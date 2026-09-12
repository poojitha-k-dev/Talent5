-- ==========================================================
-- TALENT5 PRODUCTION RELATIONAL DATABASE SCHEMA (PostgreSQL 16)
-- ==========================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Clean drop if recreating (dev mode safe)
DROP TABLE IF EXISTS audit_logs CASCADE;
DROP TABLE IF EXISTS system_settings CASCADE;
DROP TABLE IF EXISTS reports CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS competition_entries CASCADE;
DROP TABLE IF EXISTS competitions CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
DROP TABLE IF EXISTS follows CASCADE;
DROP TABLE IF EXISTS playlist_songs CASCADE;
DROP TABLE IF EXISTS playlists CASCADE;
DROP TABLE IF EXISTS payout_requests CASCADE;
DROP TABLE IF EXISTS wallet_transactions CASCADE;
DROP TABLE IF EXISTS creator_wallets CASCADE;
DROP TABLE IF EXISTS reward_calculations CASCADE;
DROP TABLE IF EXISTS reward_rules CASCADE;
DROP TABLE IF EXISTS fraud_events CASCADE;
DROP TABLE IF EXISTS engagement_validation CASCADE;
DROP TABLE IF EXISTS likes CASCADE;
DROP TABLE IF EXISTS desi_music_content CASCADE;
DROP TABLE IF EXISTS content_submissions CASCADE;
DROP TABLE IF EXISTS creator_applications CASCADE;
DROP TABLE IF EXISTS creator_profiles CASCADE;
DROP TABLE IF EXISTS lyric_lines CASCADE;
DROP TABLE IF EXISTS lyrics CASCADE;
DROP TABLE IF EXISTS rights_records CASCADE;
DROP TABLE IF EXISTS music_assets CASCADE;
DROP TABLE IF EXISTS songs CASCADE;
DROP TABLE IF EXISTS albums CASCADE;
DROP TABLE IF EXISTS artists CASCADE;
DROP TABLE IF EXISTS genres CASCADE;
DROP TABLE IF EXISTS languages CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- 1. USERS
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    username VARCHAR(100) UNIQUE NOT NULL,
    avatar_url TEXT,
    phone VARCHAR(30),
    is_verified BOOLEAN DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'SUSPENDED', 'DELETED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);

-- 2. ROLES & RBAC
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE user_roles (
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role_id INT NOT NULL REFERENCES roles(id) ON DELETE CASCADE,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id)
);

-- 3. LANGUAGES (13+ Indian Languages)
CREATE TABLE languages (
    id SERIAL PRIMARY KEY,
    code VARCHAR(10) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    native_name VARCHAR(150) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE
);

-- 4. GENRES
CREATE TABLE genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    slug VARCHAR(120) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT
);

-- 5. ARTISTS
CREATE TABLE artists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(150) NOT NULL,
    slug VARCHAR(180) UNIQUE NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    cover_url TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total_plays BIGINT DEFAULT 0,
    followers_count INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_artists_slug ON artists(slug);

-- 6. ALBUMS
CREATE TABLE albums (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    release_date DATE NOT NULL DEFAULT CURRENT_DATE,
    cover_url TEXT,
    type VARCHAR(30) DEFAULT 'ALBUM' CHECK (type IN ('ALBUM', 'EP', 'SINGLE')),
    language_id INT REFERENCES languages(id),
    genre_id INT REFERENCES genres(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. SONGS
CREATE TABLE songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(250) NOT NULL,
    slug VARCHAR(300) NOT NULL,
    artist_id UUID NOT NULL REFERENCES artists(id) ON DELETE CASCADE,
    album_id UUID REFERENCES albums(id) ON DELETE SET NULL,
    featured_artists JSONB DEFAULT '[]'::jsonb,
    language_id INT NOT NULL REFERENCES languages(id),
    genre_id INT NOT NULL REFERENCES genres(id),
    mood VARCHAR(50),
    duration_seconds INT NOT NULL DEFAULT 0,
    audio_url TEXT NOT NULL,
    artwork_url TEXT,
    release_date DATE NOT NULL DEFAULT CURRENT_DATE,
    is_explicit BOOLEAN DEFAULT FALSE,
    play_count BIGINT DEFAULT 0,
    raw_likes_count BIGINT DEFAULT 0,
    valid_likes_count BIGINT DEFAULT 0,
    popularity_score NUMERIC(5,2) DEFAULT 0,
    status VARCHAR(30) DEFAULT 'PUBLISHED' CHECK (status IN ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'PUBLISHED', 'UNPUBLISHED', 'TAKEDOWN')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_songs_artist ON songs(artist_id);
CREATE INDEX idx_songs_language ON songs(language_id);
CREATE INDEX idx_songs_genre ON songs(genre_id);
CREATE INDEX idx_songs_status ON songs(status);

-- 8. MUSIC ASSETS
CREATE TABLE music_assets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('AUDIO_MASTER', 'AUDIO_PREVIEW', 'STEM', 'BACKING_TRACK')),
    storage_key TEXT NOT NULL,
    format VARCHAR(20) DEFAULT 'mp3',
    bitrate INT DEFAULT 320,
    file_size_bytes BIGINT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. RIGHTS & COPYRIGHT RECORDS
CREATE TABLE rights_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID REFERENCES songs(id) ON DELETE CASCADE,
    rights_holder VARCHAR(255) NOT NULL,
    ownership_type VARCHAR(50) NOT NULL CHECK (ownership_type IN ('TALENT5_OWNED', 'CREATOR_OWNED', 'DIRECT_LICENSED', 'OPEN_LICENSE', 'PUBLIC_DOMAIN')),
    license_type VARCHAR(100) NOT NULL,
    license_provider VARCHAR(150),
    territory VARCHAR(100) DEFAULT 'IN',
    start_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    streaming_allowed BOOLEAN DEFAULT TRUE,
    download_allowed BOOLEAN DEFAULT FALSE,
    monetization_allowed BOOLEAN DEFAULT TRUE,
    karaoke_allowed BOOLEAN DEFAULT FALSE,
    ugc_allowed BOOLEAN DEFAULT TRUE,
    proof_document_url TEXT,
    status VARCHAR(30) DEFAULT 'VERIFIED' CHECK (status IN ('VERIFIED', 'PENDING', 'EXPIRED', 'RESTRICTED', 'TAKEDOWN')),
    reviewer_id UUID REFERENCES users(id),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 10. LYRICS & SYNCHRONIZED LINES
CREATE TABLE lyrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    song_id UUID UNIQUE NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    language_id INT REFERENCES languages(id),
    is_synced BOOLEAN DEFAULT FALSE,
    full_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lyric_lines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    lyrics_id UUID NOT NULL REFERENCES lyrics(id) ON DELETE CASCADE,
    sequence_order INT NOT NULL,
    start_time_ms INT NOT NULL,
    end_time_ms INT NOT NULL,
    text TEXT NOT NULL
);

CREATE INDEX idx_lyric_lines_timing ON lyric_lines(lyrics_id, start_time_ms);

-- 11. CREATOR PROFILES & APPLICATIONS
CREATE TABLE creator_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    stage_name VARCHAR(150) NOT NULL,
    bio TEXT,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    primary_language_id INT REFERENCES languages(id),
    category VARCHAR(50) NOT NULL CHECK (category IN ('SINGER', 'RAPPER', 'FOLK', 'CLASSICAL', 'INSTRUMENTAL', 'PRODUCER')),
    is_approved BOOLEAN DEFAULT FALSE,
    approved_at TIMESTAMP WITH TIME ZONE,
    verified_badge BOOLEAN DEFAULT FALSE,
    portfolio_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE creator_applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    stage_name VARCHAR(150) NOT NULL,
    bio TEXT NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(100) NOT NULL,
    languages TEXT[] NOT NULL,
    category VARCHAR(50) NOT NULL,
    genres TEXT[] NOT NULL,
    experience TEXT NOT NULL,
    social_links JSONB DEFAULT '{}'::jsonb,
    portfolio_url TEXT,
    sample_performance_url TEXT NOT NULL,
    original_composition_info TEXT,
    ownership_declaration BOOLEAN NOT NULL DEFAULT FALSE,
    copyright_declaration BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'SUSPENDED')),
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 12. CONTENT SUBMISSIONS & DESI MUSIC
CREATE TABLE content_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    title VARCHAR(250) NOT NULL,
    description TEXT,
    category VARCHAR(50) NOT NULL,
    language_id INT NOT NULL REFERENCES languages(id),
    genre_id INT NOT NULL REFERENCES genres(id),
    audio_url TEXT,
    video_url TEXT,
    cover_url TEXT,
    composer VARCHAR(150),
    lyricist VARCHAR(150),
    producer VARCHAR(150),
    featured_artists TEXT[] DEFAULT ARRAY[]::TEXT[],
    ownership_declaration BOOLEAN NOT NULL DEFAULT FALSE,
    status VARCHAR(30) DEFAULT 'SUBMITTED' CHECK (status IN ('DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'TAKEDOWN', 'SUSPENDED')),
    reviewed_by UUID REFERENCES users(id),
    review_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE desi_music_content (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID UNIQUE REFERENCES content_submissions(id) ON DELETE SET NULL,
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    song_id UUID UNIQUE REFERENCES songs(id) ON DELETE SET NULL,
    video_url TEXT,
    views_count BIGINT DEFAULT 0,
    is_featured BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 13. LIKES, VALIDATION & ANTI-FRAUD
CREATE TABLE likes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('SONG', 'DESI_CONTENT')),
    target_id UUID NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'VALID', 'INVALID', 'SUSPICIOUS')),
    risk_score VARCHAR(20) DEFAULT 'LOW' CHECK (risk_score IN ('LOW', 'MEDIUM', 'HIGH')),
    ip_hash VARCHAR(64),
    device_fingerprint VARCHAR(128),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, target_type, target_id)
);

CREATE TABLE engagement_validation (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    like_id UUID UNIQUE NOT NULL REFERENCES likes(id) ON DELETE CASCADE,
    signals JSONB DEFAULT '{}'::jsonb,
    evaluated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE fraud_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type VARCHAR(100) NOT NULL,
    risk_score VARCHAR(20) NOT NULL,
    evidence JSONB DEFAULT '{}'::jsonb,
    action_taken VARCHAR(50) DEFAULT 'FLAGGED',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 14. REWARD RULES, WALLETS & PAYOUTS
CREATE TABLE reward_rules (
    id SERIAL PRIMARY KEY,
    reward_per_valid_like_inr NUMERIC(10, 4) NOT NULL DEFAULT 0.10,
    minimum_payout_inr NUMERIC(10, 2) NOT NULL DEFAULT 500.00,
    maximum_monthly_reward_inr NUMERIC(10, 2) NOT NULL DEFAULT 100000.00,
    bonus_rate NUMERIC(5, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reward_calculations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    valid_likes_delta INT NOT NULL,
    rate_applied NUMERIC(10, 4) NOT NULL,
    amount_inr NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'FRAUD_CLEARED', 'CREDITED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE creator_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID UNIQUE NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    available_balance_inr NUMERIC(12, 2) DEFAULT 0.00,
    pending_balance_inr NUMERIC(12, 2) DEFAULT 0.00,
    approved_balance_inr NUMERIC(12, 2) DEFAULT 0.00,
    paid_balance_inr NUMERIC(12, 2) DEFAULT 0.00,
    total_earned_inr NUMERIC(12, 2) DEFAULT 0.00,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE wallet_transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_id UUID NOT NULL REFERENCES creator_wallets(id) ON DELETE CASCADE,
    type VARCHAR(30) NOT NULL CHECK (type IN ('REWARD', 'BONUS', 'ADJUSTMENT', 'FRAUD_DEDUCTION', 'PAYOUT', 'REFUND')),
    amount_inr NUMERIC(12, 2) NOT NULL,
    status VARCHAR(30) DEFAULT 'APPROVED' CHECK (status IN ('PENDING', 'APPROVED', 'REJECTED', 'PAID', 'REVERSED')),
    reference_id UUID,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE payout_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    amount_inr NUMERIC(12, 2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL CHECK (payment_method IN ('UPI', 'BANK_TRANSFER')),
    account_ref_tokenized VARCHAR(255) NOT NULL,
    status VARCHAR(30) DEFAULT 'REQUESTED' CHECK (status IN ('REQUESTED', 'UNDER_REVIEW', 'APPROVED', 'PROCESSING', 'PAID', 'REJECTED')),
    reviewed_by UUID REFERENCES users(id),
    transaction_ref VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 15. PLAYLISTS & SOCIAL
CREATE TABLE playlists (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(250) NOT NULL,
    description TEXT,
    cover_url TEXT,
    visibility VARCHAR(20) DEFAULT 'PUBLIC' CHECK (visibility IN ('PUBLIC', 'PRIVATE')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE playlist_songs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    playlist_id UUID NOT NULL REFERENCES playlists(id) ON DELETE CASCADE,
    song_id UUID NOT NULL REFERENCES songs(id) ON DELETE CASCADE,
    position INT NOT NULL DEFAULT 0,
    added_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(playlist_id, song_id)
);

CREATE TABLE follows (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('ARTIST', 'CREATOR', 'USER')),
    target_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(follower_id, target_type, target_id)
);

CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('SONG', 'DESI_CONTENT')),
    target_id UUID NOT NULL,
    parent_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 16. COMPETITIONS & CHALLENGES
CREATE TABLE competitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(250) NOT NULL,
    slug VARCHAR(300) UNIQUE NOT NULL,
    description TEXT NOT NULL,
    cover_url TEXT,
    rules TEXT NOT NULL,
    prize_inr NUMERIC(12, 2) NOT NULL DEFAULT 0,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    eligible_languages TEXT[] DEFAULT ARRAY[]::TEXT[],
    eligible_genres TEXT[] DEFAULT ARRAY[]::TEXT[],
    status VARCHAR(30) DEFAULT 'ACTIVE' CHECK (status IN ('DRAFT', 'UPCOMING', 'ACTIVE', 'ENDED', 'CANCELLED')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE competition_entries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    competition_id UUID NOT NULL REFERENCES competitions(id) ON DELETE CASCADE,
    creator_id UUID NOT NULL REFERENCES creator_profiles(id) ON DELETE CASCADE,
    content_id UUID NOT NULL,
    rank INT,
    votes_count INT DEFAULT 0,
    status VARCHAR(30) DEFAULT 'SUBMITTED' CHECK (status IN ('SUBMITTED', 'QUALIFIED', 'WINNER', 'RUNNER_UP')),
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(competition_id, creator_id)
);

-- 17. NOTIFICATIONS & REPORTS
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reporter_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    target_type VARCHAR(30) NOT NULL CHECK (target_type IN ('SONG', 'VIDEO', 'CREATOR', 'COMMENT', 'PROFILE')),
    target_id UUID NOT NULL,
    reason VARCHAR(50) NOT NULL,
    details TEXT,
    status VARCHAR(30) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'INVESTIGATING', 'RESOLVED', 'DISMISSED')),
    resolved_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 18. AUDIT LOGS & SETTINGS
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_name VARCHAR(100) NOT NULL,
    entity_id UUID NOT NULL,
    old_state JSONB,
    new_state JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE system_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
