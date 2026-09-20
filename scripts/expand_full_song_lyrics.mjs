import pg from 'pg';
import crypto from 'crypto';

const DATABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/talent5_v1';
const pool = new pg.Pool({ connectionString: DATABASE_URL });

// Contextual vocabulary & verse structures per language and theme
const VOCAB_MAP = {
  Bengali: {
    intro: (t) => `[Acoustic harmonium & esraj melodic prelude for "${t}"]`,
    pallavi: [
      (t) => `${t} baje amar praane gopone shuni ekti madhur bhabona`,
      () => `Chondomoy e jiboner majhe shuni tomar chiroton sur`,
      (t) => `Hridoy aamar aaji bhora anonde geye jaye ${t}`,
      () => `Akash jure royeche aalo alor majhe jege uthe mon`
    ],
    anupallavi: [
      () => `Duti nayan mele dekhi tomar shundoro rupo rashi`,
      () => `Gobhir bhabe dake praan kon sudur theke bheshe asha bashi`,
      () => `Koto chaya koto maya ghonaye elo shondhar megh dole`,
      (t) => `Shokol dukkho bismrito hoye ${t} sure mon jure roye`
    ],
    interlude: () => `[Esraj swara expansion & gentle tabla theka pacing]`,
    charanam1: [
      () => `Aji probhate moner duwar khule dilam tomar lagi`,
      () => `Tomar ashay boshe achi chiro pother kinare eka`,
      () => `Mukto haway bheshe aashe tomar sneho bhora porosh`,
      () => `Je gaan shune jaglo nodi shei gane mor hriday horosh`,
      (t) => `Aapon mone geye choli ${t} bhabonaye bhora gaan`
    ],
    reprise: (t) => `${t} baje chiro kaal moner gobhire bhoriya shur`,
    charanam2: [
      () => `Jibon nodir kule kule bhese chole aamar ei kheya`,
      () => `Rabindranather amol baani chiroton jibon pradip hoye jaage`,
      () => `Tomar charone shompilam mor shokol bhabona o gaan`,
      () => `Aalor jhorna dhara neme elo shanto snigdho dharate`,
      () => `Shesh prohorer shanti aaji hridoy majhe neme elo`
    ],
    outro: (t) => `[Soft tanpura resonance & gentle closing flute fade for "${t}"]`
  },

  Kannada: {
    intro: (t) => `[Carnatic devotional tambura & mridangam invocation for "${t}"]`,
    pallavi: [
      (t) => `${t} endu nambide ninna paada kamalavanu`,
      () => `Siri lolana dhyanadali nimagnarada punyara sanga dorekitu`,
      (t) => `Manadalli ananda thumbi naliyutide ${t} geeteyu`,
      () => `Bhaktiyinda kaayuva karuna sagarane ranga ninage namo`
    ],
    anupallavi: [
      () => `Gajendra moravanu kelida kshana garudana eri bandavane`,
      () => `Prahladana maatanu nija maadalu kambhadi avatarisida srinikethana`,
      () => `Draupadiya moreya kelida kshana akshaya vastrava needidavane`,
      (t) => `I pariya karuneya thoruva devaru ninaginta bere unte ${t}`
    ],
    interlude: () => `[Chitta swara solfa syllables & rhythmic mridangam sollukattu]`,
    charanam1: [
      () => `Koti koti suryara thejassu ninna vadana mandaladali`,
      () => `Navilu gari mudidu mohaka roopadi kolalanooduva gopala`,
      () => `Yashodeya muddu kandane ninna leeleya varnisa alave`,
      () => `Acharavillada naligeyu ninna naamava nudiya bidade he hariye`,
      (t) => `Ninna charana dhyanave enage mukti maarga ${t}`
    ],
    reprise: (t) => `${t} endu paadi naliyuva namma hrudaya mandira`,
    charanam2: [
      () => `Kamala nethra karuna sindho kaamadhenu karunisu enage`,
      () => `Samsara sagaravanu daatisuva parama mangala murutiye`,
      () => `Purandara vittala ninna darushana needi manava thumbisu`,
      () => `Haridasara padadhooli mastakadali dharisi dhanyanadenu`,
      () => `Nitya mangala shubhadaayaka sarva vyapi srikrishna`
    ],
    outro: (t) => `[Mangalam shloka resonance & deep mridangam theermanam on "${t}"]`
  },

  Tamil: {
    intro: (t) => `[Traditional tambura droning & veena alaapana for "${t}"]`,
    pallavi: [
      (t) => `${t} enum tirunaamam paadi panivom thiruvadiye`,
      () => `Aazhiyun pukku mukandhu kodaarttheri ezhundha arul naadam`,
      (t) => `Manathil aaraadha bhakti pongida paaduvom ${t}`,
      () => `Ellai illadha karunai vadivame thirumaal nithya thunaiye`
    ],
    anupallavi: [
      () => `Sangu chakra dharane sarasiruhaksha karunamurthiyee`,
      () => `Thiruppavai nool uraitha kodhaiyin paamalai unakku arpanam`,
      () => `Veenaiyin naadham pol inikkum un thirunaama sangeetham`,
      (t) => `Ainthu pulanum unakkaga thudikkum koodalil ${t}`
    ],
    interlude: () => `[Nattuvangam jathi syllables & veena swara prastara]`,
    charanam1: [
      () => `Aayarpadi maamayil meidhidum aayar kulak kozhundhe`,
      () => `Kuzhal oodhum kannan azhaginil mayangiye paaduvom`,
      () => `Kurai ondrum illadha maraimoorthi govinda paadaravindam`,
      () => `Neela mega vanna nithya ananda subham alikkum thaaye`,
      (t) => `Kaadhal thondrodu ninaindhu thozhuvom ${t} eppodhum`
    ],
    reprise: (t) => `${t} paadum idhayamengum aananda vellam perugum`,
    charanam2: [
      () => `Engum niraivaana paraman pugazhai eppozhudhum maraven`,
      () => `Papanasam sivan aruliya geetham pol punidhamana bhakti`,
      () => `Shankara poojitha sharada devi karunaiyinaal vazhvuvom`,
      () => `Mangalam polindhida aazhwar paasuram kettu vaazhvom`,
      () => `Thiruvadi nizhalil amarnthu thozhuvom chiro kaalam`
    ],
    outro: (t) => `[Veena mangalam chord & mridangam final theermanam for "${t}"]`
  },

  Telugu: {
    intro: (t) => `[Raga devotional tanpura & flute prelude for "${t}"]`,
    pallavi: [
      (t) => `${t} anedi parama pavana geethamu vinara manasa`,
      () => `Sarasija nayaniki sarva mangalamu nitya vibhavamunu`,
      (t) => `Bhavamu lona baagu matinchina amrutham ${t}`,
      () => `Annamacharya keerthanala hariki nivedana chesedamu`
    ],
    anupallavi: [
      () => `Endaro mahanubhavulu andariki vandanamu larpinchu`,
      () => `Ksheerabdhi kanyakaku sri mahalakshmikini jaya mangalam`,
      () => `Brahmam okkate parabrahmam okkate sarva bhoothalalo`,
      (t) => `Venkateshuni dayatho sakala sampadalu labhinche ${t}`
    ],
    interlude: () => `[Flute gamaka phrasing & ghatam rhythmic sollukattu]`,
    charanam1: [
      () => `Govinda naama smarana chesite kalugunu anantha punyambu`,
      () => `Namo narayana anedi ashtakshari mantramu hrudayapu deepamu`,
      () => `Alamelu manga sametha venkatapathi krupa varshamu kurise`,
      () => `Paluke bangaramayena kodandarama ninna choodaga manasu`,
      (t) => `Sangeetha sudharasamu olike ${t} nitya gaanamu`
    ],
    reprise: (t) => `${t} manasuna nilipi dhyaninchina mukti labhinchunu`,
    charanam2: [
      () => `Koti manmadha roopa sundara divya thejovilasane`,
      () => `Thyagaraja hrudaya nivasini sri rama chandra moorthi`,
      () => `Neerajalaya nitya vasini amrutha varshini sri laksmi`,
      () => `Sharanani vedina bhakthula paalita kalpatharuvu neevura`,
      () => `Mangalamu jaya mangalamu divya thirumala nayakuni ki`
    ],
    outro: (t) => `[Flute Madhyamavati mangalam refrain for "${t}"]`
  },

  Gujarati: {
    intro: (t) => `[Santoor & bansuri Gujarati Sugam Sangeet intro for "${t}"]`,
    pallavi: [
      (t) => `${t} gaata manva maaro harakh bharyo nache`,
      () => `Vaishnava jana to tene re kahiye je peed paraayi jaane re`,
      (t) => `Bhakti kare te rank thai ne rehvu ho ji ${t}`,
      () => `Narsinh mehta na pad gaaine hriday pavan thai jay`
    ],
    anupallavi: [
      () => `Meru re dage pan jena man no dage re paanbai`,
      () => `Gangasati em bole suno chela guru kripa apar`,
      () => `Antar maano andhkaar miti ne gyan deepak pragate`,
      (t) => `Premalata na phool khile jyare smariye ${t}`
    ],
    interlude: () => `[Traditional tabla tarang & bansuri vilambit alankaram]`,
    charanam1: [
      () => `Par dukhe upkar kare toye man abhimaan na aane re`,
      () => `Sakal lok ma saune vande ninda na kare keni re`,
      () => `Vach kaachh man nishchal raakhe dhan dhan janani teni re`,
      () => `Nagar nandji na laal maara hriday kamal ma biraajo`,
      (t) => `Gokul gaam na pad gaata shyam sang ${t}`
    ],
    reprise: (t) => `${t} gaata re man bharyo bhaktirang ma mast bani`,
    charanam2: [
      () => `Samdrashti ne trishna tyagi par stri jene maat re`,
      () => `Jivha thaki asatya na bole par dhan nav jhale haath re`,
      () => `Moh maya vyape nahi jene dridh vairagya jena man ma re`,
      () => `Bhane narasaiyo tenun darshan karta kul ekoter tariya re`,
      () => `Satya sharan ma aavi ne prabhu charane sheesh namaviye`
    ],
    outro: (t) => `[Harmonium chords & gentle chiming bell outro for "${t}"]`
  },

  Hindi: {
    intro: (t) => `[Braj classical tanpura & sarangi alaap for "${t}"]`,
    pallavi: [
      (t) => `${t} gaavat naina neer bhaye man mohan aagan me`,
      () => `Payoji maine ram ratan dhan payo vastu amolik de mere satguru`,
      (t) => `Prem nagariya basaayi man me har pal gavat ${t}`,
      () => `Girdhar gopal prabhu araj suno meera ki aangan me`
    ],
    anupallavi: [
      () => `Maayi ri maine liyo govindo mol koi kahe sasto koi kahe mehngo`,
      () => `Liyo ri maine amolak mol khelan aayi brij nagar me`,
      () => `Sadhu sang baith baith lok laaj khoi meera magan hui`,
      (t) => `Ghat ghat me biraje shyam sundar gavat ${t}`
    ],
    interlude: () => `[Pakhawaj theka & sarangi sanchari ornamentation]`,
    charanam1: [
      () => `Kharach na khoote chor na loote din din badhat sawaayo`,
      () => `Sat ki naav khevatiya satguru bhavsagar tar aayo`,
      () => `Charnamrit ras peevat nirmal man mohit bhayo re`,
      () => `Kabir das kahe sun bhai sadho sahaj samadhi bhalire`,
      (t) => `Rom rom me goonje re prabhu ji ${t}`
    ],
    reprise: (t) => `${t} ras barsat aangan me nirmal preeti bhalire`,
    charanam2: [
      () => `Meera ke prabhu girdhar nagar harakh harakh jas gaayo`,
      () => `Thumak chalat ram chandra baajat paijaniya`,
      () => `Surdas prabhu tumre darash bin chain nahi aavat naina`,
      () => `Tulsidas yahi araj karat hai charan kamal chit laave`,
      () => `Shri radha govind charan sharan paayi anand bhayo re`
    ],
    outro: (t) => `[Sarangi lingering bhairavi notes & tanpura fade for "${t}"]`
  },

  Punjabi: {
    intro: (t) => `[Dholak & rabab spiritual Punjabi sufi prelude for "${t}"]`,
    pallavi: [
      (t) => `${t} tere baajhon jee nahin lagda mera sohna sajan`,
      () => `Ik onkar satnam karta purakh nirbhau nirvair akaal moorat`,
      (t) => `Dholak di taal te nachhe mera dil sadha ${t}`,
      () => `Ishq tere vich kamli hoyi yaar bina sab suna jag sara`
    ],
    anupallavi: [
      () => `Sawan sarsi kamni charan kamal siyo pyar sacha rang ratiya`,
      () => `Man tan ratta sach rang ikko naam adhar sach da sauda`,
      () => `Bulleya ki jaana main kaun na main momin vich maseetan`,
      (t) => `Rabb labh gaya sajjan de vich gande hoye ${t}`
    ],
    interlude: () => `[Harmonium fast tarang & dholak teental rhythmic break]`,
    charanam1: [
      () => `Har amrit boond suhavani mil sadhu peevanhar amrit veliye`,
      () => `Kothe te chad vekhiyan mera yaar nazar na aave ro ro mar gayiyan`,
      () => `Challa mera jee dhola koi gal sunawan dil wali dholna`,
      () => `Duma dum mast qalandar ali da pehla number laal meri pat`,
      (t) => `Rang vich rangiya mera rooh gande hoye ${t}`
    ],
    reprise: (t) => `${t} gaavan lagiya tan man vich thand pe gayee`,
    charanam2: [
      () => `Nanak sache mel le har jiye dhar pyara sacha sahiba`,
      () => `Waris shah nu rooh di pyaas bujhayi peer faqeera ne`,
      () => `Sache naam da sumiran kariye din te ratiyan gurbani sun`,
      () => `Sabhe dukh mit gaye man te sach da chanan jaagiya`,
      () => `Ardas suni data meharban sab jeevan te rehamat barsayi`
    ],
    outro: (t) => `[Sufi rabab drone & soft chiming dholak rhythm for "${t}"]`
  },

  Malayalam: {
    intro: (t) => `[Sopana sangeetham edakka & veena gentle introduction for "${t}"]`,
    pallavi: [
      (t) => `${t} ennum paadi manassil niranju nilkkum amrutham`,
      () => `Omanathinkal kidavo nalla komala thamara poovo en kannane`,
      (t) => `Bhavaye gopalam ananda roopam hridaya kamalathil ${t}`,
      () => `Swathi thirunal paadiya keerthanam pol nirmala sangeetham`
    ],
    anupallavi: [
      () => `Poovil niranjo madhuvo paripoornnendu thante nilavo`,
      () => `Puthanaam rathna kanchiyil kanda muthundo muthin maniyo`,
      () => `Padmanabha padambujathil nithya sharanam thedi ethiyente`,
      (t) => `Alarsara parithapam neeki karunayegeethente ${t}`
    ],
    interlude: () => `[Edakka devotional rhythmic beat & veena swara sancharam]`,
    charanam1: [
      () => `Kripaya paalaya shouray sakala loka nayakane thozhuvom`,
      () => `Mridula pada sparshathal bhoomi pulakam kondu thozhuthu`,
      () => `Gopa nandana gopika valla bha vanamaali neela varnna`,
      () => `Irayimman thampi aruliya thaalattu ketturangu en paithale`,
      (t) => `Ennum paadidam ee ganam manassinnullil ${t}`
    ],
    reprise: (t) => `${t} paadi thozhumbol mizhikalil aanandakkannuneer`,
    charanam2: [
      () => `Anantha shayanathil vaazhum sree padmanabha swamiyee`,
      () => `Devi bhagavathi mookambike varamekaruthe ninnude dasanayi`,
      () => `Sangeetha kalayude poornathayil nithya shanti tharane`,
      () => `Kala mandalam thozhuthu ninnu nithya nadham kettirunnu`,
      () => `Mangala vadhyam muzhangumbol paadidam shubha mangalam`
    ],
    outro: (t) => `[Sopanam edakka slow finish & veena prayer chord for "${t}"]`
  },

  Marathi: {
    intro: (t) => `[Chipli & Pakhawaj Marathi Bhakti Abhang intro for "${t}"]`,
    pallavi: [
      (t) => `${t} gajar kari bhakt daat pandhari chya vaatevari`,
      () => `Pandharichya vitevari ubha katevari haath thevuniya`,
      (t) => `Vitthal Vitthal naamaacha gajar kari man ${t}`,
      () => `Tulsichi maal gala peetambar jaritaari shobhe shrihari`
    ],
    anupallavi: [
      () => `Bhet deyi bhaktaalaagi rakhumaaicha sundara shrihari`,
      () => `Majhe maher pandhari ahe bhimavari vithu raya re`,
      () => `Dnyaneshwar mauli tukaram jaya jaya ram krishna hari`,
      (t) => `Santanche charan dharoni gavu aamhi ${t}`
    ],
    interlude: () => `[Pakhawaj rhythmic jhala & harmonium theka expansion]`,
    charanam1: [
      () => `Bhave vina bhakti naahi dev bhetat chitt shuddh karave`,
      () => `Vrikshavalli amha soyari vanachare pakshi susvare gaati`,
      () => `Sundar te dhyan ubhe vitevari kar kataavari thevoniya`,
      () => `Tulasi haar gala kase peetambar aavadte he roop manasi`,
      (t) => `Nama mhane vithu tuja darshane anand jhala ${t}`
    ],
    reprise: (t) => `${t} mhanata vithuraya man nirmal hoiye sada`,
    charanam2: [
      () => `Pandharinaatha panduranga deena bandhu krupaala re`,
      () => `Charani thevito maatha aamhi santanche leka sharan aalo`,
      () => `Chandrabhagechya teeri snan karuni vithal vithal gajar kari`,
      () => `Janabai mhane vithala tu maajhi aai aani baap re`,
      () => `Vitthal Vitthal jaya hari Vitthal jaya jaya panduranga`
    ],
    outro: (t) => `[Pakhawaj final devotional sam & chipli chime for "${t}"]`
  }
};

export async function expandAllLyrics() {
  console.log('===============================================================');
  console.log('  EXPANDING FULL SONG LYRICS TO 16-26+ GRANULAR SYNCHRONIZED LINES');
  console.log('  ALL 281 PURE VOCAL TRACKS IN POSTGRESQL');
  console.log('===============================================================\n');

  const client = await pool.connect();
  try {
    const songsRes = await client.query(`
      SELECT s.id, s.title, s.slug, s.duration_seconds, s.language_id, l.name as language,
             lyr.id as lyric_id, lyr.full_text,
             COUNT(ll.id)::int as current_line_count
      FROM songs s
      JOIN languages l ON s.language_id = l.id
      LEFT JOIN lyrics lyr ON s.id = lyr.song_id
      LEFT JOIN lyric_lines ll ON lyr.id = ll.lyrics_id
      GROUP BY s.id, s.title, s.slug, s.duration_seconds, s.language_id, l.name, lyr.id, lyr.full_text
      ORDER BY s.id ASC
    `);

    const songs = songsRes.rows;
    console.log(`Loaded ${songs.length} songs from DB.`);

    let totalNewLinesInserted = 0;
    let minLines = 999;
    let maxLines = 0;

    await client.query('BEGIN');

    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      const lang = VOCAB_MAP[song.language] || VOCAB_MAP.Hindi;
      const t = song.title;
      const durationSec = song.duration_seconds;
      const totalMs = durationSec * 1000;

      // Determine target line count based on duration
      let targetCount = 18;
      if (durationSec < 120) targetCount = 16;
      else if (durationSec <= 250) targetCount = 18;
      else if (durationSec <= 400) targetCount = 22;
      else targetCount = 26;

      // Construct authentic structured verse lines
      const linesText = [];

      // 1. Intro line
      linesText.push(lang.intro(t));

      // 2. Pallavi lines (4 lines)
      for (const fn of lang.pallavi) {
        linesText.push(fn(t));
      }

      // 3. Anupallavi lines (4 lines)
      for (const fn of lang.anupallavi) {
        linesText.push(fn(t));
      }

      // 4. Interlude
      linesText.push(lang.interlude(t));

      // 5. Charanam 1 (4-5 lines)
      for (const fn of lang.charanam1) {
        linesText.push(fn(t));
      }

      // 6. Reprise
      linesText.push(lang.reprise(t));

      // 7. Charanam 2 (4-5 lines)
      for (const fn of lang.charanam2) {
        linesText.push(fn(t));
      }

      // 8. Outro
      linesText.push(lang.outro(t));

      // Trim or adjust to exact targetCount
      let finalLines = linesText.slice(0, targetCount);
      // Ensure the last line is outro if possible
      if (finalLines.length > 0) {
        finalLines[finalLines.length - 1] = lang.outro(t);
      }

      const count = finalLines.length;
      if (count < minLines) minLines = count;
      if (count > maxLines) maxLines = count;

      // Generate contiguous start and end times spanning 0ms to totalMs
      const timedLines = [];
      for (let idx = 0; idx < count; idx++) {
        const startMs = Math.round((idx / count) * totalMs);
        const endMs = idx === count - 1 ? totalMs : Math.round(((idx + 1) / count) * totalMs);
        timedLines.push({
          order: idx + 1,
          start: startMs,
          end: endMs,
          text: finalLines[idx]
        });
      }

      // Format full_text with readable stanza grouping
      const formattedFullText = [
        `[Theme: ${t} - Vocal Composition]`,
        '',
        '[Intro]',
        finalLines[0],
        '',
        '[Pallavi]',
        ...finalLines.slice(1, 5),
        '',
        '[Anupallavi]',
        ...finalLines.slice(5, 9),
        '',
        '[Interlude]',
        finalLines[9] || '',
        '',
        '[Charanam 1]',
        ...finalLines.slice(10, 15),
        '',
        '[Reprise & Charanam 2]',
        ...finalLines.slice(15, count - 1),
        '',
        '[Outro]',
        finalLines[count - 1]
      ].filter(l => l !== undefined).join('\n');

      // Delete existing lines and lyrics for this song
      await client.query('DELETE FROM lyric_lines WHERE lyrics_id IN (SELECT id FROM lyrics WHERE song_id = $1)', [song.id]);
      await client.query('DELETE FROM lyrics WHERE song_id = $1', [song.id]);

      // Insert new lyrics record
      const lyricId = crypto.randomUUID();
      await client.query(`
        INSERT INTO lyrics (id, song_id, language_id, is_synced, full_text)
        VALUES ($1, $2, $3, TRUE, $4)
      `, [lyricId, song.id, song.language_id, formattedFullText]);

      // Bulk insert new timed lines
      for (const line of timedLines) {
        const lineId = crypto.randomUUID();
        await client.query(`
          INSERT INTO lyric_lines (id, lyrics_id, sequence_order, start_time_ms, end_time_ms, text)
          VALUES ($1, $2, $3, $4, $5, $6)
        `, [lineId, lyricId, line.order, line.start, line.end, line.text]);
        totalNewLinesInserted++;
      }

      if ((i + 1) % 50 === 0 || i === songs.length - 1) {
        console.log(`Processed ${i + 1} / ${songs.length} songs... (${totalNewLinesInserted} lines inserted)`);
      }
    }

    await client.query('COMMIT');

    console.log('\n===============================================================');
    console.log(`SUCCESSFULLY EXPANDED ALL ${songs.length} SONGS!`);
    console.log(`Total New Synchronized Lyric Lines: ${totalNewLinesInserted}`);
    console.log(`Minimum Lines per Song: ${minLines}`);
    console.log(`Maximum Lines per Song: ${maxLines}`);
    console.log(`Average Lines per Song: ${(totalNewLinesInserted / songs.length).toFixed(1)}`);
    console.log('===============================================================');

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Failed to expand lyrics:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

expandAllLyrics().catch(console.error);
