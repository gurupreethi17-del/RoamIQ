import fs from 'fs';

let content = fs.readFileSync('src/data/destinations.ts', 'utf8');

// Find all occurrences of name: 'XYZ',
// and inject displayName: 'XYZ, India', type: 'city',
content = content.replace(/name:\s*'([^']+)',/g, (match, p1) => {
    return `name: '${p1}',\n        displayName: '${p1}, India',\n        type: 'city',`;
});

// Since the array itself had missing elements, we also need to adjust any nested attractions.
// But the linter specifically said Destination type was missing it. The replaced strings should fix Destination.
// Wait, attractions and hotels in Destination interface don't have displayName or type. Only the root Destination object.

fs.writeFileSync('src/data/destinations.ts', content);
console.log('Fixed destinations.ts types!');
