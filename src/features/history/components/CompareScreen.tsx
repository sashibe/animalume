import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Helmet } from 'react-helmet-async';
import { CharacterImage } from '@/components/character/CharacterImage';
import { getTypeMeta } from '@/data/types';
import { useComparison } from '../hooks/useHistory';
import type { QuestionLocale } from '@/data/questions/types';
import type { Axis } from '@/features/diagnosis/logic/types';

function formatDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}.${m}.${day}`;
}

// Phase 3.1 で実装予定:
// const interpretations = {
//   EI: { I_to_E: "...", E_to_I: "..." },
//   SN: { S_to_N: "...", N_to_S: "..." },
//   TF: { T_to_F: "...", F_to_T: "..." },
//   JP: { J_to_P: "...", P_to_J: "..." },
// };
// 軸の変化方向 × 強度（±20%以上 / 以下）で出し分け

type AxisBarProps = {
  axis: Axis;
  previousScore: number;
  currentScore: number;
  labelPrevious: string;
  labelCurrent: string;
};

function AxisBar({ axis, previousScore, currentScore, labelPrevious, labelCurrent }: AxisBarProps) {
  const labels: Record<Axis, { left: string; right: string }> = {
    EI: { left: 'I', right: 'E' },
    SN: { left: 'S', right: 'N' },
    TF: { left: 'T', right: 'F' },
    JP: { left: 'J', right: 'P' },
  };

  // -100〜+100 を 0〜100% に変換
  const previousPos = (previousScore + 100) / 2;
  const currentPos = (currentScore + 100) / 2;

  const prevLabel = previousScore >= 0 ? labels[axis].right : labels[axis].left;
  const currLabel = currentScore >= 0 ? labels[axis].right : labels[axis].left;

  return (
    <div className="mb-8">
      {/* 軸ラベル */}
      <div className="flex justify-between text-xs text-ink-mute mb-2">
        <span>{labels[axis].left}</span>
        <span>{labels[axis].right}</span>
      </div>

      {/* スペクトルバー */}
      <div className="relative h-1 bg-border-subtle rounded-full">
        {/* 5%以上の変化がある時だけ移動線を引く（ノイズ抑制） */}
        {Math.abs(previousPos - currentPos) > 5 && (
          <div
            className="absolute top-1/2 h-px bg-ink-mute/40"
            style={{
              left: `${Math.min(previousPos, currentPos)}%`,
              width: `${Math.abs(currentPos - previousPos)}%`,
              transform: 'translateY(-50%)',
            }}
          />
        )}

        {/* 過去のドット（控えめ） */}
        <div
          className="absolute w-3 h-3 rounded-full bg-ink-mute"
          style={{ left: `${previousPos}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
          aria-label={`${labelPrevious}: ${prevLabel} ${Math.abs(previousScore)}%`}
        />

        {/* 現在のドット（大きめ＋リング、主役） */}
        <div
          className="absolute w-4 h-4 rounded-full bg-ink ring-2 ring-bg"
          style={{ left: `${currentPos}%`, top: '50%', transform: 'translate(-50%, -50%)' }}
          aria-label={`${labelCurrent}: ${currLabel} ${Math.abs(currentScore)}%`}
        />
      </div>

      {/* 数値（控えめ） */}
      <div className="flex justify-between text-xs text-ink-mute mt-2 tabular-nums">
        <span>{labelPrevious} {prevLabel} {Math.abs(previousScore)}%</span>
        <span>{labelCurrent} {currLabel} {Math.abs(currentScore)}%</span>
      </div>
    </div>
  );
}

export function CompareScreen() {
  const { t, i18n } = useTranslation();
  const locale = (i18n.language.startsWith('ko') ? 'ko' : 'ja') as QuestionLocale;
  const { current, previous, loading } = useComparison();

  if (loading) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-3">
        <p className="text-[11px] tracking-[0.32em] text-ink-mute uppercase">
          — LOADING —
        </p>
        <p className="text-sm text-ink-mute">{t('common.loading')}</p>
      </div>
    );
  }

  if (!current || !previous) {
    return (
      <div className="min-h-full flex flex-col items-center justify-center gap-4 p-8 text-center">
        <p className="font-serif text-xl text-ink-mute">
          {t('compare.need_two_readings')}
        </p>
        <Link
          to="/history"
          className="px-6 py-3 rounded-full border border-border text-ink text-sm hover:bg-bg-subtle transition"
        >
          {t('compare.cta_view_all')}
        </Link>
      </div>
    );
  }

  const currentMeta = getTypeMeta(current.type, locale);
  const previousMeta = getTypeMeta(previous.type, locale);
  const typeChanged = previous.type !== current.type;
  const labelPrevious = t('compare.axis_previous');
  const labelCurrent = t('compare.axis_current');

  return (
    <>
      <Helmet>
        <title>{t('compare.title')} | Animalume</title>
      </Helmet>

      <main className="min-h-full safe-top safe-bottom flex flex-col">
        <div className="container-app flex-1 flex flex-col py-8 animate-slide-up">

          {/* ── セクション：見出し ── */}
          <header className="text-center mb-12 pt-2">
            <p className="text-[11px] tracking-[0.32em] text-ink-mute uppercase mb-2">
              {t('compare.section_label')}
            </p>
            <h1 className="font-serif text-3xl text-ink">{t('compare.title')}</h1>
            <p className="text-sm text-ink-mute mt-2">
              {formatDate(previous.takenAt)} → {formatDate(current.takenAt)}
            </p>
          </header>

          {/* ── セクション1：言葉（最重要・最初に目に入る位置） ── */}
          <section className="mb-16">
            <p className="text-[11px] tracking-[0.32em] text-ink-mute text-center mb-6 uppercase">
              {t('compare.reading_label')}
            </p>
            <div className="px-4 space-y-4">
              {typeChanged ? (
                <>
                  <p className="font-serif text-xl text-ink leading-relaxed whitespace-pre-line">
                    {t('compare.type_changed', { prev: previous.type, curr: current.type })}
                  </p>
                  <p className="text-base text-ink-mute leading-[1.85] whitespace-pre-line">
                    {/* TODO Phase 3.1: 軸ごとの定型文を出し分け */}
                    {t('compare.type_changed_subtext')}
                  </p>
                </>
              ) : (
                <>
                  <p className="font-serif text-xl text-ink leading-relaxed whitespace-pre-line">
                    {t('compare.type_unchanged', { type: current.type })}
                  </p>
                  <p className="text-base text-ink-mute leading-[1.85] whitespace-pre-line">
                    {/* TODO Phase 3.1: 4軸内での微細な変化を解説 */}
                    {t('compare.type_unchanged_subtext')}
                  </p>
                </>
              )}
            </div>
          </section>

          {/* ── ページブレイク ── */}
          <div aria-hidden className="my-2 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* ── セクション2：キャラの並び（左：過去 / 右：現在） ── */}
          <section className="mb-16 mt-12">
            <div className="grid grid-cols-2 gap-4 px-2">
              {/* 左：過去 */}
              <div className="text-center">
                <p className="text-xs text-ink-mute mb-2 tabular-nums">
                  {formatDate(previous.takenAt)}
                </p>
                <CharacterImage
                  type={previous.type}
                  confidence={previous.confidence}
                  locale={locale}
                  className="w-full rounded-2xl"
                />
                <p className="font-serif text-xl mt-3">{previous.type}</p>
                <p className="text-xs text-ink-mute mt-1">
                  — {previousMeta.nameJa} —
                </p>
              </div>

              {/* 右：現在 */}
              <div className="text-center">
                <p className="text-xs text-ink-mute mb-2 tabular-nums">
                  {formatDate(current.takenAt)}
                </p>
                <CharacterImage
                  type={current.type}
                  confidence={current.confidence}
                  locale={locale}
                  className="w-full rounded-2xl"
                />
                <p className="font-serif text-xl mt-3">{current.type}</p>
                <p className="text-xs text-ink-mute mt-1">
                  — {currentMeta.nameJa} —
                </p>
              </div>
            </div>
          </section>

          {/* ── セクション3：4軸グラフ（横棒の重ね合わせ） ── */}
          <section className="mb-16 px-2">
            <p className="text-[11px] tracking-[0.32em] text-ink-mute text-center mb-8 uppercase">
              {t('compare.spectrum_label')}
            </p>
            {(['EI', 'SN', 'TF', 'JP'] as const).map((axis) => (
              <AxisBar
                key={axis}
                axis={axis}
                previousScore={previous.scores[axis]}
                currentScore={current.scores[axis]}
                labelPrevious={labelPrevious}
                labelCurrent={labelCurrent}
              />
            ))}
          </section>

          {/* ── セクション4：CTA ── */}
          <div className="text-center mt-4 pb-8 flex flex-col gap-4">
            <Link
              to="/diagnosis"
              className="block py-3.5 rounded-full bg-ink text-bg text-sm font-medium hover:opacity-90 transition"
            >
              {t('compare.cta_retake')}
            </Link>
            <Link
              to="/history"
              className="text-sm text-ink-mute hover:text-ink transition"
            >
              {t('compare.cta_view_all')}
            </Link>
          </div>

        </div>
      </main>
    </>
  );
}
