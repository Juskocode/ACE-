'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BarChart3,
  Bell,
  BookOpen,
  CircleHelp,
  ClipboardCheck,
  DatabaseZap,
  FileStack,
  LayoutDashboard,
  Menu,
  Newspaper,
  Play,
  Search,
  Stethoscope,
  Target,
  X,
} from 'lucide-react';

import { AppSkeleton } from '@/components/app/app-skeleton';
import { AnalyticsView } from '@/features/analytics/analytics-view';
import { DashboardView } from '@/features/dashboard/dashboard-view';
import { ExamBuilderView } from '@/features/exam-builder/exam-builder-view';
import { MaterialsView } from '@/features/materials/materials-view';
import { NewsView } from '@/features/news/news-view';
import { PracticeView } from '@/features/practice/practice-view';
import { QuestionBankView } from '@/features/question-bank/question-bank-view';
import { SourcesView } from '@/features/sources/sources-view';
import { loadAceData } from '@/lib/api';
import type { AceData, GeneratedExam, ViewKey } from '@/lib/types';

const navigation: { id: ViewKey; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'overview', label: 'Visão geral', icon: LayoutDashboard },
  { id: 'practice', label: 'Treinar', icon: Play },
  { id: 'builder', label: 'Criar exame', icon: ClipboardCheck },
  { id: 'questions', label: 'Banco de questões', icon: FileStack },
  { id: 'materials', label: 'Materiais', icon: BookOpen },
  { id: 'news', label: 'Atualidade', icon: Newspaper },
  { id: 'analytics', label: 'Análise', icon: BarChart3 },
  { id: 'sources', label: 'Fontes', icon: DatabaseZap },
];

const mobileNavigation = navigation.filter((item) => ['overview', 'practice', 'builder', 'materials', 'analytics'].includes(item.id));

export function AceApp() {
  const [data, setData] = useState<AceData | null>(null);
  const [activeView, setActiveView] = useState<ViewKey>('overview');
  const [generatedExam, setGeneratedExam] = useState<GeneratedExam | null>(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let active = true;
    void loadAceData().then((next) => {
      if (active) setData(next);
    });
    return () => { active = false; };
  }, []);

  const searchResults = useMemo(() => {
    if (!data || search.trim().length < 2) return [];
    const query = search.toLowerCase();
    return [
      ...data.questions.filter((item) => `${item.area} ${item.topic} ${item.stem}`.toLowerCase().includes(query)).slice(0, 3).map((item) => ({ id: item.id, label: item.topic, detail: item.area, view: 'questions' as ViewKey })),
      ...data.materials.filter((item) => `${item.title} ${item.publisher}`.toLowerCase().includes(query)).slice(0, 2).map((item) => ({ id: item.id, label: item.title, detail: item.publisher, view: 'materials' as ViewKey })),
    ];
  }, [data, search]);

  if (!data) return <AppSkeleton />;

  function navigate(view: ViewKey) {
    setActiveView(view);
    setMobileMenu(false);
    setSearch('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const activeLabel = navigation.find((item) => item.id === activeView)?.label;

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-[1600px]">
        <aside className="sticky top-0 hidden h-screen w-[242px] shrink-0 border-r border-sidebar-border bg-sidebar px-4 py-5 lg:flex lg:flex-col">
          <button onClick={() => navigate('overview')} className="flex items-center gap-3 px-3 text-left">
            <div className="grid size-10 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm"><Stethoscope className="size-5" /></div>
            <div><p className="font-display text-lg font-semibold tracking-[-0.03em]">ACE</p><p className="text-[11px] font-medium uppercase tracking-[0.14em] text-muted-foreground">PNA Prep</p></div>
          </button>

          <nav aria-label="Navegação principal" className="mt-9 space-y-1">
            {navigation.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => navigate(id)} aria-current={activeView === id ? 'page' : undefined} className={`flex min-h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors ${activeView === id ? 'bg-sidebar-primary text-sidebar-primary-foreground shadow-sm' : 'text-sidebar-foreground/65 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'}`}>
                <Icon className="size-[18px]" />{label}
              </button>
            ))}
          </nav>

          <div className="mt-auto rounded-2xl border border-sidebar-border bg-white p-4 shadow-[0_8px_30px_rgb(26_63_58/6%)]">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary"><Target className="size-4" /> Meta semanal</div>
            <p className="mt-3 text-2xl font-semibold tracking-tight">3h 42m</p><p className="mt-1 text-xs text-muted-foreground">de 5 horas planeadas</p>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full w-[74%] rounded-full bg-primary" /></div>
          </div>
        </aside>

        <section className="min-w-0 flex-1 pb-20 lg:pb-0">
          <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-border/70 bg-background/90 px-5 backdrop-blur-xl sm:px-8 xl:px-12">
            <div className="flex items-center gap-3 lg:hidden">
              <button aria-label={mobileMenu ? 'Fechar menu' : 'Abrir menu'} onClick={() => setMobileMenu((current) => !current)} className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground">{mobileMenu ? <X className="size-4" /> : <Menu className="size-4" />}</button>
              <div><span className="font-display font-semibold">ACE</span><span className="ml-2 text-xs text-muted-foreground">{activeLabel}</span></div>
            </div>
            <div className="relative hidden w-full max-w-[430px] sm:block">
              <label className="flex h-10 items-center gap-2 rounded-xl border border-border bg-card px-3 text-sm text-muted-foreground shadow-sm"><Search className="size-4" /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Pesquisar questões, temas e materiais" className="min-w-0 flex-1 bg-transparent text-foreground outline-none placeholder:text-muted-foreground" /><kbd className="rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold">⌘ K</kbd></label>
              {searchResults.length > 0 ? <div className="absolute inset-x-0 top-12 overflow-hidden rounded-xl border border-border bg-card p-2 shadow-xl">{searchResults.map((result) => <button key={result.id} onClick={() => navigate(result.view)} className="flex w-full items-center justify-between rounded-lg px-3 py-2 text-left hover:bg-muted"><span className="truncate text-sm font-medium">{result.label}</span><span className="ml-3 shrink-0 text-xs text-muted-foreground">{result.detail}</span></button>)}</div> : null}
            </div>
            <div className="ml-auto flex items-center gap-2 sm:gap-3">
              <span title={data.origin === 'api' ? 'Dados do backend Java' : 'Dados de demonstração'} className={`hidden rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] xl:inline-flex ${data.origin === 'api' ? 'bg-teal-50 text-teal-700' : 'bg-amber-50 text-amber-700'}`}>{data.origin === 'api' ? 'API ligada' : 'Modo demo'}</span>
              <button aria-label="Ajuda" className="grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted"><CircleHelp className="size-[18px]" /></button>
              <button aria-label="Notificações" className="relative grid size-9 place-items-center rounded-xl text-muted-foreground hover:bg-muted"><Bell className="size-[18px]" /><span className="absolute right-2 top-2 size-1.5 rounded-full bg-coral-500" /></button>
              <div className="hidden items-center gap-2 border-l border-border pl-4 sm:flex"><div className="grid size-9 place-items-center rounded-full bg-teal-100 text-xs font-bold text-teal-800">MA</div><div><p className="text-xs font-semibold">Marta Almeida</p><p className="text-[11px] text-muted-foreground">{data.dashboard.targetLabel}</p></div></div>
            </div>
          </header>

          {mobileMenu ? <div className="fixed inset-x-4 top-20 z-40 rounded-2xl border border-border bg-card p-2 shadow-2xl lg:hidden">{navigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => navigate(id)} className={`flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium ${activeView === id ? 'bg-secondary text-primary' : 'text-muted-foreground'}`}><Icon className="size-4" />{label}</button>)}</div> : null}

          <div className="mx-auto max-w-[1220px] px-5 py-8 sm:px-8 xl:px-12 xl:py-10">
            {activeView === 'overview' ? <DashboardView data={data.dashboard} onNavigate={navigate} /> : null}
            {activeView === 'practice' ? <PracticeView key={generatedExam?.id ?? 'adaptive'} questions={data.questions} generatedExam={generatedExam} /> : null}
            {activeView === 'builder' ? <ExamBuilderView onNavigate={navigate} onExamReady={setGeneratedExam} /> : null}
            {activeView === 'questions' ? <QuestionBankView questions={data.questions} /> : null}
            {activeView === 'materials' ? <MaterialsView materials={data.materials} /> : null}
            {activeView === 'news' ? <NewsView news={data.news} onNavigate={navigate} /> : null}
            {activeView === 'analytics' ? <AnalyticsView dashboard={data.dashboard} history={data.readinessHistory} /> : null}
            {activeView === 'sources' ? <SourcesView sources={data.sources} /> : null}

            <footer className="mt-12 border-t border-border pt-6 text-[11px] leading-5 text-muted-foreground">
              <p>ACE é uma plataforma independente de estudo, não afiliada, aprovada ou certificada pela ACSS, GPNA, Ordem dos Médicos ou Ministério da Saúde. Conteúdo exclusivamente educativo; confirma sempre regras, datas e normas nas fontes oficiais.</p>
            </footer>
          </div>
        </section>
      </div>

      <nav aria-label="Navegação móvel" className="fixed inset-x-0 bottom-0 z-40 grid h-[70px] grid-cols-5 border-t border-border bg-card/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden">
        {mobileNavigation.map(({ id, label, icon: Icon }) => <button key={id} onClick={() => navigate(id)} className={`flex flex-col items-center justify-center gap-1 text-[10px] font-medium ${activeView === id ? 'text-primary' : 'text-muted-foreground'}`}><Icon className={`size-[18px] ${id === 'builder' ? 'rounded-md bg-primary p-0.5 text-primary-foreground' : ''}`} />{label === 'Visão geral' ? 'Início' : label === 'Criar exame' ? 'Criar' : label}</button>)}
      </nav>
    </main>
  );
}
