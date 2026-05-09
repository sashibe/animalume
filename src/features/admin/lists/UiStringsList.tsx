import { useNavigate } from 'react-router-dom';
import { ChevronRight, Loader2 } from 'lucide-react';
import { ProgressBadge } from './shared-list/ProgressBadge';
import { DraftIndicator } from './shared-list/DraftIndicator';
import { useUiStringsStatus } from './shared-list/useContentStatus';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

export function UiStringsList() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { status, loading } = useUiStringsStatus(db, user?.uid ?? 'anonymous');

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-serif text-stone-900">UI文言</h1>
        <p className="text-sm text-stone-500 mt-1">
          ボタンラベル、メッセージ、エラー文言など
        </p>
      </header>

      {loading && (
        <div className="flex items-center justify-center py-12 text-sm text-stone-500">
          <Loader2 className="h-4 w-4 animate-spin mr-2" />
          読み込み中…
        </div>
      )}

      {!loading && status && (
        <button
          type="button"
          onClick={() => navigate('/admin/ui-strings/edit')}
          className="w-full text-left rounded-lg border border-stone-200 bg-white p-5 hover:border-stone-400 hover:shadow-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400 group"
        >
          <div className="flex items-center justify-between mb-3">
            <div>
              <h2 className="font-medium text-stone-900">アプリ全体の文言</h2>
              <p className="text-xs text-stone-500 mt-0.5">
                {status.hasPublished ? '公開済み' : '未公開'}
              </p>
            </div>
            <ChevronRight className="h-4 w-4 text-stone-300 group-hover:text-stone-500 transition" />
          </div>
          <div className="flex items-center gap-2">
            <ProgressBadge lang="ja" progress={status.progress.ja} />
            <ProgressBadge lang="ko" progress={status.progress.ko} />
            <DraftIndicator hasDraft={status.hasDraft} className="ml-auto" />
          </div>
        </button>
      )}
    </div>
  );
}
