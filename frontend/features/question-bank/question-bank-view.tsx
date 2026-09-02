'use client';

import { useMemo, useState } from 'react';
import { CheckCircle2, FileQuestion, Filter, Search, ShieldCheck } from 'lucide-react';

import { PageIntro } from '@/components/app/page-intro';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { NativeSelect, NativeSelectOption } from '@/components/ui/native-select';
import type { Question } from '@/lib/types';

export function QuestionBankView({ questions }: { questions: Question[] }) {
  const [query, setQuery] = useState('');
  const [area, setArea] = useState('Todas');

  const areas = ['Todas', ...Array.from(new Set(questions.map((question) => question.area)))];
  const filtered = useMemo(() => questions.filter((question) => {
    const matchesArea = area === 'Todas' || question.area === area;
    const normalized = `${question.stem} ${question.area} ${question.topic}`.toLowerCase();
    return matchesArea && normalized.includes(query.toLowerCase());
  }), [area, query, questions]);

  return (
    <div>
      <PageIntro eyebrow="Banco de questões" title="Conteúdo com contexto e origem." description="Pesquisa por área ou tema. Cada versão publicada mantém explicação, proveniência e estado de revisão." icon={FileQuestion} />
      <div className="mt-8 flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 sm:flex-row">
        <label className="flex min-h-10 flex-1 items-center gap-2 rounded-xl border border-input bg-background px-3"><Search className="size-4 text-muted-foreground" /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Pesquisar enunciado ou tema…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label>
        <div className="flex items-center gap-2"><Filter className="size-4 text-muted-foreground" /><NativeSelect value={area} onChange={(event) => setArea(event.target.value)} className="w-full sm:w-64 [&_[data-slot=native-select]]:h-10 [&_[data-slot=native-select]]:rounded-xl">{areas.map((item) => <NativeSelectOption key={item}>{item}</NativeSelectOption>)}</NativeSelect></div>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground"><span>{filtered.length} questões encontradas</span><span className="flex items-center gap-1.5"><ShieldCheck className="size-3.5 text-teal-600" /> Histórico de versões preservado</span></div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        {filtered.map((question) => (
          <Card key={question.id} className="border-0 py-0 transition-transform hover:-translate-y-0.5 hover:shadow-[0_12px_36px_rgb(31_55_52/8%)] ring-1 ring-border">
            <CardContent className="p-5 sm:p-6">
              <div className="flex flex-wrap items-center gap-2"><Badge variant="secondary">{question.area}</Badge><Badge variant="outline">{question.topic}</Badge><Badge variant="outline">{question.difficulty}</Badge><Badge className="ml-auto bg-teal-50 text-teal-700"><CheckCircle2 className="size-3" />{question.status}</Badge></div>
              <h2 className="mt-5 line-clamp-3 font-display text-base font-semibold leading-6">{question.stem}</h2>
              <div className="mt-5 flex items-center justify-between border-t border-border pt-4 text-xs text-muted-foreground"><span>Matriz {question.relevance} · {question.competency}</span><span className="font-medium text-foreground">{question.source}</span></div>
            </CardContent>
          </Card>
        ))}
      </div>
      {filtered.length === 0 ? <div className="mt-4 rounded-2xl border border-dashed border-border bg-card p-10 text-center"><Search className="mx-auto size-7 text-muted-foreground" /><h2 className="mt-3 font-semibold">Sem resultados</h2><p className="mt-1 text-sm text-muted-foreground">Experimenta outra área ou um termo mais geral.</p></div> : null}
    </div>
  );
}
