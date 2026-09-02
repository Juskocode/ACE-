'use client';

import { Activity, Brain, Clock3, Gauge, Info, TrendingUp, TriangleAlert } from 'lucide-react';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { MetricCard } from '@/components/app/metric-card';
import { PageIntro } from '@/components/app/page-intro';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import type { DashboardData, ReadinessPoint } from '@/lib/types';

interface AnalyticsViewProps {
  dashboard: DashboardData;
  history: ReadinessPoint[];
}

const chartConfig = {
  score: { label: 'Índice de preparação', color: '#2c8b7d' },
  target: { label: 'Trajetória recomendada', color: '#d3a247' },
};

export function AnalyticsView({ dashboard, history }: AnalyticsViewProps) {
  const topicTimes = [
    { topic: 'Cardiologia', seconds: 102, target: 96 },
    { topic: 'Obstetrícia', seconds: 118, target: 96 },
    { topic: 'Pediatria', seconds: 89, target: 96 },
    { topic: 'Psiquiatria', seconds: 78, target: 96 },
    { topic: 'Cirurgia', seconds: 109, target: 96 },
  ];

  return (
    <div>
      <PageIntro
        eyebrow="Análise de preparação"
        title="Percebe o que está a mudar."
        description="Uma leitura explicável da tua evolução, cobertura da matriz, ritmo e lacunas — baseada na atividade desta plataforma."
        icon={TrendingUp}
        action={<Badge variant="secondary" className="h-7 px-3">Confiança da estimativa: {dashboard.readinessConfidence}</Badge>}
      />

      <div className="mt-8 grid gap-5 md:grid-cols-3">
        <MetricCard label="Preparação atual" value={`${dashboard.readiness}%`} detail={`+${dashboard.readinessDelta} pontos em 7 dias`} icon={Gauge} />
        <MetricCard label="Cobertura da matriz" value="68%" detail="16 de 24 domínios com evidência" icon={Brain} tone="blue" />
        <MetricCard label="Tempo por questão" value="1m 41s" detail="5s acima do objetivo do simulado" icon={Clock3} tone="amber" />
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[1.45fr_.8fr]">
        <Card className="border-0 py-0 shadow-[0_10px_36px_rgb(31_55_52/6%)] ring-1 ring-border">
          <CardContent className="p-6 sm:p-7">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Série temporal</p>
                <h2 className="mt-1 font-display text-xl font-semibold">Evolução da preparação</h2>
                <p className="mt-1 text-xs text-muted-foreground">Subiste 21 pontos desde maio; a projeção mantém-se perto da trajetória recomendada.</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] text-muted-foreground"><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-teal-600" />Real</span><span className="flex items-center gap-1.5"><i className="size-2 rounded-full bg-amber-500" />Objetivo</span></div>
            </div>
            <ChartContainer config={chartConfig} className="mt-6 h-[290px] w-full aspect-auto" aria-label="Gráfico da preparação entre maio e a previsão para o exame">
              <AreaChart data={history} margin={{ left: -14, right: 8, top: 12 }}>
                <defs>
                  <linearGradient id="scoreFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-score)" stopOpacity={0.28} /><stop offset="100%" stopColor="var(--color-score)" stopOpacity={0.01} /></linearGradient>
                </defs>
                <CartesianGrid vertical={false} strokeDasharray="4 6" />
                <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={10} />
                <YAxis domain={[40, 100]} tickLine={false} axisLine={false} tickFormatter={(value) => `${value}%`} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Area type="monotone" dataKey="target" stroke="var(--color-target)" strokeWidth={1.5} strokeDasharray="5 5" fill="transparent" />
                <Area type="monotone" dataKey="score" stroke="var(--color-score)" strokeWidth={3} fill="url(#scoreFill)" />
              </AreaChart>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="border-0 bg-ink py-0 text-white ring-0">
          <CardContent className="p-6 sm:p-7">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.1em] text-teal-200"><Activity className="size-4" /> Leitura desta semana</div>
            <h2 className="mt-5 font-display text-2xl font-semibold leading-tight tracking-tight">A precisão subiu; o ritmo ainda limita dois temas.</h2>
            <p className="mt-3 text-sm leading-6 text-white/60">Medicina e Pediatria sustentam a subida. Obstetrícia e Cirurgia continuam acima do tempo recomendado por questão.</p>
            <div className="mt-6 space-y-3">
              <div className="rounded-xl bg-white/7 p-4"><p className="text-xs text-white/50">Força com mais evidência</p><p className="mt-1 text-sm font-semibold">Cardiologia · 84% em 74 respostas</p></div>
              <div className="rounded-xl bg-white/7 p-4"><p className="text-xs text-white/50">Lacuna com maior impacto</p><p className="mt-1 text-sm font-semibold">Hipertensão na gravidez · 51%</p></div>
            </div>
            <div className="mt-6 flex gap-2 text-[11px] leading-5 text-white/45"><Info className="mt-0.5 size-3.5 shrink-0" />O índice combina precisão recente (55%), cobertura (20%), recência (15%) e ritmo (10%).</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 xl:grid-cols-[.9fr_1.1fr]">
        <Card className="border-0 py-0 ring-1 ring-border">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Mapa de conhecimento</p>
            <h2 className="mt-1 font-display text-xl font-semibold">Forças e lacunas</h2>
            <div className="mt-6 space-y-4">
              {dashboard.subjectScores.map((subject) => (
                <div key={subject.name} className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <div><div className="mb-2 flex justify-between text-sm"><span className="font-medium">{subject.name}</span><span className="tabular-nums text-muted-foreground">{subject.score}%</span></div><div className="h-2 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${subject.status === 'Forte' ? 'bg-teal-500' : subject.status === 'Prioridade' ? 'bg-orange-500' : 'bg-amber-500'}`} style={{ width: `${subject.score}%` }} /></div></div>
                  <Badge variant="outline" className="w-24 justify-center">{subject.status}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 py-0 ring-1 ring-border">
          <CardContent className="p-6">
            <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Ritmo por tema</p>
            <h2 className="mt-1 font-display text-xl font-semibold">Segundos por questão</h2>
            <p className="mt-1 text-xs text-muted-foreground">Objetivo atual: 96 segundos para o formato de 150 questões em 240 minutos.</p>
            <ChartContainer config={{ seconds: { label: 'Tempo', color: '#4aa99b' } }} className="mt-5 h-[260px] w-full aspect-auto" aria-label="Tempo médio por questão em cinco temas">
              <BarChart data={topicTimes} layout="vertical" margin={{ left: 18, right: 12 }}>
                <CartesianGrid horizontal={false} strokeDasharray="4 6" />
                <XAxis type="number" tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="topic" width={86} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="seconds" fill="var(--color-seconds)" radius={[0, 7, 7, 0]} />
              </BarChart>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      <div className="mt-5 flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm leading-6 text-amber-950"><TriangleAlert className="mt-0.5 size-5 shrink-0" /><p><strong>Estimativa, não previsão de colocação.</strong> O índice usa apenas a tua atividade no ACE e não incorpora classificação final de curso, ranking, vagas ou escolhas de especialidade.</p></div>
    </div>
  );
}
