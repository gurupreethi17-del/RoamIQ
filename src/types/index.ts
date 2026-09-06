export interface Location {
    lat: number;
    lng: number;
}

export interface Attraction {
    id: string;
    name: string;
    category: string;
    description: string;
    durationMinutes: number;
    entryCost: number;
    location: Location;
    openTime?: string;
    closeTime?: string;
    image?: string;
    type?: 'attraction' | 'food' | 'hotel' | 'leisure';
}

export interface Hotel {
    id: string;
    name: string;
    rating: number;
    pricePerNight: number;
    location: Location;
    amenities: string[];
    type: 'Best Overall' | 'Best Budget' | 'Best Location' | 'Luxury Hotel' | 'Resort' | 'Business Hotel' | 'Luxury Resort' | 'Heritage Hotel' | 'Budget Hotel';
    matchReason?: string;
}

export interface Destination {
    id: string;
    name: string;
    displayName: string;
    city: string;
    state: string;
    country: string;
    description?: string;
    bestTimeToVisit?: string;
    image?: string;
    location: Location;
    type: string;
    attractions: Attraction[];
    hotels: Hotel[];
    isRegion?: boolean;
    routes?: string[][];
}

export interface TripPlan {
    destination: Destination;
    days: number;
    travelers: number;
    budget: number;
    currency: string;
    travelStyle: string;
    interests: string[];
    language: string;
    startLocation: Location | null;
    selectedHotelId?: string;
    itinerary: ItineraryDay[];
}

export type ActivityType = 'hotel' | 'food' | 'attraction' | 'travel' | 'leisure' | 'shopping' | 'sunset';

export interface ItineraryItem {
    id: string;
    type: ActivityType;
    title: string;
    subtitle: string;
    description: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    costEstimate: number;
    location?: Location;
    distanceFromPrevious?: number; // km
    travelTimeFromPrevious?: number; // minutes
    icon?: string;
    originalAttractionId?: string;
}

export interface ItineraryDay {
    dayNumber: number;
    dateStr?: string;
    items: ItineraryItem[];
    totalDistanceKm: number;
    totalTravelTimeMinutes: number;
    totalFoodCost: number;
    totalActivityCost: number;
    totalTransportCost: number;
    estimatedDayCost: number;
    aiExplanation?: string;
}
