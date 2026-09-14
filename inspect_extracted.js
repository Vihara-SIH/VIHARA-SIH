import fs from 'fs';

const resps = JSON.parse(fs.readFileSync('./extracted_stitch_raw/intercepted_responses.json', 'utf8'));
console.log('Intercepted response count:', resps.length);
resps.forEach((r, idx) => {
  console.log(idx, r.url.slice(0, 100), 'Length:', r.text.length);
  const matches = r.text.match(/https:\/\/contribution\.usercontent\.google\.com\/[^\s"'<>]+/g) || [];
  if (matches.length > 0) {
    console.log('  Found download URLs:', matches);
  }
});
