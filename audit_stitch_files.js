import fs from 'fs';
import path from 'path';

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat && stat.isDirectory()) {
      results = results.concat(walkDir(fullPath));
    } else {
      results.push(fullPath);
    }
  });
  return results;
}

const files = walkDir('./stitch_screens');
files.forEach(f => {
  const content = fs.readFileSync(f, 'utf8');
  console.log(`\n==================================================`);
  console.log(`FILE: ${f} (${content.length} bytes)`);
  console.log(`==================================================`);
  
  // Extract body content or main elements
  const h1s = content.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const h2s = content.match(/<h2[^>]*>([\s\S]*?)<\/h2>/gi) || [];
  const buttons = content.match(/<button[^>]*>([\s\S]*?)<\/button>/gi) || [];
  
  console.log('H1s:', h1s.map(h => h.replace(/<[^>]+>/g, '').trim()));
  console.log('H2s:', h2s.map(h => h.replace(/<[^>]+>/g, '').trim()));
  console.log('Buttons count:', buttons.length);
  console.log('Buttons sample:', buttons.slice(0, 6).map(b => b.replace(/<[^>]+>/g, '').trim()));
});
