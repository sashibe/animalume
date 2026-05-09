import { SmartText } from '../shared/SmartText';
import type { Locale } from '../shared/types';
import type { SourceQuestion } from '../shared/source-types';

type Props = {
  question: SourceQuestion;
  lang: Locale;
  index?: number;
  total?: number;
};

export function QuestionPreview({ question, lang, index = 1, total = 40 }: Props) {
  const content = question.content[lang];
  const a = question.optionA.text[lang];
  const b = question.optionB.text[lang];
  const percent = Math.round((index / total) * 100);

  return (
    <div className="space-y-3">
      <div className="text-[10px] text-stone-400 px-1">375px (実機相当)</div>

      <div
        className="rounded-2xl bg-[#FAF9F6] border border-stone-200/50 overflow-hidden mx-auto"
        style={{ width: 375 }}
      >
        <div className="px-6 pt-6 pb-2">
          <div className="h-0.5 bg-stone-200 rounded-full overflow-hidden">
            <div className="h-full bg-stone-700" style={{ width: `${percent}%` }} />
          </div>
          <div className="flex justify-between text-[11px] text-stone-500 mt-1.5 font-mono">
            <span>{index} / {total}</span>
            <span>{percent}%</span>
          </div>
        </div>

        <div className="px-6 pt-12 pb-10">
          <div className="rounded-xl border border-stone-200/70 bg-white/60 px-5 py-8 space-y-8">
            <div className="text-center">
              <div className="text-[11px] tracking-[0.2em] text-stone-400 mb-4">
                {question.id.toUpperCase()}
              </div>
              <h2 className="font-serif text-[22px] leading-[1.5] text-stone-800 whitespace-pre-line">
                {content ? `「${content}」` : <span className="text-stone-300">（問題文未入力）</span>}
              </h2>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <OptionCard text={a} lang={lang} dir="left" />
              <OptionCard text={b} lang={lang} dir="right" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function OptionCard({ text, lang, dir }: { text: string; lang: Locale; dir: 'left' | 'right' }) {
  return (
    <div className="rounded-xl border border-stone-200/70 bg-white/60 px-3.5 py-4 min-h-[120px] flex flex-col justify-between">
      <div className="text-[14px] leading-[1.6] text-stone-700">
        {text ? (
          <SmartText text={text} lang={lang} />
        ) : (
          <span className="text-stone-300">（未入力）</span>
        )}
      </div>
      <div className={`text-stone-300 text-base ${dir === 'left' ? 'text-left' : 'text-right'}`}>
        {dir === 'left' ? '←' : '→'}
      </div>
    </div>
  );
}
