import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function findUnadded() {
  const allDbSongs = await pool.query('SELECT title, slug, audio_url FROM songs');
  const existingTitles = new Set(allDbSongs.rows.map(r => r.title.toLowerCase().replace(/[^a-z0-9]/g, '')));
  const existingUrls = new Set(allDbSongs.rows.map(r => r.audio_url.toLowerCase()));

  console.log(`Database has ${allDbSongs.rows.length} existing songs.`);

  // 1. MSS Meera Bhajans
  const mssFiles = [
    { name: 'Baso More Man Mein Nandlal', file: '01 Baso More Man Mein Nandlal.mp3', id: 'MSS-Meera-Bhajans' },
    { name: 'Daras Bina Dukhan Laage Nain', file: '02 Daras Bina Dukhan Laage Nain.mp3', id: 'MSS-Meera-Bhajans' },
    { name: 'Chakar Rakhoji Mhare Chakar Rakhoji', file: '03 Chakar Rakhoji.mp3', id: 'MSS-Meera-Bhajans' },
    { name: 'More To Giridhar Gopala Dusro Na Koi', file: '04 More To Giridhar Gopala.mp3', id: 'MSS-Meera-Bhajans' }
  ];

  // 2. GNB Classical Vocal
  const gnbFiles = [
    { name: 'Vinayaka Ninu Vina Brova', file: 'G.N. Balasubramaniam-Classical Vocal/01-Vinayaka.mp3', id: 'g.n.-balasubramaniam-classical-vocal' },
    { name: 'Pari Palayamam Sri Padmanabha', file: 'G.N. Balasubramaniam-Classical Vocal/02-Pari Palayamam.mp3', id: 'g.n.-balasubramaniam-classical-vocal' },
    { name: 'Eti Yochanalu Chesedavu Rama', file: 'G.N. Balasubramaniam-Classical Vocal/03-Eti Yochanalu.mp3', id: 'g.n.-balasubramaniam-classical-vocal' },
    { name: 'Manasuloni Marmamulu Thelusuko', file: 'G.N. Balasubramaniam-Classical Vocal/05-Manasulonima.mp3', id: 'g.n.-balasubramaniam-classical-vocal' },
    { name: 'Kannane En Kanavan Bharathiyar', file: 'G.N. Balasubramaniam-Classical Vocal/06-Kannane En Kanavan.mp3', id: 'g.n.-balasubramaniam-classical-vocal' }
  ];

  // 3. SVBC TTD Remaining
  const svbcRemaining = [
    { name: 'E Dari Sancharintura', file: '15 - E dAri saMchariMturA - lahari - SRti raMjani.mp3', id: '01SundariNeeDivyaRUpamuJUDaMALavika' },
    { name: 'Evarikaiyavatara Mettitivo', file: '15 - evarikai yavatAra mettitivO - mallAdi - dEvamanOhari.mp3', id: '01SundariNeeDivyaRUpamuJUDaMALavika' }
  ];

  // 4. Check Gujarati Bhajan 36
  const gujResp = await fetch('https://archive.org/metadata/GujaratiBhajan36/files');
  const gujData = await gujResp.json();
  const gujFiles = (gujData.result || []).filter(f => f.name && f.name.endsWith('.mp3')).map(f => ({
    name: f.name.replace('.mp3', ''),
    file: f.name,
    id: 'GujaratiBhajan36'
  }));

  // 5. Check Kannada Ananda Rao
  const kanResp = await fetch('https://archive.org/metadata/dasa_sahitya_shri_ananda_rao_srirangam/files');
  const kanData = await kanResp.json();
  const kanFiles = (kanData.result || []).filter(f => f.name && f.name.endsWith('.mp3')).map(f => ({
    name: f.name.replace('.mp3', ''),
    file: f.name,
    id: 'dasa_sahitya_shri_ananda_rao_srirangam'
  }));

  // 6. Check Rabindra Sangeet
  const rabResp = await fetch('https://archive.org/metadata/RabindraSangeet/files');
  const rabData = await rabResp.json();
  const rabFiles = (rabData.result || []).filter(f => f.name && f.name.endsWith('.mp3')).map(f => ({
    name: f.name.replace('.mp3', ''),
    file: f.name,
    id: 'RabindraSangeet'
  }));

  const allCandidates = [
    ...mssFiles,
    ...gnbFiles,
    ...svbcRemaining,
    ...gujFiles,
    ...kanFiles,
    ...rabFiles
  ];

  const unadded = [];
  for (const c of allCandidates) {
    const norm = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    let exists = false;
    for (const ext of existingTitles) {
      if (ext.includes(norm) || norm.includes(ext)) {
        exists = true;
        break;
      }
    }
    if (!exists) {
      unadded.push(c);
    }
  }

  console.log(`Found ${unadded.length} completely UNADDED vocal gems across collections!`);
  console.log('Sample of 20 unadded gems:');
  console.log(unadded.slice(0, 20));

  await pool.end();
}

findUnadded().catch(console.error);
