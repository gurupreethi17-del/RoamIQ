import React from 'react';
import { TripPlan } from '../types';

interface BudgetBreakdownProps {
    trip: TripPlan;
}

const BudgetChart: React.FC<BudgetBreakdownProps> = ({ trip }) => {
    const stay = trip.budget * 0.35;
    const food = trip.budget * 0.25;
    const transport = trip.budget * 0.15;
    const activities = trip.budget * 0.15;
    const emergency = trip.budget * 0.10;

    return (
        <div className="glass-panel p-6 rounded-3xl space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-white">BudgetIQ</h3>
                <span className="text-iqoo-yellow font-bold text-xl">₹{trip.budget.toLocaleString()}</span>
            </div>

            <div className="space-y-3 pt-2">
                <BudgetItem label="Stay (35%)" amount={stay} color="bg-blue-500" />
                <BudgetItem label="Food (25%)" amount={food} color="bg-green-500" />
                <BudgetItem label="Transport (15%)" amount={transport} color="bg-purple-500" />
                <BudgetItem label="Activities (15%)" amount={activities} color="bg-orange-500" />
                <BudgetItem label="Emergency (10%)" amount={emergency} color="bg-red-500" />
            </div>

            <div className="pt-4 flex w-full h-3 rounded-full overflow-hidden bg-white/10">
                <div style={{ width: '35%' }} className="bg-blue-500 h-full" />
                <div style={{ width: '25%' }} className="bg-green-500 h-full" />
                <div style={{ width: '15%' }} className="bg-purple-500 h-full" />
                <div style={{ width: '15%' }} className="bg-orange-500 h-full" />
                <div style={{ width: '10%' }} className="bg-red-500 h-full" />
            </div>
        </div>
    );
};

const BudgetItem = ({ label, amount, color }: { label: string, amount: number, color: string }) => (
    <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-gray-300">{label}</span>
        </div>
        <span className="font-semibold">₹{Math.round(amount).toLocaleString()}</span>
    </div>
);

export default BudgetChart;
