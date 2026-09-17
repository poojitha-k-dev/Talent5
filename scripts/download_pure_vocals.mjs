import fs from 'fs';
import https from 'https';

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (response) => {
      if (response.statusCode === 302 || response.statusCode === 301) {
        return downloadFile(response.headers.location, dest).then(resolve).catch(reject);
      }
      if (response.statusCode !== 200) {
        return reject(new Error(`Failed to download ${url}: status ${response.statusCode}`));
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close(resolve);
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  const base = 'https://archive.org/download/LakshmiKataksham/Lakshmi%20Kataksham/';
  
  // 1. Kannada: Bhagyada Lakshmi Baramma (Purandara Dasa, Vocal by M. S. Subbulakshmi)
  console.log('Downloading Kannada vocal: Bhagyada Lakshmi Baramma...');
  await downloadFile(
    base + encodeURIComponent('10 Bhagyada Lakshmi Baramma.mp3'),
    'apps/web/public/media/bhagyada_lakshmi_baramma.mp3'
  );
  console.log('Downloaded bhagyada_lakshmi_baramma.mp3! Size:', fs.statSync('apps/web/public/media/bhagyada_lakshmi_baramma.mp3').size);

  // 2. Tamil: Kurai Onrum Illai (Vocal by M. S. Subbulakshmi)
  console.log('Downloading Tamil vocal: Kurai Onrum Illai...');
  await downloadFile(
    base + encodeURIComponent('09 Kurai Onrum Illai.mp3'),
    'apps/web/public/media/kurai_onrum_illai.mp3'
  );
  console.log('Downloaded kurai_onrum_illai.mp3! Size:', fs.statSync('apps/web/public/media/kurai_onrum_illai.mp3').size);
}

main().catch(console.error);
