import { api } from './api';
import { UploadKind, type UploadPresignResponse } from '@grow-fitness/shared-types';

/**
 * Presign → PUT bytes to GCS → finalize (persists URL on kid/coach via API).
 */
export async function uploadFileViaGcs(
  kind: UploadKind,
  entityId: string,
  file: File
): Promise<{ publicUrl: string; objectKey: string }> {
  const contentType = file.type || 'application/octet-stream';

  const presign = await api.post<UploadPresignResponse>('/uploads/presign', {
    kind,
    entityId,
    contentType,
    size: file.size,
    originalName: file.name,
  });

  const putRes = await fetch(presign.uploadUrl, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });

  if (!putRes.ok) {
    const text = await putRes.text().catch(() => '');
    throw new Error(text || `Upload failed (${putRes.status})`);
  }

  return api.post<{ publicUrl: string; objectKey: string }>('/uploads/finalize', {
    kind,
    entityId,
    objectKey: presign.objectKey,
    publicUrl: presign.publicUrl,
  });
}
