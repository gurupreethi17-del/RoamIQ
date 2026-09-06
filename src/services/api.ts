// OpenStreetMap Nominatim Geocoding API wrapper

export interface GeocodeResult {
    place_id: number;
    lat: string;
    lon: string;
    display_name: string;
    type: string;
}

export const searchLocationsAPI = async (query: string): Promise<GeocodeResult[]> => {
    if (!query || query.trim().length < 2) return [];

    try {
        // We limit to India (countrycodes=in) as requested for the All-India scope
        const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&limit=5&countrycodes=in`;
        const response = await fetch(url, {
            headers: {
                'Accept-Language': 'en',
                'User-Agent': 'RoamIQ-AI-Tour-App/1.0'
            }
        });
        if (!response.ok) {
            return [];
        }
        const data = await response.json();
        return data as GeocodeResult[];
    } catch (e) {
        console.error("Geocoding failed", e);
        return [];
    }
};
