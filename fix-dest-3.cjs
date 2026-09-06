const fs = require('fs');

let content = fs.readFileSync('src/data/destinations.ts', 'utf8');

// Strip the wrong 'displayName' and 'type' keys from ALL hotel/attractions that the previous script maliciously added!
content = content.replace(/\s+displayName: '[^']+',\n\s+type: 'city',/g, '');

// Now we need to manually target ONLY the root objects to inject it!
// We can use the fact that root objects follow immediately after `{` inside the main array.
// But standard regex is hard. Let's parse with eval!

let arrStr = content.match(/export const fallbackDestinationsList: Destination\[\] = (\[[\s\S]*\]);/)[1];
let fix = `const arr = ${arrStr}; arr.forEach(d => { d.displayName = d.name + ', India'; d.type = 'city'; }); module.exports = arr;`;
fs.writeFileSync('src/data/temp-eval.js', fix);
