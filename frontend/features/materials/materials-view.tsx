'use client';

import { BookOpen, ExternalLink, FileText, FolderOpen, MoreHorizontal, Plus, Search } from 'lucide-react';

import { PageIntro } from '@/components/app/page-intro';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import type { Material } from '@/lib/types';

export function MaterialsView({ materials }: { materials: Material[] }) {
  const collections = Array.from(new Set(materials.map((material) => material.collection)));

  return (
    <div>
      <PageIntro eyebrow="Biblioteca de estudo" title="Materiais ligados à matriz." description="Agrupa normas, regulamentos, artigos e apontamentos. O ACE mantém a fonte, data e estado de leitura visíveis." icon={BookOpen} action={<Button className="h-11 rounded-xl px-4"><Plus className="size-4" /> Adicionar material</Button>} />

      <div className="mt-8 grid gap-5 xl:grid-cols-[260px_1fr]">
        <aside>
          <Card className="border-0 py-0 ring-1 ring-border"><CardContent className="p-4"><p className="px-2 text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">Coleções</p><div className="mt-3 space-y-1"><button className="flex w-full items-center gap-2 rounded-xl bg-secondary px-3 py-2.5 text-left text-sm font-semibold text-secondary-foreground"><FolderOpen className="size-4" /> Todos os materiais <span className="ml-auto text-xs">{materials.length}</span></button>{collections.map((collection) => <button key={collection} className="flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-sm text-muted-foreground hover:bg-muted hover:text-foreground"><FolderOpen className="size-4" /> <span className="min-w-0 flex-1 truncate">{collection}</span></button>)}</div></CardContent></Card>
          <div className="mt-4 rounded-2xl border border-dashed border-border p-4"><p className="text-xs font-semibold">Importação responsável</p><p className="mt-2 text-[11px] leading-5 text-muted-foreground">RSS e API primeiro. Conteúdo integral apenas quando a licença o permite; os restantes itens guardam resumo e ligação canónica.</p></div>
        </aside>

        <div>
          <label className="flex h-11 items-center gap-2 rounded-xl border border-input bg-card px-3 shadow-sm"><Search className="size-4 text-muted-foreground" /><input placeholder="Pesquisar materiais, fontes ou temas…" className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground" /></label>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {materials.map((material) => (
              <Card key={material.id} className="border-0 py-0 ring-1 ring-border">
                <CardContent className="p-5">
                  <div className="flex items-start gap-4"><div className="grid size-11 shrink-0 place-items-center rounded-xl bg-teal-50 text-teal-700"><FileText className="size-5" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><Badge variant="secondary">{material.type}</Badge><button aria-label="Mais opções" className="text-muted-foreground"><MoreHorizontal className="size-4" /></button></div><h2 className="mt-3 font-display text-base font-semibold leading-6">{material.title}</h2><p className="mt-1 text-xs text-muted-foreground">{material.publisher} · {material.updatedAt}</p></div></div>
                  <div className="mt-5"><div className="mb-2 flex justify-between text-[11px] text-muted-foreground"><span>Progresso de leitura</span><span>{material.progress}%</span></div><div className="h-1.5 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-teal-500" style={{ width: `${material.progress}%` }} /></div></div>
                  <div className="mt-5 flex items-center justify-between border-t border-border pt-4"><span className="text-xs text-muted-foreground">{material.collection}</span><a href={material.sourceUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs font-semibold text-primary hover:underline">Abrir fonte <ExternalLink className="size-3" /></a></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
