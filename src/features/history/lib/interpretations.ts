/**
 * Phase 3.1: 比較ビュー定型文データ
 *
 * 48パターンの定型文と判定ロジック。
 * - 軸別変化文 32パターン（4軸 × 8）
 * - グループ間遷移 12パターン
 * - 同日比較 2パターン
 * - 微小変化 2パターン
 */

import type { MbtiType } from '@/features/diagnosis/logic/types';

// =============================================================
// 型定義
// =============================================================

export type Axis = 'EI' | 'SN' | 'TF' | 'JP';

export type AxisStrength = 'none' | 'small' | 'medium' | 'flip';

export type Direction =
  | 'left_to_right'    // I→E, S→N, T→F, J→P
  | 'right_to_left'    // E→I, N→S, F→T, P→J
  | 'stable_left'      // I, S, T, J で変化なし
  | 'stable_right';    // E, N, F, P で変化なし

export type Group = 'analysts' | 'diplomats' | 'sentinels' | 'explorers';

export interface AxisInterpretation {
  axis: Axis;
  direction: Direction;
  strength: AxisStrength;
  text: string;
}

export interface GroupTransitionInterpretation {
  from: Group;
  to: Group;
  text: string;
}

export interface SameDayInterpretation {
  typeChanged: boolean;
  text: string;
}

export interface MinimalChangeInterpretation {
  variant: 'subtle_movement' | 'all_stable';
  text: string;
}

// =============================================================
// タイプ → グループのマッピング
// =============================================================

export const TYPE_TO_GROUP: Record<MbtiType, Group> = {
  INTJ: 'analysts', INTP: 'analysts', ENTJ: 'analysts', ENTP: 'analysts',
  INFJ: 'diplomats', INFP: 'diplomats', ENFJ: 'diplomats', ENFP: 'diplomats',
  ISTJ: 'sentinels', ISFJ: 'sentinels', ESTJ: 'sentinels', ESFJ: 'sentinels',
  ISTP: 'explorers', ISFP: 'explorers', ESTP: 'explorers', ESFP: 'explorers',
};

// =============================================================
// 軸別変化文 32パターン
// =============================================================

export const AXIS_INTERPRETATIONS: AxisInterpretation[] = [
  // ---- EI 軸 ----
  {
    axis: 'EI', direction: 'left_to_right', strength: 'small',
    text: `内向的だったあなたの中に、
ほんの少し、外への動きが生まれている。

大きく変わったわけではないけれど、
人と過ごす時間に、わずかな心地よさを
感じはじめているのかもしれません。`,
  },
  {
    axis: 'EI', direction: 'left_to_right', strength: 'medium',
    text: `内向的だったあなたが、少しずつ心をひらいていく。

ひとりの時間を大切にしてきたあなたが、
最近は誰かと過ごす時間にも、
じわりと馴染んでいるのかもしれません。

外への扉が、ゆっくりと開きはじめています。`,
  },
  {
    axis: 'EI', direction: 'left_to_right', strength: 'flip',
    text: `内向的だったあなたが、外へと開いていく。

ひとりで詩を編んでいた時間から、
場の真ん中で踊る時間へ、
軸が大きく移ろうとしているようです。

最近、誰かと過ごすことが、
むしろ自分を満たすことになっていませんか?`,
  },
  {
    axis: 'EI', direction: 'right_to_left', strength: 'small',
    text: `外向的なあなたの中に、
静けさを求める気持ちが芽生えている。

人といる時間は変わらず好きでも、
ひとりで過ごす時間が、
少しずつ意味を持ちはじめているようです。`,
  },
  {
    axis: 'EI', direction: 'right_to_left', strength: 'medium',
    text: `外向的だったあなたが、少しずつ内へと向かう。

人の中にいる時間も大切にしながら、
自分の内側に耳を澄ませる時間が、
ゆっくりと増えているようです。

外と内の、ちょうど真ん中あたり。
そこに、今のあなたが立っています。`,
  },
  {
    axis: 'EI', direction: 'right_to_left', strength: 'flip',
    text: `外へ開いていたあなたが、内へと向かう。

人の輪の真ん中にいた時期から、
ひとり静かに過ごす時間へと、
重心が深く沈んでいるようです。

誰かと一緒にいる時より、
ひとりでいる時のほうが、
今のあなたには馴染むのかもしれません。`,
  },
  {
    axis: 'EI', direction: 'stable_left', strength: 'none',
    text: `あなたは引き続き、内向的なあなたのまま。

外の喧騒から少し離れたところで、
自分の世界を深めていく時間を、
変わらず大切にしているようです。

揺らぎながらも保たれている軸。
それはあなたの核のひとつです。`,
  },
  {
    axis: 'EI', direction: 'stable_right', strength: 'none',
    text: `あなたは引き続き、外向的なあなたのまま。

人と関わり、場に開かれる時間が、
今もあなたを満たしているようです。

細かな波はあっても、
心が外へ向かう力は変わっていません。`,
  },

  // ---- SN 軸 ----
  {
    axis: 'SN', direction: 'left_to_right', strength: 'small',
    text: `現実を見つめるあなたの中に、
直感が顔を出しはじめている。

目の前の事実を大切にしながらも、
その奥にある何かを感じ取ろうとする
小さな動きが生まれています。`,
  },
  {
    axis: 'SN', direction: 'left_to_right', strength: 'medium',
    text: `現実的だったあなたが、少しずつ直感に耳を傾けはじめる。

足元の確かさを大切にしてきたあなたが、
最近は言葉にならない予感や、
ふと浮かぶイメージを、
信じてみようとしているようです。`,
  },
  {
    axis: 'SN', direction: 'left_to_right', strength: 'flip',
    text: `現実を見つめていたあなたが、直感の世界へと開かれていく。

確かな手触りを頼りに歩んできた日々から、
まだ見えないものを信じる日々へ、
視線が遠くへと伸びているようです。

「なんとなく、そう感じる」という感覚が、
今のあなたを動かしはじめています。`,
  },
  {
    axis: 'SN', direction: 'right_to_left', strength: 'small',
    text: `直感的なあなたの中に、
現実を確かめる視点が育っている。

ひらめきを大切にしながらも、
目の前のことを丁寧に見つめる時間が、
少しずつ増えているようです。`,
  },
  {
    axis: 'SN', direction: 'right_to_left', strength: 'medium',
    text: `直感的だったあなたが、少しずつ現実に足をつける。

遠くを見つめる時間も大切にしながら、
今この瞬間の手触りや、
具体的な事実に意識が向かいはじめています。`,
  },
  {
    axis: 'SN', direction: 'right_to_left', strength: 'flip',
    text: `直感を信じていたあなたが、現実へと深く根を下ろす。

ひらめきと予感の中を漂っていた時期から、
目の前の確かなものに向き合う時期へ、
重心が深く沈んでいるようです。

「今、ここにあるもの」を丁寧に
受け取ろうとする姿勢が、
あなたの中に生まれているのかもしれません。`,
  },
  {
    axis: 'SN', direction: 'stable_left', strength: 'none',
    text: `あなたは引き続き、現実的なあなたのまま。

目の前の確かなものを大切にし、
足元を一歩ずつ確かめながら歩む姿勢が、
今もあなたを支えています。

揺らぎながらも保たれている視点。
それはあなたの核のひとつです。`,
  },
  {
    axis: 'SN', direction: 'stable_right', strength: 'none',
    text: `あなたは引き続き、直感的なあなたのまま。

まだ言葉にならない予感や、
全体を一目で捉える感覚が、
今もあなたの道しるべになっているようです。

世界の奥にあるものを見ようとする力は、
変わらず保たれています。`,
  },

  // ---- TF 軸 ----
  {
    axis: 'TF', direction: 'left_to_right', strength: 'small',
    text: `論理を頼りにしてきたあなたの中に、
感性の声が聞こえはじめている。

筋道を立てて考える姿勢を保ちながらも、
「なんとなく、こちらが正しい気がする」という
小さな感覚が、判断に加わりつつあります。`,
  },
  {
    axis: 'TF', direction: 'left_to_right', strength: 'medium',
    text: `論理的だったあなたが、少しずつ感性に耳を傾けはじめる。

理屈で物事を決めてきたあなたが、
最近は自分の気持ちや、
相手の心の動きを、
判断の中に置こうとしているようです。`,
  },
  {
    axis: 'TF', direction: 'left_to_right', strength: 'flip',
    text: `理屈で決めていたあなたが、感性に任せる世界へと移っていく。

論理の筋道を頼りに歩んできた日々から、
気持ちの響きを信じる日々へ、
判断の重心が大きく動いているようです。

「正しいかどうか」より、
「心が動くかどうか」が、
今のあなたを導きはじめています。`,
  },
  {
    axis: 'TF', direction: 'right_to_left', strength: 'small',
    text: `感性に任せてきたあなたの中に、
理屈で確かめる視点が育っている。

気持ちの響きを大切にしながらも、
筋道を立てて考える時間が、
少しずつ増えているようです。`,
  },
  {
    axis: 'TF', direction: 'right_to_left', strength: 'medium',
    text: `感性に任せてきたあなたが、少しずつ論理に重心を移す。

心の響きを大切にしながらも、
冷静に物事を見つめる視線が、
判断の中で力を増しているようです。`,
  },
  {
    axis: 'TF', direction: 'right_to_left', strength: 'flip',
    text: `感性に任せていたあなたが、論理の世界へと深く入っていく。

気持ちの流れに沿って動いていた時期から、
理屈で物事を整える時期へ、
判断の軸が大きく動いているようです。

「心がどう動くか」より、
「筋が通っているか」を、
今のあなたは大切にしはじめています。`,
  },
  {
    axis: 'TF', direction: 'stable_left', strength: 'none',
    text: `あなたは引き続き、論理的なあなたのまま。

筋道を立てて物事を見つめ、
冷静に判断を下す姿勢が、
今もあなたを支えています。

揺らぎながらも保たれている重心。
それはあなたの核のひとつです。`,
  },
  {
    axis: 'TF', direction: 'stable_right', strength: 'none',
    text: `あなたは引き続き、感性に任せるあなたのまま。

心の響きや気持ちの流れを大切にし、
人と人のあいだに生まれるものを
丁寧に感じ取る力が、
今もあなたを動かしているようです。

揺らぎながらも保たれている響き。
それはあなたの核のひとつです。`,
  },

  // ---- JP 軸 ----
  {
    axis: 'JP', direction: 'left_to_right', strength: 'small',
    text: `計画を立ててきたあなたの中に、
柔らかさが芽生えはじめている。

決めた道筋を大切にしながらも、
予定にない流れを受け入れる余地が、
少しずつ生まれているようです。`,
  },
  {
    axis: 'JP', direction: 'left_to_right', strength: 'medium',
    text: `計画的だったあなたが、少しずつ流れに身を任せはじめる。

道筋を立てて進む安心感も大切にしながら、
その場で起きることに合わせて動く軽やかさが、
あなたの中で育っているようです。`,
  },
  {
    axis: 'JP', direction: 'left_to_right', strength: 'flip',
    text: `道筋を立ててきたあなたが、臨機応変な世界へと開かれていく。

決められた予定通りに歩んできた日々から、
その瞬間の流れに合わせて動く日々へ、
重心が大きく動いているようです。

「決めた通りに進めること」より、
「その時々に応じること」が、
今のあなたを軽やかにしはじめています。`,
  },
  {
    axis: 'JP', direction: 'right_to_left', strength: 'small',
    text: `臨機応変なあなたの中に、
道筋を整える視点が育っている。

流れに身を任せる軽やかさを保ちながらも、
予定を立てて動く時間が、
少しずつ増えているようです。`,
  },
  {
    axis: 'JP', direction: 'right_to_left', strength: 'medium',
    text: `臨機応変だったあなたが、少しずつ計画に重心を移す。

その場の流れを大切にしながらも、
あらかじめ道筋を立てる落ち着きが、
あなたの中で力を増しているようです。`,
  },
  {
    axis: 'JP', direction: 'right_to_left', strength: 'flip',
    text: `臨機応変だったあなたが、道筋を立てる世界へと深く入っていく。

その瞬間の流れに乗っていた時期から、
予定と計画で物事を整える時期へ、
重心が大きく動いているようです。

「流れに任せること」より、
「自分で道を引くこと」を、
今のあなたは大切にしはじめています。`,
  },
  {
    axis: 'JP', direction: 'stable_left', strength: 'none',
    text: `あなたは引き続き、計画的なあなたのまま。

道筋を立てて物事を進め、
予定通りに歩む安定感が、
今もあなたを支えています。

揺らぎながらも保たれている道。
それはあなたの核のひとつです。`,
  },
  {
    axis: 'JP', direction: 'stable_right', strength: 'none',
    text: `あなたは引き続き、臨機応変なあなたのまま。

その時々の流れを読み、
柔らかく動く軽やかさが、
今もあなたを支えています。

揺らぎながらも保たれている軽やかさ。
それはあなたの核のひとつです。`,
  },
];

// =============================================================
// グループ間遷移文 12パターン
// =============================================================

export const GROUP_TRANSITION_INTERPRETATIONS: GroupTransitionInterpretation[] = [
  // ---- Analysts → others ----
  {
    from: 'analysts', to: 'diplomats',
    text: `光の探究者から、光を編む人へ。

論理で世界を解き明かそうとしていたあなたが、
人と人のあいだに流れるものに、
心を向けはじめているようです。

「正しさ」を追っていた視線が、
「美しさ」や「人の想い」へと
ゆっくりと移っていく。

そんな変化が、あなたの中で
静かに進んでいます。`,
  },
  {
    from: 'analysts', to: 'sentinels',
    text: `光の探究者から、光の番人へ。

未来を描いていたあなたが、
今、目の前にある秩序や責任に、
重心を移しはじめているようです。

新しい仕組みを考えるより、
すでにあるものを丁寧に守り、
育てていくこと。

そこに、今のあなたの
誠実さが向かっています。`,
  },
  {
    from: 'analysts', to: 'explorers',
    text: `光の探究者から、光の踊り手へ。

頭の中で組み立てていた構想を、
今、あなたは身体と感覚で
試しはじめているようです。

考え抜くより、まず動いてみる。
理屈で組むより、その場で感じる。

そんな軽やかな姿勢が、
あなたの中で生まれています。`,
  },

  // ---- Diplomats → others ----
  {
    from: 'diplomats', to: 'analysts',
    text: `光を編む人から、光の探究者へ。

人の想いに寄り添ってきたあなたが、
今、少し距離を取って、
物事の構造を見つめはじめているようです。

「どう感じるか」を大切にしながらも、
「どう成り立っているか」を
冷静に解き明かそうとする視線が、
あなたの中に育っています。`,
  },
  {
    from: 'diplomats', to: 'sentinels',
    text: `光を編む人から、光の番人へ。

人の理想や可能性を見つめてきたあなたが、
今、地に足のついた現実を
大切にしはじめているようです。

夢を語ることから、
日々を整えること、
誰かを支えることへと、
重心が移っているのかもしれません。`,
  },
  {
    from: 'diplomats', to: 'explorers',
    text: `光を編む人から、光の踊り手へ。

繊細な感性で世界の美しさを集めていたあなたが、
今、その美しさを場に放つ側へと
立ち位置を変えはじめているようです。

ひとり静かに紡いでいた詩が、
誰かと共有する歌になり、
踊りになっていく。

そんな変化が、あなたの中で
静かに、しかし確かに起きています。`,
  },

  // ---- Sentinels → others ----
  {
    from: 'sentinels', to: 'analysts',
    text: `光の番人から、光の探究者へ。

秩序を守ってきたあなたが、
今、その秩序そのものを問い直し、
新しい構造を描こうとしているようです。

「こうあるべき」を受け継ぐより、
「なぜそうなのか」を考え抜く視点が、
あなたの中で力を増しています。`,
  },
  {
    from: 'sentinels', to: 'diplomats',
    text: `光の番人から、光を編む人へ。

役割と責任を全うしてきたあなたが、
今、その向こうにある
人の心の動きに、
目を向けはじめているようです。

整えること、守ることを大切にしながらも、
誰かの想いに寄り添う時間が、
あなたの中で意味を増しています。`,
  },
  {
    from: 'sentinels', to: 'explorers',
    text: `光の番人から、光の踊り手へ。

秩序を守ってきたあなたが、
今、決められた枠の外へと
足を踏み出しはじめているようです。

予定通りに進めることから、
その瞬間の感覚に従うことへ、
重心が動いているのかもしれません。

少し肩の力が抜けた、
新しいあなたが顔を出しています。`,
  },

  // ---- Explorers → others ----
  {
    from: 'explorers', to: 'analysts',
    text: `光の踊り手から、光の探究者へ。

その場の感覚で動いてきたあなたが、
今、立ち止まって考え、
構造を読み解こうとしているようです。

身体で覚えていたことを、
言葉と論理で整理しなおす時間が、
あなたの中で始まっています。`,
  },
  {
    from: 'explorers', to: 'diplomats',
    text: `光の踊り手から、光を編む人へ。

今この瞬間を生きてきたあなたが、
今、誰かの心の動きや、
人と人のあいだに流れるものに、
深く意識を向けはじめているようです。

軽やかな感性はそのままに、
その感性を誰かのために
使おうとしているのかもしれません。`,
  },
  {
    from: 'explorers', to: 'sentinels',
    text: `光の踊り手から、光の番人へ。

その場の流れに乗ってきたあなたが、
今、自分の足元を整え、
誰かを支える側へと
立ち位置を変えはじめているようです。

軽やかに動くことから、
確かに守ること、
継続することへと、
重心が移っているのかもしれません。`,
  },
];

// =============================================================
// 同日比較 2パターン
// =============================================================

export const SAME_DAY_INTERPRETATIONS: SameDayInterpretation[] = [
  {
    typeChanged: true,
    text: `同じ日の中で、すでに2つのあなたが現れています。
気分や状況によって、別の側面が立ちあらわれることは、
誰にでも起こりうることです。`,
  },
  {
    typeChanged: false,
    text: `同じ日に2度、あなたは同じ場所に立ち戻りました。
それは、今日のあなたが
ぶれずに自分の中心にあることの証なのかもしれません。`,
  },
];

// =============================================================
// 微小変化 2パターン
// =============================================================

export const MINIMAL_CHANGE_INTERPRETATIONS: MinimalChangeInterpretation[] = [
  {
    variant: 'subtle_movement',
    text: `あなたの中で、何かが動こうとしているのかもしれません。

数字としては大きな変化ではありませんが、
今のあなたは、いつものあなたの中で
わずかに揺らいでいるようです。

その揺らぎは、変化の前触れかもしれませんし、
いつもの自分を保つための
小さな調整なのかもしれません。`,
  },
  {
    variant: 'all_stable',
    text: `あなたの中の4つの軸は、ほとんど変わっていません。

このReadingは、前回のあなたをそのまま映しています。
それは、あなたの輪郭が
今、安定していることの表れです。

揺らぎながらも、ぶれない核。
それが今日のあなたを支えています。`,
  },
];

// =============================================================
// 強度判定ロジック
// =============================================================

/**
 * 2つのスコアから変化の方向と強度を判定する。
 *
 * 判定優先順位:
 * 1. 変化量の絶対値が 5 以下 → none（揺らぎの範囲）
 * 2. 符号反転（previous と current の符号が逆）→ flip
 * 3. 変化量 51 以上 → flip（軸別文ではlargeとflipを統合）
 * 4. 変化量 21〜50 → medium
 * 5. 変化量 6〜20 → small
 */
export function analyzeAxisChange(
  _axis: Axis, // 軸名はシグネチャの一貫性のため残す（Direction は軸非依存）
  previousScore: number,
  currentScore: number,
): { direction: Direction; strength: AxisStrength } {
  const diff = currentScore - previousScore;
  const absDiff = Math.abs(diff);

  // 1. 揺らぎの範囲（変化なし）
  if (absDiff <= 5) {
    // 現在の符号で stable_left / stable_right を決定
    return {
      direction: currentScore < 0 ? 'stable_left' : 'stable_right',
      strength: 'none',
    };
  }

  // 移動方向
  const direction: Direction = diff > 0 ? 'left_to_right' : 'right_to_left';

  // 2. 符号反転（flip）— 両方とも絶対値 6 以上のとき
  const flipped =
    previousScore < 0 && currentScore > 0 ||
    previousScore > 0 && currentScore < 0;
  if (flipped && Math.abs(previousScore) >= 6 && Math.abs(currentScore) >= 6) {
    return { direction, strength: 'flip' };
  }

  // 3. 大きな変化（flipと統合）
  if (absDiff >= 51) {
    return { direction, strength: 'flip' };
  }

  // 4. 中程度
  if (absDiff >= 21) {
    return { direction, strength: 'medium' };
  }

  // 5. 小さな変化
  return { direction, strength: 'small' };
}

/**
 * 軸別文を検索する。該当パターンがなければ null。
 */
export function findAxisInterpretation(
  axis: Axis,
  direction: Direction,
  strength: AxisStrength,
): AxisInterpretation | null {
  return (
    AXIS_INTERPRETATIONS.find(
      (item) =>
        item.axis === axis &&
        item.direction === direction &&
        item.strength === strength,
    ) ?? null
  );
}

/**
 * グループ間遷移文を検索する。
 */
export function findGroupTransition(
  from: Group,
  to: Group,
): GroupTransitionInterpretation | null {
  if (from === to) return null;
  return (
    GROUP_TRANSITION_INTERPRETATIONS.find(
      (item) => item.from === from && item.to === to,
    ) ?? null
  );
}

/**
 * 同日比較文を取得する。
 */
export function getSameDayInterpretation(typeChanged: boolean): SameDayInterpretation {
  return SAME_DAY_INTERPRETATIONS.find((item) => item.typeChanged === typeChanged)!;
}

/**
 * 微小変化文を取得する。
 */
export function getMinimalChangeInterpretation(
  variant: 'subtle_movement' | 'all_stable',
): MinimalChangeInterpretation {
  return MINIMAL_CHANGE_INTERPRETATIONS.find((item) => item.variant === variant)!;
}
