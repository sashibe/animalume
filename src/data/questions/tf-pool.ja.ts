/**
 * Animalume - T/F軸 問題プール（日本語）
 *
 * 構成: 状況提示型14問 + 二択6問 = 計20問
 * 軸: T（Thinking/論理）vs F（Feeling/感情）
 *
 * weight の意味:
 *   - 範囲: -1.0 〜 +1.0
 *   - 正の値が T（論理）、負の値が F（感情）への寄与
 *   - 絶対値の大きさ＝判別への寄与度
 *
 * T/F軸の設計方針:
 *   - 「冷たい/優しい」「論理的/感情的」のステレオタイプを徹底回避
 *   - 両方とも思慮深く誠実な判断として描く
 *   - 性別・性役割と紐づかない設計
 *   - 「何を判断基準にするか」の差異で測る
 *
 * 抽選ロジック: 層化サンプリング、このプールから10問抽選される
 */

import type { Question } from './types';

export const tfPoolJa: Question[] = [
  // ─────────────────────────────────────
  // 状況提示型（14問）
  // ─────────────────────────────────────

  {
    id: 'tf-001',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: '友達から悩み相談を受けたとき、\n自然と先に出るのは',
    optionA: { text: '状況を整理して、\n解決策を一緒に考える', weight: 0.9 },
    optionB: { text: 'まず気持ちに\n寄り添って共感する', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['relationship', 'support'],
  },

  {
    id: 'tf-002',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: 'チームで意見が割れたとき、\n重視するのは',
    optionA: { text: 'どの案が最も合理的かを\n基準に決める', weight: 0.9 },
    optionB: { text: '関わる人みんなが納得できる\n落とし所を探す', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['work', 'decision'],
  },

  {
    id: 'tf-003',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: '映画やドラマで\n「いい作品だった」と感じる瞬間は',
    optionA: { text: '構成が緻密で、\nストーリーに納得感があるとき', weight: 0.7 },
    optionB: { text: '登場人物の感情に\n深く共鳴したとき', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['leisure', 'preference'],
  },

  {
    id: 'tf-004',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: '部下や後輩のミスを指摘するとき',
    optionA: { text: '何が問題で、\nどう改善すべきかを率直に伝える', weight: 0.9 },
    optionB: { text: '相手が落ち込まないよう、\n伝え方を工夫する', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['work', 'feedback'],
  },

  {
    id: 'tf-005',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: '誰かを評価するとき、より重く見るのは',
    optionA: { text: '出している成果や能力', weight: 0.9 },
    optionB: { text: '人柄や周囲との関わり方', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['evaluation', 'people'],
  },

  {
    id: 'tf-006',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: '議論をしていて、\n相手が感情的になってきたとき',
    optionA: { text: '冷静に話を続けようと努める', weight: 0.8 },
    optionB: { text: '一旦話を止めて、\nまず気持ちを整える時間をつくる', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['conflict', 'communication'],
  },

  {
    id: 'tf-007',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: '何かを決めるとき、\n最後の決め手になりやすいのは',
    optionA: { text: '客観的に見て\n筋が通っているか', weight: 1.0 },
    optionB: { text: '自分や周りの人に\nとって心地よいか', weight: -1.0 },
    active: true,
    difficulty: 'easy',
    tags: ['core', 'decision'],
  },

  {
    id: 'tf-008',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: '誰かが涙を流しているのを\n見たとき、自然な反応は',
    optionA: { text: '何が起きたのかを\nまず理解しようとする', weight: 0.7 },
    optionB: { text: 'そばにいて気持ちに\n寄り添おうとする', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['empathy', 'response'],
  },

  {
    id: 'tf-009',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: '本やニュースを読んでいて、\n強く反応するのは',
    optionA: { text: '論理の組み立てや\n事実の精度', weight: 0.8 },
    optionB: { text: 'そこに描かれた人々の\n境遇や感情', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['information', 'reaction'],
  },

  {
    id: 'tf-010',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: '誰かに褒めてもらったとき、嬉しいのは',
    optionA: { text: '具体的な成果や能力を\n認められたとき', weight: 0.8 },
    optionB: { text: '人柄や姿勢を\n認められたとき', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['praise', 'self'],
  },

  {
    id: 'tf-011',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: '正論なのに相手を\n傷つけてしまいそうな場面で',
    optionA: { text: 'それでも事実は\n伝えるべきだと思う', weight: 0.9 },
    optionB: { text: '伝え方を変えるか、\n別の機会にしたい', weight: -0.9 },
    active: true,
    difficulty: 'hard',
    tags: ['ethics', 'communication'],
  },

  {
    id: 'tf-012',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: '自分が間違っていたと気づいたとき',
    optionA: { text: 'なぜ間違ったのか、\n原因を分析したくなる', weight: 0.8 },
    optionB: { text: '迷惑をかけた人への\n申し訳なさが先に立つ', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['self_reflection'],
  },

  {
    id: 'tf-013',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: '人間関係でトラブルが起きたとき',
    optionA: { text: 'どこで何が\nズレたのかを\n整理したい', weight: 0.7 },
    optionB: { text: '関係をどう修復するか\nを優先したい', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['relationship', 'conflict'],
  },

  {
    id: 'tf-014',
    axis: 'TF',
    format: 'situation',
    locale: 'ja',
    content: '尊敬する人のタイプとして、\nより惹かれるのは',
    optionA: { text: '判断が公正で、\nぶれない人', weight: 0.8 },
    optionB: { text: '人の気持ちを\n大切にする、温かい人', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['values', 'admiration'],
  },

  // ─────────────────────────────────────
  // 二択（短い選好ペア）6問
  // ─────────────────────────────────────

  {
    id: 'tf-015',
    axis: 'TF',
    format: 'binary',
    locale: 'ja',
    content: '判断の軸として近いのは',
    optionA: { text: '正しいか、間違っているか', weight: 0.9 },
    optionB: { text: '良いか、悪いか（人にとって）', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['core', 'judgment'],
  },

  {
    id: 'tf-016',
    axis: 'TF',
    format: 'binary',
    locale: 'ja',
    content: '大切にしたいのは',
    optionA: { text: '一貫性のある判断', weight: 0.8 },
    optionB: { text: '相手や状況への配慮', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['values'],
  },

  {
    id: 'tf-017',
    axis: 'TF',
    format: 'binary',
    locale: 'ja',
    content: '自分を表す言葉に近いのは',
    optionA: { text: '冷静・分析的', weight: 0.8 },
    optionB: { text: '共感的・思いやり', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['self_image'],
  },

  {
    id: 'tf-018',
    axis: 'TF',
    format: 'binary',
    locale: 'ja',
    content: '指摘されて少し凹むのは',
    optionA: { text: '「感情的すぎる」と\n言われたとき', weight: 0.7 },
    optionB: { text: '「冷たい」と\n言われたとき', weight: -0.8 },
    active: true,
    difficulty: 'hard',
    tags: ['vulnerability'],
  },

  {
    id: 'tf-019',
    axis: 'TF',
    format: 'binary',
    locale: 'ja',
    content: '会議や議論で評価されたいのは',
    optionA: { text: '論点を整理する力', weight: 0.8 },
    optionB: { text: '場の空気をまとめる力', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['work', 'self_image'],
  },

  {
    id: 'tf-020',
    axis: 'TF',
    format: 'binary',
    locale: 'ja',
    content: '誰かと衝突したあとに気になるのは',
    optionA: { text: 'どちらの主張が\n正しかったのか', weight: 0.7 },
    optionB: { text: '相手との関係が\n修復できるか', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['conflict', 'aftermath'],
  },
];
