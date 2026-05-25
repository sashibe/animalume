import { useEffect, useState, useMemo } from 'react';
import { Loader2 } from 'lucide-react';
import { LangTabs } from '../editor/LangTabs';
import { LocalizedField } from '../editor/LocalizedField';
import { EditorShell } from '../editor/EditorShell';
import { SourceSaveIndicator } from '../editor/SaveIndicator';
import { TypePreview } from './TypePreview';
import { StrengthsList } from './StrengthsList';
import { loadAllTypeMetas, saveAllTypeMetas } from '../sources/type-source';
import { useSourceSave } from '../sources/use-source-save';
import type { Locale } from '../shared/types';
import type { SourceTypeMeta, MbtiType } from '../shared/source-types';

type Props = {
  typeCode: MbtiType;
  onBack?: () => void;
};

export function TypeEditor({ typeCode, onBack }: Props) {
  const [allMetas, setAllMetas] = useState<SourceTypeMeta[] | null>(null);
  const [lang, setLang] = useState<Locale>('ja');
  const [error, setError] = useState<string | null>(null);
  const { state: saveState, save } = useSourceSave();

  useEffect(() => {
    let cancelled = false;
    loadAllTypeMetas()
      .then((metas) => {
        if (!cancelled) setAllMetas(metas);
      })
      .catch((e) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      });
    return () => { cancelled = true; };
  }, []);

  const currentMeta = useMemo(() => {
    return allMetas?.find((m) => m.code === typeCode) ?? null;
  }, [allMetas, typeCode]);

  const updateCurrent = (patch: Partial<SourceTypeMeta>) => {
    if (!allMetas || !currentMeta) return;
    const next = allMetas.map((m) =>
      m.code === typeCode ? { ...m, ...patch } : m,
    );
    setAllMetas(next);
  };

  const handleSave = () => {
    if (!allMetas) return;
    save(() => saveAllTypeMetas(allMetas));
  };

  const missing = useMemo(() => {
    if (!currentMeta) return { ja: false, ko: false };
    const fields = [
      currentMeta.name,
      currentMeta.group,
      currentMeta.tagline,
      currentMeta.essence,
      currentMeta.relationshipNote,
      ...currentMeta.strengths,
    ];
    return {
      ja: fields.some((f) => !f.ja.trim()),
      ko: fields.some((f) => !f.ko.trim()),
    };
  }, [currentMeta]);

  if (error) {
    return (
      <div className="p-8 max-w-md text-sm">
        <p className="font-medium text-red-700 mb-2">読み込みエラー</p>
        <p className="text-stone-600">{error}</p>
      </div>
    );
  }

  if (!allMetas || !currentMeta) {
    return (
      <div className="min-h-screen flex items-center justify-center text-sm text-stone-500">
        <Loader2 className="h-4 w-4 animate-spin mr-2" />
        読み込み中…
      </div>
    );
  }

  return (
    <EditorShell
      title={`${typeCode} - ${currentMeta.name[lang] || '(未入力)'}`}
      subtitle={currentMeta.group[lang]}
      onBack={onBack}
      saveIndicator={<SourceSaveIndicator state={saveState} />}
      langTabs={<LangTabs value={lang} onChange={setLang} missing={missing} />}
      onPublish={handleSave}
      publishLabel={saveState.status === 'saving' ? '保存中…' : '保存'}
      publishDisabled={saveState.status === 'saving'}
      preview={<TypePreview meta={currentMeta} lang={lang} />}
    >
      <section className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700">基本情報</h2>
        <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-4">
          <LocalizedField
            label="タイプ名"
            value={currentMeta.name}
            onChange={(name) => updateCurrent({ name })}
            lang={lang}
            kind="typeHeading"
            hint="例：建築家、論理学者"
          />
          <LocalizedField
            label="グループ名"
            value={currentMeta.group}
            onChange={(group) => updateCurrent({ group })}
            lang={lang}
            kind="typeHeading"
            hint="例：光の探究者たち"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700">本質メッセージ</h2>
        <div className="rounded-lg border border-stone-200 bg-white p-4 space-y-4">
          <LocalizedField
            label="タグライン"
            value={currentMeta.tagline}
            onChange={(tagline) => updateCurrent({ tagline })}
            lang={lang}
            kind="tagline"
            hint="タイプを一言で表すキャッチコピー"
          />
          <LocalizedField
            label="エッセンス"
            value={currentMeta.essence}
            onChange={(essence) => updateCurrent({ essence })}
            lang={lang}
            kind="typeEssence"
            hint="タイプの本質を 1 文で要約（40文字程度）"
          />
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700">強み</h2>
        <StrengthsList
          items={currentMeta.strengths}
          lang={lang}
          onChange={(strengths) => updateCurrent({ strengths })}
        />
      </section>

      <section className="space-y-3">
        <h2 className="text-sm font-medium text-stone-700">関係性ノート</h2>
        <div className="rounded-lg border border-stone-200 bg-white p-4">
          <LocalizedField
            label="関係性での傾向"
            value={currentMeta.relationshipNote}
            onChange={(relationshipNote) => updateCurrent({ relationshipNote })}
            lang={lang}
            kind="typeBody"
            multiline
            rows={6}
            hint="他者との関わり方の説明（長文）"
          />
        </div>
      </section>
    </EditorShell>
  );
}
