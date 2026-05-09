/**
 * Animalume - S/N軸 問題プール（日本語）
 *
 * 構成: 状況提示型14問 + 二択6問 = 計20問
 * 軸: S（Sensing/感覚）vs N（Intuition/直観）
 *
 * weight の意味:
 *   - 範囲: -1.0 〜 +1.0
 *   - 正の値が S（感覚）、負の値が N（直観）への寄与
 *   - 絶対値の大きさ＝判別への寄与度
 *
 * S/N軸の設計方針:
 *   - 自己評価を直接聞かない（「想像力豊か？」等のバイアス回避）
 *   - 両方ポジティブに見える対称性を保つ
 *   - 行動・選好の具体的差異で測る
 *
 * 抽選ロジック: 層化サンプリング、このプールから10問抽選される
 */

import type { Question } from './types';

export const snPoolJa: Question[] = [
  // ─────────────────────────────────────
  // 状況提示型（14問）
  // ─────────────────────────────────────

  {
    id: 'sn-001',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '初めての場所に旅行する計画を立てるとき、\n自然なやり方は？',
    optionA: { text: '実際に行った人の\n口コミやガイドを参考にする', weight: 0.9 },
    optionB: { text: 'その土地の歴史や\n文化的背景を調べたくなる', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['planning', 'travel'],
  },

  {
    id: 'sn-002',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '面白そうな本を見つけたとき、\n惹かれやすいのは',
    optionA: { text: '実例やノウハウが\n詰まった実用書', weight: 0.9 },
    optionB: { text: '抽象的なテーマや\n思想を扱った本', weight: -1.0 },
    active: true,
    difficulty: 'easy',
    tags: ['learning', 'preference'],
  },

  {
    id: 'sn-003',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '誰かの話を聞いていて、\nつい注目してしまうのは',
    optionA: { text: '具体的な出来事や\nディテール', weight: 0.9 },
    optionB: { text: '話の背景にある\n意図やテーマ', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['communication', 'attention'],
  },

  {
    id: 'sn-004',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '仕事で新しいやり方を考えるとき',
    optionA: { text: '今あるやり方を\n改善する方向で考える', weight: 0.8 },
    optionB: { text: '前提から見直して\n全く別の発想を\n試したい', weight: -1.0 },
    active: true,
    difficulty: 'medium',
    tags: ['work', 'innovation'],
  },

  {
    id: 'sn-005',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '美術館で絵画を見るとき、\nより楽しめるのは',
    optionA: { text: '描かれている\n題材や技法を観察すること', weight: 0.8 },
    optionB: { text: '作家の意図や時代背景を\n想像すること', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['art', 'leisure'],
  },

  {
    id: 'sn-006',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '将来について考える時間が長いのは',
    optionA: { text: '現実的に達成できる\n近い未来の計画', weight: 0.9 },
    optionB: { text: 'まだ形になっていない\n可能性や夢', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['future', 'planning'],
  },

  {
    id: 'sn-007',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '人と話していて\n「面白い」と感じる瞬間は',
    optionA: { text: '生々しい体験談や\n具体的なエピソード', weight: 0.8 },
    optionB: { text: '思いがけない視点や\n考え方の発見', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['communication', 'curiosity'],
  },

  {
    id: 'sn-008',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '初めての料理に挑戦するとき',
    optionA: { text: 'レシピ通りに正確に\n作ることから始める', weight: 0.9 },
    optionB: { text: '自分なりのアレンジを\nすぐ試したくなる', weight: -0.8 },
    active: true,
    difficulty: 'easy',
    tags: ['lifestyle', 'creativity'],
  },

  {
    id: 'sn-009',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '面白い記事を読んだあと、\n印象に残るのは',
    optionA: { text: '紹介されていた\n具体的な事実やデータ', weight: 0.8 },
    optionB: { text: '記事全体から感じた\n雰囲気や示唆', weight: -0.8 },
    active: true,
    difficulty: 'hard',
    tags: ['information', 'memory'],
  },

  {
    id: 'sn-010',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '仕事の説明をするとき、\n自然と多くなるのは',
    optionA: { text: '具体例や数字で示すこと', weight: 0.8 },
    optionB: { text: '比喩やイメージで伝えること', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['work', 'communication'],
  },

  {
    id: 'sn-011',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '新しい技術や流行のニュースを見たとき',
    optionA: { text: 'まず実用面で\n何ができるかを考える', weight: 0.8 },
    optionB: { text: 'これがどう世界を\n変えるか\n想像してしまう', weight: -1.0 },
    active: true,
    difficulty: 'easy',
    tags: ['future', 'tech'],
  },

  {
    id: 'sn-012',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '部屋の模様替えをするとき',
    optionA: { text: '使い勝手や\n生活動線を優先する', weight: 0.8 },
    optionB: { text: '理想の雰囲気を\nイメージしてから決める', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['lifestyle', 'design'],
  },

  {
    id: 'sn-013',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '映画や小説で、より好みなのは',
    optionA: { text: '実話ベースや日常を\n丁寧に描いた作品', weight: 0.7 },
    optionB: { text: 'ファンタジーや\n哲学的な\nテーマの作品', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['leisure', 'preference'],
  },

  {
    id: 'sn-014',
    axis: 'SN',
    format: 'situation',
    locale: 'ja',
    content: '誰かに何かを学ぶとき、\n効率的に感じるのは',
    optionA: { text: '実演を見せてもらいながら\n手順を覚える', weight: 0.9 },
    optionB: { text: '理屈や全体像を\n先に理解する', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['learning', 'style'],
  },

  // ─────────────────────────────────────
  // 二択（短い選好ペア）6問
  // ─────────────────────────────────────

  {
    id: 'sn-015',
    axis: 'SN',
    format: 'binary',
    locale: 'ja',
    content: '信頼できると感じる情報源は',
    optionA: { text: '実際に体験した人の話', weight: 0.9 },
    optionB: { text: '理論的に筋が通った話', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['trust', 'information'],
  },

  {
    id: 'sn-016',
    axis: 'SN',
    format: 'binary',
    locale: 'ja',
    content: '関心が向きやすいのは',
    optionA: { text: '今、目の前にあること', weight: 1.0 },
    optionB: { text: 'これから起こりうること', weight: -1.0 },
    active: true,
    difficulty: 'easy',
    tags: ['core', 'attention'],
  },

  {
    id: 'sn-017',
    axis: 'SN',
    format: 'binary',
    locale: 'ja',
    content: '自分を表す言葉に近いのは',
    optionA: { text: '現実的・着実', weight: 0.8 },
    optionB: { text: '想像的・ひらめき型', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['self_image'],
  },

  {
    id: 'sn-018',
    axis: 'SN',
    format: 'binary',
    locale: 'ja',
    content: '物事の判断材料として重視するのは',
    optionA: { text: '過去の実績やデータ', weight: 0.9 },
    optionB: { text: 'これからの可能性', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['decision'],
  },

  {
    id: 'sn-019',
    axis: 'SN',
    format: 'binary',
    locale: 'ja',
    content: '頭の中で動きやすいのは',
    optionA: { text: '具体的なイメージ', weight: 0.7 },
    optionB: { text: '抽象的な概念', weight: -0.8 },
    active: true,
    difficulty: 'hard',
    tags: ['cognition'],
  },

  {
    id: 'sn-020',
    axis: 'SN',
    format: 'binary',
    locale: 'ja',
    content: '心地よく感じるのは',
    optionA: { text: '見通しが立っている状態', weight: 0.7 },
    optionB: { text: '何が起こるか分からない可能性', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['comfort'],
  },
];
