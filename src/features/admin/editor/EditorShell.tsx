import { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  langTabs: ReactNode;
  saveIndicator?: ReactNode;
  onBack?: () => void;
  onPublish?: () => void;
  publishLabel?: string;
  publishDisabled?: boolean;
  children: ReactNode;
  preview?: ReactNode;
};

export function EditorShell({
  title, subtitle, langTabs, saveIndicator,
  onBack, onPublish, publishLabel = '公開', publishDisabled,
  children, preview,
}: Props) {
  return (
    <div className="min-h-screen bg-stone-50">
      <header className="sticky top-0 z-10 border-b border-stone-200 bg-white/90 backdrop-blur">
        <div className="mx-auto max-w-7xl px-6 py-3 flex items-center gap-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-1.5 -ml-1.5 rounded-md hover:bg-stone-100 text-stone-600"
              aria-label="戻る"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-medium text-stone-900 truncate">{title}</h1>
            {subtitle && (
              <p className="text-xs text-stone-500 truncate">{subtitle}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {saveIndicator}
            {langTabs}
            {onPublish && (
              <Button onClick={onPublish} disabled={publishDisabled} size="sm">
                {publishLabel}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-6">
        {preview ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 items-start">
            <div className="space-y-6 min-w-0">{children}</div>
            <aside className="space-y-2 lg:sticky lg:top-[4.5rem] lg:self-start lg:max-h-[calc(100vh-5rem)] lg:overflow-y-auto">
              <h2 className="text-xs font-medium uppercase tracking-wider text-stone-500 px-1">
                プレビュー
              </h2>
              {preview}
            </aside>
          </div>
        ) : (
          <div className="space-y-6">{children}</div>
        )}
      </main>
    </div>
  );
}
