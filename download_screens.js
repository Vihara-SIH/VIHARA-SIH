import fs from 'fs';
import https from 'https';

const screens = [
  { id: 'screen1_home', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTFhZjkxOTUxNjUwMjJkNGEwOWZkMjQ4ZjBjEgsSBxDu9LyjtggYAZIBIwoKcHJvamVjdF9pZBIVQhM3NDA4MDE1NzYxMDM3NzU3MzM4&filename=&opi=89354086' },
  { id: 'screen2_logo_anim', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTFhZmYzYjY2NWUwMmQzY2FkZDE3MWY0NTE5EgsSBxDu9LyjtggYAZIBIwoKcHJvamVjdF9pZBIVQhM3NDA4MDE1NzYxMDM3NzU3MzM4&filename=&opi=89354086' },
  { id: 'screen3_trip_details', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTNkYTM3MDA5ZTIwMzgzOWM4Mjc1M2M0NTAxEgsSBxDu9LyjtggYAZIBIwoKcHJvamVjdF9pZBIVQhM3NDA4MDE1NzYxMDM3NzU3MzM4&filename=&opi=89354086' },
  { id: 'screen4_budget', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTNkY2Q2OTZmNDQwNjM5NGU5YzU3MDc5MzExEgsSBxDu9LyjtggYAZIBIwoKcHJvamVjdF9pZBIVQhM3NDA4MDE1NzYxMDM3NzU3MzM4&filename=&opi=89354086' },
  { id: 'screen5_trip_overview_p4', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTFiZjZkODE0NGIwNzA5MmVhYjg1MDNkOTRhEgsSBxDu9LyjtggYAZIBIwoKcHJvamVjdF9pZBIVQhM3NDA4MDE1NzYxMDM3NzU3MzM4&filename=&opi=89354086' },
  { id: 'screen6_categories', url: 'https://contribution.usercontent.google.com/download?c=CgthaWRhX2NvZGVmeBJ7Eh1hcHBfY29tcGFuaW9uX2dlbmVyYXRlZF9maWxlcxpaCiVodG1sXzAwMDY1YTFjNjg4N2Q2ZTkwNTIyYTA5OTk2MGRkNTlmEgsSBxDu9LyjtggYAZIBIwoKcHJvamVjdF9pZBIVQhM3NDA4MDE1NzYxMDM3NzU3MzM4&filename=&opi=89354086' }
];

if (!fs.existsSync('./stitch_screens')) fs.mkdirSync('./stitch_screens');

for (const s of screens) {
  https.get(s.url, res => {
    let data = '';
    res.on('data', chunk => { data += chunk; });
    res.on('end', () => {
      fs.writeFileSync(`./stitch_screens/${s.id}.html`, data);
      console.log(`Saved ${s.id}.html (${data.length} bytes)`);
    });
  }).on('error', err => console.error(err));
}
