import type { LucideIcon } from 'lucide-react';

interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
}

export function PageIntro({ eyebrow, title, description, icon: Icon, action }: PageIntroProps) {
  return (
    <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
      <div>
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
          {Icon ? <Icon className="size-3.5" /> : null}
          {eyebrow}
        </div>
        <h1 className="font-display text-3xl font-semibold tracking-[-0.04em] sm:text-[38px]">{title}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
