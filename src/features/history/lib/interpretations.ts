// Re-export Axis so CompareScreen can import types from a single location
export type { Axis } from '@/features/diagnosis/logic/types';
import type { Axis, MbtiType } from '@/features/diagnosis/logic/types';

// ─── 型定義 ─────────────────────────────────────────────────────────────────

export type ChangeStrength = 'none' | 'small' | 'medium' | 'large' | 'flip';

export type AxisDirection =
  | 'toward_E'
  | 'toward_I'
  | 'toward_N'
  | 'toward_S'
  | 'toward_F'
  | 'toward_T'
  | 'toward_P'
  | 'toward_J';

export type Group = 'NT' | 'NF' | 'SJ' | 'SP';

export interface AxisChange {
  direction: AxisDirection;
  strength: ChangeStrength;
}

// ─── タイプ→グループ対応表 ───────────────────────────────────────────────────

export const TYPE_TO_GROUP: Record<MbtiType, Group> = {
  INTJ: 'NT', INTP: 'NT', ENTJ: 'NT', ENTP: 'NT',
  INFJ: 'NF', INFP: 'NF', ENFJ: 'NF', ENFP: 'NF',
  ISTJ: 'SJ', ISFJ: 'SJ', ESTJ: 'SJ', ESFJ: 'SJ',
  ISTP: 'SP', ISFP: 'SP', ESTP: 'SP', ESFP: 'SP',
};

// ─── 軸変化の解析 ────────────────────────────────────────────────────────────

function positiveDirectionOf(axis: Axis): AxisDirection {
  switch (axis) {
    case 'EI': return 'toward_E';
    case 'SN': return 'toward_N';
    case 'TF': return 'toward_F';
    case 'JP': return 'toward_P';
  }
}

function negativeDirectionOf(axis: Axis): AxisDirection {
  switch (axis) {
    case 'EI': return 'toward_I';
    case 'SN': return 'toward_S';
    case 'TF': return 'toward_T';
    case 'JP': return 'toward_J';
  }
}

/**
 * スコア差から変化方向と強度を返す。
 *
 * 強度しきい値:
 *   none  ≤ 5点差  — 診断誤差とみなす（指示書の「変化量5以下」定義に準拠）
 *   flip           — 符号逆転（MBTIの軸をまたいだ変化）
 *   small ≤ 20点差 — 微細な変化
 *   medium ≤ 50点差 — 中程度の変化
 *   large > 50点差  — 大きな変化
 */
export function analyzeAxisChange(
  axis: Axis,
  previousScore: number,
  currentScore: number,
): AxisChange {
  const diff = currentScore - previousScore;
  const absDiff = Math.abs(diff);
  const direction: AxisDirection =
    diff >= 0 ? positiveDirectionOf(axis) : negativeDirectionOf(axis);

  if (absDiff <= 5) return { direction, strength: 'none' };

  // 符号逆転 = MBTI の軸をまたいだ（タイプ文字が変わった）場合のみ flip
  const flipped =
    (previousScore < 0 && currentScore > 0) ||
    (previousScore > 0 && currentScore < 0);
  if (flipped) return { direction, strength: 'flip' };

  if (absDiff <= 20) return { direction, strength: 'small' };
  if (absDiff <= 50) return { direction, strength: 'medium' };
  return { direction, strength: 'large' };
}

// ─── 軸別変化テキスト（32パターン: 4軸 × 2方向 × 4強度） ──────────────────

interface AxisInterpretationEntry {
  axis: Axis;
  direction: AxisDirection;
  strength: Exclude<ChangeStrength, 'none'>;
  text: string;
}

const AXIS_INTERPRETATIONS: AxisInterpretationEntry[] = [
  // ── EI 軸 ──────────────────────────────────────────────────────────────────
  {
    axis: 'EI', direction: 'toward_E', strength: 'small',
    text: '外の世界への開き方が、少しだけ変化しています。\n人との接点に、以前より自然な流れが生まれてきているのかもしれません。',
  },
  {
    axis: 'EI', direction: 'toward_E', strength: 'medium',
    text: '外向きのエネルギーが増してきています。\n人や出来事の中に、自分を見出そうとする動きが見えます。',
  },
  {
    axis: 'EI', direction: 'toward_E', strength: 'large',
    text: 'Eの傾向が大きく前面に出てきています。\n環境や人との関わりが、あなたの新しい側面を引き出したのでしょう。',
  },
  {
    axis: 'EI', direction: 'toward_E', strength: 'flip',
    text: 'IからEへ、軸を越えました。\n内省型から外向型へ——環境の変化や、意識的な行動の変化が反映されているのかもしれません。',
  },
  {
    axis: 'EI', direction: 'toward_I', strength: 'small',
    text: '内向きへのわずかなシフトが見えます。\n自分のペースや、一人でいる時間を大切にする気持ちが出てきているようです。',
  },
  {
    axis: 'EI', direction: 'toward_I', strength: 'medium',
    text: '内省へのシフトが進んでいます。\n深く考えること、静かな時間が重要になってきた時期かもしれません。',
  },
  {
    axis: 'EI', direction: 'toward_I', strength: 'large',
    text: 'Iの傾向が大きく強まっています。\nエネルギーを内側に向け、何かを整理しようとしている時期にあるのかもしれません。',
  },
  {
    axis: 'EI', direction: 'toward_I', strength: 'flip',
    text: 'EからIへ、軸を越えました。\n外向型から内省型へ——社会的な接触量の変化や、生活リズムの見直しが影響している可能性があります。',
  },

  // ── SN 軸 ──────────────────────────────────────────────────────────────────
  {
    axis: 'SN', direction: 'toward_N', strength: 'small',
    text: '具体から抽象へ、わずかな動きがあります。\nアイデアや可能性への感受性が、少し広がってきたようです。',
  },
  {
    axis: 'SN', direction: 'toward_N', strength: 'medium',
    text: '直感や可能性への感度が高まっています。\n全体像やパターンを捉えようとする力が伸びてきた時期です。',
  },
  {
    axis: 'SN', direction: 'toward_N', strength: 'large',
    text: 'Nの傾向が大きく強まっています。\n理論・象徴・抽象的な思考への関心が、以前より格段に広がっています。',
  },
  {
    axis: 'SN', direction: 'toward_N', strength: 'flip',
    text: 'SからNへ、軸を越えました。\n事実から可能性へ——物事の見方の基盤が変化している転換点かもしれません。',
  },
  {
    axis: 'SN', direction: 'toward_S', strength: 'small',
    text: '抽象から具体へ、わずかな動きがあります。\n現実の手触りや、足元の確かさを求めるようになってきたようです。',
  },
  {
    axis: 'SN', direction: 'toward_S', strength: 'medium',
    text: '具体的・現実的な視点が強まっています。\n今ここにある事実や、実用的な解決策に集中している時期かもしれません。',
  },
  {
    axis: 'SN', direction: 'toward_S', strength: 'large',
    text: 'Sの傾向が大きく強まっています。\n経験・感覚・現実に根ざした思考が前面に出てきています。',
  },
  {
    axis: 'SN', direction: 'toward_S', strength: 'flip',
    text: 'NからSへ、軸を越えました。\n可能性から現実へ——生活の中で、より実践的な視点が求められるようになった可能性があります。',
  },

  // ── TF 軸 ──────────────────────────────────────────────────────────────────
  {
    axis: 'TF', direction: 'toward_F', strength: 'small',
    text: '論理より共感へ、わずかな傾きが見えます。\n人との関わりの中で、感情に寄り添う面が増えてきたようです。',
  },
  {
    axis: 'TF', direction: 'toward_F', strength: 'medium',
    text: '感情・価値観への感度が高まっています。\n人の気持ちや、関係性の温度感を大切にする傾向が出てきた時期です。',
  },
  {
    axis: 'TF', direction: 'toward_F', strength: 'large',
    text: 'Fの傾向が大きく強まっています。\n感情共鳴や対人的な温かみへの意識が、以前よりずっと前面に出てきています。',
  },
  {
    axis: 'TF', direction: 'toward_F', strength: 'flip',
    text: 'TからFへ、軸を越えました。\n論理中心から感情・関係重視へ——人間関係や感情的な体験が大きく影響した可能性があります。',
  },
  {
    axis: 'TF', direction: 'toward_T', strength: 'small',
    text: '共感より論理へ、わずかな傾きが見えます。\n感情よりも筋道を重んじる場面が増えてきたようです。',
  },
  {
    axis: 'TF', direction: 'toward_T', strength: 'medium',
    text: '論理的な判断軸が強まっています。\n感情より根拠や効率を基準に動こうとしている時期かもしれません。',
  },
  {
    axis: 'TF', direction: 'toward_T', strength: 'large',
    text: 'Tの傾向が大きく強まっています。\n客観的な分析や、論理的一貫性を重視する姿勢が前面に出てきています。',
  },
  {
    axis: 'TF', direction: 'toward_T', strength: 'flip',
    text: 'FからTへ、軸を越えました。\n感情・関係重視から論理中心へ——環境や責任範囲の変化が影響している可能性があります。',
  },

  // ── JP 軸 ──────────────────────────────────────────────────────────────────
  {
    axis: 'JP', direction: 'toward_P', strength: 'small',
    text: '計画より柔軟さへ、わずかな動きがあります。\n決めすぎず、流れに沿って動く余裕が生まれてきたようです。',
  },
  {
    axis: 'JP', direction: 'toward_P', strength: 'medium',
    text: '自発性・適応性への傾きが見られます。\n固定したスケジュールより、その場の判断を好む感覚が出てきた時期です。',
  },
  {
    axis: 'JP', direction: 'toward_P', strength: 'large',
    text: 'Pの傾向が大きく強まっています。\n即興的で開かれたアプローチへの親和性が、以前よりずっと強まっています。',
  },
  {
    axis: 'JP', direction: 'toward_P', strength: 'flip',
    text: 'JからPへ、軸を越えました。\n計画型から柔軟型へ——生活スタイルや仕事の進め方が大きく変化した可能性があります。',
  },
  {
    axis: 'JP', direction: 'toward_J', strength: 'small',
    text: '柔軟さより構造へ、わずかな動きがあります。\n計画や見通しに安心感を覚えるようになってきたようです。',
  },
  {
    axis: 'JP', direction: 'toward_J', strength: 'medium',
    text: '計画性・秩序への傾きが出てきています。\n自分なりのペースや手順を重んじる意識が強まっている時期かもしれません。',
  },
  {
    axis: 'JP', direction: 'toward_J', strength: 'large',
    text: 'Jの傾向が大きく強まっています。\n明確な見通しと、コントロールできる環境への志向が前面に出てきています。',
  },
  {
    axis: 'JP', direction: 'toward_J', strength: 'flip',
    text: 'PからJへ、軸を越えました。\n柔軟型から計画型へ——環境の変化や、責任の増加が影響している可能性があります。',
  },
];

export function findAxisInterpretation(
  axis: Axis,
  direction: AxisDirection,
  strength: ChangeStrength,
): { text: string } | null {
  if (strength === 'none') return null;
  const entry = AXIS_INTERPRETATIONS.find(
    (e) => e.axis === axis && e.direction === direction && e.strength === strength,
  );
  return entry ? { text: entry.text } : null;
}

// ─── グループ間遷移テキスト（12パターン） ────────────────────────────────────

interface GroupTransitionEntry {
  from: Group;
  to: Group;
  text: string;
}

const GROUP_TRANSITIONS: GroupTransitionEntry[] = [
  {
    from: 'NT', to: 'NF',
    text: '探究から共鳴へ。\n知的な鋭さを保ちながら、人との深いつながりや感情の機微に向かう変化が見えます。',
  },
  {
    from: 'NT', to: 'SJ',
    text: '理念から基盤へ。\n抽象的な思考の力を持ちながら、現実・秩序・継続性への重心が増してきたようです。',
  },
  {
    from: 'NT', to: 'SP',
    text: '分析から行動へ。\n理論より実践、概念より即応——より感覚的で軽やかな動き方に向かっています。',
  },
  {
    from: 'NF', to: 'NT',
    text: '共鳴から探究へ。\n感情・関係の世界から、より客観的で概念的な思考の軸へと移動しています。',
  },
  {
    from: 'NF', to: 'SJ',
    text: '理想から現実へ。\n深い共感の力を持ちながら、より地に足のついた、安定と継続を重んじる姿勢が出てきています。',
  },
  {
    from: 'NF', to: 'SP',
    text: '感情から感覚へ。\n内的な世界から、身体・瞬間・体験の世界へ向かう変化が見えます。',
  },
  {
    from: 'SJ', to: 'NT',
    text: '基盤から探究へ。\n着実さの土台を持ちながら、より抽象的で概念的な思考の世界へ広がっています。',
  },
  {
    from: 'SJ', to: 'NF',
    text: '秩序から共鳴へ。\n現実的な安定性を持ちながら、感情・価値観・対人的なつながりへの感度が高まっています。',
  },
  {
    from: 'SJ', to: 'SP',
    text: '計画から即応へ。\n構造と秩序から離れ、より自発的で感覚的な動き方に変化しています。',
  },
  {
    from: 'SP', to: 'NT',
    text: '感覚から探究へ。\n即興と体験の世界から、より概念的・分析的な方向へのシフトが見えます。',
  },
  {
    from: 'SP', to: 'NF',
    text: '行動から共鳴へ。\n感覚的な世界から、感情や関係性の奥行きへ向かう変化が見えます。',
  },
  {
    from: 'SP', to: 'SJ',
    text: '即応から基盤へ。\n自由な流れから、より計画的で安定した構造を求める方向への変化です。',
  },
];

export function findGroupTransition(
  from: Group,
  to: Group,
): { text: string } | null {
  const entry = GROUP_TRANSITIONS.find((e) => e.from === from && e.to === to);
  return entry ? { text: entry.text } : null;
}

// ─── 同日比較テキスト（2パターン） ──────────────────────────────────────────

export function getSameDayInterpretation(typeChanged: boolean): { text: string } {
  if (typeChanged) {
    return {
      text: '同じ日に、二つのあなたが現れました。\n時間帯や状況によって、異なる側面が前に出てきていたのかもしれません。',
    };
  }
  return {
    text: '同じ日に二度、同じ自分と出会いました。\n診断の間、あなたの中心にある傾向は揺るがなかったようです。',
  };
}

// ─── 微小変化テキスト（2パターン） ──────────────────────────────────────────

export function getMinimalChangeInterpretation(
  kind: 'all_stable' | 'subtle_movement',
): { text: string } {
  if (kind === 'all_stable') {
    return {
      text: '4軸すべてで変化はほぼ見られません。\n今、あなたの傾向は非常に安定した状態にあります。',
    };
  }
  return {
    text: 'わずかな動きがあります。\n診断の誤差範囲に収まる変化ですが、何かがゆっくりと動き始めているサインかもしれません。',
  };
}
