import pg from 'pg';

const pool = new pg.Pool({ connectionString: 'postgresql://postgres:postgres@localhost:5432/talent5_v1' });

async function checkCandidates() {
  const candidates = [
    // Hindi (M.S. Subbulakshmi Meera Bhajans)
    { title: 'Baso More Nayan Mein Nandlal', query: '%Baso More%' },
    { title: 'Daras Bina Dukhan Laage Nain', query: '%Daras Bina%' },
    { title: 'Chakar Rakhoji Mhare Girdhari Lala', query: '%Chakar Rakhoji%' },
    { title: 'More To Giridhar Gopala Dusro Na Koi', query: '%More To Giridhar%' },

    // Tamil / Carnatic (G.N. Balasubramaniam)
    { title: 'Vinayaka Ninu Vina Brova', query: '%Vinayaka Ninu%' },
    { title: 'Pari Palayamam Sri Padmanabha', query: '%Pari Palayamam%' },
    { title: 'Eti Yochanalu Chesedavu Rama', query: '%Eti Yochanalu%' },
    { title: 'Sri Subramanyaya Namaste', query: '%Subramanyaya%' },
    { title: 'Manasuloni Marmamulu Thelusuko', query: '%Manasuloni%' },
    { title: 'Kannane En Kanavan Bharathiyar', query: '%Kannane En Kanavan%' },

    // Telugu (SVBC TTD)
    { title: 'E Dari Sancharintura', query: '%Dari Sancharintura%' },
    { title: 'Evarikaiyavatara Mettitivo', query: '%Evarikaiyavatara%' },

    // Bengali (Rabindra Sangeet)
    { title: 'Sukhe Amar Rakhbe Keno', query: '%Sukhe Amar%' },
    { title: 'Je Chhilo Amar Swapanocharini', query: '%Je Chhilo%' },
    { title: 'Ebar Amai Dakle Priyo', query: '%Ebar Amai%' },
    { title: 'Khama Karo More Sakhigan', query: '%Khama Karo%' },
    { title: 'Ami Hridoyer Katha Bolite Chai', query: '%Hridoyer Katha%' },
    { title: 'Aloo Amar Aloo Ogo', query: '%Aloo Amar%' },

    // Additional Kannada candidates
    { title: 'Buci Bandide Ranga', query: '%Buci Bandide%' },
    { title: 'Didi Adona Ranga', query: '%Didi Adona%' },
    { title: 'Hanuma Namma Thayi Thande', query: '%Hanuma Namma%' },
    { title: 'Parama Purusha Nee Nellikkai', query: '%Nellikkai%' },
    { title: 'Sharanu Sharanayya Guru Raghavendra', query: '%Sharanu Sharanayya%' },
    { title: 'Sri Ramana Poojisalilla Mai Marathenalla', query: '%Poojisalilla%' },
    { title: 'Sri Srinivasa Kalyana Vaibhava', query: '%Srinivasa Kalyana%' },
    { title: 'Simharupanada Srihare Narasimha', query: '%Simharupanada%' },
    { title: 'Swami Mukhya Prana Deva', query: '%Swami Mukhya%' },

    // Gujarati traditional candidates
    { title: 'Sant Param Hitkari Guru Samarth', query: '%Sant Param Hitkari%' },
    { title: 'Mane Pyaru Lage Shreeji Taru Naam', query: '%Mane Pyaru Lage%' },
    { title: 'Shree Krishna Sharanam Mama Kirtan', query: '%Shree Krishna Sharanam%' },
    { title: 'Namo Namo Giriraj Kishori', query: '%Namo Namo Giriraj%' },
    { title: 'Jaya Jaya Aarti Vighnaharta Ganesh', query: '%Aarti Vighnaharta%' }
  ];

  console.log(`Checking ${candidates.length} candidate songs against database...`);
  const cleanList = [];
  for (const c of candidates) {
    const res = await pool.query('SELECT id, title, slug FROM songs WHERE title ILIKE $1', [c.query]);
    if (res.rows.length > 0) {
      console.log(`[EXISTS] "${c.title}" matches:`, res.rows.map(r => r.title));
    } else {
      console.log(`[CLEAN - READY TO ADD] "${c.title}"`);
      cleanList.push(c);
    }
  }

  console.log(`\nFound ${cleanList.length} guaranteed CLEAN, NON-DUPLICATE songs ready for addition!`);
  await pool.end();
}

checkCandidates().catch(console.error);
