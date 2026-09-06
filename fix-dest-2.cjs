const fs = require('fs');

let content = fs.readFileSync('src/data/destinations.ts', 'utf8');

// Remove all wrongly added displayName and type from nested elements
content = content.replace(/\s+displayName: '[^']+',\n\s+type: 'city',/g, '');

// Since this removed ALL of them, now we carefully add them ONLY to the root objects
// Root objects have structure:
//     {
//         id: '...',
//         name: '...',

content = content.replace(/(\{\s*id:\s*'[^']+',\s*name:\s*'([^']+)',)/g, (match, p1, p2) => {
    return p1 + `\n        displayName: '${p2}, India',\n        type: 'city',`;
});

fs.writeFileSync('src/data/destinations.ts', content);
console.log("Destinations cleaned and corrected!");
