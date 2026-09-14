import fs from 'fs';

for (const f of ['stitch_frame_0.html', 'stitch_frame_1.html']) {
  if (fs.existsSync(f)) {
    const txt = fs.readFileSync(f, 'utf8');
    console.log(`=== ${f} (${txt.length} chars) ===`);
    const urls = txt.match(/https?:\/\/[^\s"'<>]+/g) || [];
    const contributionUrls = urls.filter(u => u.includes('contribution.usercontent.google.com') || u.includes('stitch'));
    console.log('Contribution / Stitch URLs:', [...new Set(contributionUrls)]);
    
    // search for screen or frame names
    const screenMatches = txt.match(/"name":\s*"[^"]+"/g) || [];
    console.log('Screen names / json properties:', screenMatches.slice(0, 20));
  }
}
