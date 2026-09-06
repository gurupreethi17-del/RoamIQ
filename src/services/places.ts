import { Attraction, Hotel, Location } from '../types';

/**
 * Fetches dynamic Tourist Attractions and Hotels via OpenStreetMap's Overpass API
 * for destinations not covered by the local fallback dataset. This allows RoamIQ 
 * to handle any location in India dynamically without manual data entry.
 */

interface OverpassElement {
    type: string;
    id: number;
    lat: number;
    lon: number;
    tags: {
        name?: string;
        tourism?: string;
        historic?: string;
        amenity?: string;
        leisure?: string;
        description?: string;
        fee?: string;
        stars?: string;
    };
}

export const fetchDynamicPlaces = async (
    lat: number,
    lng: number,
    radiusMeters: number = 10000
): Promise<{ attractions: Attraction[], hotels: Hotel[] }> => {

    // We search for nodes that are tagged with tourism=attraction, historic=yes, leisure=park, etc.
    const query = `
        [out:json][timeout:15];
        (
          node["tourism"~"attraction|museum|viewpoint|gallery"](around:${radiusMeters},${lat},${lng});
          node["historic"](around:${radiusMeters},${lat},${lng});
          node["leisure"="park"](around:${radiusMeters},${lat},${lng});
          node["tourism"="hotel"](around:${radiusMeters},${lat},${lng});
          node["amenity"~"restaurant|cafe|fast_food|food_court"](around:${radiusMeters},${lat},${lng});
        );
        out 50;
    `;

    const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url);
        if (!response.ok) return { attractions: [], hotels: [] };

        const data = await response.json();
        const elements: OverpassElement[] = data.elements || [];

        const attractions: Attraction[] = [];
        const hotels: Hotel[] = [];

        elements.forEach((el, index) => {
            if (!el.tags || !el.tags.name) return; // Must have a name

            const loc: Location = { lat: el.lat, lng: el.lon };

            if (el.tags.tourism === 'hotel') {
                hotels.push({
                    id: `dyn-hotel-${el.id}`,
                    name: el.tags.name,
                    rating: el.tags.stars ? parseInt(el.tags.stars) : 4,
                    pricePerNight: 3500 + (Math.random() * 2000), // Estimate
                    location: loc,
                    amenities: ['Free WiFi', 'Air Conditioning', 'Restaurant'],
                    type: 'Best Location',
                    matchReason: 'Dynamically found near your destination center.'
                });
            } else if (el.tags.amenity && ['restaurant', 'cafe', 'fast_food', 'food_court'].includes(el.tags.amenity)) {
                attractions.push({
                    id: `dyn-food-${el.id}`,
                    name: el.tags.name,
                    category: el.tags.amenity, // Pass through exact tag (restaurant, cafe, etc.) for meal filtering
                    description: el.tags.description || `A locally discovered ${el.tags.amenity.replace('_', ' ')}.`,
                    durationMinutes: 45,
                    entryCost: 0,
                    location: loc,
                    type: 'food' // Ensures itinerary engine maps this strictly as a meal anchor
                });
            } else {
                let category = 'Nature & Outdoors';
                if (el.tags.historic) category = 'Historical Places';
                if (el.tags.tourism === 'museum') category = 'Cultural Experiences';

                let entryCost = 0;
                if (el.tags.fee === 'yes') entryCost = 150;

                attractions.push({
                    id: `dyn-attr-${el.id}`,
                    name: el.tags.name,
                    category,
                    description: el.tags.description || `A popular local spot discovered in this region. Perfect for exploring.`,
                    durationMinutes: 90,
                    entryCost: entryCost,
                    location: loc,
                    type: 'attraction'
                });
            }
        });

        // Remove duplicates if any (Overpass might return same node under different tags if nested, though our query is mostly union)
        // Sort hotels and attractions slightly to cap them

        return {
            attractions: attractions.slice(0, 25), // Expanded slice bounds appropriately since 'food' items naturally fill it up heavily
            hotels: hotels.slice(0, 5)
        };

    } catch (error) {
        console.error("Overpass API fetching failed:", error);
        return { attractions: [], hotels: [] };
    }
};
