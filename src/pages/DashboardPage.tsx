import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTripContext } from '../hooks/useTripData';
import { generateItinerary } from '../services/itinerary';
import TripMap from '../components/Map';
import ActivityCard from '../components/ActivityCard';
import BudgetChart from '../components/BudgetChart';
import StayIQCard from '../components/StayIQCard';
import { Destination, Location } from '../types';
import { getFallbackAttractions } from '../data/destinations';
import { fetchDynamicPlaces } from '../services/places';
import { Search, Map as MapIcon, Bed, Wallet, Sparkles, Navigation, Clock, Utensils, IndianRupee } from 'lucide-react';

const DashboardPage = () => {
    const [trip, setTrip] = useTripContext();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'plan' | 'stay' | 'budget' | 'map'>('plan');
    const [activeDay, setActiveDay] = useState(1);

    const [targetDest, setTargetDest] = useState<Destination | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!trip) {
            navigate('/plan');
            return;
        }

        const loadTripData = async () => {
            const cachedDestStr = localStorage.getItem('roamiq_selected_dest_cache');
            if (!cachedDestStr) {
                navigate('/plan');
                return;
            }

            const rawDest = JSON.parse(cachedDestStr) as Destination;

            // STRICT DESTINATION MATCHING: 
            // We fetch attractions for the EXACT name geocoded via Nominatim.
            // If they don't exist, we fallback to dynamic Overpass finding instead of "Destination not found"
            let { attractions, hotels } = getFallbackAttractions(rawDest.name);

            if (attractions.length < trip.days * 4) {
                const dynPlaces = await fetchDynamicPlaces(rawDest.location.lat, rawDest.location.lng, 15000);

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
                ...rawDest,
                attractions,
                hotels
            };

            // Update the cache explicitly showing we loaded or failed to load items
            setTargetDest(verifiedDest);

            if (!trip.itinerary || trip.itinerary.length === 0) {
                const selectedHotel = verifiedDest.hotels.find(h => h.id === trip.selectedHotelId) || null;
                const itinerary = generateItinerary(verifiedDest, trip.days, trip.startLocation, trip.interests, trip.travelStyle, selectedHotel);
                setTrip(prev => {
                    if (!prev) return prev;
                    return { ...prev, itinerary };
                });
            }
            setLoading(false);
        };

        loadTripData();
    }, [navigate, setTrip, trip?.selectedHotelId]); // Re-run if hotel changes

    if (loading || !trip || !targetDest || (!trip.itinerary && targetDest.attractions.length > 0)) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                <Sparkles className="w-16 h-16 text-iqoo-yellow animate-spin" />
                <h2 className="text-2xl font-bold text-white">Building your perfect day plans...</h2>
                <div className="flex flex-col space-y-2 max-w-sm w-full text-sm text-gray-400">
                    <span className="flex items-center space-x-2"><span>✓</span> <span>Checking destination coordinates</span></span>
                    <span className="flex flex-col">
                        <span className="flex items-center space-x-2 text-iqoo-yellow animate-pulse"><span>●</span> <span>Sourcing regional places in {trip?.destination?.name || 'region'}...</span></span>
                    </span>
                </div>
            </div>
        );
    }

    const currentDayPlan = trip?.itinerary?.find(d => d.dayNumber === activeDay) || trip?.itinerary?.[0];

    const routePath: Location[] = [];
    currentDayPlan?.items?.forEach(item => {
        if (item.location) routePath.push(item.location);
    });

    const selectedHotelObj = targetDest?.hotels?.find(h => h.id === trip.selectedHotelId);

    const getCurrencySymbol = (c: string) => c?.includes('₹') ? '₹' : c?.includes('$') ? '$' : '₹';
    const cSym = getCurrencySymbol(trip.currency || 'INR (₹)');

    const totalTripCost = trip.itinerary?.reduce((sum, d) => sum + (d.estimatedDayCost || 0), 0) || 0;
    const totalTripTravelDist = trip.itinerary?.reduce((sum, d) => sum + (d.totalDistanceKm || 0), 0) || 0;
    const totalTripTravelTime = trip.itinerary?.reduce((sum, d) => sum + (d.totalTravelTimeMinutes || 0), 0) || 0;
    const remainingBudget = (trip.budget || 0) - totalTripCost;

    const hasEmptyState = !targetDest || !targetDest.attractions || targetDest.attractions.length === 0;

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] md:flex-row overflow-hidden absolute inset-0 pt-16">

            {/* Sidebar / List View */}
            <div className="w-full md:w-[50%] lg:w-[45%] flex flex-col h-full border-r border-white/5 bg-iqoo-dark shadow-2xl z-20">

                <div className="px-5 py-5 border-b border-white/10 shrink-0 bg-gradient-to-b from-white/5 to-transparent">
                    {/* Trip Summary Header */}
                    <div className="mb-4 space-y-1 block max-w-full overflow-hidden">
                        <h2 className="text-xl font-black text-white truncate">{targetDest.displayName}</h2>
                        <div className="text-xs text-gray-300 font-medium pb-2 border-b border-white/10 truncate">
                            <span>{trip.days} Days · {trip.travelers} Travelers · {trip.travelStyle}</span>
                        </div>

                        {!hasEmptyState && (
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Total estimated cost</p>
                                    <p className="text-lg font-black text-white">{cSym}{totalTripCost}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Remaining budget</p>
                                    <p className={`text-lg font-black ${remainingBudget < 0 ? 'text-red-400' : 'text-green-400'}`}>
                                        {cSym}{remainingBudget}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Total travel</p>
                                    <p className="text-sm font-bold text-gray-300">{totalTripTravelDist.toFixed(1)} km</p>
                                </div>
                                <div>
                                    <p className="text-[10px] text-gray-400 font-bold tracking-widest uppercase">Total travel time</p>
                                    <p className="text-sm font-bold text-gray-300">{Math.floor(totalTripTravelTime / 60)}h {totalTripTravelTime % 60}m</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="flex space-x-2 overflow-x-auto pb-2 scrollbar-hide">
                        <TabButton active={activeTab === 'plan'} icon={<Search size={16} />} label="Itinerary" onClick={() => setActiveTab('plan')} />
                        <TabButton active={activeTab === 'stay'} icon={<Bed size={16} />} label="StayIQ" onClick={() => setActiveTab('stay')} />
                        <TabButton active={activeTab === 'budget'} icon={<Wallet size={16} />} label="Budget" onClick={() => setActiveTab('budget')} />
                        <TabButton active={activeTab === 'map'} icon={<MapIcon size={16} />} label="Map" onClick={() => setActiveTab('map')} className="md:hidden" />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto scroll-smooth pb-32 md:pb-6 relative h-full">
                    {hasEmptyState ? (
                        <div className="flex flex-col items-center justify-center pt-20 px-6 text-center space-y-4">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                                <Search className="w-8 h-8 text-gray-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white">Destination not found</h3>
                            <p className="text-sm text-gray-400 leading-relaxed max-w-sm mt-4">
                                Using minimal available destination data to keep things afloat. Try searching for a major city or confirmed tourist destination.
                            </p>
                            <button
                                onClick={() => navigate('/plan')}
                                className="mt-6 bg-iqoo-yellow text-black font-bold py-3 px-6 rounded-xl hover:bg-white transition-colors"
                            >
                                Edit Destination
                            </button>
                        </div>
                    ) : (
                        <>
                            {activeTab === 'plan' && (
                                <div className="flex flex-col animate-in slide-in-from-right-4 duration-300">

                                    {/* Day-Navigation-Wrapper */}
                                    <div className="sticky top-0 z-40 bg-iqoo-dark px-4 md:px-6 pt-4 md:pt-6 pb-3 border-b border-white/5 shadow-sm">
                                        <div className="flex space-x-3 overflow-x-auto scrollbar-hide">
                                            {trip.itinerary?.map(d => (
                                                <button
                                                    key={d.dayNumber}
                                                    onClick={() => setActiveDay(d.dayNumber)}
                                                    className={`px-6 py-3 rounded-full font-black text-sm uppercase tracking-wider shrink-0 transition-all ${activeDay === d.dayNumber
                                                        ? 'bg-iqoo-yellow text-black shadow-[0_0_15px_rgba(255,200,0,0.3)]'
                                                        : 'bg-white/5 text-gray-400 border border-white/5 hover:bg-white/10'
                                                        }`}
                                                >
                                                    Day {d.dayNumber}
                                                </button>
                                            )) || <p className="text-sm text-gray-500">No itinerary activities found yet.</p>}
                                        </div>
                                    </div>

                                    {/* Itinerary-Content */}
                                    {currentDayPlan && (
                                        <div className="px-4 md:px-6 pt-4 pb-8 space-y-6">
                                            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                                                <div className="flex justify-between items-start mb-3">
                                                    <div className="truncate pr-4">
                                                        <h3 className="text-xl font-black text-white">DAY {currentDayPlan.dayNumber}</h3>
                                                        <p className="text-xs text-gray-400 mt-0.5 truncate">{targetDest.name} · {trip.interests.slice(0, 3).join(' · ')}</p>
                                                    </div>
                                                    <div className="text-right shrink-0">
                                                        <span className="text-xl font-black text-iqoo-yellow block">{cSym}{currentDayPlan.estimatedDayCost}</span>
                                                        <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold block">Est. Day Total</span>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs mb-3">
                                                    <div className="flex justify-center items-center space-x-1.5 bg-white/5 rounded-lg p-2">
                                                        <span className="font-bold text-gray-300">📍 {currentDayPlan.totalDistanceKm} km</span>
                                                    </div>
                                                    <div className="flex justify-center items-center space-x-1.5 bg-white/5 rounded-lg p-2">
                                                        <span className="font-bold text-gray-300">🚗 {currentDayPlan.totalTravelTimeMinutes}m travel</span>
                                                    </div>
                                                    <div className="flex justify-center items-center space-x-1.5 bg-white/5 rounded-lg p-2">
                                                        <span className="font-bold text-gray-300">🍛 {cSym}{currentDayPlan.totalFoodCost} food</span>
                                                    </div>
                                                    <div className="flex justify-center items-center space-x-1.5 bg-white/5 rounded-lg p-2">
                                                        <span className="font-bold text-gray-300">🎟 {cSym}{currentDayPlan.totalActivityCost} activity</span>
                                                    </div>
                                                </div>

                                                {currentDayPlan.aiExplanation && (
                                                    <div className="bg-iqoo-yellow/5 border border-iqoo-yellow/10 rounded-xl p-3 flex items-start space-x-2">
                                                        <Sparkles className="w-4 h-4 text-iqoo-yellow shrink-0 mt-0.5" />
                                                        <p className="text-xs text-gray-300 tracking-wide font-medium leading-relaxed">
                                                            <span className="font-bold text-iqoo-yellow mr-1">Why this plan?</span>
                                                            {currentDayPlan.aiExplanation}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="text-center bg-blue-500/10 border border-blue-500/20 text-blue-300 text-[11px] md:text-xs py-2 px-3 rounded-lg flex items-center justify-center space-x-2">
                                                <Clock className="w-4 h-4 shrink-0" />
                                                <span>Suggested times — actual timings may vary with traffic, queues and opening hours.</span>
                                            </div>

                                            <div className="relative pl-0 md:pl-2">
                                                {currentDayPlan.items?.length > 0 ? currentDayPlan.items.map((item, index) => (
                                                    <ActivityCard
                                                        key={item.id || index}
                                                        item={item}
                                                        isLast={index === currentDayPlan.items.length - 1}
                                                    />
                                                )) : (
                                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10 text-center text-gray-400">
                                                        No activities to display for this day.
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'stay' && (
                                <div className="space-y-4 px-4 md:px-6 pt-2 pb-8 animate-in slide-in-from-right-4 duration-300">
                                    <h3 className="text-xl font-bold mb-6 mt-2">Recommended Stays</h3>
                                    {targetDest.hotels?.length > 0 ? targetDest.hotels.map(hotel => (
                                        <StayIQCard
                                            key={hotel.id}
                                            hotel={hotel}
                                            selected={trip.selectedHotelId === hotel.id}
                                            onSelect={(id) => {
                                                setTrip(prev => {
                                                    if (!prev) return prev;
                                                    return { ...prev, selectedHotelId: id, itinerary: [] };
                                                });
                                            }}
                                            days={trip.days}
                                        />
                                    )) : (
                                        <p className="text-gray-400 bg-white/5 p-4 rounded-xl border border-white/10">
                                            Stay recommendations temporarily unavailable.
                                        </p>
                                    )}
                                </div>
                            )}

                            {activeTab === 'budget' && (
                                <div className="px-4 md:px-6 pt-2 pb-8 animate-in slide-in-from-right-4 duration-300">
                                    <BudgetChart trip={trip} />
                                </div>
                            )}

                            {/* Mobile Map View */}
                            {activeTab === 'map' && (
                                <div className="absolute inset-0 h-full w-full md:hidden">
                                    <TripMap
                                        center={targetDest.location}
                                        attractions={targetDest.attractions}
                                        currentLocation={trip.startLocation}
                                        routePath={routePath}
                                        hotelLocation={selectedHotelObj?.location}
                                    />
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Desktop Map */}
            <div className="hidden md:block md:w-[50%] lg:w-[55%] h-full relative">
                <TripMap
                    center={targetDest?.location}
                    attractions={targetDest?.attractions?.filter(a => routePath.some(r => r?.lat === a?.location?.lat)) || []}
                    currentLocation={trip?.startLocation}
                    routePath={routePath}
                    hotelLocation={selectedHotelObj?.location}
                />

                {!hasEmptyState && (
                    <button
                        onClick={() => alert("AI Assistant: I can recalculate the rest of the day if you are running late, or suggest food spots!")}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[1000] bg-iqoo-yellow text-black px-6 py-4 rounded-full font-bold shadow-2xl flex items-center space-x-2 hover:scale-105 transition-transform"
                    >
                        <Sparkles className="w-5 h-5" />
                        <span>Ask RoamIQ AI</span>
                    </button>
                )}
            </div>

            {/* Mobile Ask RoamIQ */}
            {!hasEmptyState && activeTab !== 'map' && (
                <button
                    onClick={() => alert("I can recalculate the rest of the day if you are running late!")}
                    className="md:hidden fixed bottom-6 right-4 z-[1000] bg-iqoo-yellow text-black p-4 rounded-full shadow-lg"
                >
                    <Sparkles className="w-6 h-6" />
                </button>
            )}

        </div>
    );
};

const TabButton = ({ active, icon, label, onClick, className = '' }: any) => (
    <button
        onClick={onClick}
        className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border shrink-0 ${active
            ? 'bg-iqoo-yellow text-black border-iqoo-yellow shadow-[0_0_15px_rgba(255,200,0,0.2)]'
            : 'bg-white/5 text-gray-300 border-transparent hover:bg-white/10 hover:text-white'
            } ${className}`}
    >
        {icon}
        <span>{label}</span>
    </button>
);

export default DashboardPage;
