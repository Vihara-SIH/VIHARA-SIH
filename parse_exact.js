import fs from 'fs';

const content = fs.readFileSync('stitch_exact.html', 'utf8');

// Find all elements and structure in content
console.log('File size:', content.length);

// Extract the html body
const bodyMatch = content.match(/<body[\s\S]*?>([\s\S]*?)<\/body>/i);
if (bodyMatch) {
  let bodyHtml = bodyMatch[1];
  // Remove script tags
  bodyHtml = bodyHtml.replace(/<script[\s\S]*?<\/script>/gi, '');
  fs.writeFileSync('stitch_rendered_markup.html', bodyHtml);
  console.log('Saved stitch_rendered_markup.html');
}

// Extract styles
const styleMatches = Array.from(content.matchAll(/<style[\s\S]*?>([\s\S]*?)<\/style>/gi)).map(m => m[1]);
fs.writeFileSync('stitch_rendered_styles.css', styleMatches.join('\n\n'));
console.log('Saved stitch_rendered_styles.css');
