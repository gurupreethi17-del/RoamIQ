import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
import HomePage from './pages/HomePage';
import PlannerPage from './pages/PlannerPage';
import DashboardPage from './pages/DashboardPage';
import TranslatePage from './pages/TranslatePage';
import ErrorBoundary from './components/ErrorBoundary';


function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<MainLayout />}>
                    <Route index element={<HomePage />} />
                    <Route path="plan" element={<PlannerPage />} />
                    <Route path="trip" element={
                        <ErrorBoundary>
                            <DashboardPage />
                        </ErrorBoundary>
                    } />
                    <Route path="translate" element={<TranslatePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}

export default App;
