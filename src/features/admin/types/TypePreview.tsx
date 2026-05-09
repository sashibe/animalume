import { SmartText } from '../shared/SmartText';
import type { Locale } from '../shared/types';
import type { SourceTypeMeta } from '../shared/source-types';

type Props = {
  meta: SourceTypeMeta;
  lang: Locale;
};

export function TypePreview({ meta, lang }: Props) {
  return (
    <div className="space-y-3">
      <div className="text-[10px] text-stone-400 px-1">375px (iPhone SE / 標準)</div>

      <div
        className="rounded-2xl bg-[#FAF9F6] shadow-sm border border-stone-200/50 overflow-hidden mx-auto"
        style={{ width: 375 }}
      >
        <div className="px-6 py-8 space-y-6">
          <div className="text-center">
            <p className="text-xs tracking-[0.3em] text-stone-500 mb-1">
              {meta.code}
            </p>
            <p className="text-xs text-stone-400 mb-3">
              {meta.group[lang] || '—'}
            </p>
            <SmartText
              text={meta.name[lang] || '(タイプ名未入力)'}
              lang={lang}
              className="font-serif text-2xl text-stone-800 leading-tight block mb-2"
            />
            <SmartText
              text={meta.tagline[lang] || '(タグライン未入力)'}
              lang={lang}
              className="text-sm text-stone-600 leading-relaxed"
            />
          </div>

          <div className="border-t border-stone-200/60" />

          {meta.essence[lang] && (
            <p className="text-[15px] text-stone-700 leading-[1.8] text-center">
              {meta.essence[lang]}
            </p>
          )}

          {meta.strengths.length > 0 && (
            <section className="space-y-2">
              <h3 className="font-serif text-base text-stone-800">あなたの強み</h3>
              <ul className="space-y-2">
                {meta.strengths.map((s, i) => {
                  const text = s[lang];
                  if (!text) return null;
                  return (
                    <li
                      key={i}
                      className="text-[15px] text-stone-700 leading-[1.8]"
                      style={{
                        wordBreak: 'normal',
                        overflowWrap: 'break-word',
                        textWrap: 'pretty',
                      }}
                    >
                      ・{text}
                    </li>
                  );
                })}
              </ul>
            </section>
          )}

          {meta.relationshipNote[lang] && (
            <section className="space-y-2">
              <h3 className="font-serif text-base text-stone-800">関係性</h3>
              <p
                className="text-[15px] text-stone-700 leading-[1.8] whitespace-pre-line"
                style={{
                  wordBreak: 'normal',
                  overflowWrap: 'break-word',
                  textWrap: 'pretty',
                }}
              >
                {meta.relationshipNote[lang]}
              </p>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
