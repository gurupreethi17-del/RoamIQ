import React from 'react';
import { ItineraryItem } from '../types';
import { Bed, Navigation, MapPin, Coffee, Utensils, ShoppingBag, Sunrise, Sparkles, Clock, Wallet, TreePine, History, Ticket } from 'lucide-react';

interface Props {
    item: ItineraryItem;
    isLast: boolean;
}

const ActivityCard: React.FC<Props> = ({ item, isLast }) => {

    const getIcon = () => {
        switch (item.type) {
            case 'hotel': return <Bed className="w-5 h-5 text-indigo-400" />;
            case 'food': return item.subtitle.includes('Coffee') || item.subtitle.includes('Breakfast') ? <Coffee className="w-5 h-5 text-orange-400" /> : <Utensils className="w-5 h-5 text-red-500" />;
            case 'travel': return <Navigation className="w-5 h-5 text-gray-400" />;
            case 'leisure': return <Coffee className="w-5 h-5 text-orange-400" />;
            case 'shopping': return <ShoppingBag className="w-5 h-5 text-pink-400" />;
            case 'sunset': return <Sunrise className="w-5 h-5 text-yellow-500" />;
            case 'attraction':
                if (item.subtitle.includes('History')) return <History className="w-5 h-5 text-amber-500" />;
                if (item.subtitle.includes('Nature')) return <TreePine className="w-5 h-5 text-emerald-500" />;
                return <Ticket className="w-5 h-5 text-blue-400" />;
            default: return <MapPin className="w-5 h-5 text-iqoo-yellow" />;
        }
    };

    const getBorderColor = () => {
        switch (item.type) {
            case 'travel': return 'border-gray-500/30';
            case 'hotel': return 'border-indigo-500/50';
            case 'food': return 'border-red-500/30';
            default: return 'border-white/10 hover:border-iqoo-yellow/50';
        }
    };

    const isTravel = item.type === 'travel';

    if (isTravel) {
        const isWalk = (item.distanceFromPrevious || 0) === 0;
        const desc = isWalk ? '🚶 Walkable' : `${item.description} ( ${item.distanceFromPrevious?.toFixed(1)} km · ${item.durationMinutes} min )`;

        return (
            <div className="flex relative items-start group">
                {!isLast && <div className="absolute left-6 top-8 bottom-0 w-0.5 bg-gray-600/50 -z-10" />}

                <div className="w-[12px] h-[12px] rounded-full bg-gray-600 border-[3px] border-iqoo-dark shrink-0 ml-[18px] mt-2 relative z-10" />

                <div className="ml-6 py-2 pb-6">
                    <div className="flex items-center space-x-2 text-sm text-gray-400 font-medium bg-white/5 px-3 py-1.5 rounded-lg border border-white/5 transition-colors">
                        <Navigation className="w-3 h-3 text-gray-500" />
                        <span>{desc}</span>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="flex relative items-start group pb-6 w-full max-w-full overflow-hidden">
            {!isLast && <div className="absolute left-[23px] top-10 bottom-0 w-0.5 bg-white/10 group-hover:bg-iqoo-yellow/30 transition-colors -z-10" />}

            {/* Time Gutter (Desktop only) */}
            <div className="w-16 shrink-0 pt-3 text-right pr-4 hidden md:block">
                <span className="text-xs font-bold text-gray-400 block leading-tight">{item.startTime}</span>
                <span className="text-[10px] text-gray-600 block">{item.endTime}</span>
            </div>

            {/* Center Node */}
            <div className="relative z-10 w-12 h-12 rounded-full bg-iqoo-dark border-2 border-white/10 flex items-center justify-center shrink-0 group-hover:border-iqoo-yellow group-hover:shadow-[0_0_15px_rgba(255,200,0,0.4)] transition-all md:ml-0 ml-1">
                {getIcon()}
            </div>

            {/* Card Content */}
            <div className="ml-3 md:ml-4 flex-1 mt-1 min-w-0 transition-transform md:group-hover:translate-x-1">
                <div className="md:hidden block mb-1">
                    <span className="font-bold text-iqoo-yellow text-xs tracking-wider">{item.startTime} – {item.endTime}</span>
                </div>

                <div className={`glass-panel p-4 rounded-2xl border ${getBorderColor()} group-hover:bg-white/5 transition-colors`}>

                    <div className="flex justify-between items-start mb-1">
                        <h4 className="text-[15px] md:text-lg font-bold text-white group-hover:text-iqoo-yellow transition-colors leading-tight truncate">{item.title}</h4>
                    </div>

                    <p className="text-[10px] md:text-xs font-bold text-gray-400 tracking-wide uppercase mb-2 flex items-center truncate">
                        {item.type === 'food' ? <Utensils className="w-3 h-3 mr-1" /> : null}
                        {item.subtitle}
                    </p>

                    <p className="text-sm text-gray-300 mb-3 leading-relaxed break-words whitespace-normal">{item.description}</p>

                    {(item.durationMinutes > 0 || item.costEstimate > 0 || item.type === 'attraction') && (
                        <div className="flex flex-wrap gap-y-2 gap-x-4 mt-2 pt-3 border-t border-white/5">
                            {item.durationMinutes > 0 && (
                                <div className="flex items-center space-x-1.5 text-[11px] md:text-xs text-gray-400 font-medium">
                                    <Clock className="w-3.5 h-3.5" />
                                    <span>{item.durationMinutes >= 60 ? `${Math.floor(item.durationMinutes / 60)}h ${item.durationMinutes % 60}m` : `${item.durationMinutes}m`}</span>
                                </div>
                            )}
                            {item.costEstimate > 0 && (
                                <div className="flex items-center space-x-1.5 text-[11px] md:text-xs text-gray-400 font-medium">
                                    <Wallet className="w-3.5 h-3.5" />
                                    <span>Cost: ₹{item.costEstimate}</span>
                                </div>
                            )}
                            {item.costEstimate === 0 && item.type === 'attraction' && (
                                <div className="flex items-center space-x-1.5 text-[11px] md:text-xs text-green-400 font-medium">
                                    <Sparkles className="w-3.5 h-3.5" />
                                    <span>Free Entry</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ActivityCard;
