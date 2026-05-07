/**
 * Animalume - J/P軸 問題プール（韓国語）
 *
 * J축(판단) vs P축(인식)
 * 일본어 버전(jp-pool.ja.ts)을 기반으로 한국어 작성.
 *
 * 注: ネイティブレビュー前のClaudeドラフト
 */

import type { Question } from './types';

export const jpPoolKo: Question[] = [
  // ─────────────────────────────────────
  // 状況提示型（14問）
  // ─────────────────────────────────────

  {
    id: 'jp-001',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '여행을 갈 때, 자연스럽게 취하는 스타일은',
    optionA: { text: '출발 전에 일정을 충분히 짜둔다', weight: 0.9 },
    optionB: { text: '큰 틀만 정해두고, 현지에서 유연하게 움직인다', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['travel', 'planning'],
  },

  {
    id: 'jp-002',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '마감이 있는 일을 대하는 방식',
    optionA: { text: '일찍 시작해서, 여유 있게 끝낸다', weight: 0.9 },
    optionB: { text: '마감이 가까워질수록 집중이 잘 된다', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['work', 'deadline'],
  },

  {
    id: 'jp-003',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '주말을 보내는 방식 중, 더 편안하게 느껴지는 것은',
    optionA: { text: '아침부터 일정을 잡고 움직이는 쪽이 충실하다', weight: 0.8 },
    optionB: { text: '그날의 기분에 따라 정해 나가는 쪽이 좋다', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['leisure', 'weekend'],
  },

  {
    id: 'jp-004',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '할 일 목록(To-Do)을 다루는 방식',
    optionA: { text: '리스트로 적어두고, 하나씩 지워나가는 것이 좋다', weight: 0.9 },
    optionB: { text: '리스트에 얽매이지 않고, 그때그때 움직이는 편이다', weight: -0.8 },
    active: true,
    difficulty: 'easy',
    tags: ['work', 'task'],
  },

  {
    id: 'jp-005',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '쇼핑하러 갈 때',
    optionA: { text: '필요한 것을 메모해서, 그대로 산다', weight: 0.8 },
    optionB: { text: '매장에서 보고, 마음에 끌린 것을 산다', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['lifestyle', 'shopping'],
  },

  {
    id: 'jp-006',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '회의나 프로젝트를 진행할 때',
    optionA: { text: '안건을 정해두고, 그대로 진행하고 싶다', weight: 0.9 },
    optionB: { text: '대화의 흐름에 따라 유연하게 진행하고 싶다', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['work', 'meeting'],
  },

  {
    id: 'jp-007',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '방이나 책상의 상태로 마음이 편한 것은',
    optionA: { text: '물건이 제자리에 있고 정돈된 상태', weight: 0.7 },
    optionB: { text: '조금 어수선해도 나만의 배치가 있는 상태', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['lifestyle', 'environment'],
  },

  {
    id: 'jp-008',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '약속 시간에 대한 자신의 습관은',
    optionA: { text: '여유 있게 일찍 도착한다', weight: 0.8 },
    optionB: { text: '아슬아슬하게 도착할 때가 많다', weight: -0.7 },
    active: true,
    difficulty: 'easy',
    tags: ['punctuality'],
  },

  {
    id: 'jp-009',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '결정을 내리는 타이밍에 대해',
    optionA: { text: '일찍 결정하는 쪽이 마음이 편하다', weight: 0.9 },
    optionB: { text: '가능한 한 선택지를 열어두고 싶다', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['core', 'decision'],
  },

  {
    id: 'jp-010',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '예정이 갑자기 바뀌었을 때의 느낌',
    optionA: { text: '계획이 흐트러져서 살짝 스트레스를 받는다', weight: 0.8 },
    optionB: { text: '오히려 새로운 전개라 즐겁게 느껴진다', weight: -0.9 },
    active: true,
    difficulty: 'medium',
    tags: ['change', 'flexibility'],
  },

  {
    id: 'jp-011',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '일이나 공부를 진행하는 방식으로 자연스러운 것은',
    optionA: { text: '계획을 세우고, 그대로 진행하는 것이 좋다', weight: 0.9 },
    optionB: { text: '관심이 가는 대로, 곁가지를 즐기며 나아간다', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['work', 'style'],
  },

  {
    id: 'jp-012',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '식당에서 메뉴를 고를 때',
    optionA: { text: '메뉴를 보면 비교적 빨리 정한다', weight: 0.6 },
    optionB: { text: '망설이다가 좀처럼 정하지 못할 때가 많다', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['decision', 'daily'],
  },

  {
    id: 'jp-013',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '할 일이 많아졌을 때, 가장 먼저 하는 것은',
    optionA: { text: '정리해서 우선순위를 매기고 싶어진다', weight: 0.8 },
    optionB: { text: '되는 일부터 흐름에 맡기며 손을 댄다', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['task_management'],
  },

  {
    id: 'jp-014',
    axis: 'JP',
    format: 'situation',
    locale: 'ko',
    content: '여행 중 예상 밖의 일이 생기면',
    optionA: { text: '계획을 다시 세우고 싶어진다', weight: 0.7 },
    optionB: { text: '그것도 재미있게 느끼며 흐름에 맡긴다', weight: -0.9 },
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
    locale: 'ko',
    content: '더 만족감을 느끼기 쉬운 것은',
    optionA: { text: '성취감이 있는 하루', weight: 0.8 },
    optionB: { text: '여유와 여백이 있는 하루', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['satisfaction'],
  },

  {
    id: 'jp-016',
    axis: 'JP',
    format: 'binary',
    locale: 'ko',
    content: '나를 표현하는 말에 가까운 것은',
    optionA: { text: '계획적·꼼꼼함', weight: 0.8 },
    optionB: { text: '유연함·즉흥적', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['self_image'],
  },

  {
    id: 'jp-017',
    axis: 'JP',
    format: 'binary',
    locale: 'ko',
    content: '편안하게 느끼는 상태는',
    optionA: { text: '일이 정해져 있는 상태', weight: 0.9 },
    optionB: { text: '선택지가 열려 있는 상태', weight: -0.9 },
    active: true,
    difficulty: 'easy',
    tags: ['core', 'comfort'],
  },

  {
    id: 'jp-018',
    axis: 'JP',
    format: 'binary',
    locale: 'ko',
    content: '집중하는 방식에 가까운 것은',
    optionA: { text: '구간을 나눠 계획적으로', weight: 0.8 },
    optionB: { text: '몰입이 올 때 한 번에', weight: -0.7 },
    active: true,
    difficulty: 'medium',
    tags: ['work_style'],
  },

  {
    id: 'jp-019',
    axis: 'JP',
    format: 'binary',
    locale: 'ko',
    content: '결정을 내리는 타이밍은',
    optionA: { text: '가능한 한 빨리 결정한다', weight: 0.8 },
    optionB: { text: '가능한 한 판단을 미뤄둔다', weight: -0.8 },
    active: true,
    difficulty: 'medium',
    tags: ['decision_timing'],
  },

  {
    id: 'jp-020',
    axis: 'JP',
    format: 'binary',
    locale: 'ko',
    content: '스트레스를 더 잘 느끼는 상황은',
    optionA: { text: '예정이 자꾸 바뀔 때', weight: 0.7 },
    optionB: { text: '세세하게 정해진 대로 움직여야 할 때', weight: -0.7 },
    active: true,
    difficulty: 'hard',
    tags: ['stress'],
  },
];
