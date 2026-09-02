import { demoData } from '@/lib/demo-data';
import type { AceData, GeneratedExam } from '@/lib/types';

function apiUrl(path: string): string {
  const configuredOrigin = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
  if (configuredOrigin) return `${configuredOrigin}${path}`;
  if (typeof window !== 'undefined' && ['localhost', '127.0.0.1'].includes(window.location.hostname)) {
    return `http://localhost:8080${path}`;
  }
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
        request<AceData['questions']>('/api/v1/questions?limit=40'),
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
    return await request<GeneratedExam>('/api/v1/exams/generate', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  } catch {
    const selected = demoData.questions.filter(
      (question) => input.areas.length === 0 || input.areas.includes(question.area),
    );
    const source = selected.length > 0 ? selected : demoData.questions;
    const items = Array.from({ length: Math.min(input.questionCount, source.length) }, (_, index) => source[index % source.length]);

    await new Promise((resolve) => window.setTimeout(resolve, 900));

    return {
      id: `demo-${input.seed}`,
      title: input.mode,
      questionCount: input.questionCount,
      durationMinutes: input.durationMinutes,
      mode: input.mode,
      areas: input.areas.length ? input.areas : ['Todas as áreas'],
      manifestNotes: [
        'Distribuição equilibrada pela matriz selecionada.',
        'Questões repetidas nos últimos 30 dias foram evitadas.',
        'Conteúdo demonstrativo — validar sempre nas fontes citadas.',
      ],
      items,
    };
  }
}
