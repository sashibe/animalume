/**
 * Animalume - J/P軸 問題プール（日本語）
 *
 * 構成: 状況提示型14問 + 二択6問 = 計20問
 * 軸: J（Judging/判断）vs P（Perceiving/知覚）
 *
 * weight の意味:
 *   - 範囲: -1.0 〜 +1.0
 *   - 正の値が J（判断・計画）、負の値が P（知覚・柔軟）への寄与
 *   - 絶対値の大きさ＝判別への寄与度
 *
 * J/P軸の設計方針:
 *   - 「J=真面目、P=だらしない」のステレオタイプを徹底回避
 *   - 両方をプロフェッショナルとして等価に描く
 *   - 日本社会のJ偏重バイアスに対するカウンター設計
 *   - 「決まっている vs 開かれている」の選好差で測る
 *
 * 抽選ロジック: 層化サンプリング、このプールから10問抽選される
 */

import type { Question } from './types';

export const jpPoolJa: Question[] = [
  // ─────────────────────────────────────
  // 状況提示型（14問）
  // ─────────────────────────────────────

  {
    id: 'jp-001',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: '旅行に行くとき、自然と取るスタイルは',
    optionA: { text: '出発前にしっかり予定を組んでおく', weight: 0.9 },
    optionB: { text: '大まかに決めて、現地で柔軟に動く', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['travel', 'planning'],
  },

  {
    id: 'jp-002',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: '締切のあるタスクへの取り組み方',
    optionA: { text: '早めに着手して、余裕を持って終わらせる', weight: 0.9 },
    optionB: { text: '締切が近づいてからの方が集中できる', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['work', 'deadline'],
  },

  {
    id: 'jp-003',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: '休日の過ごし方として、心地よく感じるのは',
    optionA: { text: '朝から予定を組んで動く方が充実する', weight: 0.8 },
    optionB: { text: 'その日の気分で決めていく', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['leisure', 'weekend'],
  },

  {
    id: 'jp-004',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: 'To-Doリストとの付き合い方',
    optionA: { text: 'リストに書いて、順番に消していくのが好き', weight: 0.9 },
    optionB: { text: 'リストにこだわらず、その時々で動く', weight: -0.8 },
    active: true,
    difficulty: 'easy',
    tags: ['work', 'task'],
  },

  {
    id: 'jp-005',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: '買い物に行くとき',
    optionA: { text: '必要なものをメモして、それに沿って買う', weight: 0.8 },
    optionB: { text: '店で見て、ピンときたものを買う', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['lifestyle', 'shopping'],
  },

  {
    id: 'jp-006',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: '会議やプロジェクトを進めるとき',
    optionA: { text: 'アジェンダを決めて、その通りに進めたい', weight: 0.9 },
    optionB: { text: '話の流れに沿って柔軟に進めたい', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['work', 'meeting'],
  },

  {
    id: 'jp-007',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: '部屋やデスクの状態として落ち着くのは',
    optionA: { text: '物が定位置にあって整っている状態', weight: 0.7 },
    optionB: { text: '多少散らかっていても自分なりの配置', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['lifestyle', 'environment'],
  },

  {
    id: 'jp-008',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: '約束の時間に対して、自分のクセは',
    optionA: { text: '余裕を持って早めに到着する', weight: 0.8 },
    optionB: { text: 'ぎりぎりに着くことが多い', weight: -0.7 },
    active: true,
    difficulty: 'easy',
    tags: ['punctuality'],
  },

  {
    id: 'jp-009',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: '物事を決めるタイミングについて',
    optionA: { text: '早めに決めてしまう方がスッキリする', weight: 0.9 },
    optionB: { text: 'できる限り選択肢を残しておきたい', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['core', 'decision'],
  },

  {
    id: 'jp-010',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: '予定が急に変わったときの感覚',
    optionA: { text: '段取りが崩れて少しストレスを感じる', weight: 0.8 },
    optionB: { text: 'むしろ展開が変わって楽しめる', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['change', 'flexibility'],
  },

  {
    id: 'jp-011',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: '仕事や勉強の進め方として自然なのは',
    optionA: { text: '計画を立てて、その通りに進めるのが好き', weight: 0.9 },
    optionB: { text: '興味の赴くまま、寄り道しながら進める', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['work', 'style'],
  },

  {
    id: 'jp-012',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: 'レストランで注文を決めるとき',
    optionA: { text: 'メニューを見たらわりとすぐ決められる', weight: 0.6 },
    optionB: { text: '迷ってなかなか決まらないことが多い', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['decision', 'daily'],
  },

  {
    id: 'jp-013',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: 'やることが増えてきたとき、まずやるのは',
    optionA: { text: '整理して優先順位をつけたくなる', weight: 0.8 },
    optionB: { text: 'できるものから流れに任せて手をつける', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['task_management'],
  },

  {
    id: 'jp-014',
    axis: 'JP',
    format: 'situation',
    locale: 'ja',
    content: '旅行先で予定外のことが起きたら',
    optionA: { text: '計画を立て直したくなる', weight: 0.7 },
    optionB: { text: 'それも面白いと感じて流れに乗る', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['travel', 'adaptability'],
  },

  // ─────────────────────────────────────
  // 二択（短い選好ペア）6問
  // ─────────────────────────────────────

  {
    id: 'jp-015',
    axis: 'JP',
    format: 'binary',
    locale: 'ja',
    content: '満足感を覚えやすいのは',
    optionA: { text: '達成感のある一日', weight: 0.8 },
    optionB: { text: '自由な余白のある一日', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['satisfaction'],
  },

  {
    id: 'jp-016',
    axis: 'JP',
    format: 'binary',
    locale: 'ja',
    content: '自分を表す言葉に近いのは',
    optionA: { text: '計画的・几帳面', weight: 0.8 },
    optionB: { text: '柔軟・即興的', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['self_image'],
  },

  {
    id: 'jp-017',
    axis: 'JP',
    format: 'binary',
    locale: 'ja',
    content: '心地よく感じる状態は',
    optionA: { text: '物事が決まっている', weight: 0.9 },
    optionB: { text: '選択肢が開かれている', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['core', 'comfort'],
  },

  {
    id: 'jp-018',
    axis: 'JP',
    format: 'binary',
    locale: 'ja',
    content: '集中の仕方に近いのは',
    optionA: { text: '区切って計画的に', weight: 0.8 },
    optionB: { text: '波が来たときに一気に', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['work_style'],
  },

  {
    id: 'jp-019',
    axis: 'JP',
    format: 'binary',
    locale: 'ja',
    content: '決断するタイミングは',
    optionA: { text: 'なるべく早く決める', weight: 0.8 },
    optionB: { text: 'できるだけ判断を保留する', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['decision_timing'],
  },

  {
    id: 'jp-020',
    axis: 'JP',
    format: 'binary',
    locale: 'ja',
    content: 'ストレスを感じやすいのは',
    optionA: { text: '予定が次々と変わるとき', weight: 0.7 },
    optionB: { text: '細かく決められて動かされるとき', weight: -0.7 },
    active: true,
    difficulty: 'hard',
    tags: ['stress'],
  },
];
