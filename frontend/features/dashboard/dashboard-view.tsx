'use client';

import {
  ArrowRight,
  BookOpenCheck,
  CalendarDays,
  ChevronRight,
  Clock3,
  Flame,
  Play,
  Sparkles,
  Target,
} from 'lucide-react';

import { MetricCard } from '@/components/app/metric-card';
import { PageIntro } from '@/components/app/page-intro';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { DashboardData, ViewKey } from '@/lib/types';

interface DashboardViewProps {
  data: DashboardData;
  onNavigate: (view: ViewKey) => void;
}

const barTones = ['bg-teal-500', 'bg-sky-500', 'bg-amber-500', 'bg-violet-500', 'bg-orange-500'];

export function DashboardView({ data, onNavigate }: DashboardViewProps) {
  const weeklyPercent = Math.round((data.studyMinutesThisWeek / data.weeklyGoalMinutes) * 100);
  const maxQuestions = Math.max(...data.weeklyActivity.map((day) => day.questions), 1);

  return (
    <div>
      <PageIntro
        eyebrow="Quarta-feira, 2 de setembro"
        title={`Bom dia, ${data.learnerName}.`}
        description={`Faltam ${data.daysToExam} dias para a Prova Nacional de Acesso. O plano de hoje prioriza a lacuna com maior impacto.`}
        icon={CalendarDays}
        action={
          <div className="flex gap-2">
            <Button variant="outline" size="lg" className="h-11 rounded-xl px-4" onClick={() => onNavigate('builder')}>Criar exame</Button>
            <Button size="lg" className="h-11 rounded-xl px-4 shadow-[0_8px_22px_rgb(20_90_81/18%)]" onClick={() => onNavigate('practice')}>
              Continuar plano <ArrowRight className="size-4" />
            </Button>
          </div>
        }
      />

      <div className="mt-8 grid gap-5 xl:grid-cols-[1.45fr_.9fr]">
        <Card className="relative min-h-[320px] overflow-hidden border-0 bg-ink text-white shadow-[0_18px_60px_rgb(16_43_40/13%)] ring-0">
          <div className="absolute -right-24 -top-32 size-80 rounded-full bg-teal-300/10 blur-2xl" />
          <CardContent className="relative grid h-full gap-8 p-6 sm:grid-cols-[210px_1fr] sm:p-8">
            <div className="flex flex-col items-center justify-center border-white/10 sm:border-r sm:pr-8">
              <div className="relative grid size-40 place-items-center rounded-full p-[10px]" style={{ background: `conic-gradient(#64d5bd 0 ${data.readiness}%, rgba(255,255,255,.10) ${data.readiness}% 100%)` }}>
                <div className="grid size-full place-items-center rounded-full bg-ink">
                  <div className="text-center">
                    <span className="font-display text-5xl font-semibold tracking-[-0.07em]">{data.readiness}</span>
                    <span className="text-xl text-teal-200">%</span>
                    <p className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-white/55">preparação</p>
                  </div>
                </div>
              </div>
              <span className="mt-4 rounded-full bg-teal-300/10 px-3 py-1 text-xs font-semibold text-teal-200">↑ {data.readinessDelta}% esta semana</span>
              <p className="mt-2 text-[11px] text-white/45">Confiança {data.readinessConfidence.toLowerCase()} · 286 respostas recentes</p>
            </div>

            <div className="flex flex-col justify-center">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.13em] text-teal-200"><Sparkles className="size-4" /> Próxima melhor ação</div>
              <h2 className="mt-4 max-w-lg font-display text-2xl font-semibold leading-tight tracking-[-0.035em] sm:text-3xl">{data.recommendation.title}</h2>
              <p className="mt-3 max-w-xl text-sm leading-6 text-white/62">{data.recommendation.description}</p>
              <div className="mt-6 flex flex-wrap items-center gap-3">
                <Button className="h-10 rounded-xl bg-mint px-4 text-ink hover:bg-mint/90" onClick={() => onNavigate('practice')}>
                  <Play className="size-4 fill-current" /> Começar {data.recommendation.questionCount} perguntas
                </Button>
                <span className="flex items-center gap-1.5 text-xs text-white/55"><Clock3 className="size-3.5" /> ~{data.recommendation.estimatedMinutes} minutos</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card py-0 shadow-[0_12px_40px_rgb(31_55_52/7%)] ring-1 ring-border">
          <CardContent className="p-6 sm:p-7">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">Domínio por área</p>
                <h2 className="mt-2 font-display text-xl font-semibold tracking-tight">Onde estás mais forte</h2>
              </div>
              <button aria-label="Ver análise completa" onClick={() => onNavigate('analytics')} className="grid size-8 place-items-center rounded-lg border border-border text-muted-foreground hover:bg-muted"><ChevronRight className="size-4" /></button>
            </div>
            <div className="mt-7 space-y-4">
              {data.subjectScores.slice(0, 3).map((subject, index) => (
                <div key={subject.name}>
                  <div className="mb-2 flex items-center justify-between text-sm"><span className="font-medium">{subject.name}</span><span className="font-semibold tabular-nums">{subject.score}%</span></div>
                  <div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${barTones[index]}`} style={{ width: `${subject.score}%` }} /></div>
                </div>
              ))}
            </div>
            <div className="mt-6 rounded-xl bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 ring-1 ring-amber-200/70"><strong>Maior oportunidade:</strong> Ginecologia e Obstetrícia tem 38 perguntas ainda não vistas.</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        <MetricCard label="Questões respondidas" value={data.answeredQuestions.toLocaleString('pt-PT')} detail="+139 nos últimos 7 dias" icon={BookOpenCheck} tone="blue" />
        <MetricCard label="Meta semanal" value={`${Math.floor(data.studyMinutesThisWeek / 60)}h ${data.studyMinutesThisWeek % 60}m`} detail={`${weeklyPercent}% de ${Math.floor(data.weeklyGoalMinutes / 60)} horas`} icon={Target} tone="teal" />
        <MetricCard label="Consistência" value={`${data.currentStreakDays} dias`} detail="Melhor sequência: 14 dias" icon={Flame} tone="coral" />
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[1.2fr_.8fr]">
        <Card className="border-0 py-0 shadow-[0_8px_30px_rgb(31_55_52/5%)] ring-1 ring-border">
          <CardContent className="p-6">
            <div className="flex items-center justify-between"><div><p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Atividade</p><h3 className="mt-1 font-display text-lg font-semibold">Esta semana</h3></div><span className="text-xs text-muted-foreground">139 perguntas · 3h 42m</span></div>
            <figure className="mt-7 flex h-32 items-end justify-between gap-3" aria-label="Atividade semanal: pico de 42 perguntas na quinta-feira">
              {data.weeklyActivity.map((day) => (
                <div key={day.label} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <div className="w-full max-w-9 rounded-t-lg bg-teal-500/75 transition-all hover:bg-teal-500" style={{ height: `${Math.max((day.questions / maxQuestions) * 100, day.questions ? 12 : 3)}%` }} title={`${day.questions} perguntas`} />
                  <span className="text-[11px] font-medium text-muted-foreground">{day.label}</span>
                </div>
              ))}
            </figure>
          </CardContent>
        </Card>
        <Card className="border-0 py-0 shadow-[0_8px_30px_rgb(31_55_52/5%)] ring-1 ring-border">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Próximo marco</p>
            <div className="mt-4 flex items-center gap-4"><div className="grid size-14 shrink-0 place-items-center rounded-2xl bg-teal-50 text-teal-700"><CalendarDays className="size-6" /></div><div><h3 className="font-display text-lg font-semibold">Simulado completo</h3><p className="mt-1 text-xs text-muted-foreground">Sábado · 09:00 · 150 questões</p></div></div>
            <button onClick={() => onNavigate('builder')} className="mt-6 flex w-full items-center justify-between rounded-xl border border-border px-4 py-3 text-sm font-semibold hover:bg-muted">Ajustar simulado <ChevronRight className="size-4" /></button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
