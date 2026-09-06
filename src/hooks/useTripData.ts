import { useState, useCallback } from 'react';
import { TripPlan } from '../types';

export const useLocalStorage = <T>(key: string, initialValue: T) => {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.warn('Error reading localStorage', error);
            return initialValue;
        }
    });

    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            setStoredValue(valueToStore);
        } catch (error) {
            console.warn('Error setting localStorage', error);
        }
    }, [key, storedValue]);

    return [storedValue, setValue] as const;
};

export const useTripContext = () => {
    return useLocalStorage<TripPlan | null>('roamiq_trip_plan', null);
}
