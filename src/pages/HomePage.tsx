import React from 'react';
import { Link } from 'react-router-dom';
import { Plane, Compass, ShieldCheck, MapPin } from 'lucide-react';

const HomePage = () => {
    return (
        <div className="flex flex-col w-full">
            {/* Hero Section */}
            <section className="relative w-full py-20 px-4 md:py-32 overflow-hidden flex flex-col items-center justify-center text-center">
                <div className="absolute inset-0 bg-gradient-to-b from-iqoo-yellow/10 to-transparent pointer-events-none" />

                <div className="relative z-10 max-w-4xl mx-auto space-y-6">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight">
                        Travel Smarter. <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-iqoo-yellow to-iqoo-gold">
                            Explore Freely.
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
                        Your AI-powered multilingual travel companion. Experience the world like a local anywhere you go.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-8">
                        <Link to="/plan" className="w-full sm:w-auto px-8 py-4 bg-iqoo-yellow text-black font-bold rounded-full text-lg shadow-[0_0_20px_rgba(255,200,0,0.4)] hover:shadow-[0_0_30px_rgba(255,200,0,0.6)] transition-all flex items-center justify-center space-x-2">
                            <Plane className="w-5 h-5" />
                            <span>Plan My Trip</span>
                        </Link>
                        <Link to="/plan" className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-bold rounded-full text-lg transition-all border border-white/20 flex items-center justify-center space-x-2">
                            <Compass className="w-5 h-5" />
                            <span>Explore Nearby</span>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Feature Highlights */}
            <section className="py-16 px-4">
                <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FeatureCard
                        icon={<MapPin className="text-iqoo-yellow w-8 h-8" />}
                        title="Smart Itineraries"
                        desc="Geographically optimized routes that save time and reduce unnecessary travel."
                    />
                    <FeatureCard
                        icon={<span className="text-iqoo-yellow text-3xl font-bold">₹</span>}
                        title="Budget Optimization"
                        desc="Track expenses and get smart alternatives when you approach your limit."
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="text-iqoo-yellow w-8 h-8" />}
                        title="StayIQ"
                        desc="Intelligent accommodation filtering based on location, budget, and true value."
                    />
                    <FeatureCard
                        icon={<Globe className="text-iqoo-yellow w-8 h-8" />}
                        title="Visual & Voice Trans."
                        desc="Break language barriers instantly using your camera or microphone."
                    />
                </div>
            </section>
        </div>
    );
};

const FeatureCard = ({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) => (
    <div className="glass-card p-6 rounded-2xl hover:-translate-y-1 transition-transform">
        <div className="mb-4 bg-white/5 w-14 h-14 rounded-full flex items-center justify-center border border-white/10">
            {icon}
        </div>
        <h3 className="text-xl font-bold mb-2">{title}</h3>
        <p className="text-gray-400 leading-relaxed text-sm">{desc}</p>
    </div>
)

import { Globe } from 'lucide-react'; // Added import for Globe

export default HomePage;
