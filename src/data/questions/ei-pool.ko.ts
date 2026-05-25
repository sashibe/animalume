/**
 * Animalume - E/I軸 問題プール（韓国語）
 *
 * 일본어 버전(ei-pool.ja.ts)을 기반으로 한국어로 작성.
 * 20-30대 여성이 위화감 없이 읽을 수 있는 자연스러운 현대 한국어.
 *
 * 원칙:
 * - 존댓말 베이스, 너무 딱딱하지 않게
 * - "당신" 남용 회피 (한국어 MBTI 테스트는 보통 "나는~" 스타일)
 * - 질문은 중립적인 의문형, 선택지는 "~한다", "~하는 편이다" 등 자연스러운 형식
 *
 * 注: ネイティブレビュー前のClaudeドラフト
 */


import type { Question } from './types';

export const eiPoolKo: Question[] = [
  {
    id: 'ei-001',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: '업무에서 큰 성과를 낸 직후, 가장 먼저 떠오르는 방식은?',
    optionA: {
      text: '동료나 친구와 함께 축하하고 싶다',
      weight: 1,
    },
    optionB: {
      text: '혼자서 조용히 여운을 즐기고 싶다',
      weight: -1,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'career',
      'celebration',
    ],
  },
  {
    id: 'ei-002',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: '새로운 프로젝트 킥오프 회의에서, 자신의 행동 방식은?',
    optionA: {
      text: '처음 만나는 사람에게도 적극적으로 말을 걸며 관계를 만든다',
      weight: 0.9,
    },
    optionB: {
      text: '먼저 분위기를 파악한 뒤에 움직이는 편이다',
      weight: -0.7,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'career',
      'first_meeting',
    ],
  },
  {
    id: 'ei-003',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: '친구의 결혼식 2차 자리에서, 모르는 사람들 사이에 앉게 되었다',
    optionA: {
      text: '옆 사람에게 자연스럽게 말을 걸 수 있다',
      weight: 1,
    },
    optionB: {
      text: '식사를 하면서, 누군가 말을 걸어주기를 기다린다',
      weight: -0.8,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'social',
      'wedding',
    ],
  },
  {
    id: 'ei-004',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: '퇴근 후 저녁, 자유로운 시간이 3시간 있다',
    optionA: {
      text: '친구를 불러서 식사나 한잔하러 가고 싶다',
      weight: 0.9,
    },
    optionB: {
      text: '집에서 책이나 영화를 천천히 즐기고 싶다',
      weight: -0.9,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'leisure',
      'evening',
    ],
  },
  {
    id: 'ei-005',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: '아이디어를 정리할 때, 더 자연스러운 쪽은?',
    optionA: {
      text: '누군가와 이야기하며 생각을 정리하는 편이다',
      weight: 0.9,
    },
    optionB: {
      text: '혼자 충분히 고민한 뒤에 사람들에게 이야기한다',
      weight: -0.9,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'thinking',
      'work',
    ],
  },
  {
    id: 'ei-006',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: '주말에 하루가 통째로 비었다',
    optionA: {
      text: '누군가를 불러서 밖으로 나가고 싶어진다',
      weight: 0.9,
    },
    optionB: {
      text: '집에서 좋아하는 일을 하며 보내고 싶다',
      weight: -0.9,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'leisure',
      'weekend',
    ],
  },
  {
    id: 'ei-007',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: 'SNS에 일상을 공유할 때, 나의 스타일은?',
    optionA: {
      text: '부담 없이 자주 올리는 편이다',
      weight: 0.7,
    },
    optionB: {
      text: '잘 올리지 않고, 보는 쪽에 가깝다',
      weight: -0.7,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'sns',
      'communication',
    ],
  },
  {
    id: 'ei-008',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: '중요한 결정을 두고 고민할 때',
    optionA: {
      text: '여러 사람에게 상담하면서 정리하고 싶다',
      weight: 0.8,
    },
    optionB: {
      text: '내 안에서 정리될 때까지 다른 사람에게 말하지 않는다',
      weight: -0.9,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'decision',
      'introspection',
    ],
  },
  {
    id: 'ei-009',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: '많은 사람들이 모인 자리에 두 시간 정도 있은 후의 기분은?',
    optionA: {
      text: '더 어울리고 싶고, 2차도 가고 싶다',
      weight: 1,
    },
    optionB: {
      text: '즐거웠지만, 이제 혼자 있는 시간이 필요하다',
      weight: -1,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'social',
      'energy',
    ],
  },
  {
    id: 'ei-010',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: '업무 메신저에 답장이 필요할 때',
    optionA: {
      text: '떠오른 순간 짧게라도 바로 답한다',
      weight: 0.6,
    },
    optionB: {
      text: '내용을 정리한 뒤에 보낸다',
      weight: -0.6,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'work',
      'communication',
    ],
  },
  {
    id: 'ei-011',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: '여행지에서 이상적으로 보내고 싶은 시간은?',
    optionA: {
      text: '현지 사람들이나 다른 여행자와 어울리고 싶다',
      weight: 0.8,
    },
    optionB: {
      text: '낯선 곳을 혼자 걸어 다니는 시간이 좋다',
      weight: -0.8,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'travel',
      'leisure',
    ],
  },
  {
    id: 'ei-012',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: '처음 만난 사람과 이야기할 때, 자연스럽게 더 많아지는 것은',
    optionA: {
      text: '내 이야기를 공유하는 쪽',
      weight: 0.7,
    },
    optionB: {
      text: '상대의 이야기를 듣는 쪽',
      weight: -0.6,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'communication',
      'first_meeting',
    ],
  },
  {
    id: 'ei-013',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: '스트레스가 쌓였을 때, 회복을 위해 필요한 것은',
    optionA: {
      text: '믿을 수 있는 사람과 이야기하는 시간',
      weight: 0.9,
    },
    optionB: {
      text: '혼자 보내는 시간',
      weight: -1,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'wellbeing',
      'recovery',
    ],
  },
  {
    id: 'ei-014',
    axis: 'EI',
    format: 'situation',
    locale: 'ko',
    content: '새로운 취미를 시작한다면, 어떤 형태가 좋은가?',
    optionA: {
      text: '커뮤니티나 모임에 참여하는 형태',
      weight: 0.8,
    },
    optionB: {
      text: '혼자서 묵묵히 할 수 있는 형태',
      weight: -0.8,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'hobby',
      'lifestyle',
    ],
  },
  {
    id: 'ei-015',
    axis: 'EI',
    format: 'binary',
    locale: 'ko',
    content: '인간관계 스타일에 가까운 것은',
    optionA: {
      text: '넓고 얕게, 다양한 사람들과',
      weight: 0.8,
    },
    optionB: {
      text: '소수의 사람들과 깊게',
      weight: -0.8,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'relationship',
      'preference',
    ],
  },
  {
    id: 'ei-016',
    axis: 'EI',
    format: 'binary',
    locale: 'ko',
    content: '에너지가 충전되는 원천은',
    optionA: {
      text: '사람들과 어울리는 시간',
      weight: 1,
    },
    optionB: {
      text: '혼자 있는 시간',
      weight: -1,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'core',
      'energy',
    ],
  },
  {
    id: 'ei-017',
    axis: 'EI',
    format: 'binary',
    locale: 'ko',
    content: '나를 표현하는 말에 가까운 것은',
    optionA: {
      text: '활발함·행동파',
      weight: 0.8,
    },
    optionB: {
      text: '차분함·사려 깊음',
      weight: -0.8,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'self_image',
    ],
  },
  {
    id: 'ei-018',
    axis: 'EI',
    format: 'binary',
    locale: 'ko',
    content: '새로운 환경에서의 나는',
    optionA: {
      text: '비교적 빨리 적응하는 편',
      weight: 0.7,
    },
    optionB: {
      text: '적응하는 데 시간이 걸리는 편',
      weight: -0.7,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'adaptation',
    ],
  },
  {
    id: 'ei-019',
    axis: 'EI',
    format: 'binary',
    locale: 'ko',
    content: '대화 중 자연스러운 모습은',
    optionA: {
      text: '그 자리에서 생각하며 말한다',
      weight: 0.6,
    },
    optionB: {
      text: '하고 싶은 말을 정리한 뒤 말한다',
      weight: -0.7,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'communication',
    ],
  },
  {
    id: 'ei-020',
    axis: 'EI',
    format: 'binary',
    locale: 'ko',
    content: '주변 사람들에게 비치는 나의 모습은, 어느 쪽에 가까운가?',
    optionA: {
      text: '말 걸기 쉬운 사람',
      weight: 0.5,
    },
    optionB: {
      text: '차분한 사람',
      weight: -0.5,
    },
    active: true,
    difficulty: 'hard',
    tags: [
      'social_perception',
    ],
  },
];
