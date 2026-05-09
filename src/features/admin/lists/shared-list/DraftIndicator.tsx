import { cn } from '@/lib/utils';

type Props = {
  hasDraft: boolean;
  className?: string;
};

export function DraftIndicator({ hasDraft, className }: Props) {
  if (!hasDraft) return null;
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 text-[10px] text-amber-700',
        className,
      )}
      aria-label="未公開の変更あり"
    >
      <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
      未公開
    </span>
  );
}
