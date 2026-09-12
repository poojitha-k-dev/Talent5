import { query } from './db';
import { RightsRecord, LicenseStatus } from '@talent5/types';

export async function getSongRights(songId: string): Promise<RightsRecord | null> {
  const res = await query(
    `SELECT id, song_id as "songId", rights_holder as "rightsHolder", 
            ownership_type as "ownershipType", license_type as "licenseType",
            license_provider as "licenseProvider", territory,
            start_date as "startDate", end_date as "endDate",
            streaming_allowed as "streamingAllowed", download_allowed as "downloadAllowed",
            monetization_allowed as "monetizationAllowed", karaoke_allowed as "karaokeAllowed",
            ugc_allowed as "ugcAllowed", proof_document_url as "proofDocumentUrl",
            status, notes, created_at as "createdAt"
     FROM rights_records
     WHERE song_id = $1
     ORDER BY created_at DESC
     LIMIT 1`,
    [songId]
  );

  if (res.rows.length === 0) return null;
  return res.rows[0] as RightsRecord;
}

export async function verifyStreamingAllowed(songId: string): Promise<{
  allowed: boolean;
  reason?: string;
  status?: LicenseStatus;
}> {
  const record = await getSongRights(songId);

  if (!record) {
    // If no rights record exists, default to safe restriction
    return { allowed: false, reason: 'No registered rights license found for this music asset', status: 'PENDING' };
  }

  if (record.status === 'TAKEDOWN') {
    return { allowed: false, reason: 'Content has been removed under takedown order', status: 'TAKEDOWN' };
  }

  if (record.status === 'RESTRICTED') {
    return { allowed: false, reason: 'Content playback is currently restricted by administration', status: 'RESTRICTED' };
  }

  if (record.status === 'EXPIRED') {
    return { allowed: false, reason: 'Content licensing term has expired', status: 'EXPIRED' };
  }

  if (record.endDate && new Date(record.endDate) < new Date()) {
    return { allowed: false, reason: 'Content license expiration date passed', status: 'EXPIRED' };
  }

  if (!record.streamingAllowed) {
    return { allowed: false, reason: 'Streaming is not permitted under the active license', status: record.status };
  }

  return { allowed: true, status: record.status };
}
