"use strict";
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
var itinerary_1 = require("./src/services/itinerary");
var destinations_1 = require("./src/data/destinations");
var dest = destinations_1.fallbackDestinationsList.find(function (d) { return d.name === 'Hyderabad'; });
if (!dest)
    throw new Error("Destination not found");
dest.attractions = __spreadArray(__spreadArray([], dest.attractions, true), [
    { id: 'h3', name: 'Salar Jung Museum', description: '', category: 'Historical Places', location: { lat: 17.3713, lng: 78.4804 }, durationMinutes: 120, entryCost: 50, type: 'attraction' },
    { id: 'h4', name: 'Husain Sagar Lake', description: '', category: 'Nature & Outdoors', location: { lat: 17.4239, lng: 78.4738 }, durationMinutes: 90, entryCost: 0, type: 'attraction' },
    { id: 'h5', name: 'Lumbini Park', description: '', category: 'Nature & Outdoors', location: { lat: 17.4093, lng: 78.4733 }, durationMinutes: 60, entryCost: 20, type: 'attraction' },
    { id: 'h6', name: 'Ramoji Film City', description: '', category: 'Adventure', location: { lat: 17.2530, lng: 78.6800 }, durationMinutes: 240, entryCost: 1150, type: 'attraction' },
    { id: 'h7', name: 'Snow World', description: '', category: 'Adventure', location: { lat: 17.4116, lng: 78.4795 }, durationMinutes: 120, entryCost: 500, type: 'attraction' },
    { id: 'h8', name: 'Nehru Zoological Park', description: '', category: 'Nature & Outdoors', location: { lat: 17.3512, lng: 78.4503 }, durationMinutes: 180, entryCost: 50, type: 'attraction' },
    { id: 'h9', name: 'Chowmahalla Palace', description: '', category: 'Historical Places', location: { lat: 17.3592, lng: 78.4716 }, durationMinutes: 120, entryCost: 80, type: 'attraction' },
], false);
var itinerary = (0, itinerary_1.generateItinerary)(dest, 3, null, ['Adventure', 'Nature & Outdoors', 'Cultural Experiences', 'Food & Local Cuisine']);
itinerary.forEach(function (day, index) {
    console.log("\nDAY ".concat(day.dayNumber));
    day.items.forEach(function (i) {
        console.log("- ".concat(i.title, " (").concat(i.type, "): ").concat(i.costEstimate, " - ").concat(i.startTime));
    });
});
