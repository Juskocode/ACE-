export type ViewKey =
  | 'overview'
  | 'practice'
  | 'builder'
  | 'questions'
  | 'materials'
  | 'news'
  | 'analytics'
  | 'sources';

export type Difficulty = 'Fácil' | 'Média' | 'Difícil';

export interface DashboardData {
  learnerName: string;
  targetLabel: string;
  examDate: string;
  daysToExam: number;
  readiness: number;
  readinessDelta: number;
  readinessConfidence: 'Baixa' | 'Média' | 'Alta';
  answeredQuestions: number;
  studyMinutesThisWeek: number;
  weeklyGoalMinutes: number;
  currentStreakDays: number;
  recommendation: {
    title: string;
    description: string;
    questionCount: number;
    estimatedMinutes: number;
  };
  subjectScores: SubjectScore[];
  weeklyActivity: ActivityPoint[];
}

export interface SubjectScore {
  name: string;
  score: number;
  coverage: number;
  trend: number;
  status: 'Forte' | 'A consolidar' | 'Prioridade';
}

export interface ActivityPoint {
  label: string;
  questions: number;
  minutes: number;
}

export interface ReadinessPoint {
  label: string;
  score: number;
  target: number;
}

export interface Question {
  id: string;
  area: string;
  topic: string;
  difficulty: Difficulty;
  relevance: 'A' | 'B' | 'C';
  competency: string;
  stem: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  source: string;
  sourceUrl: string;
  status: 'Revista' | 'Rascunho' | 'Demonstração';
}

export interface Material {
  id: string;
  title: string;
  publisher: string;
  type: string;
  area: string;
  updatedAt: string;
  progress: number;
  collection: string;
  sourceUrl: string;
}

export interface NewsItem {
  id: string;
  title: string;
  summary: string;
  publisher: string;
  publishedAt: string;
  area: string;
  impact: 'Alto' | 'Médio' | 'Baixo';
  sourceUrl: string;
  relatedQuestions: number;
}

export interface SourceFeed {
  id: string;
  name: string;
  authority: string;
  type: 'RSS' | 'API' | 'Web';
  status: 'Ativa' | 'A rever';
  lastSync: string;
  itemsImported: number;
  url: string;
}

export interface IngestionResult {
  runId: string;
  sourceId: string;
  sourceName: string;
  status: 'SUCCESS' | 'FAILED';
  discovered: number;
  imported: number;
  completedAt: string;
  message: string;
}

export interface AceData {
  dashboard: DashboardData;
  readinessHistory: ReadinessPoint[];
  questions: Question[];
  materials: Material[];
  news: NewsItem[];
  sources: SourceFeed[];
  origin: 'api' | 'demo';
}

export interface GeneratedExam {
  id: string;
  title: string;
  questionCount: number;
  durationMinutes: number;
  mode: string;
  areas: string[];
  manifestNotes: string[];
  items: Question[];
}
