import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  label: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: 'teal' | 'amber' | 'blue' | 'coral';
}

const tones = {
  teal: 'bg-teal-50 text-teal-700',
  amber: 'bg-amber-50 text-amber-700',
  blue: 'bg-sky-50 text-sky-700',
  coral: 'bg-orange-50 text-orange-700',
};

export function MetricCard({ label, value, detail, icon: Icon, tone = 'teal' }: MetricCardProps) {
  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-[0_8px_30px_rgb(31_55_52/5%)]">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.1em] text-muted-foreground">{label}</p>
          <p className="mt-3 font-display text-3xl font-semibold tracking-[-0.045em]">{value}</p>
          <p className="mt-1.5 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={`grid size-10 place-items-center rounded-xl ${tones[tone]}`}>
          <Icon className="size-[18px]" />
        </div>
      </div>
    </div>
  );
}
