import { demoData } from '@/lib/demo-data';
import type { AceData, GeneratedExam, IngestionResult } from '@/lib/types';

function apiUrl(path: string): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (configuredOrigin) return `${configuredOrigin}${path}`;
  return path;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('Content-Type', 'application/json');
  const response = await fetch(apiUrl(path), {
    ...init,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Pedido falhou (${response.status})`);
  }

  return response.json() as Promise<T>;
}

export async function loadAceData(): Promise<AceData> {
  const startedAt = Date.now();

  try {
    const [dashboard, readinessHistory, questions, materials, news, sources] =
      await Promise.all([
        request<AceData['dashboard']>('/api/v1/dashboard'),
        request<AceData['readinessHistory']>('/api/v1/analytics/readiness'),
        request<AceData['questions']>('/api/v1/questions?limit=200'),
        request<AceData['materials']>('/api/v1/materials'),
        request<AceData['news']>('/api/v1/news'),
        request<AceData['sources']>('/api/v1/sources'),
      ]);

    const minimumSkeletonMs = 420;
    const remaining = minimumSkeletonMs - (Date.now() - startedAt);
    if (remaining > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, remaining));
    }

    return {
      dashboard,
      readinessHistory,
      questions,
      materials,
      news,
      sources,
      origin: 'api',
    };
  } catch {
    const remaining = 620 - (Date.now() - startedAt);
    if (remaining > 0) {
      await new Promise((resolve) => window.setTimeout(resolve, remaining));
    }
    return demoData;
  }
}

interface GenerateExamInput {
  mode: string;
  questionCount: number;
  durationMinutes: number;
  areas: string[];
  difficulty: string;
  boostWeakTopics: boolean;
  seed: number;
}

export async function generateExam(input: GenerateExamInput): Promise<GeneratedExam> {
  try {
    const generated = await request<Omit<GeneratedExam, 'origin'>>('/api/v1/exams/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
    return { ...generated, origin: 'api' };
  } catch {
    const selected = demoData.questions.filter(
      (question) => input.areas.length === 0 || input.areas.includes(question.area),
    );
    const source = selected.length > 0 ? selected : demoData.questions;
    const shuffled = shuffleWithSeed(source, input.seed);
    const items = shuffled.slice(0, Math.min(input.questionCount, shuffled.length));

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    return {
      origin: 'demo',
      id: `demo-${input.seed}`,
      title: input.mode,
      questionCount: items.length,
      durationMinutes: input.durationMinutes,
      mode: input.mode,
      areas: input.areas.length ? input.areas : ['Todas as áreas'],
      manifestNotes: [
        'Modo local: a API de geração não respondeu e foi usado o conjunto demonstrativo disponível.',
        input.areas.length > 0
          ? 'O filtro de áreas foi aplicado ao conjunto local de seis perguntas.'
          : 'A seleção foi feita a partir do conjunto local de seis perguntas.',
        `Ordem aleatória guardada com seed ${input.seed}.`,
        'O total pode ser inferior ao pedido quando o conjunto local não contém itens suficientes.',
        'Conteúdo demonstrativo — validar sempre nas fontes citadas.',
      ],
      items,
    };
  }
}

function shuffleWithSeed<T>(items: T[], seed: number): T[] {
  const shuffled = [...items];
  let state = Math.trunc(seed) >>> 0;

  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    const target = Math.floor((state / 4294967296) * (index + 1));
    [shuffled[index], shuffled[target]] = [shuffled[target], shuffled[index]];
  }

  return shuffled;
}

export async function syncSource(sourceId: string): Promise<IngestionResult> {
  const response = await fetch('/api/source-sync', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sourceId }),
  });
  const payload = (await response.json().catch(() => null)) as
    | IngestionResult
    | { message?: unknown }
    | null;

  if (
    payload !== null &&
    typeof payload === 'object' &&
    'runId' in payload &&
    typeof (payload as IngestionResult).runId === 'string'
  ) {
    return payload as IngestionResult;
  }

  const message =
    payload && typeof payload.message === 'string'
      ? payload.message
      : response.ok
        ? 'A resposta da sincronização não é válida.'
        : `Não foi possível sincronizar a fonte (${response.status}).`;

  throw new Error(message);
}
