/**
 * Animalume - E/I軸 問題プール（日本語）
 *
 * 構成: 状況提示型14問 + 二択6問 = 計20問
 * ターゲット: 森香澄世代（20代後半〜30代前半キャリア女性）
 *
 * weight の意味:
 *   - 範囲: -1.0 〜 +1.0
 *   - 正の値が E（外向）、負の値が I（内向）への寄与
 *   - 絶対値の大きさ＝判別への寄与度（後にD係数で自動更新予定）
 *
 * 抽選ロジック: 層化サンプリング、このプールから10問抽選される
 */

export type Question = {
  id: string;
  axis: 'EI' | 'SN' | 'TF' | 'JP';
  format: 'situation' | 'binary' | 'likert';
  locale: 'ja' | 'ko';
  content: string;
  optionA: { text: string; weight: number };
  optionB: { text: string; weight: number };
  active: boolean;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
};

export const eiPoolJa: Question[] = [
  // ─────────────────────────────────────
  // 状況提示型（14問）
  // ─────────────────────────────────────

  {
    id: 'ei-001',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: '仕事で大きな成果を出した直後、まず思い浮かぶ過ごし方は？',
    optionA: { text: '同僚や友人と一緒に祝いたい', weight: 1.0 },
    optionB: { text: '一人で静かに余韻に浸りたい', weight: -1.0 },
    active: true,
    difficulty: 'easy',
    tags: ['career', 'celebration'],
  },

  {
    id: 'ei-002',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: '新しいプロジェクトのキックオフ会議で、自分の動き方は？',
    optionA: { text: '初対面の人にも積極的に話しかけて関係を作る', weight: 0.9 },
    optionB: { text: 'まず周りの様子を見て、雰囲気を掴んでから動く', weight: -0.7 },
    active: true,
    difficulty: 'easy',
    tags: ['career', 'first_meeting'],
  },

  {
    id: 'ei-003',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: '友人の結婚式の二次会で、知らない人ばかりの席に案内された',
    optionA: { text: '隣の人に自然と話しかけられる', weight: 1.0 },
    optionB: { text: '食事を進めながら、誰かが話しかけてくれるのを待つ', weight: -0.8 },
    active: true,
    difficulty: 'easy',
    tags: ['social', 'wedding'],
  },

  {
    id: 'ei-004',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: '仕事終わりの夜、自由な時間が3時間ある',
    optionA: { text: '誰かを誘ってご飯か飲みに行きたい', weight: 0.9 },
    optionB: { text: '家でゆっくり本や映画を楽しみたい', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['leisure', 'evening'],
  },

  {
    id: 'ei-005',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: 'アイデアを練るとき、どちらが自然？',
    optionA: { text: '誰かと話しながら考えると整理される', weight: 0.9 },
    optionB: { text: '一人で考え込んでから人に話す', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['thinking', 'work'],
  },

  {
    id: 'ei-006',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: '休日に予定が一日空いた',
    optionA: { text: '誰かを誘って外に出かけたくなる', weight: 0.9 },
    optionB: { text: '家で好きなことをして過ごせると嬉しい', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['leisure', 'weekend'],
  },

  {
    id: 'ei-007',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: 'SNSで近況を投稿するときの自分のスタイル',
    optionA: { text: '気軽に頻繁に投稿する', weight: 0.7 },
    optionB: { text: '投稿は控えめ、見る専門に近い', weight: -0.7 },
    active: true,
    difficulty: 'easy',
    tags: ['sns', 'communication'],
  },

  {
    id: 'ei-008',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: '大事な決断について悩んでいるとき',
    optionA: { text: '何人かに相談して、話すうちに整理したい', weight: 0.8 },
    optionB: { text: '自分の中で考えがまとまるまで人には言わない', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['decision', 'introspection'],
  },

  {
    id: 'ei-009',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: '大人数の集まりに2時間参加した後の気持ちは？',
    optionA: { text: 'もっと盛り上がりたい、二次会にも行きたい', weight: 1.0 },
    optionB: { text: '楽しかったけど、そろそろ一人時間が欲しい', weight: -1.0 },
    active: true,
    difficulty: 'easy',
    tags: ['social', 'energy'],
  },

  {
    id: 'ei-010',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: '仕事のチャットで返信が必要なとき',
    optionA: { text: '思いついた瞬間に、短くても返す', weight: 0.6 },
    optionB: { text: '内容を整えてから送る', weight: -0.6 },
    active: true,
    difficulty: 'medium',
    tags: ['work', 'communication'],
  },

  {
    id: 'ei-011',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: '旅行先での理想的な過ごし方は？',
    optionA: { text: 'その土地の人や旅人と交流したい', weight: 0.8 },
    optionB: { text: '知らない場所をひとりで歩く時間が好き', weight: -0.8 },
    active: true,
    difficulty: 'easy',
    tags: ['travel', 'leisure'],
  },

  {
    id: 'ei-012',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: '初対面の人と話すとき、自然と多くなるのは',
    optionA: { text: '自分の話を共有すること', weight: 0.7 },
    optionB: { text: '相手の話を聞くこと', weight: -0.6 },
    active: true,
    difficulty: 'medium',
    tags: ['communication', 'first_meeting'],
  },

  {
    id: 'ei-013',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: 'ストレスが溜まったとき、回復のために必要なのは',
    optionA: { text: '信頼できる人と話すこと', weight: 0.9 },
    optionB: { text: '一人で過ごす時間', weight: -1.0 },
    active: true,
    difficulty: 'easy',
    tags: ['wellbeing', 'recovery'],
  },

  {
    id: 'ei-014',
    axis: 'EI',
    format: 'situation',
    locale: 'ja',
    content: '新しい趣味を始めるなら、どんな形がいい？',
    optionA: { text: 'コミュニティやサークルに参加する形', weight: 0.8 },
    optionB: { text: 'ひとりで黙々と取り組める形', weight: -0.8 },
    active: true,
    difficulty: 'easy',
    tags: ['hobby', 'lifestyle'],
  },

  // ─────────────────────────────────────
  // 二択（短い選好ペア）6問
  // ─────────────────────────────────────

  {
    id: 'ei-015',
    axis: 'EI',
    format: 'binary',
    locale: 'ja',
    content: '友人関係のスタイルに近いのは',
    optionA: { text: '広く浅く、いろんな人と', weight: 0.8 },
    optionB: { text: '少人数で深く', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['relationship', 'preference'],
  },

  {
    id: 'ei-016',
    axis: 'EI',
    format: 'binary',
    locale: 'ja',
    content: 'エネルギーがチャージされる源は',
    optionA: { text: '人と関わること', weight: 1.0 },
    optionB: { text: '一人になる時間', weight: -1.0 },
    active: true,
    difficulty: 'easy',
    tags: ['core', 'energy'],
  },

  {
    id: 'ei-017',
    axis: 'EI',
    format: 'binary',
    locale: 'ja',
    content: '自分を表す言葉に近いのは',
    optionA: { text: 'にぎやか・行動的', weight: 0.8 },
    optionB: { text: '落ち着き・思慮深い', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['self_image'],
  },

  {
    id: 'ei-018',
    axis: 'EI',
    format: 'binary',
    locale: 'ja',
    content: '新しい場所での自分の傾向',
    optionA: { text: 'わりとすぐに馴染む', weight: 0.7 },
    optionB: { text: '馴染むのに時間がかかる', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['adaptation'],
  },

  {
    id: 'ei-019',
    axis: 'EI',
    format: 'binary',
    locale: 'ja',
    content: '会話のなかで自然なふるまいは',
    optionA: { text: 'その場で考えながら話す', weight: 0.6 },
    optionB: { text: '言いたいことを整えてから話す', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['communication'],
  },

  {
    id: 'ei-020',
    axis: 'EI',
    format: 'binary',
    locale: 'ja',
    content: '周りの人から見た自分は、どちらに近いと思う？',
    optionA: { text: '話しかけやすい人', weight: 0.5 },
    optionB: { text: '落ち着いた人', weight: -0.5 },
    active: true,
    difficulty: 'hard',
    tags: ['social_perception'],
  },
];
