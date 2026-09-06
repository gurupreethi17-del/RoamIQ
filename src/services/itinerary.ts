import { Destination, ItineraryDay, ItineraryItem, Attraction, Location, Hotel, ActivityType } from '../types';
import { calculateDistance, estimateTravelTimeMins } from './distance';

const interestKeywords: Record<string, string[]> = {
    'Historical Places': ['History', 'Culture', 'Museum', 'Monument', 'Fort', 'Heritage', 'Palace', 'Archaeological', 'Temple'],
    'Adventure': ['Nature', 'Trek', 'Adventure', 'Hill', 'Water', 'Park', 'River', 'Forest'],
    'Nature & Outdoors': ['Nature', 'Park', 'Lake', 'Wildlife', 'River', 'Forest', 'Garden', 'Hill', 'Beach', 'Waterfall', 'Gorge'],
    'Cultural Experiences': ['Culture', 'Art', 'Tradition', 'Local', 'Experience', 'Heritage', 'Museum', 'Temple', 'Mosque'],
    'Food & Local Cuisine': ['Food', 'Cuisine', 'Market', 'Bazaar', 'Local', 'Restaurant', 'Cafe'],
    'Shopping': ['Shopping', 'Market', 'Mall', 'Bazaar', 'Street'],
    'Photography': ['View', 'Landmark', 'Scenic', 'Temple', 'Architecture', 'Park', 'Beach', 'Fort'],
    'Nightlife': ['Night', 'Club', 'Bar', 'Evening'],
    'Spiritual / Religious': ['Temple', 'Church', 'Mosque', 'Shrine', 'Myth', 'Dargah'],
    'Family Friendly': ['Park', 'Museum', 'Zoo', 'Family', 'Lake', 'Beach']
};

const formatTime = (totalMins: number): string => {
    const hours = Math.floor(Math.abs(totalMins) / 60) % 24;
    const mins = Math.floor(Math.abs(totalMins) % 60);
    const period = hours >= 12 ? 'PM' : 'AM';
    const hours12 = hours > 12 ? hours - 12 : (hours === 0 ? 12 : hours);
    return `${String(hours12).padStart(2, '0')}:${String(mins).padStart(2, '0')} ${period}`;
};

export const generateItinerary = (
    destination: Destination,
    days: number,
    startLocation: Location | null,
    userInterests: string[] = [],
    travelStyle: string = 'Balanced',
    selectedHotel?: Hotel | null
): ItineraryDay[] => {
    if (!destination.attractions || destination.attractions.length === 0) return [];

    let targetKeywords: string[] = [];
    userInterests.forEach(interest => {
        if (interestKeywords[interest]) targetKeywords.push(...interestKeywords[interest]);
    });
    // Add exact interest names to keywords as fallback
    userInterests.forEach(interest => targetKeywords.push(...interest.toLowerCase().split(/[ &]+/)));

    targetKeywords = [...new Set(targetKeywords)].map(k => k.toLowerCase());

    const isMatch = (attr: Attraction) => {
        const cat = attr.category.toLowerCase();
        const desc = attr.description.toLowerCase();
        const name = attr.name.toLowerCase();
        return targetKeywords.some(keyword => cat.includes(keyword) || name.includes(keyword) || desc.includes(keyword));
    };

    // Separate verified food from generic attractions
    const allFoodPlaces = destination.attractions.filter(attr => attr.type === 'food' || attr.category === 'Food & Local Cuisine');
    let primaryAttractions = destination.attractions.filter(attr => attr.type !== 'food' && attr.category !== 'Food & Local Cuisine');

    // Strict Filtering: Require interest match unless we don't have enough data
    const matchedAttractions = primaryAttractions.filter(attr => isMatch(attr));

    // If strict matching yields too few attractions, softly add back the highest priority ones to satisfy schedule.
    if (matchedAttractions.length < (days * 2) && primaryAttractions.length > matchedAttractions.length) {
        // We keep the matched ones but we add un-matched ones at a massive negative penalty score.
        primaryAttractions = primaryAttractions;
    } else {
        primaryAttractions = matchedAttractions;
    }

    const scoredAttractions = primaryAttractions.map(attr => {
        let score = 0;

        // Massive priority for mapping to user interests explicitly
        if (isMatch(attr)) score += 50;

        // Travel Style Modifiers
        if (travelStyle === 'Budget' && attr.entryCost === 0) score += 10;
        if (travelStyle === 'Premium' && attr.entryCost > 500) score += 10;
        if (travelStyle === 'Premium' && attr.durationMinutes >= 120) score += 5;

        return { attraction: attr, score, visited: false };
    });

    const itinerary: ItineraryDay[] = [];
    const destinationCenter = destination.location;
    const visitedFoodPlaces = new Set<string>();

    for (let day = 1; day <= days; day++) {
        const items: ItineraryItem[] = [];

        // Dynamic waking time based on travel style
        let currentTimeMinutes = (travelStyle === 'Premium' ? 10.0 : 8.5) * 60;
        let currentLoc = (day === 1 && startLocation) ? startLocation : (selectedHotel ? selectedHotel.location : destinationCenter);

        let dayTotalDistance = 0;
        let dayTotalTravelTime = 0;
        let totalFoodCost = 0;
        let totalActivityCost = 0;
        let totalTransportCost = 0;

        const unvisitedCountForDay = scoredAttractions.filter(sa => !sa.visited).length;
        if (unvisitedCountForDay === 0) {
            items.push({
                id: `limitation-${day}`,
                type: 'leisure',
                title: 'Free Exploration',
                subtitle: 'Self-Guided',
                description: 'Our database ran out of curated attractions matching your interests. Enjoy some free time exploring local street life or shopping!',
                startTime: formatTime(10 * 60),
                endTime: formatTime(17 * 60),
                durationMinutes: 420,
                costEstimate: 0
            });
            itinerary.push({
                dayNumber: day,
                items,
                totalDistanceKm: 0,
                totalTravelTimeMinutes: 0,
                totalFoodCost: 0,
                totalActivityCost: 0,
                totalTransportCost: 0,
                estimatedDayCost: 0,
                aiExplanation: 'Interest-based data limitation reached.'
            });
            continue;
        }

        const addTravelNode = (toLoc: Location) => {
            const dist = calculateDistance(currentLoc, toLoc);
            const tTime = estimateTravelTimeMins(dist);

            if (dist > 0.5) {
                let transportMode = '🚗 Car/Taxi';
                if (dist < 1.0) transportMode = '🚶 Walking';
                else if (dist < 3) transportMode = '🛺 Auto Rickshaw';

                const cost = dist < 1.0 ? 0 : Math.round(dist * (travelStyle === 'Premium' ? 30 : 15));

                items.push({
                    id: `travel-${day}-${items.length}`,
                    type: 'travel',
                    title: 'Travel',
                    subtitle: `${dist.toFixed(1)} km · Approx. ${tTime} min`,
                    description: transportMode,
                    startTime: formatTime(currentTimeMinutes),
                    endTime: formatTime(currentTimeMinutes + tTime),
                    durationMinutes: tTime,
                    costEstimate: cost,
                    distanceFromPrevious: dist,
                    travelTimeFromPrevious: tTime
                });
                dayTotalDistance += dist;
                dayTotalTravelTime += tTime;
                totalTransportCost += cost;
            } else if (dist > 0) {
                dayTotalDistance += dist;
            }
            currentTimeMinutes += tTime;
            currentLoc = toLoc;
        };

        const addFoodNode = (mealType: string, minBudget: number, maxBudget: number) => {
            const isMainMeal = mealType === 'Lunch' || mealType === 'Dinner';

            // Find nearby unvisited true restaurant
            const nearbyFoods = allFoodPlaces.filter(f => !visitedFoodPlaces.has(f.id)).map(f => {
                const nameLower = f.name.toLowerCase();
                const catLower = f.category.toLowerCase();
                let penalty = 0;
                let actualDistance = calculateDistance(currentLoc, f.location);

                if (isMainMeal) {
                    // Massive penalty for snacks/desserts appearing as major meals
                    if (nameLower.includes('juice') || nameLower.includes('ice cream') || nameLower.includes('bakery') || nameLower.includes('snack') || catLower === 'cafe') {
                        penalty += 100;
                    }
                    if (catLower === 'restaurant' || nameLower.includes('restaurant')) {
                        penalty -= 5;
                    }
                } else if (mealType.includes('Snack') || mealType.includes('Cafe')) {
                    // Bonus for snacks if it actually is a cafe/juice bar
                    if (nameLower.includes('juice') || catLower === 'cafe' || nameLower.includes('bakery')) {
                        penalty -= 5;
                    }
                }

                return {
                    food: f,
                    dist: actualDistance,
                    score: actualDistance + penalty
                };
            }).sort((a, b) => a.score - b.score);

            let selectedFood = nearbyFoods.length > 0 && nearbyFoods[0].dist < 20 && nearbyFoods[0].score < 50 ? nearbyFoods[0].food : null;
            let costMultiplier = travelStyle === 'Premium' ? 2 : (travelStyle === 'Budget' ? 0.6 : 1);
            let estimatedCost = Math.round((Math.random() * (maxBudget - minBudget) + minBudget) * costMultiplier);

            if (selectedFood) {
                // Verified Restaurant mapped natively!
                visitedFoodPlaces.add(selectedFood.id);
                addTravelNode(selectedFood.location);
                items.push({
                    id: `meal-${mealType}-${day}`,
                    type: 'food',
                    title: selectedFood.name, // Real API name!
                    subtitle: mealType,
                    description: `🍴 Recommended nearby\n${selectedFood.category}\n~${calculateDistance(currentLoc, selectedFood.location).toFixed(1)} km away\nBudget level: ${travelStyle}`,
                    startTime: formatTime(currentTimeMinutes),
                    endTime: formatTime(currentTimeMinutes + 60),
                    durationMinutes: 60,
                    costEstimate: estimatedCost
                });
            } else {
                // Fake/Generic Fallback banned by User! We insert transparent block indicating no data.
                items.push({
                    id: `meal-${mealType}-${day}`,
                    type: 'food',
                    title: `No verified food places found nearby`,
                    subtitle: mealType,
                    description: 'Explore on your own to locate a nearby restaurant or cafe.',
                    startTime: formatTime(currentTimeMinutes),
                    endTime: formatTime(currentTimeMinutes + 60),
                    durationMinutes: 60,
                    costEstimate: estimatedCost
                });
            }
            currentTimeMinutes += 60;
            totalFoodCost += estimatedCost;
        };

        // 1. HOTEL START
        if (selectedHotel || startLocation) {
            items.push({
                id: `hotel-start-${day}`,
                type: 'hotel',
                title: selectedHotel ? selectedHotel.name : (day === 1 ? 'Current Location' : 'City Center'),
                subtitle: 'Starting Point',
                description: 'Ready for the day.',
                startTime: formatTime(currentTimeMinutes),
                endTime: formatTime(currentTimeMinutes),
                durationMinutes: 0,
                costEstimate: 0,
                location: currentLoc
            });
        }

        // 2. MORNING ATTRACTIONS (Target 1-2 items)
        let unvisited = scoredAttractions.filter(sa => !sa.visited);
        let itemsAdded = 0;

        while (unvisited.length > 0 && itemsAdded < 2 && currentTimeMinutes < 12.5 * 60) {
            // Sort by proximity + interest score for clustering!
            unvisited.sort((a, b) => {
                const distA = calculateDistance(currentLoc, a.attraction.location);
                const distB = calculateDistance(currentLoc, b.attraction.location);
                // Heavy penalty for travelling far, heavy bonus for score.
                const weightA = a.score - (distA * 5);
                const weightB = b.score - (distB * 5);
                return weightB - weightA;
            });

            const nextAttrObj = unvisited[0];
            const nextAttr = nextAttrObj.attraction;

            // Abort if the only unvisited attraction is incredibly far away natively.
            if (itemsAdded > 0 && calculateDistance(currentLoc, nextAttr.location) > 40) break;

            nextAttrObj.visited = true;
            addTravelNode(nextAttr.location);

            let type: ActivityType = nextAttr.category.toLowerCase().includes('shopping') ? 'shopping' : 'attraction';

            items.push({
                id: nextAttr.id,
                type,
                title: nextAttr.name,
                subtitle: nextAttr.category,
                description: nextAttr.description || "Explore this verified attraction.",
                startTime: formatTime(currentTimeMinutes),
                endTime: formatTime(currentTimeMinutes + nextAttr.durationMinutes),
                durationMinutes: nextAttr.durationMinutes,
                costEstimate: nextAttr.entryCost,
                location: nextAttr.location,
                originalAttractionId: nextAttr.id
            });

            currentTimeMinutes += nextAttr.durationMinutes;
            totalActivityCost += nextAttr.entryCost;
            itemsAdded++;
            unvisited = scoredAttractions.filter(sa => !sa.visited);
        }

        // 3. LUNCH
        if (currentTimeMinutes < 12.5 * 60) {
            currentTimeMinutes = 12.5 * 60; // Wait till lunch
        }
        addFoodNode('Lunch', 300, 500);

        // 4. AFTERNOON ATTRACTIONS (Target 1-3 items depending on duration)
        itemsAdded = 0;
        while (unvisited.length > 0 && itemsAdded < 3 && currentTimeMinutes < 17.5 * 60) {
            unvisited.sort((a, b) => {
                const distA = calculateDistance(currentLoc, a.attraction.location);
                const distB = calculateDistance(currentLoc, b.attraction.location);
                const weightA = a.score - (distA * 5);
                const weightB = b.score - (distB * 5);
                return weightB - weightA;
            });

            const nextAttrObj = unvisited[0];
            const nextAttr = nextAttrObj.attraction;

            if (itemsAdded > 0 && calculateDistance(currentLoc, nextAttr.location) > 40) break;

            nextAttrObj.visited = true;
            addTravelNode(nextAttr.location);

            items.push({
                id: nextAttr.id,
                type: 'attraction',
                title: nextAttr.name,
                subtitle: nextAttr.category,
                description: nextAttr.description || "Afternoon exploration.",
                startTime: formatTime(currentTimeMinutes),
                endTime: formatTime(currentTimeMinutes + nextAttr.durationMinutes),
                durationMinutes: nextAttr.durationMinutes,
                costEstimate: nextAttr.entryCost,
                location: nextAttr.location,
                originalAttractionId: nextAttr.id
            });

            currentTimeMinutes += nextAttr.durationMinutes;
            totalActivityCost += nextAttr.entryCost;
            itemsAdded++;
            unvisited = scoredAttractions.filter(sa => !sa.visited);
        }

        // 5. EVENING/DINNER logic
        // If there's time for one more sunset/evening attraction (Like Viewpoint or Shopping)
        unvisited = scoredAttractions.filter(sa => !sa.visited);
        if (unvisited.length > 0 && currentTimeMinutes < 19 * 60) {
            // Find sunset/shopping specific item
            let eveningOptions = unvisited.filter(u => u.attraction.category.toLowerCase().includes('view') || u.attraction.category.toLowerCase().includes('shopping') || u.attraction.category.toLowerCase().includes('night'));

            let eveningAttr = null;
            if (eveningOptions.length > 0) {
                // Pick closest
                eveningAttr = eveningOptions.sort((a, b) => calculateDistance(currentLoc, a.attraction.location) - calculateDistance(currentLoc, b.attraction.location))[0];
            } else {
                // Otherwise pick any closest
                eveningAttr = unvisited.sort((a, b) => calculateDistance(currentLoc, a.attraction.location) - calculateDistance(currentLoc, b.attraction.location))[0];
            }

            if (eveningAttr) {
                eveningAttr.visited = true;
                addTravelNode(eveningAttr.attraction.location);
                items.push({
                    id: eveningAttr.attraction.id,
                    type: eveningAttr.attraction.category.toLowerCase().includes('view') ? 'sunset' : 'attraction',
                    title: eveningAttr.attraction.name,
                    subtitle: eveningAttr.attraction.category,
                    description: eveningAttr.attraction.description || "Evening attraction.",
                    startTime: formatTime(currentTimeMinutes),
                    endTime: formatTime(currentTimeMinutes + eveningAttr.attraction.durationMinutes),
                    durationMinutes: eveningAttr.attraction.durationMinutes,
                    costEstimate: eveningAttr.attraction.entryCost,
                    location: eveningAttr.attraction.location,
                    originalAttractionId: eveningAttr.attraction.id
                });
                currentTimeMinutes += eveningAttr.attraction.durationMinutes;
                totalActivityCost += eveningAttr.attraction.entryCost;
            }
        }

        // 6. DINNER
        if (currentTimeMinutes < 19.5 * 60) {
            currentTimeMinutes = 19.5 * 60; // Wait till dinner
        }
        addFoodNode('Dinner', 400, 800);

        // 7. RETURN TO HOTEL
        if (selectedHotel || startLocation) {
            const endLoc = selectedHotel ? selectedHotel.location : startLocation!;
            addTravelNode(endLoc);
            items.push({
                id: `hotel-end-${day}`,
                type: 'leisure',
                title: 'Return to Hotel / Start',
                subtitle: 'End of Day',
                description: 'Rest and recharge for tomorrow.',
                startTime: formatTime(currentTimeMinutes),
                endTime: formatTime(currentTimeMinutes),
                durationMinutes: 0,
                costEstimate: 0,
                location: endLoc
            });
        }

        const estimatedDayCost = totalFoodCost + totalActivityCost + (travelStyle !== 'Budget' ? totalTransportCost : 0);

        itinerary.push({
            dayNumber: day,
            items,
            totalDistanceKm: Number(dayTotalDistance.toFixed(1)),
            totalTravelTimeMinutes: dayTotalTravelTime,
            totalFoodCost,
            totalActivityCost,
            totalTransportCost,
            estimatedDayCost,
            aiExplanation: `Focused heavily on ${userInterests.join(', ')} grouped smoothly around geographically mapped local food spots.`
        });
    }

    return itinerary;
};
