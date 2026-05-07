/**
 * Animalume - T/F軸 問題プール（韓国語）
 *
 * T축(사고) vs F축(감정)
 * 일본어 버전(tf-pool.ja.ts)을 기반으로 한국어 작성.
 *
 * 注: ネイティブレビュー前のClaudeドラフト
 */

import type { Question } from './types';

export const tfPoolKo: Question[] = [
  // ─────────────────────────────────────
  // 状況提示型（14問）
  // ─────────────────────────────────────

  {
    id: 'tf-001',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '친구에게 고민 상담을 받았을 때, 자연스럽게 먼저 나오는 반응은',
    optionA: { text: '상황을 정리해서 함께 해결책을 생각한다', weight: 0.9 },
    optionB: { text: '먼저 마음에 공감하며 들어준다', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['relationship', 'support'],
  },

  {
    id: 'tf-002',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '팀 안에서 의견이 갈렸을 때, 더 중요하게 여기는 것은',
    optionA: { text: '어떤 안이 가장 합리적인가를 기준으로 결정한다', weight: 0.9 },
    optionB: { text: '관련된 모두가 납득할 수 있는 합의점을 찾는다', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['work', 'decision'],
  },

  {
    id: 'tf-003',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '영화나 드라마를 보고 "좋은 작품이다"라고 느끼는 순간은',
    optionA: { text: '구성이 치밀하고, 스토리에 납득감이 있을 때', weight: 0.7 },
    optionB: { text: '등장인물의 감정에 깊이 공감했을 때', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['leisure', 'preference'],
  },

  {
    id: 'tf-004',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '후배의 실수를 지적할 때',
    optionA: { text: '무엇이 문제인지, 어떻게 개선할지를 솔직하게 전한다', weight: 0.9 },
    optionB: { text: '상대가 위축되지 않도록, 전달 방식을 고민한다', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['work', 'feedback'],
  },

  {
    id: 'tf-005',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '누군가를 평가할 때, 더 비중을 두는 것은',
    optionA: { text: '내고 있는 성과나 능력', weight: 0.9 },
    optionB: { text: '인품이나 주변과 어울리는 방식', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['evaluation', 'people'],
  },

  {
    id: 'tf-006',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '논의 중 상대가 감정적으로 변할 때',
    optionA: { text: '침착하게 대화를 이어가려고 한다', weight: 0.8 },
    optionB: { text: '잠시 멈추고, 마음을 가다듬을 시간을 만든다', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['conflict', 'communication'],
  },

  {
    id: 'tf-007',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '무언가를 결정할 때, 마지막 결정의 근거가 되는 것은',
    optionA: { text: '객관적으로 봤을 때 논리적인가', weight: 1.0 },
    optionB: { text: '나와 주변 사람들에게 편안한가', weight: -1.0 },
    active: true,
    difficulty: 'easy',
    tags: ['core', 'decision'],
  },

  {
    id: 'tf-008',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '누군가가 눈물을 흘리는 모습을 봤을 때, 자연스러운 반응은',
    optionA: { text: '먼저 무슨 일이 있었는지 이해하려 한다', weight: 0.7 },
    optionB: { text: '곁에서 마음에 공감하려 한다', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['empathy', 'response'],
  },

  {
    id: 'tf-009',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '책이나 뉴스를 읽으며 강하게 반응하게 되는 것은',
    optionA: { text: '논리의 짜임새나 사실의 정확성', weight: 0.8 },
    optionB: { text: '거기에 그려진 사람들의 처지나 감정', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['information', 'reaction'],
  },

  {
    id: 'tf-010',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '누군가에게 칭찬을 받았을 때, 더 기쁜 쪽은',
    optionA: { text: '구체적인 성과나 능력을 인정받았을 때', weight: 0.8 },
    optionB: { text: '인품이나 태도를 인정받았을 때', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['praise', 'self'],
  },

  {
    id: 'tf-011',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '맞는 말이지만 상대에게 상처가 될 것 같은 상황에서',
    optionA: { text: '그래도 사실은 전해야 한다고 생각한다', weight: 0.9 },
    optionB: { text: '전달 방식을 바꾸거나, 다른 기회로 미룬다', weight: -0.9 },
    active: true,
    difficulty: 'hard',
    tags: ['ethics', 'communication'],
  },

  {
    id: 'tf-012',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '내가 잘못했다는 것을 깨달았을 때',
    optionA: { text: '왜 잘못했는지, 원인을 분석하고 싶어진다', weight: 0.8 },
    optionB: { text: '폐를 끼친 사람에 대한 미안함이 먼저 든다', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['self_reflection'],
  },

  {
    id: 'tf-013',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '인간관계에서 갈등이 생겼을 때',
    optionA: { text: '어디에서 어떻게 어긋났는지 정리하고 싶다', weight: 0.7 },
    optionB: { text: '관계를 어떻게 회복할지를 우선한다', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['relationship', 'conflict'],
  },

  {
    id: 'tf-014',
    axis: 'TF',
    format: 'situation',
    locale: 'ko',
    content: '존경하는 사람의 유형으로 더 끌리는 쪽은',
    optionA: { text: '판단이 공정하고, 흔들림 없는 사람', weight: 0.8 },
    optionB: { text: '사람의 마음을 소중히 하는, 따뜻한 사람', weight: -0.9 },
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
    locale: 'ko',
    content: '판단의 기준에 더 가까운 것은',
    optionA: { text: '맞는가, 틀린가', weight: 0.9 },
    optionB: { text: '좋은가, 나쁜가 (사람에게)', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['core', 'judgment'],
  },

  {
    id: 'tf-016',
    axis: 'TF',
    format: 'binary',
    locale: 'ko',
    content: '소중하게 여기고 싶은 것은',
    optionA: { text: '일관성 있는 판단', weight: 0.8 },
    optionB: { text: '상대와 상황에 대한 배려', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['values'],
  },

  {
    id: 'tf-017',
    axis: 'TF',
    format: 'binary',
    locale: 'ko',
    content: '나를 표현하는 말에 가까운 것은',
    optionA: { text: '냉정함·분석적', weight: 0.8 },
    optionB: { text: '공감적·다정함', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['self_image'],
  },

  {
    id: 'tf-018',
    axis: 'TF',
    format: 'binary',
    locale: 'ko',
    content: '들으면 조금 마음에 걸리는 말은',
    optionA: { text: '"너무 감정적이다"라는 말', weight: 0.7 },
    optionB: { text: '"차갑다"라는 말', weight: -0.8 },
    active: true,
    difficulty: 'hard',
    tags: ['vulnerability'],
  },

  {
    id: 'tf-019',
    axis: 'TF',
    format: 'binary',
    locale: 'ko',
    content: '회의나 논의에서 인정받고 싶은 능력은',
    optionA: { text: '논점을 정리하는 힘', weight: 0.8 },
    optionB: { text: '분위기를 모으는 힘', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['work', 'self_image'],
  },

  {
    id: 'tf-020',
    axis: 'TF',
    format: 'binary',
    locale: 'ko',
    content: '누군가와 부딪힌 뒤, 더 신경 쓰이는 것은',
    optionA: { text: '어느 쪽 주장이 맞았는지', weight: 0.7 },
    optionB: { text: '상대와의 관계가 회복될 수 있을지', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['conflict', 'aftermath'],
  },
];
