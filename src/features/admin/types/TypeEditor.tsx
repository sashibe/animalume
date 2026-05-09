import { useEffect, useState } from 'react';
import type { Locale, TypeCode, TypeDescription } from '../shared/types';
import { useAutoDraft, loadDraftOrFallback } from '../editor/useAutoDraft';
import { LangTabs } from '../editor/LangTabs';
import { LocalizedField } from '../editor/LocalizedField';
import { EditorShell } from '../editor/EditorShell';
import { SaveIndicator } from '../editor/SaveIndicator';
import { TopicList } from './TopicList';
import { TypePreview } from './TypePreview';
import { usePublish } from '../publish/usePublish';
import { PublishDialog } from '../publish/PublishDialog';
import { db } from '@/lib/firebase';
import { useAuth } from '@/lib/auth';

const empty = (typeCode: TypeCode): TypeDescription => ({
  typeCode,
  tagline: { ja: '', ko: '' },
  topics: [],
});

type Props = {
  typeCode: TypeCode;
  onBack?: () => void;
};

export function TypeEditor({ typeCode, onBack }: Props) {
  const { user } = useAuth();
  const [data, setData] = useState<TypeDescription>(empty(typeCode));
  const [lang, setLang] = useState<Locale>('ja');
  const [loaded, setLoaded] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'idle'>('idle');

  useEffect(() => {
    loadDraftOrFallback('type', typeCode, empty(typeCode)).then((d) => {
      setData(d);
      setLoaded(true);
    });
  }, [typeCode]);

  useAutoDraft('type', typeCode, data, {
    enabled: loaded,
    onSaved: () => {
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 2000);
    },
  });

  const pub = usePublish<TypeDescription>({
    db,
    userId: user?.uid ?? 'anonymous',
    contentType: 'type',
    contentId: typeCode,
  });

  const missing = {
    ja:
      !data.tagline.ja.trim() ||
      data.topics.some((t) => !t.heading.ja.trim() || !t.body.ja.trim()),
    ko:
      !data.tagline.ko.trim() ||
      data.topics.some((t) => !t.heading.ko.trim() || !t.body.ko.trim()),
  };

  const canPublish = !missing.ja && !missing.ko && data.topics.length > 0;

  return (
    <>
      <EditorShell
        title={`${typeCode} - タイプ説明`}
        subtitle={`${data.topics.length}個のトピック`}
        onBack={onBack}
        saveIndicator={<SaveIndicator status={saveStatus} />}
        langTabs={<LangTabs value={lang} onChange={setLang} missing={missing} />}
        onPublish={() => pub.open(data)}
        publishDisabled={!canPublish}
        preview={<TypePreview data={data} lang={lang} />}
      >
        {!loaded ? (
          <div className="text-sm text-stone-400">読み込み中…</div>
        ) : (
          <>
            <section className="space-y-3">
              <h2 className="text-sm font-medium text-stone-700">タグライン</h2>
              <div className="rounded-lg border border-stone-200 bg-white p-4">
                <LocalizedField
                  label="タグライン"
                  value={data.tagline}
                  onChange={(tagline) => {
                    setSaveStatus('saving');
                    setData({ ...data, tagline });
                  }}
                  lang={lang}
                  kind="tagline"
                  hint="タイプを一言で表すキャッチコピー（例：未来の地図を描く者）"
                />
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-sm font-medium text-stone-700">トピック</h2>
              <TopicList
                topics={data.topics}
                lang={lang}
                onChange={(topics) => {
                  setSaveStatus('saving');
                  setData({ ...data, topics });
                }}
              />
            </section>
          </>
        )}
      </EditorShell>

      <PublishDialog
        open={pub.dialogOpen}
        contentLabel={`${typeCode} - タイプ説明`}
        draft={pub.draft as TypeDescription}
        fetchPublished={pub.fetchPublished}
        onPublish={pub.publish}
        onClose={pub.close}
      />
    </>
  );
}
