'use client';

import { useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Bookmark, Check, CheckCircle2, Clock3, ExternalLink, Flag, RotateCcw, X } from 'lucide-react';

import { PageIntro } from '@/components/app/page-intro';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { GeneratedExam, Question } from '@/lib/types';

interface PracticeViewProps {
  questions: Question[];
  generatedExam: GeneratedExam | null;
}

export function PracticeView({ questions, generatedExam }: PracticeViewProps) {
  const items = useMemo(() => generatedExam?.items?.length ? generatedExam.items : questions, [generatedExam, questions]);
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [flagged, setFlagged] = useState<string[]>([]);
  const [complete, setComplete] = useState(false);

  const question = items[index];
  const correctCount = Object.values(answers).filter(Boolean).length;
  const accuracy = Object.keys(answers).length ? Math.round((correctCount / Object.keys(answers).length) * 100) : 0;

  if (!question) {
    return <div className="rounded-2xl border border-border bg-card p-8"><p>Ainda não existem questões neste conjunto.</p></div>;
  }

  function revealAnswer() {
    if (selected === null) return;
    setRevealed(true);
    setAnswers((current) => ({ ...current, [question.id]: selected === question.correctIndex }));
  }

  function nextQuestion() {
    if (index >= items.length - 1) {
      setComplete(true);
      return;
    }
    setIndex((current) => current + 1);
    setSelected(null);
    setRevealed(false);
  }

  function previousQuestion() {
    if (index === 0) return;
    setIndex((current) => current - 1);
    setSelected(null);
    setRevealed(false);
  }

  if (complete) {
    return (
      <div className="mx-auto max-w-2xl py-10">
        <Card className="border-0 py-0 text-center shadow-[0_18px_60px_rgb(31_55_52/10%)] ring-1 ring-border">
          <CardContent className="p-8 sm:p-12">
            <div className="mx-auto grid size-16 place-items-center rounded-2xl bg-teal-50 text-teal-700"><CheckCircle2 className="size-8" /></div>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Sessão concluída</p>
            <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight">{accuracy}% de precisão</h1>
            <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">Respondeste a {Object.keys(answers).length} questões. As respostas alimentam o índice de preparação e as próximas recomendações.</p>
            <div className="mt-8 grid grid-cols-3 gap-3"><div className="rounded-xl bg-muted p-4"><p className="text-2xl font-semibold text-teal-700">{correctCount}</p><p className="text-xs text-muted-foreground">certas</p></div><div className="rounded-xl bg-muted p-4"><p className="text-2xl font-semibold text-orange-700">{Object.keys(answers).length - correctCount}</p><p className="text-xs text-muted-foreground">a rever</p></div><div className="rounded-xl bg-muted p-4"><p className="text-2xl font-semibold">{flagged.length}</p><p className="text-xs text-muted-foreground">marcadas</p></div></div>
            <Button className="mt-8 h-11 rounded-xl px-5" onClick={() => { setIndex(0); setSelected(null); setRevealed(false); setAnswers({}); setComplete(false); }}><RotateCcw className="size-4" /> Repetir sessão</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <PageIntro eyebrow={generatedExam ? 'Exame personalizado' : 'Treino adaptativo'} title={generatedExam?.title ?? 'Sessão de consolidação'} description={generatedExam ? `${generatedExam.questionCount} questões · ${generatedExam.durationMinutes} minutos · configuração guardada` : 'Questões selecionadas a partir das tuas lacunas recentes, com explicações e fontes.'} icon={Clock3} />

      <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-teal-500 transition-all" style={{ width: `${((index + 1) / items.length) * 100}%` }} /></div>
      <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground"><span>Questão {index + 1} de {items.length}</span><span>{Object.keys(answers).length} respondidas · {flagged.length} marcadas</span></div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1fr_280px]">
        <Card className="border-0 py-0 shadow-[0_12px_44px_rgb(31_55_52/7%)] ring-1 ring-border">
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{question.area}</Badge><Badge variant="outline">{question.topic}</Badge><Badge variant="outline">Relevância {question.relevance}</Badge><span className="ml-auto text-xs text-muted-foreground">{question.difficulty}</span></div>
            <h2 className="mt-7 font-display text-xl font-semibold leading-8 tracking-[-0.02em] sm:text-2xl">{question.stem}</h2>
            <div className="mt-7 space-y-3">
              {question.options.map((option, optionIndex) => {
                const isSelected = selected === optionIndex;
                const isCorrect = revealed && optionIndex === question.correctIndex;
                const isWrong = revealed && isSelected && optionIndex !== question.correctIndex;
                return (
                  <button key={option} disabled={revealed} onClick={() => setSelected(optionIndex)} className={`flex min-h-14 w-full items-center gap-3 rounded-xl border p-3.5 text-left text-sm leading-5 transition-all ${isCorrect ? 'border-teal-500 bg-teal-50 text-teal-950' : isWrong ? 'border-orange-400 bg-orange-50 text-orange-950' : isSelected ? 'border-primary bg-secondary' : 'border-border hover:border-primary/45 hover:bg-muted/40'}`}>
                    <span className={`grid size-7 shrink-0 place-items-center rounded-lg border text-xs font-semibold ${isCorrect ? 'border-teal-600 bg-teal-600 text-white' : isWrong ? 'border-orange-500 bg-orange-500 text-white' : isSelected ? 'border-primary bg-primary text-white' : 'border-border bg-card text-muted-foreground'}`}>{isCorrect ? <Check className="size-4" /> : isWrong ? <X className="size-4" /> : String.fromCharCode(65 + optionIndex)}</span>
                    {option}
                  </button>
                );
              })}
            </div>

            {revealed ? (
              <div className={`mt-6 rounded-2xl border p-5 ${selected === question.correctIndex ? 'border-teal-200 bg-teal-50' : 'border-orange-200 bg-orange-50'}`}>
                <div className="flex items-center gap-2 text-sm font-semibold">{selected === question.correctIndex ? <><CheckCircle2 className="size-4 text-teal-700" /> Resposta correta</> : <><X className="size-4 text-orange-700" /> Revê este raciocínio</>}</div>
                <p className="mt-2 text-sm leading-6 text-foreground/75">{question.explanation}</p>
                <a href={question.sourceUrl} target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">Fonte: {question.source} <ExternalLink className="size-3" /></a>
              </div>
            ) : null}

            <div className="mt-7 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-5">
              <Button variant="ghost" onClick={() => setFlagged((current) => current.includes(question.id) ? current.filter((id) => id !== question.id) : [...current, question.id])}><Flag className={`size-4 ${flagged.includes(question.id) ? 'fill-amber-400 text-amber-500' : ''}`} />{flagged.includes(question.id) ? 'Marcada' : 'Marcar para rever'}</Button>
              <div className="flex gap-2"><Button variant="outline" disabled={index === 0} onClick={previousQuestion}><ArrowLeft className="size-4" /> Anterior</Button>{revealed ? <Button onClick={nextQuestion}>{index === items.length - 1 ? 'Terminar' : 'Seguinte'} <ArrowRight className="size-4" /></Button> : <Button disabled={selected === null} onClick={revealAnswer}>Ver resposta</Button>}</div>
            </div>
          </CardContent>
        </Card>

        <aside className="space-y-4">
          <Card className="border-0 py-0 ring-1 ring-border"><CardContent className="p-5"><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Mapa da sessão</p><div className="mt-4 grid max-h-[26rem] grid-cols-5 gap-2 overflow-y-auto pr-1">{items.map((item, itemIndex) => <button key={`${item.id}-${itemIndex}`} aria-label={`Ir para a questão ${itemIndex + 1}`} onClick={() => { setIndex(itemIndex); setSelected(null); setRevealed(false); }} className={`grid aspect-square place-items-center rounded-lg text-xs font-semibold ${itemIndex === index ? 'bg-primary text-primary-foreground' : answers[item.id] === true ? 'bg-teal-100 text-teal-800' : answers[item.id] === false ? 'bg-orange-100 text-orange-800' : 'bg-muted text-muted-foreground'}`}>{itemIndex + 1}</button>)}</div></CardContent></Card>
          <Card className="border-0 py-0 ring-1 ring-border"><CardContent className="p-5"><div className="flex items-center gap-2"><Bookmark className="size-4 text-primary" /><p className="text-sm font-semibold">Proveniência</p></div><p className="mt-3 text-xs leading-5 text-muted-foreground">Questão autoral demonstrativa associada a uma fonte. Requer validação clínica antes de utilização formativa e não é uma questão oficial da PNA.</p></CardContent></Card>
        </aside>
      </div>
    </div>
  );
}
