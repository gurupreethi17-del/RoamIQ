import { Destination } from '../types';

export const fallbackDestinationsList: Destination[] = [
    {
        id: 'tokyo-jp',
        name: 'Tokyo',
        displayName: 'Tokyo, Japan',
        type: 'city',
        city: 'Tokyo',
        state: 'Tokyo',
        country: 'Japan',
        description: 'Vibrant metropolis matching ultramodern neon with tradition.',
        bestTimeToVisit: 'March to May',
        image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf',
        location: { lat: 35.6764, lng: 139.6500 },
        attractions: [
            { id: 't1', name: 'Senso-ji Temple', description: 'Ancient Buddhist temple.', category: 'Historical Places', location: { lat: 35.7147, lng: 139.7966 }, durationMinutes: 90, entryCost: 0, type: 'attraction' },
            { id: 't2', name: 'Shibuya Crossing', description: 'Famous scramble crossing.', category: 'Shopping', location: { lat: 35.6595, lng: 139.7005 }, durationMinutes: 45, entryCost: 0, type: 'attraction' }
        ],
        hotels: [
            { id: 'th1', name: 'Shibuya Excel', rating: 4.5, pricePerNight: 8000, location: { lat: 35.6580, lng: 139.6990 }, amenities: ['WiFi'], type: 'Best Location' }
        ]
    },
    {
        id: 'visakhapatnam',
        name: 'Visakhapatnam',
        displayName: 'Visakhapatnam, Andhra Pradesh, India',
        type: 'city',
        city: 'Visakhapatnam',
        state: 'Andhra Pradesh',
        country: 'India',
        description: 'The Jewel of the East Coast, featuring beautiful beaches and lush green hills.',
        bestTimeToVisit: 'October to March',
        image: 'https://images.unsplash.com/photo-1596700812739-1ffb54cc3ac8',
        location: { lat: 17.6868, lng: 83.2185 },
        attractions: [
            { id: 'v1', name: 'RK Beach', description: 'Famous city beach known for evening walks and bustling crowd.', category: 'Nature & Outdoors', location: { lat: 17.7146, lng: 83.3236 }, durationMinutes: 60, entryCost: 0, type: 'attraction' },
            { id: 'v2', name: 'Kailasagiri', description: 'Hilltop park with panoramic sea views and a ropeway.', category: 'Nature & Outdoors', location: { lat: 17.7490, lng: 83.3421 }, durationMinutes: 120, entryCost: 50, type: 'attraction' },
            { id: 'v3', name: 'Submarine Museum', description: 'INS Kursura submarine turned into a museum.', category: 'Historical Places', location: { lat: 17.7155, lng: 83.3314 }, durationMinutes: 90, entryCost: 40, type: 'attraction' },
            { id: 'v4', name: 'Yarada Beach', description: 'Pristine, less crowded beach surrounded by hills.', category: 'Nature & Outdoors', location: { lat: 17.6558, lng: 83.2683 }, durationMinutes: 120, entryCost: 0, type: 'attraction' },
            { id: 'v5', name: 'Rushikonda Beach', description: 'Popular for water sports and golden sands.', category: 'Nature & Outdoors', location: { lat: 17.7820, lng: 83.3850 }, durationMinutes: 150, entryCost: 0, type: 'attraction' },
            { id: 'v6', name: 'Araku Valley', description: 'Famous hill station with coffee plantations (Nearby trip).', category: 'Nature & Outdoors', location: { lat: 18.3333, lng: 82.8667 }, durationMinutes: 240, entryCost: 0, type: 'attraction' },
            { id: 'v7', name: 'Jagadamba Centre', description: 'Bustling local shopping and food hub.', category: 'Shopping', location: { lat: 17.7126, lng: 83.3013 }, durationMinutes: 90, entryCost: 0, type: 'attraction' }
        ],
        hotels: [
            { id: 'vh1', name: 'The Park Hotel', rating: 4.5, pricePerNight: 5500, location: { lat: 17.7124, lng: 83.3155 }, amenities: ['Pool', 'Spa', 'Sea View'], type: 'Luxury Hotel' },
            { id: 'vh2', name: 'Novotel Varun Beach', rating: 4.8, pricePerNight: 8500, location: { lat: 17.7150, lng: 83.3250 }, amenities: ['Infinity Pool', 'Gym', 'Sea View'], type: 'Resort' },
            { id: 'vh3', name: 'Fairfield by Marriott', rating: 4.2, pricePerNight: 3500, location: { lat: 17.7289, lng: 83.1818 }, amenities: ['Wifi', 'Breakfast'], type: 'Business Hotel' }
        ]
    },
    {
        id: 'rajampet',
        name: 'Rajampet',
        displayName: 'Rajampet, Andhra Pradesh, India',
        type: 'city',
        city: 'Rajampet',
        state: 'Andhra Pradesh',
        country: 'India',
        description: 'A serene town known for cultural heritage and the Annamacharya connection.',
        bestTimeToVisit: 'November to February',
        image: 'https://images.unsplash.com/photo-1627885744883-71ea8ec0ebf1',
        location: { lat: 14.1952, lng: 79.1601 },
        attractions: [
            { id: 'r1', name: 'Tallapaka Temple', description: 'Birthplace of Saint Annamacharya.', category: 'Spiritual / Religious', location: { lat: 14.2370, lng: 79.1417 }, durationMinutes: 60, entryCost: 0, type: 'attraction' },
            { id: 'r2', name: 'Rajampet Main Market', description: 'Local bazaar for spices and textiles.', category: 'Shopping', location: { lat: 14.1945, lng: 79.1580 }, durationMinutes: 90, entryCost: 0, type: 'attraction' },
            { id: 'r3', name: 'Attirala Waterfalls', description: 'Small picturesque waterfalls nearby.', category: 'Nature & Outdoors', location: { lat: 14.2050, lng: 79.2000 }, durationMinutes: 120, entryCost: 0, type: 'attraction' }
        ],
        hotels: [
            { id: 'rh1', name: 'Vyshnavi Hotel', rating: 3.8, pricePerNight: 1200, location: { lat: 14.1950, lng: 79.1620 }, amenities: ['AC', 'Restaurant'], type: 'Budget Hotel' }
        ]
    },
    {
        id: 'kadapa-in',
        name: 'Kadapa',
        displayName: 'Kadapa, Andhra Pradesh, India',
        type: 'city',
        city: 'Kadapa',
        state: 'Andhra Pradesh',
        country: 'India',
        description: 'A historic city famous for its proximity to Gandikota, spiritual shrines and rich cultural heritage.',
        bestTimeToVisit: 'October to February',
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
        location: { lat: 14.4673, lng: 78.8242 },
        attractions: [
            { id: 'k1', name: 'Ameen Peer Dargah', description: 'Famous Sufi shrine visited by people of all faiths.', category: 'Spiritual / Religious', location: { lat: 14.4752, lng: 78.8276 }, durationMinutes: 60, entryCost: 0, type: 'attraction' },
            { id: 'k2', name: 'Devuni Kadapa', description: 'Historic Sri Lakshmi Venkateswara Swamy Temple.', category: 'Spiritual / Religious', location: { lat: 14.4533, lng: 78.8351 }, durationMinutes: 60, entryCost: 0, type: 'attraction' },
            { id: 'k3', name: 'Gandikota (The Grand Canyon of India)', description: 'Spectacular gorge formed by river Pennar, with an ancient fort.', category: 'Nature & Outdoors', location: { lat: 14.8144, lng: 78.2861 }, durationMinutes: 180, entryCost: 0, type: 'attraction' },
            { id: 'k4', name: 'Pushpagiri Temple Complex', description: 'Ancient temple complex on the banks of Pennar river.', category: 'Historical Places', location: { lat: 14.5947, lng: 78.7561 }, durationMinutes: 90, entryCost: 0, type: 'attraction' },
            { id: 'k5', name: 'Vontimitta Kothandarama Temple', description: '16th-century temple known for architectural beauty.', category: 'Historical Places', location: { lat: 14.3857, lng: 79.0322 }, durationMinutes: 75, entryCost: 0, type: 'attraction' }
        ],
        hotels: [
            { id: 'kh1', name: 'Ziara Hotel', rating: 4.2, pricePerNight: 2800, location: { lat: 14.4660, lng: 78.8235 }, amenities: ['WiFi', 'Restaurant', 'AC'], type: 'Best Budget' },
            { id: 'kh2', name: 'Haritha Hotel Kadapa', rating: 3.9, pricePerNight: 3500, location: { lat: 14.4720, lng: 78.8300 }, amenities: ['Parking', 'Restaurant'], type: 'Best Location' }
        ]
    },
    {
        id: 'hyderabad',
        name: 'Hyderabad',
        displayName: 'Hyderabad, Telangana, India',
        type: 'city',
        city: 'Hyderabad',
        state: 'Telangana',
        country: 'India',
        description: 'The City of Pearls, known for its rich history, IT sector, and unique cuisine.',
        bestTimeToVisit: 'November to February',
        image: 'https://images.unsplash.com/photo-1566497746927-46654e58a36d',
        location: { lat: 17.3850, lng: 78.4867 },
        attractions: [
            { id: 'h1', name: 'Charminar', description: 'Iconic 16th-century mosque with 4 minarets.', category: 'Historical Places', location: { lat: 17.3616, lng: 78.4747 }, durationMinutes: 90, entryCost: 25, type: 'attraction' },
            { id: 'h2', name: 'Golconda Fort', description: 'Massive fortress complex known for its acoustics.', category: 'Historical Places', location: { lat: 17.3833, lng: 78.4011 }, durationMinutes: 180, entryCost: 25, type: 'attraction' }
        ],
        hotels: [
            { id: 'hh1', name: 'Taj Falaknuma Palace', rating: 4.9, pricePerNight: 35000, location: { lat: 17.3323, lng: 78.4674 }, amenities: ['Spa', 'Pool', 'Butler'], type: 'Heritage Hotel' }
        ]
    },
    {
        id: 'kerala',
        name: 'Kerala',
        displayName: 'Kerala, India',
        type: 'state',
        city: 'Kerala',
        state: 'Kerala',
        country: 'India',
        description: 'Known for its palm-lined beaches, backwaters, and spices.',
        bestTimeToVisit: 'September to March',
        image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944',
        location: { lat: 10.8505, lng: 76.2711 },
        attractions: [
            { id: 'kerala1', name: 'Alleppey Backwaters', description: 'Famous houseboat rides.', category: 'Nature & Outdoors', location: { lat: 9.4981, lng: 76.3388 }, durationMinutes: 240, entryCost: 0, type: 'attraction' }
        ],
        hotels: [
            { id: 'kerh1', name: 'Kumarakom Lake Resort', rating: 4.7, pricePerNight: 18000, location: { lat: 9.6171, lng: 76.4300 }, amenities: ['Pool', 'Spa'], type: 'Luxury Resort' }
        ]
    }
];

export const getFallbackAttractions = (cityName: string) => {
    // Only return static fallback datasets. If empty, callers can request Overpass dynamically via coordinates.
    // We strictly match city name.
    const found = fallbackDestinationsList.find(d => d.name.toLowerCase() === cityName.toLowerCase());
    return found ? { attractions: found.attractions, hotels: found.hotels } : { attractions: [], hotels: [] };
};
