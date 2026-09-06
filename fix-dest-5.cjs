const fs = require('fs');
let lines = fs.readFileSync('src/data/destinations.ts', 'utf8').split('\n');

let scrubbed = [];
for (let line of lines) {
    if (line.includes("displayName: '") || line.includes("type: 'city'")) {
        // Skip it! Since ALL injected types where 'city' and displayName was just injected.
        continue;
    }
    scrubbed.push(line);
}

// Now we need to append them properly to the root object.
// A root object starts with `    {` and the next line is `        id:`
let finalLines = [];
for (let i = 0; i < scrubbed.length; i++) {
    finalLines.push(scrubbed[i]);
    if (scrubbed[i].includes("id: '") && scrubbed[i - 1].trim() === "{") {
        let nameMatch = scrubbed[i + 1].match(/name: '([^']+)'/);
        if (nameMatch) {
            finalLines.push(`        displayName: '${nameMatch[1]}, India',`);
            finalLines.push(`        type: 'city',`);
        }
    }
}

fs.writeFileSync('src/data/destinations.ts', finalLines.join('\n'));
console.log("Safely restored and fixed destinations.ts!");
