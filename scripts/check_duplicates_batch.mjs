import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

const titles = [
  'Nada Tanumanisham', 'E Dari Sancharintura', 'Evarikaiyavatara Mettitivo',
  'Baso More Man Mein Nandlal', 'Daras Bina Dukhan Laage Nain', 'Chakar Rakhoji', 'More To Giridhar Gopala',
  'Vinayaka Ninu Vina', 'Pari Palayamam', 'Eti Yochanalu', 'Manasulonima', 'Kannane En Kanavan',
  'Asan Prem Umahra', 'Asarh Tapanda Tis Lagai', 'Bhaduye Bhram Bhulaniya', 'Chet Govind Aradhiaei',
  'Har Jeth Jurhanda Loriyai', 'Jinn Jinn Naam Dhyaeya', 'Kattak Karam Kamavane', 'Maagh Majan Sangh Sadhuaa',
  'Aha Aji E Boshanto', 'Bhalobashi Bhalobashi', 'Sakhi Bohe Gelo Bela', 'Ami Tomar Preme', 'Amar Mon Manena',
  'Bare Nammani Tanaka', 'Baravva Mahabhagyada Abhimani', 'Buci Bandide Ranga', 'Entha Punyave Gopi', 'Didi Adona Ranga'
];

async function run() {
  let dupCount = 0;
  for (const t of titles) {
    const r = await pool.query('SELECT id, title FROM songs WHERE title ILIKE $1', [`%${t}%`]);
    if (r.rows.length > 0) {
      console.log('FOUND EXISTING:', t, '->', r.rows.map(x => x.title));
      dupCount++;
    }
  }
  console.log(`Finished check: ${dupCount} duplicates found out of ${titles.length} candidates.`);
  await pool.end();
}

run();
