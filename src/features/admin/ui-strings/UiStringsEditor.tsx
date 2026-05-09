import { useEffect, useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import type { Locale, UiStrings } from '../shared/types';
import { useAutoDraft, loadDraftOrFallback } from '../editor/useAutoDraft';
import { LangTabs } from '../editor/LangTabs';
import { EditorShell } from '../editor/EditorShell';
import { SaveIndicator } from '../editor/SaveIndicator';
import { StringTree } from './StringTree';
import { JsonImportExport } from './JsonImportExport';
import { flatten } from './string-helpers';
import { usePublish } from '../publish/usePublish';
import { PublishDialog } from '../publish/PublishDialog';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

type FilterMode = 'all' | 'missing' | 'lang-missing';

type Props = {
  initial?: UiStrings;
  onBack?: () => void;
};

const CONTENT_ID = 'main';
const EMPTY_INITIAL: UiStrings = {};

export function UiStringsEditor({ initial, onBack }: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<UiStrings>(() => initial ?? EMPTY_INITIAL);
  const [lang, setLang] = useState<Locale>('ja');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<FilterMode>('all');
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  useEffect(() => {
    loadDraftOrFallback('ui-strings', CONTENT_ID, initial ?? EMPTY_INITIAL).then((d) => {
      setData(d);
      setLoaded(true);
    });
    // 初回マウント時のみ実行する。initial の参照変化で再実行させない。
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useAutoDraft('ui-strings', CONTENT_ID, data, {
    enabled: loaded,
    onSaved: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  const pub = usePublish<UiStrings>({
    db,
    userId: user?.uid ?? 'anonymous',
    contentType: 'ui-strings',
    contentId: CONTENT_ID,
  });

  const stats = useMemo(() => {
    const all = flatten(data);
    const missingJa = all.filter((e) => !e.value.ja.trim()).length;
    const missingKo = all.filter((e) => !e.value.ko.trim()).length;
    return { total: all.length, missingJa, missingKo };
  }, [data]);

  const missing = {
    ja: stats.missingJa > 0,
    ko: stats.missingKo > 0,
  };

  const canPublish = !missing.ja && !missing.ko && stats.total > 0;

  const handleChange = (next: UiStrings) => {
    setSaveStatus('saving');
    setData(next);
  };

  return (
    <>
      <EditorShell
        title="UI文言"
        subtitle={`${stats.total}キー / 未入力 ja:${stats.missingJa} ko:${stats.missingKo}`}
        onBack={onBack}
        saveIndicator={<SaveIndicator status={saveStatus} />}
        langTabs={<LangTabs value={lang} onChange={setLang} missing={missing} />}
        onPublish={() => pub.open(data)}
        publishDisabled={!canPublish}
      >
        {!loaded ? (
          <div className="text-sm text-stone-400">読み込み中…</div>
        ) : (
          <>
            <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400 pointer-events-none" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="キー名・値で検索（例: result.share）"
                  className="pl-9"
                />
              </div>

              <div className="flex gap-1 rounded-lg border border-stone-200 bg-white p-1">
                <FilterButton active={filter === 'all'} onClick={() => setFilter('all')}>
                  全て
                </FilterButton>
                <FilterButton active={filter === 'missing'} onClick={() => setFilter('missing')}>
                  未入力
                </FilterButton>
                <FilterButton active={filter === 'lang-missing'} onClick={() => setFilter('lang-missing')}>
                  {lang === 'ja' ? '日本語' : '韓国語'}が未入力
                </FilterButton>
              </div>

              <JsonImportExport strings={data} onImport={handleChange} />
            </div>

            {stats.total > 0 && (
              <div className="flex gap-4 text-xs text-stone-500">
                <span>
                  日本語 完了率: <span className="font-mono text-stone-700">
                    {Math.round(((stats.total - stats.missingJa) / stats.total) * 100)}%
                  </span>
                </span>
                <span>
                  韓国語 完了率: <span className="font-mono text-stone-700">
                    {Math.round(((stats.total - stats.missingKo) / stats.total) * 100)}%
                  </span>
                </span>
              </div>
            )}

            <StringTree
              strings={data}
              onChange={handleChange}
              lang={lang}
              query={query}
              filter={filter}
            />

            {stats.total === 0 && (
              <div className="text-center py-12 text-sm text-stone-500 border border-dashed border-stone-200 rounded-lg">
                <p className="mb-3">UI文言がまだ登録されていません</p>
                <p className="text-xs text-stone-400">
                  右上の「インポート」から既存の <code>ja.json</code> / <code>ko.json</code> を取り込んでください
                </p>
              </div>
            )}
          </>
        )}
      </EditorShell>

      <PublishDialog
        open={pub.dialogOpen}
        contentLabel="UI文言"
        draft={pub.draft as UiStrings}
        fetchPublished={pub.fetchPublished}
        onPublish={pub.publish}
        onClose={pub.close}
      />
    </>
  );
}

function FilterButton({
  active, onClick, children,
}: {
  active: boolean; onClick: () => void; children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'px-3 py-1.5 rounded-md text-xs transition whitespace-nowrap',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-stone-400',
        active
          ? 'bg-stone-900 text-white'
          : 'text-stone-600 hover:bg-stone-100',
      )}
    >
      {children}
    </button>
  );
}
