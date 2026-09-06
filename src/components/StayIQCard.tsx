import React from 'react';
import { Hotel } from '../types';
import { Check, Info } from 'lucide-react';

interface StayIQCardProps {
    hotel: Hotel;
    selected: boolean;
    onSelect: (id: string) => void;
    days: number;
}

const StayIQCard: React.FC<StayIQCardProps> = ({ hotel, selected, onSelect, days }) => {
    const badgeColors: Record<string, string> = {
        'Best Overall': 'bg-iqoo-yellow text-black',
        'Best Budget': 'bg-green-500 text-white',
        'Best Location': 'bg-blue-500 text-white'
    };

    return (
        <div
            onClick={() => onSelect(hotel.id)}
            className={`relative p-5 rounded-2xl cursor-pointer transition-all border ${selected ? 'bg-white/10 border-iqoo-yellow shadow-[0_0_15px_rgba(255,200,0,0.2)]' : 'glass-panel hover:bg-white/5 border-transparent'
                }`}
        >
            <div className="absolute top-4 right-4">
                {selected ? (
                    <div className="w-6 h-6 rounded-full bg-iqoo-yellow flex items-center justify-center">
                        <Check className="w-4 h-4 text-black" />
                    </div>
                ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-500" />
                )}
            </div>

            <div className="space-y-4">
                <div>
                    <span className={`text-xs font-bold px-2 py-1 rounded inline-block mb-2 ${badgeColors[hotel.type]}`}>
                        {hotel.type}
                    </span>
                    <h4 className="text-lg font-bold pr-8">{hotel.name}</h4>
                    <div className="flex items-center space-x-2 text-sm mt-1">
                        <span className="text-iqoo-yellow font-bold text-lg">★ {hotel.rating}</span>
                        <span className="text-gray-400">•</span>
                        <span className="text-gray-300">₹{hotel.pricePerNight.toLocaleString()} / night</span>
                    </div>
                </div>

                <div className="flex flex-wrap gap-2">
                    {hotel.amenities.map(am => (
                        <span key={am} className="text-xs px-2 py-1 bg-white/5 rounded-md text-gray-300">
                            {am}
                        </span>
                    ))}
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 p-3 rounded-xl flex items-start space-x-3">
                    <Info className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-sm text-blue-200">{hotel.matchReason}</p>
                </div>

                <div className="pt-2 border-t border-white/10 flex justify-between items-center text-sm">
                    <span className="text-gray-400">Total ({days} nights)</span>
                    <span className="font-bold text-lg">₹{(hotel.pricePerNight * days).toLocaleString()}</span>
                </div>
            </div>
        </div>
    );
};

export default StayIQCard;
