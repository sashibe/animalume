import { Check, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Props = {
  status: 'saving' | 'saved' | 'unsaved' | 'idle';
  className?: string;
};

const TEXT = {
  saving:   { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, label: '保存中', cls: 'text-stone-500' },
  saved:    { icon: <Check className="h-3.5 w-3.5" />,                label: '保存済み', cls: 'text-stone-500' },
  unsaved:  { icon: <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />, label: '未保存', cls: 'text-amber-600' },
  idle:     { icon: null, label: '', cls: '' },
} as const;

export function SaveIndicator({ status, className }: Props) {
  if (status === 'idle') return null;
  const { icon, label, cls } = TEXT[status];
  return (
    <div className={cn('flex items-center gap-1.5 text-xs', cls, className)}>
      {icon}
      <span>{label}</span>
    </div>
  );
}
