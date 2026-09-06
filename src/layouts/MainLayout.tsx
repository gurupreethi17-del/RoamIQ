import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Plane, Compass, FileText, Globe } from 'lucide-react';

const MainLayout = () => {
    const location = useLocation();

    const navItems = [
        { name: 'Home', path: '/', icon: <Compass className="w-5 h-5" /> },
        { name: 'Plan Trip', path: '/plan', icon: <Plane className="w-5 h-5" /> },
        { name: 'Dashboard', path: '/trip', icon: <FileText className="w-5 h-5" /> },
        { name: 'Translate', path: '/translate', icon: <Globe className="w-5 h-5" /> },
    ];

    return (
        <div className="flex flex-col min-h-screen bg-iqoo-dark text-white">
            <header className="sticky top-0 z-50 glass-panel">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex-shrink-0 flex items-center space-x-2">
                            <span className="text-iqoo-yellow font-bold text-2xl tracking-tighter">Roam</span>
                            <span className="font-bold text-2xl tracking-tighter">IQ</span>
                        </div>

                        {/* Desktop Navigation */}
                        <nav className="hidden md:flex space-x-8">
                            {navItems.map((item) => {
                                const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                                return (
                                    <Link
                                        key={item.name}
                                        to={item.path}
                                        className={`flex items-center space-x-1 px-3 py-2 rounded-md text-sm font-medium transition-colors ${isActive ? 'text-iqoo-yellow' : 'text-gray-300 hover:text-white'
                                            }`}
                                    >
                                        {item.icon}
                                        <span>{item.name}</span>
                                    </Link>
                                )
                            })}
                        </nav>
                    </div>
                </div>
            </header>

            <main className="flex-grow w-full max-w-7xl mx-auto md:px-6 lg:px-8">
                <Outlet />
            </main>

            {/* Mobile Navigation Bar (Bottom) */}
            <nav className="md:hidden sticky py-2 pb-safe border-t border-white/10 bg-iqoo-black/95 backdrop-blur z-50 inset-x-0 bottom-0">
                <div className="flex justify-around items-center h-14">
                    {navItems.map((item) => {
                        const isActive = location.pathname === item.path || (item.path !== '/' && location.pathname.startsWith(item.path));
                        return (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors ${isActive ? 'text-iqoo-yellow' : 'text-gray-400'
                                    }`}
                            >
                                {item.icon}
                                <span className="text-[10px] font-medium">{item.name}</span>
                            </Link>
                        )
                    })}
                </div>
            </nav>
        </div>
    );
};

export default MainLayout;
