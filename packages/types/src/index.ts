// ==========================================
// TALENT5 SHARED TYPES & DOMAIN INTERFACES
// ==========================================

// --- AUTH & RBAC ---
export type UserRole = 'USER' | 'CREATOR' | 'MODERATOR' | 'ADMIN' | 'SUPER_ADMIN' | 'FINANCE';

export interface User {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl?: string | null;
  phone?: string | null;
  authProvider?: 'password' | 'google' | 'oauth' | string | null;
  isVerified: boolean;
  status: 'ACTIVE' | 'SUSPENDED' | 'DELETED';
  roles: UserRole[];
  createdAt: string;
  updatedAt: string;
}

export interface AuthSession {
  user: User;
  token: string;
  refreshToken?: string;
  expiresAt: number;
}

export interface JWTPayload {
  sub: string;
  email: string;
  roles: UserRole[];
  username: string;
  iat?: number;
  exp?: number;
}

// --- CATALOG: LANGUAGES & GENRES ---
export interface Language {
  id: string;
  code: string; // hi, te, ta, kn, ml, mr, pa, bn, gu, or, as, ur, en
  name: string;
  nativeName: string;
  isActive: boolean;
}

export interface Genre {
  id: string;
  name: string;
  slug: string;
  description?: string;
  iconUrl?: string;
}

// --- CATALOG: ARTISTS, ALBUMS, SONGS ---
export interface Artist {
  id: string;
  name: string;
  slug: string;
  bio?: string;
  avatarUrl?: string;
  coverUrl?: string;
  isVerified: boolean;
  userId?: string | null;
  totalPlays: number;
  followersCount: number;
  languages?: string[];
  genres?: string[];
  createdAt: string;
}

export interface Album {
  id: string;
  title: string;
  slug: string;
  artistId: string;
  artistName?: string;
  releaseDate: string;
  coverUrl?: string;
  type: 'ALBUM' | 'EP' | 'SINGLE';
  languageId: string;
  genreId: string;
  songCount?: number;
  createdAt: string;
}

export type SongStatus = 'DRAFT' | 'PENDING_REVIEW' | 'APPROVED' | 'PUBLISHED' | 'UNPUBLISHED' | 'TAKEDOWN';

export interface Song {
  id: string;
  title: string;
  slug: string;
  artistId: string;
  artistName?: string;
  albumId?: string | null;
  albumTitle?: string | null;
  featuredArtists: string[];
  languageId: string;
  languageName?: string;
  genreId: string;
  genreName?: string;
  genreSlug?: string;
  mood?: string;
  durationSeconds: number;
  audioUrl: string;
  artworkUrl?: string;
  releaseDate: string;
  isExplicit: boolean;
  playCount: number;
  rawLikesCount: number;
  validLikesCount: number;
  popularityScore: number;
  status: SongStatus;
  rightsStatus?: LicenseStatus;
  lyrics?: Lyrics;
  createdAt: string;
}

// --- LYRICS ARCHITECTURE ---
export type LyricSyncStatus = 'UNSYNCED' | 'SYNCING' | 'SYNCED' | 'NEEDS_REVIEW';

export interface LyricWord {
  text: string;
  startTimeMs: number;
  endTimeMs: number;
}

export interface LyricLine {
  id: string;
  sequenceOrder: number;
  startTimeMs: number;
  endTimeMs: number;
  text: string;
  words?: LyricWord[];
}

export interface Lyrics {
  id: string;
  songId: string;
  languageId: string;
  isSynced: boolean;
  syncStatus: LyricSyncStatus;
  version: number;
  fullText: string;
  lines: LyricLine[];
}

// --- RIGHTS & COPYRIGHT MANAGEMENT ---
export type OwnershipType = 'TALENT5_OWNED' | 'CREATOR_OWNED' | 'DIRECT_LICENSED' | 'OPEN_LICENSE' | 'PUBLIC_DOMAIN';
export type LicenseStatus = 'VERIFIED' | 'PENDING' | 'EXPIRED' | 'RESTRICTED' | 'TAKEDOWN';

export interface RightsRecord {
  id: string;
  songId?: string | null;
  desiContentId?: string | null;
  rightsHolder: string;
  ownershipType: OwnershipType;
  licenseType: string;
  licenseProvider?: string;
  territory: string;
  startDate: string;
  endDate?: string | null;
  streamingAllowed: boolean;
  downloadAllowed: boolean;
  monetizationAllowed: boolean;
  karaokeAllowed: boolean;
  ugcAllowed: boolean;
  proofDocumentUrl?: string;
  status: LicenseStatus;
  reviewerId?: string;
  notes?: string;
  createdAt: string;
}

// --- DESI CREATOR & STUDIO SYSTEM ---
export type CreatorCategory = 'SINGER' | 'RAPPER' | 'FOLK' | 'CLASSICAL' | 'INSTRUMENTAL' | 'PRODUCER';
export type CreatorAppStatus = 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';

export interface CreatorProfile {
  id: string;
  userId: string;
  stageName: string;
  bio?: string;
  city: string;
  state: string;
  primaryLanguageId: string;
  category: CreatorCategory;
  isApproved: boolean;
  approvedAt?: string;
  verifiedBadge: boolean;
  portfolioUrl?: string;
  walletBalanceINR?: number;
  createdAt: string;
}

export interface CreatorApplication {
  id: string;
  userId: string;
  fullName: string;
  stageName: string;
  bio: string;
  city: string;
  state: string;
  languages: string[];
  category: CreatorCategory;
  genres: string[];
  experience: string;
  socialLinks: Record<string, string>;
  portfolioUrl?: string;
  samplePerformanceUrl: string;
  originalCompositionInfo?: string;
  ownershipDeclaration: boolean;
  copyrightDeclaration: boolean;
  status: CreatorAppStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
}

export type SubmissionStatus = 'DRAFT' | 'SUBMITTED' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'TAKEDOWN' | 'SUSPENDED';

export interface ContentSubmission {
  id: string;
  creatorId: string;
  creatorStageName?: string;
  title: string;
  description?: string;
  category: CreatorCategory;
  languageId: string;
  languageName?: string;
  genreId: string;
  genreName?: string;
  mood?: string;
  durationSeconds?: number;
  storageKey?: string;
  audioUrl?: string;
  videoUrl?: string;
  coverUrl?: string;
  composer?: string;
  lyricist?: string;
  producer?: string;
  featuredArtists: string[];
  lyricsText?: string;
  lyricsTimedData?: any;
  ownershipDeclaration: boolean;
  rightsDeclaration?: any;
  publishedSongId?: string;
  status: SubmissionStatus;
  reviewedBy?: string;
  reviewNotes?: string;
  createdAt: string;
}

export interface DesiMusicContent {
  id: string;
  submissionId: string;
  creatorId: string;
  creatorName: string;
  songId: string;
  title: string;
  category: CreatorCategory;
  videoUrl?: string;
  audioUrl: string;
  coverUrl: string;
  languageName: string;
  genreName: string;
  viewsCount: number;
  playCount: number;
  validLikesCount: number;
  isFeatured: boolean;
  createdAt: string;
}

// --- ENGAGEMENT, FRAUD & REWARDS ---
export type LikeValidationStatus = 'PENDING' | 'VALID' | 'INVALID' | 'SUSPICIOUS';
export type RiskScore = 'LOW' | 'MEDIUM' | 'HIGH';

export interface Like {
  id: string;
  userId: string;
  targetType: 'SONG' | 'DESI_CONTENT';
  targetId: string;
  status: LikeValidationStatus;
  riskScore: RiskScore;
  ipHash?: string;
  deviceFingerprint?: string;
  userAgent?: string;
  createdAt: string;
}

export interface RewardRule {
  id: string;
  rewardPerValidLikeINR: number;
  minimumPayoutINR: number;
  maximumMonthlyRewardINR: number;
  bonusRate: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreatorWallet {
  id: string;
  creatorId: string;
  availableBalanceINR: number;
  pendingBalanceINR: number;
  approvedBalanceINR: number;
  paidBalanceINR: number;
  totalEarnedINR: number;
  updatedAt: string;
}

export type WalletTxType = 'REWARD' | 'BONUS' | 'ADJUSTMENT' | 'FRAUD_DEDUCTION' | 'PAYOUT' | 'REFUND';
export type WalletTxStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'PAID' | 'REVERSED';

export interface WalletTransaction {
  id: string;
  walletId: string;
  type: WalletTxType;
  amountINR: number;
  status: WalletTxStatus;
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

export type PayoutStatus = 'REQUESTED' | 'UNDER_REVIEW' | 'APPROVED' | 'PROCESSING' | 'PAID' | 'REJECTED';

export interface PayoutRequest {
  id: string;
  creatorId: string;
  creatorName?: string;
  amountINR: number;
  paymentMethod: 'UPI' | 'BANK_TRANSFER';
  accountRefTokenized: string;
  status: PayoutStatus;
  reviewedBy?: string;
  transactionRef?: string;
  notes?: string;
  createdAt: string;
}

// --- COMPETITIONS & LEADERBOARDS ---
export type CompetitionStatus = 'DRAFT' | 'UPCOMING' | 'ACTIVE' | 'ENDED' | 'CANCELLED';

export interface Competition {
  id: string;
  title: string;
  slug: string;
  description: string;
  coverUrl: string;
  rules: string;
  prizeINR: number;
  startDate: string;
  endDate: string;
  eligibleLanguages: string[];
  eligibleGenres: string[];
  status: CompetitionStatus;
  entriesCount?: number;
}

export interface CompetitionEntry {
  id: string;
  competitionId: string;
  creatorId: string;
  creatorStageName: string;
  contentId: string;
  title: string;
  rank?: number;
  votesCount: number;
  status: 'SUBMITTED' | 'QUALIFIED' | 'WINNER' | 'RUNNER_UP';
  submittedAt: string;
}

export interface LeaderboardItem {
  rank: number;
  id: string;
  title: string;
  subtitle: string;
  avatarUrl?: string;
  score: number;
  metricLabel: string;
  language?: string;
  genre?: string;
  isDesiCreator?: boolean;
}

export interface CompetitionVote {
  id: string;
  competitionId: string;
  entryId: string;
  userId: string;
  riskScore?: string;
  status: 'VALID' | 'SUSPICIOUS' | 'DISQUALIFIED';
  createdAt: string;
}

export interface SongPlay {
  id: string;
  songId: string;
  userId?: string | null;
  durationPlayedSeconds: number;
  isQualified: boolean;
  createdAt: string;
}

export interface SavedSong {
  id: string;
  userId: string;
  songId: string;
  song?: Song;
  savedAt: string;
}

// --- SOCIAL, PLAYLISTS & REPORTS ---
export interface Playlist {
  id: string;
  userId: string;
  userName?: string;
  name: string;
  slug: string;
  description?: string;
  coverUrl?: string;
  visibility: 'PUBLIC' | 'PRIVATE';
  songCount: number;
  createdAt: string;
}

export interface Comment {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  targetType: 'SONG' | 'DESI_CONTENT';
  targetId: string;
  parentId?: string | null;
  content: string;
  likesCount: number;
  createdAt: string;
}

export interface Report {
  id: string;
  reporterId: string;
  targetType: 'SONG' | 'VIDEO' | 'CREATOR' | 'COMMENT' | 'PROFILE';
  targetId: string;
  reason: 'COPYRIGHT' | 'HARASSMENT' | 'SPAM' | 'IMPERSONATION' | 'INAPPROPRIATE' | 'FRAUD' | 'OTHER';
  details?: string;
  status: 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';
  resolvedBy?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName?: string;
  action: string;
  entityName: string;
  entityId: string;
  oldState?: Record<string, any>;
  newState?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
}

// --- STANDARD API RESPONSES ---
export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: {
    code: string;
    details?: any;
  };
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    hasMore?: boolean;
  };
}
