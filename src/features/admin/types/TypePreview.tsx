import { SmartText } from '../shared/SmartText';
import type { Locale, TypeDescription } from '../shared/types';

type Props = {
  data: TypeDescription;
  lang: Locale;
};

export function TypePreview({ data, lang }: Props) {
  return (
    <div className="space-y-3">
      <div className="text-[10px] text-stone-400 px-1">375px (iPhone SE / 標準)</div>

      <div
        className="rounded-2xl bg-[#FAF9F6] shadow-sm border border-stone-200/50 overflow-hidden mx-auto"
        style={{ width: 375 }}
      >
        <div className="px-6 py-8 space-y-6">
          <div className="text-center">
            <p className="text-xs tracking-[0.3em] text-stone-500 mb-2">
              {data.typeCode}
            </p>
            <SmartText
              text={data.tagline[lang] || '(タグライン未入力)'}
              lang={lang}
              className="font-serif text-2xl text-stone-800 leading-tight"
            />
          </div>

          <div className="border-t border-stone-200/60" />

          {data.topics.length === 0 && (
            <p className="text-center text-xs text-stone-400">
              トピック未作成
            </p>
          )}

          {data.topics.map((topic) => {
            const heading = topic.heading[lang];
            const body = topic.body[lang];
            if (!heading && !body) return null;
            return (
              <section key={topic.id} className="space-y-2">
                {heading && (
                  <h3 className="font-serif text-base text-stone-800">
                    {heading}
                  </h3>
                )}
                {body && (
                  <p
                    className="text-[15px] text-stone-700 leading-[1.8] whitespace-pre-line"
                    style={{
                      wordBreak: 'normal',
                      overflowWrap: 'break-word',
                      textWrap: 'pretty',
                    }}
                  >
                    {body}
                  </p>
                )}
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
}
