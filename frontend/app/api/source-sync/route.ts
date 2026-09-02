import type { IngestionResult } from '@/lib/types';

export async function POST(request: Request): Promise<Response> {
  const ingestionKey = process.env.ACE_INGESTION_KEY;
  if (!ingestionKey) {
    return Response.json({ message: 'A sincronização manual não está configurada.' }, { status: 503 });
  }

  const body = (await request.json().catch(() => null)) as { sourceId?: unknown } | null;
  const sourceId = typeof body?.sourceId === 'string' ? body.sourceId : '';
  if (!/^s-[a-zA-Z0-9-]{1,36}$/.test(sourceId)) {
    return Response.json({ message: 'Fonte inválida.' }, { status: 400 });
  }

  const apiOrigin = (process.env.ACE_API_URL ?? 'http://localhost:8080').replace(/\/$/, '');
  try {
    const response = await fetch(`${apiOrigin}/api/v1/sources/${encodeURIComponent(sourceId)}/sync`, {
      method: 'POST',
      headers: { 'X-ACE-Ingestion-Key': ingestionKey },
      cache: 'no-store',
      signal: AbortSignal.timeout(15_000),
    });
    const result = (await response.json()) as IngestionResult;
    return Response.json(result, { status: response.status });
  } catch {
    return Response.json({ message: 'O serviço de ingestão não respondeu.' }, { status: 502 });
  }
}
