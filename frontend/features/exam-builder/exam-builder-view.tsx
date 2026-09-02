'use client';

import { useEffect, useMemo, useState } from 'react';
import { Check, ChevronRight, ClipboardCheck, Clock3, FileCheck2, LoaderCircle, Shuffle, SlidersHorizontal, Sparkles } from 'lucide-react';

import { PageIntro } from '@/components/app/page-intro';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import { generateExam } from '@/lib/api';
import type { GeneratedExam, ViewKey } from '@/lib/types';

interface ExamBuilderViewProps {
  onNavigate: (view: ViewKey) => void;
  onExamReady: (exam: GeneratedExam) => void;
}

const templates = [
  { id: 'simulado', title: 'Simulado PNA', detail: '150 questões · 240 min', icon: ClipboardCheck },
  { id: 'weakness', title: 'Pontos fracos', detail: '20 questões · adaptativo', icon: Sparkles },
  { id: 'quick', title: 'Revisão rápida', detail: '10 questões · 15 min', icon: Clock3 },
];

const areas = ['Medicina', 'Cirurgia', 'Pediatria', 'Ginecologia/Obstetrícia', 'Psiquiatria'];
const generationStages = ['A selecionar fontes', 'A equilibrar os temas', 'A validar as questões', 'A preparar o exame'];

function createExamSeed(): number {
  if (typeof crypto !== 'undefined') {
    return crypto.getRandomValues(new Uint32Array(1))[0];
  }

  return Date.now();
}

export function ExamBuilderView({ onNavigate, onExamReady }: ExamBuilderViewProps) {
  const [template, setTemplate] = useState('weakness');
  const [selectedAreas, setSelectedAreas] = useState<string[]>(['Medicina', 'Ginecologia/Obstetrícia']);
  const [questionCount, setQuestionCount] = useState(20);
  const [durationMinutes, setDurationMinutes] = useState(35);
  const [difficulty, setDifficulty] = useState('Equilibrada');
  const [boostWeakTopics, setBoostWeakTopics] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [stage, setStage] = useState(0);
  const [generated, setGenerated] = useState<GeneratedExam | null>(null);

  useEffect(() => {
    if (!isGenerating) return;
    const interval = window.setInterval(() => setStage((current) => Math.min(current + 1, generationStages.length - 1)), 420);
    return () => window.clearInterval(interval);
  }, [isGenerating]);

  const selectedTemplate = useMemo(() => templates.find((item) => item.id === template), [template]);

  function applyTemplate(next: string) {
    setTemplate(next);
    setGenerated(null);
    if (next === 'simulado') {
      setQuestionCount(150);
      setDurationMinutes(240);
      setSelectedAreas(areas);
      setBoostWeakTopics(false);
    } else if (next === 'quick') {
      setQuestionCount(10);
      setDurationMinutes(15);
      setSelectedAreas([]);
      setBoostWeakTopics(false);
    } else {
      setQuestionCount(20);
      setDurationMinutes(35);
      setSelectedAreas(['Medicina', 'Ginecologia/Obstetrícia']);
      setBoostWeakTopics(true);
    }
  }

  function toggleArea(area: string) {
    setGenerated(null);
    setSelectedAreas((current) => current.includes(area) ? current.filter((item) => item !== area) : [...current, area]);
  }

  async function handleGenerate() {
    setIsGenerating(true);
    setGenerated(null);
    setStage(0);
    const exam = await generateExam({
      mode: selectedTemplate?.title ?? 'Exame personalizado',
      questionCount,
      durationMinutes,
      areas: selectedAreas,
      difficulty,
      boostWeakTopics,
      seed: createExamSeed(),
    });
    setGenerated(exam);
    setIsGenerating(false);
    onExamReady(exam);
  }

  return (
    <div>
      <PageIntro eyebrow="Gerador de exames" title="Constrói o treino certo para hoje." description="Mistura áreas, equilibra dificuldade e dá prioridade às tuas lacunas. Cada geração recebe uma nova seed e uma ordem aleatória; a seed guardada permite reproduzir o exame." icon={Shuffle} />

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.2fr_.72fr]">
        <div className="space-y-5">
          <Card className="border-0 py-0 ring-1 ring-border">
            <CardContent className="p-6 sm:p-7">
              <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">1</span><div><h2 className="font-display text-lg font-semibold">Escolhe um objetivo</h2><p className="text-xs text-muted-foreground">Parte de um modelo e ajusta o que precisares.</p></div></div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                {templates.map(({ id, title, detail, icon: Icon }) => (
                  <button key={id} onClick={() => applyTemplate(id)} className={`rounded-2xl border p-4 text-left transition-all ${template === id ? 'border-primary bg-secondary shadow-sm' : 'border-border bg-card hover:border-primary/40 hover:bg-muted/50'}`}>
                    <div className={`grid size-9 place-items-center rounded-xl ${template === id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}><Icon className="size-[18px]" /></div>
                    <p className="mt-4 text-sm font-semibold">{title}</p><p className="mt-1 text-xs text-muted-foreground">{detail}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 py-0 ring-1 ring-border">
            <CardContent className="p-6 sm:p-7">
              <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">2</span><div><h2 className="font-display text-lg font-semibold">Define o conteúdo</h2><p className="text-xs text-muted-foreground">Sem seleção, usamos todas as áreas da matriz.</p></div></div>
              <div className="mt-5 flex flex-wrap gap-2">
                {areas.map((area) => {
                  const selected = selectedAreas.includes(area);
                  return <button key={area} onClick={() => toggleArea(area)} className={`flex min-h-10 items-center gap-2 rounded-xl border px-3.5 text-sm font-medium transition-colors ${selected ? 'border-primary bg-primary text-primary-foreground' : 'border-border hover:bg-muted'}`}>{selected ? <Check className="size-3.5" /> : null}{area}</button>;
                })}
              </div>
              <div className="mt-5 rounded-xl bg-muted/60 p-4 text-xs leading-5 text-muted-foreground"><strong className="text-foreground">Cobertura prevista:</strong> {selectedAreas.length ? selectedAreas.join(', ') : 'matriz PNA completa'}. A relevância A/B/C e as competências MD/D/P/GD são preservadas no balanceamento.</div>
            </CardContent>
          </Card>

          <Card className="border-0 py-0 ring-1 ring-border">
            <CardContent className="p-6 sm:p-7">
              <div className="flex items-center gap-3"><span className="grid size-8 place-items-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">3</span><div><h2 className="font-display text-lg font-semibold">Afina a sessão</h2><p className="text-xs text-muted-foreground">Configuração simples, com detalhes avançados opcionais.</p></div></div>
              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <label className="space-y-2 text-xs font-semibold text-muted-foreground"><span>Questões</span><input type="number" min={5} max={150} value={questionCount} onChange={(event) => setQuestionCount(Number(event.target.value))} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-3 focus:ring-ring/30" /></label>
                <label className="space-y-2 text-xs font-semibold text-muted-foreground"><span>Duração (min)</span><input type="number" min={10} max={240} value={durationMinutes} onChange={(event) => setDurationMinutes(Number(event.target.value))} className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-3 focus:ring-ring/30" /></label>
                <div className="space-y-2 text-xs font-semibold text-muted-foreground"><label htmlFor="exam-difficulty">Dificuldade</label><NativeSelect id="exam-difficulty" value={difficulty} onChange={(event) => setDifficulty(event.target.value)} className="w-full [&_[data-slot=native-select]]:h-10 [&_[data-slot=native-select]]:rounded-xl"><NativeSelectOption>Equilibrada</NativeSelectOption><NativeSelectOption>Progressiva</NativeSelectOption><NativeSelectOption>Difícil</NativeSelectOption></NativeSelect></div>
              </div>
              <div className="mt-5 flex items-start gap-3 rounded-xl border border-border p-4 hover:bg-muted/40"><input id="boost-weak-topics" type="checkbox" checked={boostWeakTopics} onChange={(event) => setBoostWeakTopics(event.target.checked)} className="mt-0.5 size-4 accent-[var(--primary)]" /><label htmlFor="boost-weak-topics" className="cursor-pointer"><span className="block text-sm font-semibold">Reforçar lacunas detetadas</span><span className="mt-1 block text-xs leading-5 text-muted-foreground">Aumenta o peso de tópicos com desempenho baixo sem abandonar a distribuição escolhida.</span></label></div>
            </CardContent>
          </Card>
        </div>

        <aside className="xl:sticky xl:top-24 xl:self-start">
          <Card className="border-0 bg-ink py-0 text-white ring-0">
            <CardContent className="p-6 sm:p-7">
              <div className="flex items-center justify-between"><p className="text-xs font-semibold uppercase tracking-[0.11em] text-teal-200">Resumo do exame</p><SlidersHorizontal className="size-4 text-white/45" /></div>
              <h2 className="mt-5 font-display text-2xl font-semibold">{selectedTemplate?.title}</h2>
              <div className="mt-6 divide-y divide-white/10 border-y border-white/10">
                <div className="flex justify-between py-3 text-sm"><span className="text-white/50">Questões</span><strong>{questionCount}</strong></div>
                <div className="flex justify-between py-3 text-sm"><span className="text-white/50">Duração</span><strong>{durationMinutes} min</strong></div>
                <div className="flex justify-between py-3 text-sm"><span className="text-white/50">Áreas</span><strong>{selectedAreas.length || 5}</strong></div>
                <div className="flex justify-between py-3 text-sm"><span className="text-white/50">Dificuldade</span><strong>{difficulty}</strong></div>
              </div>

              {isGenerating ? (
                <div className="mt-6 rounded-xl bg-white/7 p-4" aria-live="polite">
                  <div className="flex items-center gap-2 text-sm font-semibold"><LoaderCircle className="size-4 animate-spin" />{generationStages[stage]}</div>
                  <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-mint transition-all" style={{ width: `${((stage + 1) / generationStages.length) * 100}%` }} /></div>
                </div>
              ) : generated ? (
                <div className="mt-6 rounded-xl bg-teal-300/10 p-4 ring-1 ring-teal-200/20">
                  <div className="flex items-center gap-2 text-sm font-semibold text-teal-100"><FileCheck2 className="size-4" /> Exame preparado</div>
                  <p className="mt-2 text-xs leading-5 text-white/55">ID {generated.id} · manifesto de geração guardado</p>
                </div>
              ) : null}

              <Button disabled={isGenerating} onClick={generated ? () => onNavigate('practice') : handleGenerate} className="mt-6 h-11 w-full rounded-xl bg-mint text-ink hover:bg-mint/90">
                {isGenerating ? 'A preparar…' : generated ? 'Abrir exame' : 'Gerar exame'} <ChevronRight className="size-4" />
              </Button>
              <p className="mt-4 text-center text-[10px] leading-4 text-white/40">Os itens demonstrativos requerem validação clínica antes de utilização formativa.</p>
            </CardContent>
          </Card>

          {generated ? (
            <Card className="mt-4 border-0 py-0 ring-1 ring-border"><CardContent className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Manifesto</p><ul className="mt-3 space-y-2">{generated.manifestNotes.map((note) => <li key={note} className="flex gap-2 text-xs leading-5 text-muted-foreground"><Check className="mt-0.5 size-3.5 shrink-0 text-teal-600" />{note}</li>)}</ul></CardContent></Card>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
