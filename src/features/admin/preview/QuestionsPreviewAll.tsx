import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, AlertTriangle, Pencil, ChevronLeft } from 'lucide-react';
import { loadAllQuestions } from '../sources/question-source';
import { SmartText } from '../shared/SmartText';
import type { SourceQuestion } from '../shared/source-types';
import type { Locale } from '../shared/types';
import {
  LIMITS,
  ANSWER_CARD_SAFE,
  classifyAnswerLine,
  type AnswerSeverity,
} from '../shared/limits';

function maxLineLength(text: string): number {
  if (!text) return 0;
  return Math.max(...text.split('\n').map((line) => line.length));
}

function severityOfText(text: string, lang: Locale): AnswerSeverity {
  return classifyAnswerLine(maxLineLength(text), lang);
}

function worstSeverity(a: AnswerSeverity, b: AnswerSeverity): AnswerSeverity {
  if (a === 'ng' || b === 'ng') return 'ng';
  if (a === 'warn' || b === 'warn') return 'warn';
  return 'ok';
}

export function QuestionsPreviewAll() {
  const [questions, setQuestions] = useState<SourceQuestion[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [lang, setLang] = useState<Locale>('ja');

  useEffect(() => {
    let cancelled = false;
    loadAllQuestions()
      .then((qs) => { if (!cancelled) setQuestions(qs); })
      .catch((e) => { if (!cancelled) setError(e instanceof Error ? e.message : String(e)); });
    return () => { cancelled = true; };
  }, []);

  if (error) {
    return (
      <div className="p-4 text-sm">
        <p className="font-medium text-red-700 mb-2">読み込みエラー</p>
        <p className="text-stone-600">{error}</p>
      </div>
    );
  }

  if (!questions) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  const counts = questions.reduce(
    (acc, q) => {
      const sa = severityOfText(q.optionA.text[lang], lang);
      const sb = severityOfText(q.optionB.text[lang], lang);
      acc[worstSeverity(sa, sb)]++;
      return acc;
    },
    { ok: 0, warn: 0, ng: 0 } as Record<AnswerSeverity, number>,
  );

  const safe = ANSWER_CARD_SAFE[lang];
  const max  = LIMITS.answerCard[lang];

  return (
    <div className="min-h-screen bg-[#FAF9F6] pb-12">
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur border-b border-stone-200 px-4 py-3">
        <div className="flex items-center justify-between gap-2 mb-2">
          <Link
            to="/admin/questions"
            className="flex items-center gap-0.5 text-xs text-stone-400 hover:text-stone-700"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
            管理画面に戻る
          </Link>
        </div>
        <div className="flex items-center justify-between gap-2">
          <h1 className="text-sm font-medium text-stone-800">
            問題プレビュー
            <span className="ml-2 text-xs text-stone-500">{questions.length}問</span>
            {counts.ng > 0 && (
              <span className="ml-2 text-xs text-red-600 font-medium">NG {counts.ng}問</span>
            )}
            {counts.warn > 0 && (
              <span className="ml-2 text-xs text-amber-600">注意 {counts.warn}問</span>
            )}
          </h1>
          <div className="flex gap-1 rounded-lg border border-stone-200 bg-white p-1">
            {(['ja', 'ko'] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={
                  'px-2 py-0.5 rounded-md text-xs font-medium ' +
                  (lang === l
                    ? 'bg-stone-900 text-white'
                    : 'text-stone-600 hover:bg-stone-100')
                }
              >
                {l === 'ja' ? '日本語' : '한국어'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 凡例 */}
      <div className="px-4 py-2 text-[10px] text-stone-500 border-b border-stone-200/60 bg-white/60">
        <span className="text-red-600 font-medium">NG ({max + 1}字+)</span>
        <span className="mx-2">/</span>
        <span className="text-amber-600">注意 ({safe + 1}–{max}字)</span>
        <span className="mx-2">/</span>
        <span>OK (1–{safe}字)</span>
        <span className="ml-2 text-stone-400">※ iPhone 14 (390px) 基準。SE 対応は注意も修正</span>
      </div>

      <div className="space-y-6 px-3 pt-4">
        {questions.map((q) => {
          const a = q.optionA.text[lang];
          const b = q.optionB.text[lang];
          const aSev = severityOfText(a, lang);
          const bSev = severityOfText(b, lang);
          const cardSeverity = worstSeverity(aSev, bSev);
          const aLineMax = maxLineLength(a);
          const bLineMax = maxLineLength(b);

          const cardClass =
            cardSeverity === 'ng'   ? 'border-red-300 ring-1 ring-red-100' :
            cardSeverity === 'warn' ? 'border-amber-300 ring-1 ring-amber-100' :
            'border-stone-200';

          return (
            <article
              key={q.id}
              className={'rounded-xl border bg-white px-3 py-3 ' + cardClass}
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-1.5 text-[10px] text-stone-500 font-mono">
                  <span className="font-medium text-stone-700">{q.id}</span>
                  <span className="px-1 py-0.5 rounded bg-stone-100">{q.axis}</span>
                  <span className="px-1 py-0.5 rounded bg-stone-100">{q.format}</span>
                  {cardSeverity === 'ng' && (
                    <span className="flex items-center gap-0.5 text-red-600 ml-1 font-medium">
                      <AlertTriangle className="h-3 w-3" />
                      NG
                    </span>
                  )}
                  {cardSeverity === 'warn' && (
                    <span className="flex items-center gap-0.5 text-amber-600 ml-1">
                      <AlertTriangle className="h-3 w-3" />
                      注意
                    </span>
                  )}
                </div>
                <Link
                  to={`/admin/questions/${q.id}`}
                  className="text-stone-400 hover:text-stone-700"
                  aria-label={`${q.id} を編集`}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Link>
              </div>

              <p className="font-serif text-base text-stone-800 leading-[1.6] mb-3 whitespace-pre-line text-center">
                「{q.content[lang] || '(未入力)'}」
              </p>

              <div className="grid grid-cols-2 gap-2">
                <OptionCard text={a} lang={lang} dir="left" severity={aSev} />
                <OptionCard text={b} lang={lang} dir="right" severity={bSev} />
              </div>

              <div className="mt-2 flex justify-between text-[10px] font-mono">
                <span className={
                  aSev === 'ng'   ? 'text-red-600 font-medium' :
                  aSev === 'warn' ? 'text-amber-600' :
                  'text-stone-400'
                }>
                  A: {aLineMax}/{max}
                  {a.includes('\n') && (
                    <span className="ml-1 text-stone-400">(改行込: {a.length})</span>
                  )}
                </span>
                <span className={
                  bSev === 'ng'   ? 'text-red-600 font-medium' :
                  bSev === 'warn' ? 'text-amber-600' :
                  'text-stone-400'
                }>
                  B: {bLineMax}/{max}
                  {b.includes('\n') && (
                    <span className="ml-1 text-stone-400">(改行込: {b.length})</span>
                  )}
                </span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

function OptionCard({
  text, lang, dir, severity,
}: {
  text: string;
  lang: Locale;
  dir: 'left' | 'right';
  severity: AnswerSeverity;
}) {
  const alignClass = dir === 'left' ? 'text-left' : 'text-right';
  const borderClass =
    severity === 'ng'   ? 'border-red-300' :
    severity === 'warn' ? 'border-amber-300' :
    'border-stone-200/70';

  return (
    <div
      className={
        'rounded-xl border bg-white/60 px-3 py-3 min-h-[100px] flex flex-col justify-between ' +
        alignClass + ' ' +
        borderClass
      }
    >
      <div className="text-[14px] leading-[1.6] text-stone-700 whitespace-pre-line">
        {text ? (
          <SmartText text={text} lang={lang} />
        ) : (
          <span className="text-stone-300">(未入力)</span>
        )}
      </div>
      <div className="text-stone-300 text-base">
        {dir === 'left' ? '←' : '→'}
      </div>
    </div>
  );
}
