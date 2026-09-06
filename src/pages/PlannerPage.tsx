import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Autocomplete from '../components/Autocomplete';
import { useTripContext } from '../hooks/useTripData';
import { Destination, Location } from '../types';
import { MapPin, Navigation, Navigation2, Sparkles, Check, ChevronDown } from 'lucide-react';
import { getFallbackAttractions } from '../data/destinations';
import { fetchDynamicPlaces } from '../services/places';
import { generateItinerary } from '../services/itinerary';

const PlannerPage = () => {
    const [trip, setTrip] = useTripContext();
    const navigate = useNavigate();

    const [destination, setDestination] = useState<Destination | string>(
        trip?.destination ? trip.destination : ''
    );

    const [days, setDays] = useState<number>(trip?.days || 3);
    const [travelers, setTravelers] = useState<number>(trip?.travelers || 2);
    const [budget, setBudget] = useState<number>(trip?.budget || 10000);
    const [currency, setCurrency] = useState<string>(trip?.currency || 'INR (₹)');
    const [travelStyle, setTravelStyle] = useState<string>(trip?.travelStyle || 'Balanced');
    const [selectedInterests, setSelectedInterests] = useState<string[]>(trip?.interests || []);

    const [currentLocation, setCurrentLocation] = useState<Location | null>(trip?.startLocation || null);
    const [gettingLocation, setGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState('');

    const [generating, setGenerating] = useState(false);
    const [genStep, setGenStep] = useState(0);

    const interestOptions = [
        { label: 'Historical Places', icon: '🏛' },
        { label: 'Adventure', icon: '🥾' },
        { label: 'Nature & Outdoors', icon: '🌿' },
        { label: 'Cultural Experiences', icon: '🎭' },
        { label: 'Food & Local Cuisine', icon: '🍛' },
        { label: 'Shopping', icon: '🛍' },
        { label: 'Photography', icon: '📸' },
        { label: 'Nightlife', icon: '🌙' },
        { label: 'Spiritual / Religious', icon: '🛕' },
        { label: 'Family Friendly', icon: '👨‍👩‍👧' }
    ];

    const popularDestinations = [
        { name: 'Tokyo', displayName: 'Tokyo, Japan', city: 'Tokyo', state: 'Tokyo', country: 'Japan', type: 'city', location: { lat: 35.6764, lng: 139.6500 }, id: 'tokyo-jp', img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=300&q=80' },
        { name: 'Hyderabad', displayName: 'Hyderabad, Telangana, India', city: 'Hyderabad', state: 'Telangana', country: 'India', type: 'city', location: { lat: 17.3850, lng: 78.4867 }, id: 'hyd-in', img: 'https://images.unsplash.com/photo-1566497746927-46654e58a36d?auto=format&fit=crop&w=300&q=80' },
        { name: 'Kerala', displayName: 'Kerala, India', city: 'Kerala', state: 'Kerala', country: 'India', type: 'state', location: { lat: 10.8505, lng: 76.2711 }, id: 'ker-in', img: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=300&q=80' }
    ];

    useEffect(() => {
        // If destination changes, we should clear out old cached destination
        if (destination && typeof destination !== 'string') {
            if (trip && trip.destination?.id !== destination.id) {
                // Destination switched!
                setTrip({
                    ...trip,
                    destination: destination,
                    itinerary: [],
                    selectedHotelId: undefined
                });
            }
        }
    }, [destination]);

    const toggleInterest = (interest: string) => {
        setSelectedInterests(prev =>
            prev.includes(interest)
                ? prev.filter(i => i !== interest)
                : [...prev, interest]
        );
    };

    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationError('Geolocation is not supported');
            return;
        }
        setGettingLocation(true);
        setLocationError('');
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCurrentLocation({ lat: position.coords.latitude, lng: position.coords.longitude });
                setGettingLocation(false);
            },
            () => {
                setLocationError('Unable to retrieve location');
                setGettingLocation(false);
            }
        );
    };

    const handleGenerate = async () => {
        let destName = typeof destination === 'string' ? destination.trim() : (destination ? destination.name.trim() : '');

        if (!destName) {
            alert('Please select a destination first.');
            return;
        }
        if (days < 1) {
            alert('Must travel for at least 1 day.');
            return;
        }
        if (selectedInterests.length === 0) {
            alert('Please select at least one interest.');
            return;
        }

        setGenerating(true);
        let step = 0;
        const interval = setInterval(() => {
            step++;
            if (step < 4) setGenStep(step);
        }, 700);

        try {
            let location = typeof destination === 'string' ? null : destination.location;
            let destState = typeof destination === 'string' ? '' : (destination.state || '');

            if (!location) {
                const searchLocationsAPI = (await import('../services/api')).searchLocationsAPI;
                const geocodeResults = await searchLocationsAPI(destName);
                if (geocodeResults.length === 0) {
                    // Fallback gracefully without blocking if the API failed to verify the place
                    location = { lat: 20.5937, lng: 78.9629 }; // Fallback to India generic coordinate
                } else {
                    location = { lat: parseFloat(geocodeResults[0].lat), lng: parseFloat(geocodeResults[0].lon) };
                    const displayParts = geocodeResults[0].display_name.split(',').map(p => p.trim());
                    destName = displayParts[0];
                    if (displayParts.length > 2) destState = displayParts[displayParts.length - 2];
                }
            }

            let { attractions, hotels } = getFallbackAttractions(destName);

            // If we don't have enough attractions for a multi-day trip, fetch dynamically to augment!
            if (attractions.length < days * 4) {
                const dynPlaces = await fetchDynamicPlaces(location.lat, location.lng, 15000);

                const existingAttr = new Set(attractions.map(a => a.name.toLowerCase()));
                dynPlaces.attractions.forEach(a => {
                    if (!existingAttr.has(a.name.toLowerCase())) attractions.push(a);
                });

                const existingHotels = new Set(hotels.map(h => h.name.toLowerCase()));
                dynPlaces.hotels.forEach(h => {
                    if (!existingHotels.has(h.name.toLowerCase())) hotels.push(h);
                });
            }

            const verifiedDest: Destination = {
                ...(typeof destination === 'string' ? {
                    id: `geo-${Date.now()}`,
                    displayName: destName,
                    city: destName,
                    country: 'India',
                    type: 'city',
                } : destination),
                name: destName,
                state: destState,
                location: location,
                attractions,
                hotels
            };

            const itinerary = generateItinerary(
                verifiedDest,
                days,
                currentLocation,
                selectedInterests,
                travelStyle,
                null
            );

            clearInterval(interval);
            setGenStep(3);

            localStorage.setItem('roamiq_selected_dest_cache', JSON.stringify(verifiedDest));

            setTrip({
                destination: verifiedDest,
                days,
                travelers,
                budget,
                currency,
                travelStyle,
                interests: selectedInterests,
                language: 'English',
                startLocation: currentLocation,
                itinerary,
                selectedHotelId: undefined
            });

            navigate('/trip');
        } catch (error: any) {
            console.error(error);
            clearInterval(interval);
            setGenerating(false);
            alert(error.message || 'An error occurred while building your itinerary. Please try again.');
        }
    };

    const genMessages = [
        "✨ Finding the best places...",
        "📍 Checking distances...",
        "💰 Optimizing your budget...",
        "🗺️ Building your route..."
    ];

    return (
        <div className="min-h-screen pb-32">
            {/* Container max width for desktop */}
            <div className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-in fade-in zoom-in-95 duration-500">

                {/* Top Progress Indicator */}
                <div className="flex items-center justify-center space-x-2 md:space-x-8 mb-12 overflow-x-auto pb-4 scrollbar-hide opacity-80">
                    <Step active num="1" label="Trip Details" />
                    <div className="w-10 h-[1px] bg-white/20 hidden md:block" />
                    <Step active num="2" label="Interests" />
                    <div className="w-10 h-[1px] bg-white/20 hidden md:block" />
                    <Step active num="3" label="Preferences" />
                    <div className="w-10 h-[1px] bg-white/20 hidden md:block" />
                    <Step active={generating} num="4" label="Review & Generate" />
                </div>

                {generating ? (
                    <div className="flex flex-col items-center justify-center h-[50vh] space-y-6">
                        <Sparkles className="w-16 h-16 text-iqoo-yellow animate-spin" />
                        <h2 className="text-2xl font-bold text-white transition-opacity duration-300">
                            {genMessages[Math.min(genStep, genMessages.length - 1)]}
                        </h2>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                        {/* Left Column / Main Form */}
                        <div className="lg:col-span-8 space-y-10">

                            {/* Destination Search */}
                            <section className="space-y-4">
                                <label className="text-sm font-bold text-gray-400 tracking-widest">WHERE ARE YOU GOING?</label>
                                <Autocomplete
                                    value={typeof destination === 'string' ? destination : (destination?.name || '')}
                                    onChange={(text) => setDestination(text)}
                                    onSelect={(dest) => setDestination(dest)}
                                />
                            </section>

                            {/* Mobile Popular Destinations (Horizontal scroll) - Hidden on desktop since it's on right column */}
                            <section className="lg:hidden space-y-4">
                                <label className="text-sm font-bold text-gray-400 tracking-widest">POPULAR DESTINATIONS</label>
                                <div className="flex space-x-4 overflow-x-auto pb-4 scrollbar-hide">
                                    {popularDestinations.map(pd => (
                                        <div
                                            key={pd.id}
                                            onClick={() => {
                                                const d: Destination = {
                                                    id: pd.id,
                                                    name: pd.name,
                                                    displayName: pd.displayName,
                                                    city: pd.city,
                                                    state: pd.state,
                                                    country: pd.country,
                                                    type: pd.type,
                                                    location: pd.location,
                                                    attractions: [],
                                                    hotels: []
                                                };
                                                setDestination(d);
                                            }}
                                            className="min-w-[140px] h-[160px] rounded-2xl overflow-hidden relative cursor-pointer group shrink-0"
                                        >
                                            <img src={pd.img} alt={pd.name} className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                            <div className="absolute bottom-3 left-3">
                                                <p className="font-bold text-white">{pd.name}</p>
                                                <p className="text-xs text-gray-300">{pd.country}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Trip Details Grid */}
                            <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="glass-panel p-5 rounded-3xl flex flex-col items-center justify-center space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 tracking-widest text-center">TRIP DURATION</label>
                                    <div className="flex items-center space-x-4 w-full justify-between mt-2">
                                        <button onClick={() => setDays(Math.max(1, days - 1))} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg">−</button>
                                        <span className="font-extrabold text-xl">{days} <span className="text-sm text-gray-400">Days</span></span>
                                        <button onClick={() => setDays(days + 1)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg">+</button>
                                    </div>
                                </div>

                                <div className="glass-panel p-5 rounded-3xl flex flex-col items-center justify-center space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 tracking-widest text-center">TRAVELERS</label>
                                    <div className="flex items-center space-x-4 w-full justify-between mt-2">
                                        <button onClick={() => setTravelers(Math.max(1, travelers - 1))} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg">−</button>
                                        <span className="font-extrabold text-xl">{travelers} <span className="text-sm text-gray-400">People</span></span>
                                        <button onClick={() => setTravelers(travelers + 1)} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-lg">+</button>
                                    </div>
                                </div>

                                <div className="glass-panel p-5 rounded-3xl flex flex-col justify-center space-y-2">
                                    <label className="text-[10px] font-bold text-gray-400 tracking-widest text-center">BUDGET & CURRENCY</label>
                                    <div className="relative mt-2 w-full flex space-x-2">
                                        <input
                                            type="number"
                                            value={budget}
                                            onChange={(e) => setBudget(Number(e.target.value))}
                                            className="w-full bg-white/5 border border-white/10 rounded-xl py-2 px-3 text-white font-bold text-center focus:outline-none focus:ring-2 focus:ring-iqoo-yellow transition-all"
                                        />
                                        <select
                                            value={currency}
                                            onChange={(e) => setCurrency(e.target.value)}
                                            className="bg-white/5 border border-white/10 rounded-xl px-2 text-xs font-bold text-gray-300 focus:outline-none"
                                        >
                                            <option className="bg-iqoo-black">INR (₹)</option>
                                            <option className="bg-iqoo-black">USD ($)</option>
                                            <option className="bg-iqoo-black">JPY (¥)</option>
                                            <option className="bg-iqoo-black">EUR (€)</option>
                                        </select>
                                    </div>
                                    <p className="text-[10px] text-gray-500 text-center w-full">Your total trip budget</p>
                                </div>
                            </section>

                            {/* Starting Location */}
                            <section className="space-y-4">
                                <label className="text-sm font-bold text-gray-400 tracking-widest">STARTING LOCATION</label>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <button
                                        onClick={handleGetLocation}
                                        className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:bg-white/5 transition-colors border border-transparent hover:border-iqoo-yellow/30"
                                    >
                                        <Navigation className="w-6 h-6 text-iqoo-yellow" />
                                        <span className="font-bold">My Current Location</span>
                                        <span className="text-xs text-gray-400">Used to calculate distance & time</span>
                                    </button>
                                    <button
                                        onClick={() => setCurrentLocation(null)}
                                        className="glass-panel p-4 rounded-2xl flex flex-col items-center justify-center space-y-2 hover:bg-white/5 transition-colors"
                                    >
                                        <MapPin className="w-6 h-6 text-gray-400" />
                                        <span className="font-bold text-gray-300">Destination Center</span>
                                        <span className="text-xs text-gray-500">Start from city center</span>
                                    </button>
                                </div>

                                {gettingLocation && <p className="text-sm text-iqoo-yellow animate-pulse">Detecting GPS coordinates...</p>}
                                {locationError && <p className="text-sm text-red-500">{locationError}</p>}

                                {currentLocation && !gettingLocation && (
                                    <div className="bg-green-500/10 border border-green-500/30 p-4 rounded-2xl flex items-center justify-between">
                                        <div className="flex items-center space-x-3">
                                            <div className="w-8 h-8 rounded-full bg-green-500/20 flex items-center justify-center">
                                                <Check className="w-4 h-4 text-green-400" />
                                            </div>
                                            <div>
                                                <p className="font-bold text-green-400">Location Captured</p>
                                                <p className="text-xs text-green-500/70">{currentLocation.lat.toFixed(4)}, {currentLocation.lng.toFixed(4)}</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setCurrentLocation(null)} className="text-xs text-gray-400 hover:text-white underline">Change</button>
                                    </div>
                                )}
                            </section>

                            {/* Travel Style */}
                            <section className="space-y-4">
                                <label className="text-sm font-bold text-gray-400 tracking-widest">WHAT'S YOUR TRAVEL STYLE?</label>
                                <div className="grid grid-cols-3 gap-3 md:gap-4">
                                    {['Budget', 'Balanced', 'Premium'].map(style => (
                                        <div
                                            key={style}
                                            onClick={() => setTravelStyle(style)}
                                            className={`p-4 md:p-6 rounded-2xl cursor-pointer transition-all border flex flex-col items-center justify-center text-center space-y-2 ${travelStyle === style
                                                ? 'bg-iqoo-yellow/10 border-iqoo-yellow shadow-[0_0_15px_rgba(255,200,0,0.15)]'
                                                : 'glass-panel border-transparent hover:bg-white/5'
                                                }`}
                                        >
                                            <span className="text-2xl">{style === 'Budget' ? '💰' : style === 'Balanced' ? '⭐' : '👑'}</span>
                                            <span className={`font-bold ${travelStyle === style ? 'text-iqoo-yellow' : 'text-gray-300'}`}>{style}</span>
                                        </div>
                                    ))}
                                </div>
                            </section>

                            {/* Interests */}
                            <section className="space-y-4 pb-12">
                                <div>
                                    <label className="text-sm font-bold text-gray-400 tracking-widest block">WHAT ARE YOU INTERESTED IN?</label>
                                    <span className="text-xs text-gray-500">Choose everything you'd like to experience</span>
                                </div>

                                <div className="flex flex-wrap gap-3">
                                    {interestOptions.map(interest => {
                                        const isSelected = selectedInterests.includes(interest.label);
                                        return (
                                            <button
                                                key={interest.label}
                                                onClick={() => toggleInterest(interest.label)}
                                                className={`px-4 py-3 rounded-full border text-sm font-medium flex items-center space-x-2 transition-all ${isSelected
                                                    ? 'bg-iqoo-yellow/15 border-iqoo-yellow text-white shadow-[0_0_10px_rgba(255,200,0,0.1)]'
                                                    : 'glass-panel border-white/5 text-gray-400 hover:bg-white/5 hover:text-gray-300'
                                                    }`}
                                            >
                                                <span>{interest.icon}</span>
                                                <span>{interest.label}</span>
                                                {isSelected && <Check className="w-4 h-4 text-iqoo-yellow ml-1" />}
                                            </button>
                                        )
                                    })}
                                </div>
                            </section>
                        </div>

                        {/* Right Column / Desktop Extras (Sticky) */}
                        <div className="hidden lg:block lg:col-span-4 relative">
                            <div className="sticky top-24 space-y-8">

                                {/* Desktop Popular Destinations */}
                                <div className="glass-panel p-6 rounded-3xl space-y-4">
                                    <label className="text-sm font-bold text-gray-400 tracking-widest block">POPULAR DESTINATIONS</label>
                                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                                        {popularDestinations.map(pd => (
                                            <div
                                                key={pd.id}
                                                onClick={() => {
                                                    const d: Destination = {
                                                        id: pd.id,
                                                        name: pd.name,
                                                        displayName: pd.displayName,
                                                        city: pd.city,
                                                        state: pd.state,
                                                        country: pd.country,
                                                        type: pd.type,
                                                        location: pd.location,
                                                        attractions: [],
                                                        hotels: []
                                                    };
                                                    setDestination(d);
                                                }}
                                                className="min-w-[140px] h-[160px] rounded-2xl overflow-hidden relative cursor-pointer group shrink-0"
                                            >
                                                <img src={pd.img} alt={pd.name} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                                                <div className="absolute bottom-2 left-2">
                                                    <p className="font-bold text-white text-sm">{pd.name}</p>
                                                    <p className="text-[10px] text-gray-300">{pd.country}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Info Card */}
                                <div className="glass-panel p-6 rounded-3xl border border-iqoo-yellow/20 bg-gradient-to-br from-iqoo-yellow/5 to-transparent">
                                    <div className="w-10 h-10 rounded-full bg-iqoo-yellow/20 flex items-center justify-center mb-4">
                                        <Sparkles className="w-5 h-5 text-iqoo-yellow" />
                                    </div>
                                    <h3 className="font-bold text-lg mb-2">Smart Allocation</h3>
                                    <p className="text-sm text-gray-400 leading-relaxed">
                                        Based on your travel style and interests, our AI engine reorders attractions and allocates budget percentages differently. Premium styles prioritize higher-end stays while budget mode focuses on street food and free attractions.
                                    </p>
                                </div>

                                {/* Desktop Generate Button */}
                                <button
                                    onClick={handleGenerate}
                                    className="w-full bg-iqoo-yellow text-black font-extrabold text-lg py-5 rounded-2xl shadow-[0_0_20px_rgba(255,200,0,0.3)] hover:shadow-[0_0_30px_rgba(255,200,0,0.5)] hover:scale-[1.02] transition-all flex items-center justify-center space-x-2"
                                >
                                    <Sparkles className="w-5 h-5" />
                                    <span>Generate Smart Itinerary</span>
                                </button>
                            </div>
                        </div>

                    </div>
                )}
            </div>

            {/* Mobile Sticky CTA */}
            {!generating && (
                <div className="lg:hidden fixed bottom-[3.5rem] left-0 right-0 p-4 bg-gradient-to-t from-iqoo-dark via-iqoo-dark/95 to-transparent z-40">
                    <button
                        onClick={handleGenerate}
                        className="w-full bg-iqoo-yellow text-black font-extrabold text-lg py-4 rounded-full shadow-[0_0_20px_rgba(255,200,0,0.3)] flex items-center justify-center space-x-2"
                    >
                        <Sparkles className="w-5 h-5" />
                        <span>Generate Smart Itinerary</span>
                    </button>
                </div>
            )}
        </div>
    );
};

const Step = ({ active, num, label }: { active: boolean; num: string; label: string }) => (
    <div className="flex items-center space-x-2 shrink-0">
        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${active ? 'bg-iqoo-yellow text-black' : 'bg-white/10 text-gray-400'}`}>
            {num}
        </div>
        <span className={`font-semibold text-sm ${active ? 'text-white' : 'text-gray-500 hidden md:inline'}`}>{label}</span>
    </div>
)

export default PlannerPage;
