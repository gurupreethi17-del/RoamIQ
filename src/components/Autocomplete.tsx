import React, { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Sparkles } from 'lucide-react';
import { Destination } from '../types';
import { searchLocationsAPI, GeocodeResult } from '../services/api';

interface AutocompleteProps {
    value: string;
    onChange: (val: string) => void;
    onSelect: (destination: Destination) => void;
}

const Autocomplete: React.FC<AutocompleteProps> = ({ value, onChange, onSelect }) => {
    const [results, setResults] = useState<GeocodeResult[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIndex, setSelectedIndex] = useState(-1);
    const cacheRef = useRef<Record<string, GeocodeResult[]>>({});

    useEffect(() => {
        const fetchDebounced = setTimeout(async () => {
            const trimmedQuery = value.trim();
            if (trimmedQuery.length < 2) {
                setResults([]);
                setIsOpen(false);
                setIsLoading(false);
                return;
            }

            if (cacheRef.current[trimmedQuery.toLowerCase()]) {
                setResults(cacheRef.current[trimmedQuery.toLowerCase()]);
                setIsOpen(true);
                return;
            }

            setIsLoading(true);
            const apiResults = await searchLocationsAPI(trimmedQuery);
            cacheRef.current[trimmedQuery.toLowerCase()] = apiResults;
            setResults(apiResults);
            setIsLoading(false);
            setIsOpen(true);
            setSelectedIndex(-1);
        }, 400);

        return () => clearTimeout(fetchDebounced);
    }, [value]);

    const handleSelect = (geo: GeocodeResult) => {
        setIsOpen(false);

        // Parse display_name "Visakhapatnam, Andhra Pradesh, India"
        const parts = geo.display_name.split(',').map(p => p.trim());
        const name = parts[0];

        onChange(name);
        const state = parts.length > 2 ? parts[parts.length - 2] : '';
        const country = parts[parts.length - 1] || 'India';

        const newDest: Destination = {
            id: `geo-${geo.place_id}`,
            name,
            displayName: geo.display_name,
            city: name,
            country,
            state,
            type: geo.type || 'city',
            description: `Explore the vibrant local scene in ${name}.`,
            bestTimeToVisit: 'Year-round',
            image: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7ea', // Generic fallback
            location: {
                lat: parseFloat(geo.lat),
                lng: parseFloat(geo.lon)
            },
            attractions: [], // Will be dynamically populated
            hotels: [],
        };
        onSelect(newDest);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (!isOpen) return;

        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex(prev => (prev < results.length - 1 ? prev + 1 : prev));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex(prev => (prev > 0 ? prev - 1 : 0));
        } else if (e.key === 'Enter' && selectedIndex >= 0) {
            e.preventDefault();
            handleSelect(results[selectedIndex]);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className="relative w-full max-w-xl mx-auto z-50">
            <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Search className={`w-6 h-6 transition-colors ${isOpen ? 'text-iqoo-yellow' : 'text-gray-400 group-focus-within:text-iqoo-yellow'}`} />
                </div>
                <input
                    type="text"
                    className="w-full pl-14 pr-4 py-4 md:py-5 border-2 border-white/10 rounded-2xl bg-black/40 backdrop-blur-md text-white placeholder-gray-400 focus:outline-none focus:border-iqoo-yellow focus:ring-4 ring-iqoo-yellow/20 transition-all text-lg shadow-xl"
                    placeholder="Where do you want to go in India? (e.g. Vizag, Munnar)"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => { if (results.length > 0) setIsOpen(true); }}
                    onBlur={() => setTimeout(() => setIsOpen(false), 200)}
                    autoComplete="off"
                />
                {isLoading && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                        <Sparkles className="w-5 h-5 text-iqoo-yellow animate-spin" />
                    </div>
                )}
            </div>

            {isOpen && (results.length > 0 || value.length > 2) && (
                <div className="absolute mt-2 w-full glass-panel rounded-2xl border border-white/10 shadow-2xl overflow-hidden animate-in slide-in-from-top-2 duration-200">
                    <ul className="max-h-[300px] overflow-y-auto custom-scrollbar">
                        {results.length > 0 ? (
                            results.map((geo, index) => {
                                const isSelected = index === selectedIndex;
                                const parts = geo.display_name.split(',').map(p => p.trim());
                                const mainName = parts[0];
                                const subtext = parts.slice(1).join(', ');
                                return (
                                    <li
                                        key={geo.place_id}
                                        className={`px-4 py-3 cursor-pointer transition-colors flex items-center space-x-3 group ${isSelected ? 'bg-white/10 border-l-4 border-iqoo-yellow' : 'hover:bg-white/5 border-l-4 border-transparent'
                                            }`}
                                        onClick={() => handleSelect(geo)}
                                        onMouseEnter={() => setSelectedIndex(index)}
                                    >
                                        <div className={`p-2 rounded-full ${isSelected ? 'bg-iqoo-yellow/20 text-iqoo-yellow' : 'bg-white/5 text-gray-400 group-hover:text-iqoo-yellow'}`}>
                                            <MapPin className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-white font-bold truncate">{mainName}</p>
                                            <p className="text-xs text-gray-400 truncate mt-0.5">{subtext}</p>
                                        </div>
                                        <span className="text-[10px] uppercase font-bold text-gray-500 bg-white/5 px-2 py-1 rounded-md">{geo.type}</span>
                                    </li>
                                );
                            })
                        ) : (
                            !isLoading && (
                                <li className="px-5 py-6 text-center text-gray-400">
                                    <p>No verified places found.</p>
                                    <p className="text-xs mt-2 text-gray-500">Try searching for a city, town or tourist destination.</p>
                                </li>
                            )
                        )}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Autocomplete;
