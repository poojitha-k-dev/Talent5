const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:postgres@localhost:5432/talent5_v1',
});

async function seedAdminData() {
  console.log('Seeding rich Admin Command Center data...');

  try {
    // 1. Ensure additional users exist for auditions
    await pool.query(`
      INSERT INTO users (id, email, password_hash, full_name, username, phone, is_verified, status)
      VALUES 
      ('a0000000-0000-0000-0000-000000000005', 'meera@talent5.com', '$2b$10$w09ZqW8Vz9Z7Y1gWf1l3Aeu5iV0N7nCq5dC5w6t7g8h9j0k1l2m3n', 'Meera Swaminathan', 'meeraswami', '+919876543210', TRUE, 'ACTIVE'),
      ('a0000000-0000-0000-0000-000000000006', 'rahul.folk@talent5.com', '$2b$10$w09ZqW8Vz9Z7Y1gWf1l3Aeu5iV0N7nCq5dC5w6t7g8h9j0k1l2m3n', 'Rahul Verma', 'rahulbanaras', '+919876543211', TRUE, 'ACTIVE'),
      ('a0000000-0000-0000-0000-000000000007', 'priya.kolkata@talent5.com', '$2b$10$w09ZqW8Vz9Z7Y1gWf1l3Aeu5iV0N7nCq5dC5w6t7g8h9j0k1l2m3n', 'Priya Das', 'priyadasmusic', '+919876543212', TRUE, 'ACTIVE')
      ON CONFLICT (id) DO NOTHING;
    `);

    // Assign USER roles
    await pool.query(`
      INSERT INTO user_roles (user_id, role_id)
      SELECT 'a0000000-0000-0000-0000-000000000005', 1 WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = 'a0000000-0000-0000-0000-000000000005');
      INSERT INTO user_roles (user_id, role_id)
      SELECT 'a0000000-0000-0000-0000-000000000006', 1 WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = 'a0000000-0000-0000-0000-000000000006');
      INSERT INTO user_roles (user_id, role_id)
      SELECT 'a0000000-0000-0000-0000-000000000007', 1 WHERE NOT EXISTS (SELECT 1 FROM user_roles WHERE user_id = 'a0000000-0000-0000-0000-000000000007');
    `);

    // 2. Creator Applications (Pending review)
    await pool.query(`
      INSERT INTO creator_applications (
        id, user_id, full_name, stage_name, bio, city, state, languages, category, genres, experience, 
        social_links, portfolio_url, sample_performance_url, original_composition_info, ownership_declaration, copyright_declaration, status
      ) VALUES
      (
        '11000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000005',
        'Meera Swaminathan',
        'Meera S',
        'Trained classical Carnatic vocalist blending ancient ragas with ambient electronic soundscapes.',
        'Chennai',
        'Tamil Nadu',
        ARRAY['Tamil', 'Telugu', 'Kannada'],
        'CLASSICAL',
        ARRAY['Carnatic & Classical', 'Folk Fusion'],
        '8 years of concert performances across South India sabhas.',
        '{"instagram": "https://instagram.com/meeraswami_music", "youtube": "https://youtube.com/@meeraswami"}'::jsonb,
        'https://meeraswaminathan.art',
        'https://cdn.freesound.org/previews/612/612608_11861866-lq.mp3',
        'Original fusion of Raga Kalyani with acoustic tampura and bass synthesizers.',
        TRUE,
        TRUE,
        'PENDING'
      ),
      (
        '11000000-0000-0000-0000-000000000003',
        'a0000000-0000-0000-0000-000000000006',
        'Rahul Verma',
        'Banaras Beats',
        'Grassroots folk songwriter chronicling everyday life on the ghats of Varanasi.',
        'Varanasi',
        'Uttar Pradesh',
        ARRAY['Hindi', 'Bhojpuri'],
        'FOLK',
        ARRAY['Folk Fusion', 'Acoustic & Unplugged'],
        'Street performer and village festival balladist for 4 years.',
        '{"youtube": "https://youtube.com/@banarasbeats"}'::jsonb,
        'https://banarasbeats.org',
        'https://cdn.freesound.org/previews/665/665183_11861866-lq.mp3',
        'Original Kajari and Chaiti folk compositions written in local Awadhi dialect.',
        TRUE,
        TRUE,
        'PENDING'
      ),
      (
        '11000000-0000-0000-0000-000000000004',
        'a0000000-0000-0000-0000-000000000007',
        'Priya Das',
        'Priya Das',
        'Indie songwriter and acoustic storyteller blending Rabindra Sangeet motifs with modern indie pop.',
        'Kolkata',
        'West Bengal',
        ARRAY['Bengali', 'Hindi', 'English'],
        'SINGER',
        ARRAY['Acoustic & Unplugged', 'Indie Rock & Pop'],
        'Live indie club gigs and collegiate band lead vocalist.',
        '{"instagram": "https://instagram.com/priyadas_notes"}'::jsonb,
        'https://priyadas.live',
        'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3',
        'All acoustic indie lyrics composed and produced on Logic Pro.',
        TRUE,
        TRUE,
        'UNDER_REVIEW'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // 3. Content Submissions (for content moderation)
    await pool.query(`
      INSERT INTO content_submissions (
        id, creator_id, title, description, category, language_id, genre_id, audio_url, video_url, cover_url,
        composer, lyricist, producer, featured_artists, ownership_declaration, status
      ) VALUES
      (
        '20000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'Sufi Malhaar (Rain Raga)',
        'An original monsoon sufi ode celebrating the arrival of seasonal rains in Rajasthan.',
        'SINGER',
        1,
        1,
        'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
        'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=600',
        'Kabir Sen',
        'Kabir Sen & Traditional',
        'Acoustic Desi Records',
        ARRAY['Harshita Sharma'],
        TRUE,
        'SUBMITTED'
      ),
      (
        '20000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        'Amritsar Cypher Round 2',
        'High-octane Punjabi street verses celebrating Punjab heritage and resilience.',
        'RAPPER',
        8,
        3,
        'https://cdn.freesound.org/previews/665/665183_11861866-lq.mp3',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600',
        'DJ Shera',
        'DJ Shera',
        'Shera Productions',
        ARRAY['Young Veer'],
        TRUE,
        'SUBMITTED'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // 4. Rights Records (Various licensing statuses)
    await pool.query(`
      INSERT INTO rights_records (
        id, song_id, rights_holder, ownership_type, license_type, license_provider, territory,
        start_date, end_date, streaming_allowed, download_allowed, monetization_allowed, karaoke_allowed, ugc_allowed,
        status, reviewer_id, notes
      ) VALUES
      (
        '30000000-0000-0000-0000-000000000001',
        'd0000000-0000-0000-0000-000000000004',
        'Heritage Folk Trust of Bengal',
        'DIRECT_LICENSED',
        'Exclusive Digital Streaming License v2.4',
        'IPRS / PPL India',
        'IN, SG, AE, US',
        '2024-01-01',
        '2026-03-31',
        TRUE,
        FALSE,
        TRUE,
        FALSE,
        TRUE,
        'EXPIRED',
        'a0000000-0000-0000-0000-000000000001',
        'License expired on March 31, 2026. Needs renewal or catalog takedown.'
      ),
      (
        '30000000-0000-0000-0000-000000000002',
        'd0000000-0000-0000-0000-000000000005',
        'Raag Music Works',
        'DIRECT_LICENSED',
        'Limited Territory Streaming License',
        'Direct Publisher Agreement',
        'IN',
        '2025-06-01',
        '2026-12-31',
        TRUE,
        FALSE,
        TRUE,
        FALSE,
        FALSE,
        'RESTRICTED',
        'a0000000-0000-0000-0000-000000000001',
        'Restricted from UGC synchronization and third-party compilation playlists.'
      ),
      (
        '30000000-0000-0000-0000-000000000003',
        'd0000000-0000-0000-0000-000000000006',
        'Indie Wave Collective',
        'OPEN_LICENSE',
        'Creative Commons Attribution-NonCommercial (CC BY-NC 4.0)',
        'Open Source Music Registry',
        'WORLDWIDE',
        '2025-01-01',
        '2030-01-01',
        TRUE,
        TRUE,
        FALSE,
        TRUE,
        TRUE,
        'VERIFIED',
        'a0000000-0000-0000-0000-000000000001',
        'Verified open license. Monetization restricted per CC-BY-NC guidelines.'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // 5. Fraud Events & Suspicious Engagement
    await pool.query(`
      INSERT INTO fraud_events (
        id, user_id, event_type, risk_score, evidence, action_taken, created_at
      ) VALUES
      (
        '40000000-0000-0000-0000-000000000001',
        'a0000000-0000-0000-0000-000000000003',
        'RAPID_BURST_LIKES',
        'HIGH',
        '{"burstCount": 62, "windowSeconds": 5, "ipAddress": "103.21.244.18", "userAgent": "Python-urllib/3.11"}'::jsonb,
        'FLAGGED_FOR_REVIEW',
        NOW() - INTERVAL '2 hours'
      ),
      (
        '40000000-0000-0000-0000-000000000002',
        'a0000000-0000-0000-0000-000000000002',
        'SELF_LIKE_ATTEMPT',
        'MEDIUM',
        '{"creatorId": "10000000-0000-0000-0000-000000000001", "targetContentId": "12000000-0000-0000-0000-000000000001", "rule": "NO_CREATOR_SELF_REWARD"}'::jsonb,
        'LIKES_VOIDED',
        NOW() - INTERVAL '6 hours'
      ),
      (
        '40000000-0000-0000-0000-000000000003',
        NULL,
        'DEVICE_FINGERPRINT_COLLISION',
        'HIGH',
        '{"fingerprint": "fp_bot_farm_88a912", "distinctAccounts": 14, "timespanMinutes": 10}'::jsonb,
        'IP_SUBNET_BLOCKED',
        NOW() - INTERVAL '12 hours'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // Add some suspicious likes in likes table
    await pool.query(`
      INSERT INTO likes (
        id, user_id, target_type, target_id, status, risk_score, ip_hash, device_fingerprint, user_agent, created_at
      ) VALUES
      (
        uuid_generate_v4(),
        'a0000000-0000-0000-0000-000000000003',
        'DESI_CONTENT',
        '12000000-0000-0000-0000-000000000001',
        'SUSPICIOUS',
        'HIGH',
        'a3f9c2d1',
        'fp_bot_farm_88a912',
        'HeadlessChrome/122.0.0.0',
        NOW() - INTERVAL '2 hours'
      ),
      (
        uuid_generate_v4(),
        'a0000000-0000-0000-0000-000000000003',
        'SONG',
        'd0000000-0000-0000-0000-000000000001',
        'INVALID',
        'HIGH',
        'a3f9c2d1',
        'fp_bot_farm_88a912',
        'HeadlessChrome/122.0.0.0',
        NOW() - INTERVAL '2 hours'
      )
      ON CONFLICT (user_id, target_type, target_id) DO NOTHING;
    `);

    // 6. Pending Payout Requests
    await pool.query(`
      INSERT INTO payout_requests (
        id, creator_id, amount_inr, payment_method, account_ref_tokenized, status, transaction_ref, notes, created_at
      ) VALUES
      (
        '50000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        1000.00,
        'UPI',
        'kabirsen@icici',
        'REQUESTED',
        NULL,
        'March engagement reward withdrawal',
        NOW() - INTERVAL '1 day'
      ),
      (
        '50000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000002',
        2500.00,
        'BANK_TRANSFER',
        'HDFC Bank - A/C ****7891 (IFSC: HDFC0000123)',
        'UNDER_REVIEW',
        NULL,
        'Quarterly tournament earnings payout',
        NOW() - INTERVAL '3 days'
      )
      ON CONFLICT (id) DO NOTHING;
    `);

    // 7. Initial Audit Logs
    await pool.query(`
      INSERT INTO audit_logs (
        id, actor_id, action, entity_name, entity_id, old_state, new_state, ip_address, created_at
      ) VALUES
      (
        uuid_generate_v4(),
        'a0000000-0000-0000-0000-000000000001',
        'APPROVE_CREATOR_APPLICATION',
        'CREATOR_APPLICATION',
        '11000000-0000-0000-0000-000000000001',
        '{"status": "PENDING"}'::jsonb,
        '{"status": "APPROVED", "notes": "Audition passed 100% verified"}'::jsonb,
        '127.0.0.1',
        NOW() - INTERVAL '10 days'
      ),
      (
        uuid_generate_v4(),
        'a0000000-0000-0000-0000-000000000001',
        'VERIFY_RIGHTS_RECORD',
        'RIGHTS_RECORD',
        '30000000-0000-0000-0000-000000000003',
        '{"status": "PENDING"}'::jsonb,
        '{"status": "VERIFIED", "licenseType": "CC-BY-NC 4.0"}'::jsonb,
        '127.0.0.1',
        NOW() - INTERVAL '5 days'
      ),
      (
        uuid_generate_v4(),
        'a0000000-0000-0000-0000-000000000001',
        'UPDATE_REWARD_RULE',
        'REWARD_RULE',
        '00000000-0000-0000-0000-000000000001',
        '{"rate": 0.08}'::jsonb,
        '{"rate": 0.10, "minimumPayout": 500}'::jsonb,
        '127.0.0.1',
        NOW() - INTERVAL '3 days'
      )
      ON CONFLICT DO NOTHING;
    `);

    console.log('✅ Rich Admin Command Center data seeded successfully.');
  } catch (err) {
    console.error('Error seeding admin data:', err);
  } finally {
    await pool.end();
  }
}

seedAdminData();
