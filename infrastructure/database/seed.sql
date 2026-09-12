-- ==========================================================
-- TALENT5 COMPREHENSIVE SEED DATASET (PostgreSQL 16)
-- ==========================================================

-- 1. ROLES
INSERT INTO roles (id, name, description) VALUES
(1, 'USER', 'Standard music listener and social user'),
(2, 'CREATOR', 'Approved Desi creator with publishing and monetization rights'),
(3, 'MODERATOR', 'Content and copyright review specialist'),
(4, 'ADMIN', 'Talent5 Command Center Administrator'),
(5, 'SUPER_ADMIN', 'Full system privilege administrator'),
(6, 'FINANCE', 'Financial operations and payout management')
ON CONFLICT (id) DO NOTHING;

-- 2. USERS
-- Admin: admin@talent5.com / Talent5Admin2026!
-- Creator: creator@talent5.com / Talent5Creator2026!
-- Listener: listener@talent5.com / Talent5Listener2026!
INSERT INTO users (id, email, password_hash, full_name, username, avatar_url, is_verified, status) VALUES
('a0000000-0000-0000-0000-000000000001', 'admin@talent5.com', '$2a$10$8TEdhJ8JkjmtmB0YEUVTv.hOeLoGTnLMkC/Ny776vgUUTTfqRb8mC', 'Talent5 Commander', 'talent5_admin', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', TRUE, 'ACTIVE'),
('a0000000-0000-0000-0000-000000000002', 'creator@talent5.com', '$2a$10$iZZRwDFBdrcBTTKM9UjKU.9nhIe9f3bA6/LNXEIHkZnTJCzT3iBwa', 'Kabir Sen', 'kabir_sen_music', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', TRUE, 'ACTIVE'),
('a0000000-0000-0000-0000-000000000003', 'listener@talent5.com', '$2a$10$HyvBacb6tL7eYUzbBOYzUeJKIm1hKIA2O3bsahyAIFjzoJhmwpLJy', 'Pooja Patel', 'pooja_desi', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150', TRUE, 'ACTIVE'),
('a0000000-0000-0000-0000-000000000004', 'shera@talent5.com', '$2a$10$iZZRwDFBdrcBTTKM9UjKU.9nhIe9f3bA6/LNXEIHkZnTJCzT3iBwa', 'DJ Shera', 'shera_punjab', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', TRUE, 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 3. USER ROLES
INSERT INTO user_roles (user_id, role_id) VALUES
('a0000000-0000-0000-0000-000000000001', 4), -- Admin
('a0000000-0000-0000-0000-000000000001', 5), -- Super Admin
('a0000000-0000-0000-0000-000000000002', 1), -- User
('a0000000-0000-0000-0000-000000000002', 2), -- Creator
('a0000000-0000-0000-0000-000000000003', 1), -- User
('a0000000-0000-0000-0000-000000000004', 1), -- User
('a0000000-0000-0000-0000-000000000004', 2)  -- Creator
ON CONFLICT DO NOTHING;

-- 4. 13 INDIAN LANGUAGES
INSERT INTO languages (id, code, name, native_name, is_active) VALUES
(1, 'hi', 'Hindi', 'हिन्दी', TRUE),
(2, 'te', 'Telugu', 'తెలుగు', TRUE),
(3, 'ta', 'Tamil', 'தமிழ்', TRUE),
(4, 'kn', 'Kannada', 'ಕನ್ನಡ', TRUE),
(5, 'ml', 'Malayalam', 'മലയാളം', TRUE),
(6, 'mr', 'Marathi', 'मराठी', TRUE),
(7, 'bn', 'Bengali', 'বাংলা', TRUE),
(8, 'pa', 'Punjabi', 'ਪੰਜਾਬੀ', TRUE),
(9, 'gu', 'Gujarati', 'ગુજરાતી', TRUE),
(10, 'or', 'Odia', 'ଓଡ଼ିଆ', TRUE),
(11, 'as', 'Assamese', 'অসমীয়া', TRUE),
(12, 'ur', 'Urdu', 'اردو', TRUE),
(13, 'en', 'English', 'English', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. GENRES
INSERT INTO genres (id, name, slug, description) VALUES
(1, 'Desi Hip-Hop', 'desi-hip-hop', 'Raw street rap and rhythmic rhymes rooted in Indian cities'),
(2, 'Bollywood Pop', 'bollywood-pop', 'Melodic, cinematic, upbeat modern Hindi music'),
(3, 'Sufi & Ghazal', 'sufi-ghazal', 'Soulful, poetic, acoustic melodies reflecting deep emotions'),
(4, 'Carnatic Classical', 'carnatic-classical', 'Traditional South Indian classical ragas and swara arrangements'),
(5, 'Punjabi Beats', 'punjabi-beats', 'Energetic dhol grooves, bhangra rhythms, and bass drops'),
(6, 'Folk Fusion', 'folk-fusion', 'Regional indigenous instruments blended with modern production'),
(7, 'Telugu Melody', 'telugu-melody', 'Lyrical, emotive acoustic compositions from the Deccan'),
(8, 'Tamil Indie', 'tamil-indie', 'Cutting-edge independent Madras beats and experimental acoustics'),
(9, 'Hindustani Classical', 'hindustani-classical', 'Ancient North Indian instrumental and vocal improvisation'),
(10, 'Acoustic & Unplugged', 'acoustic-unplugged', 'Stripped-back vocals, sitar, guitar, and authentic tabla')
ON CONFLICT (id) DO NOTHING;

-- 6. ARTISTS
INSERT INTO artists (id, name, slug, bio, avatar_url, cover_url, is_verified, user_id, total_plays, followers_count) VALUES
('b0000000-0000-0000-0000-000000000001', 'Kabir Sen', 'kabir-sen', 'Independent acoustic singer-songwriter blending Sufi mysticism with indie folk guitar.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300', 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=1200', TRUE, 'a0000000-0000-0000-0000-000000000002', 124500, 8940),
('b0000000-0000-0000-0000-000000000002', 'Ananya Rao', 'ananya-rao', 'Carnatic vocalist bridging centuries of classical ragas with contemporary world ambient beats.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=1200', TRUE, NULL, 98200, 6420),
('b0000000-0000-0000-0000-000000000003', 'DJ Shera', 'dj-shera', 'Amritsar-based producer creating thumping folk-drill beats and authentic Punjabi melodies.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200', TRUE, 'a0000000-0000-0000-0000-000000000004', 215800, 14200),
('b0000000-0000-0000-0000-000000000004', 'Suhasini Roy', 'suhasini-roy', 'Baul folk singer and dotara artist from Kolkata fusing ancient ballads with jazz harmonies.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200', TRUE, NULL, 73400, 4810)
ON CONFLICT (id) DO NOTHING;

-- 7. ALBUMS
INSERT INTO albums (id, title, slug, artist_id, release_date, cover_url, type, language_id, genre_id) VALUES
('c0000000-0000-0000-0000-000000000001', 'Ruhaniyat (Soulful Echoes)', 'ruhaniyat-soulful-echoes', 'b0000000-0000-0000-0000-000000000001', '2026-01-15', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600', 'ALBUM', 1, 3),
('c0000000-0000-0000-0000-000000000002', 'Dakshin Vani', 'dakshin-vani', 'b0000000-0000-0000-0000-000000000002', '2026-02-10', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600', 'EP', 2, 4),
('c0000000-0000-0000-0000-000000000003', 'Pind Di Awaaz', 'pind-di-awaaz', 'b0000000-0000-0000-0000-000000000003', '2026-03-01', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600', 'SINGLE', 8, 5)
ON CONFLICT (id) DO NOTHING;

-- 8. SONGS (Using licensed/demo media URLs and rich Indian metadata)
INSERT INTO songs (id, title, slug, artist_id, album_id, featured_artists, language_id, genre_id, mood, duration_seconds, audio_url, artwork_url, release_date, is_explicit, play_count, raw_likes_count, valid_likes_count, popularity_score, status) VALUES
('d0000000-0000-0000-0000-000000000001', 'Tum Bin Mann Kaha', 'tum-bin-mann-kaha', 'b0000000-0000-0000-0000-000000000001', 'c0000000-0000-0000-0000-000000000001', '[]'::jsonb, 1, 3, 'Romantic / Soulful', 214, 'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3', 'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=600', '2026-01-15', FALSE, 42100, 3120, 3050, 94.5, 'PUBLISHED'),
('d0000000-0000-0000-0000-000000000002', 'Swara Tarangam', 'swara-tarangam', 'b0000000-0000-0000-0000-000000000002', 'c0000000-0000-0000-0000-000000000002', '[]'::jsonb, 2, 4, 'Meditative / Classical', 245, 'https://cdn.freesound.org/previews/415/415951_5121236-lq.mp3', 'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600', '2026-02-10', FALSE, 31900, 2410, 2390, 89.2, 'PUBLISHED'),
('d0000000-0000-0000-0000-000000000003', 'Pind Di Beat', 'pind-di-beat', 'b0000000-0000-0000-0000-000000000003', 'c0000000-0000-0000-0000-000000000003', '["MC Raw"]'::jsonb, 8, 5, 'High Energy / Party', 182, 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3', 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600', '2026-03-01', FALSE, 68400, 5820, 5710, 98.1, 'PUBLISHED'),
('d0000000-0000-0000-0000-000000000004', 'Bhorer Alo', 'bhorer-alo', 'b0000000-0000-0000-0000-000000000004', NULL, '[]'::jsonb, 7, 6, 'Serene / Morning', 228, 'https://cdn.freesound.org/previews/518/518882_11861866-lq.mp3', 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=600', '2026-02-25', FALSE, 18900, 1540, 1510, 82.0, 'PUBLISHED'),
('d0000000-0000-0000-0000-000000000005', 'Neeve Naa Praanam', 'neeve-naa-praanam', 'b0000000-0000-0000-0000-000000000002', NULL, '[]'::jsonb, 2, 7, 'Romantic Melody', 260, 'https://cdn.freesound.org/previews/415/415951_5121236-lq.mp3', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600', '2026-03-05', FALSE, 27300, 2190, 2150, 87.4, 'PUBLISHED'),
('d0000000-0000-0000-0000-000000000006', 'Gully To Gagan', 'gully-to-gagan', 'b0000000-0000-0000-0000-000000000003', NULL, '["MC Raw", "Kabir Sen"]'::jsonb, 1, 1, 'Inspirational / Hype', 195, 'https://cdn.freesound.org/previews/612/612610_11861866-lq.mp3', 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600', '2026-03-08', FALSE, 51200, 4100, 3980, 92.8, 'PUBLISHED')
ON CONFLICT (id) DO NOTHING;

-- 9. RIGHTS RECORDS (Rights-First Compliance)
INSERT INTO rights_records (id, song_id, rights_holder, ownership_type, license_type, license_provider, territory, start_date, streaming_allowed, download_allowed, monetization_allowed, karaoke_allowed, ugc_allowed, proof_document_url, status, notes) VALUES
('e0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'Kabir Sen Records', 'CREATOR_OWNED', 'TALENT5_EXCLUSIVE_DIGITAL', 'Talent5 Direct Agreement #T5-2026-001', 'IN,US,GB,AE', '2026-01-01', TRUE, FALSE, TRUE, TRUE, TRUE, 'https://talent5.com/rights/docs/T5-2026-001.pdf', 'VERIFIED', 'Direct independent creator release signed with 100% master & publishing rights verified.'),
('e0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000002', 'Ananya Rao / Swara Arts', 'DIRECT_LICENSED', 'COMMERCIAL_STREAMING_V1', 'Deccan Music Trust', 'GLOBAL', '2026-01-01', TRUE, FALSE, TRUE, FALSE, TRUE, 'https://talent5.com/rights/docs/T5-2026-002.pdf', 'VERIFIED', 'Classical original arrangement under open cultural licensing.'),
('e0000000-0000-0000-0000-000000000003', 'd0000000-0000-0000-0000-000000000003', 'Shera Soundworks', 'CREATOR_OWNED', 'TALENT5_CREATOR_PARTNER', 'Talent5 Desi Creator License', 'IN', '2026-02-01', TRUE, TRUE, TRUE, TRUE, TRUE, 'https://talent5.com/rights/docs/T5-2026-003.pdf', 'VERIFIED', 'Approved Desi original track eligible for like-based monetization.')
ON CONFLICT (id) DO NOTHING;

-- 10. SYNCHRONIZED LYRICS
INSERT INTO lyrics (id, song_id, language_id, is_synced, full_text) VALUES
('f0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 1, TRUE, 'Tum bin mann kaha lage re saawariya
Suni yeh naina dhoondhe teri galiya
Chupke se aake meri saanso mein bas jaa
Tere bina yeh jeevan adhura sa lage')
ON CONFLICT (song_id) DO NOTHING;

INSERT INTO lyric_lines (id, lyrics_id, sequence_order, start_time_ms, end_time_ms, text) VALUES
(uuid_generate_v4(), 'f0000000-0000-0000-0000-000000000001', 1, 0, 4500, 'Tum bin mann kaha lage re saawariya...'),
(uuid_generate_v4(), 'f0000000-0000-0000-0000-000000000001', 2, 4500, 9200, 'Suni yeh naina dhoondhe teri galiya...'),
(uuid_generate_v4(), 'f0000000-0000-0000-0000-000000000001', 3, 9200, 14800, 'Chupke se aake meri saanso mein bas jaa...'),
(uuid_generate_v4(), 'f0000000-0000-0000-0000-000000000001', 4, 14800, 21000, 'Tere bina yeh jeevan adhura sa lage...')
ON CONFLICT DO NOTHING;

-- 11. CREATOR PROFILES & APPLICATIONS
INSERT INTO creator_profiles (id, user_id, stage_name, bio, city, state, primary_language_id, category, is_approved, approved_at, verified_badge, portfolio_url) VALUES
('10000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Kabir Sen', 'Acoustic Sufi singer & indie storyteller from the pink city of Jaipur.', 'Jaipur', 'Rajasthan', 1, 'SINGER', TRUE, '2026-01-10 10:00:00+00', TRUE, 'https://kabirsen.music'),
('10000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000004', 'DJ Shera', 'Punjabi folk and hip-hop beat creator crafting anthems for youth.', 'Amritsar', 'Punjab', 8, 'RAPPER', TRUE, '2026-02-15 14:30:00+00', TRUE, 'https://djshera.in')
ON CONFLICT (id) DO NOTHING;

INSERT INTO creator_applications (id, user_id, full_name, stage_name, bio, city, state, languages, category, genres, experience, social_links, portfolio_url, sample_performance_url, original_composition_info, ownership_declaration, copyright_declaration, status, reviewed_by, review_notes) VALUES
('11000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000002', 'Kabir Sen', 'Kabir Sen', 'Self-taught guitarist and vocalist singing classical sufi poetry.', 'Jaipur', 'Rajasthan', ARRAY['Hindi', 'Urdu'], 'SINGER', ARRAY['Sufi & Ghazal', 'Acoustic & Unplugged'], '5 years performing at cultural fests and indie cafes.', '{"instagram": "https://instagram.com/kabir_sen", "youtube": "https://youtube.com/@kabirsen"}'::jsonb, 'https://kabirsen.music', 'https://cdn.freesound.org/previews/557/557194_11861866-lq.mp3', 'All tracks composed on acoustic guitar with original lyrics.', TRUE, TRUE, 'APPROVED', 'a0000000-0000-0000-0000-000000000001', 'Exemplary audition and 100% verified copyright ownership.')
ON CONFLICT (id) DO NOTHING;

-- 12. DESI MUSIC CONTENT
INSERT INTO desi_music_content (id, submission_id, creator_id, song_id, video_url, views_count, is_featured) VALUES
('12000000-0000-0000-0000-000000000001', NULL, '10000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4', 18400, TRUE),
('12000000-0000-0000-0000-000000000002', NULL, '10000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000003', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4', 34200, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 13. REWARD RULES
INSERT INTO reward_rules (id, reward_per_valid_like_inr, minimum_payout_inr, maximum_monthly_reward_inr, bonus_rate, is_active) VALUES
(1, 0.1000, 500.00, 100000.00, 0.05, TRUE)
ON CONFLICT (id) DO NOTHING;

-- 14. CREATOR WALLETS & TRANSACTIONS
INSERT INTO creator_wallets (id, creator_id, available_balance_inr, pending_balance_inr, approved_balance_inr, paid_balance_inr, total_earned_inr) VALUES
('13000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 1250.00, 305.00, 1250.00, 0.00, 1555.00),
('13000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 2850.00, 571.00, 2850.00, 1000.00, 4421.00)
ON CONFLICT (id) DO NOTHING;

INSERT INTO wallet_transactions (id, wallet_id, type, amount_inr, status, notes) VALUES
(uuid_generate_v4(), '13000000-0000-0000-0000-000000000001', 'REWARD', 1250.00, 'APPROVED', 'Validated engagement credit for February 2026 (12,500 valid likes @ ₹0.10)'),
(uuid_generate_v4(), '13000000-0000-0000-0000-000000000002', 'PAYOUT', -1000.00, 'PAID', 'UPI Payout settled to UPI ID shera@okhdfcbank')
ON CONFLICT DO NOTHING;

-- 15. COMPETITIONS
INSERT INTO competitions (id, title, slug, description, cover_url, rules, prize_inr, start_date, end_date, eligible_languages, eligible_genres, status) VALUES
('14000000-0000-0000-0000-000000000001', 'Desi Indie Voice 2026', 'desi-indie-voice-2026', 'India’s premier nationwide hunt for original independent voices, acoustic singers, and folk innovators.', 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800', '1. Must be an original track composed and sung by the applicant. 2. No copyrighted karaoke tracks allowed. 3. Winner decided 60% by validated audience likes and 40% by Talent5 Grand Jury.', 100000.00, '2026-03-01', '2026-04-15', ARRAY['Hindi', 'Telugu', 'Tamil', 'Punjabi', 'Bengali', 'Kannada', 'Malayalam'], ARRAY['Sufi & Ghazal', 'Folk Fusion', 'Acoustic & Unplugged'], 'ACTIVE'),
('14000000-0000-0000-0000-000000000002', 'Street Cypher: Desi Rap Battle', 'street-cypher-desi-rap-battle', 'Drop your sharpest 60-second original bars in your native regional language.', 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=800', '1. Strictly original rhymes. 2. Clean lyrics without hate speech or copyright infringement. 3. Validated likes determine weekly leaderboard positioning.', 50000.00, '2026-03-10', '2026-04-01', ARRAY['Hindi', 'Punjabi', 'Tamil', 'Telugu'], ARRAY['Desi Hip-Hop'], 'ACTIVE')
ON CONFLICT (id) DO NOTHING;

-- 16. PLAYLISTS
INSERT INTO playlists (id, user_id, name, slug, description, cover_url, visibility) VALUES
('15000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'Desi Spotlight: Best of 2026', 'desi-spotlight-best-of-2026', 'Curated sounds from India’s breakthrough independent artists and singers.', 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600', 'PUBLIC'),
('15000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000003', 'Pooja’s Soulful Sufi Morning', 'poojas-soulful-sufi-morning', 'Acoustic melodies to start peaceful mornings.', 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600', 'PUBLIC')
ON CONFLICT (id) DO NOTHING;

INSERT INTO playlist_songs (id, playlist_id, song_id, position) VALUES
(uuid_generate_v4(), '15000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000001', 1),
(uuid_generate_v4(), '15000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-000000000003', 2),
(uuid_generate_v4(), '15000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-000000000001', 1)
ON CONFLICT DO NOTHING;

-- 17. SYSTEM SETTINGS
INSERT INTO system_settings (key, value, category, description) VALUES
('platform_tagline', '"Real Voices. Original Stories. Desi Talent."'::jsonb, 'branding', 'Main tagline of Talent5 platform'),
('max_upload_size_mb', '200'::jsonb, 'media', 'Maximum allowed file size for creator audio and video uploads'),
('supported_languages_count', '13'::jsonb, 'localization', 'Number of active official Indian languages supported'),
('anti_fraud_threshold', '75'::jsonb, 'security', 'Engagement risk score above which likes are marked suspicious')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
