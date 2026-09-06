const fs = require('fs');
const arr = require('./src/data/temp-eval.js');

let finalTs = `import { Destination } from '../types';

export const fallbackDestinationsList: Destination[] = ${JSON.stringify(arr, null, 4)};

export const getFallbackAttractions = (cityName: string) => {
    const found = fallbackDestinationsList.find(d => d.name.toLowerCase() === cityName.toLowerCase());
    return found ? { attractions: found.attractions, hotels: found.hotels } : { attractions: [], hotels: [] };
};
`;

fs.writeFileSync('src/data/destinations.ts', finalTs);
console.log("Destinations written back safely via JSON!");
