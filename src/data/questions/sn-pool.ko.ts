/**
 * Animalume - S/N軸 問題プール（韓国語）
 *
 * S軸(감각) vs N축(직관)
 * 일본어 버전(sn-pool.ja.ts)을 기반으로 한국어 작성.
 *
 * 注: ネイティブレビュー前のClaudeドラフト
 */

import type { Question } from './types';

export const snPoolKo: Question[] = [
  {
    id: 'sn-001',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '처음 가는 곳으로 여행 계획을 세울 때, 자연스러운 방식은?',
    optionA: {
      text: '실제로 다녀온 사람의 후기나 가이드를 참고한다',
      weight: 0.9,
    },
    optionB: {
      text: '그 지역의 역사나 문화적 배경을 알아보고 싶다',
      weight: -0.9,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'planning',
      'travel',
    ],
  },
  {
    id: 'sn-002',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '관심이 가는 책을 발견했을 때, 끌리는 쪽은',
    optionA: {
      text: '실제 사례나 노하우가 담긴 실용서',
      weight: 0.9,
    },
    optionB: {
      text: '추상적인 주제나 사상을 다룬 책',
      weight: -1,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'learning',
      'preference',
    ],
  },
  {
    id: 'sn-003',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '누군가의 이야기를 듣다 보면, 자연스럽게 주목하게 되는 것은',
    optionA: {
      text: '구체적인 사건이나 디테일',
      weight: 0.9,
    },
    optionB: {
      text: '이야기 뒤에 있는 의도나 주제',
      weight: -0.9,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'communication',
      'attention',
    ],
  },
  {
    id: 'sn-004',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '업무에서 새로운 방식을 고민할 때',
    optionA: {
      text: '지금 있는 방식을 개선하는 방향으로 생각한다',
      weight: 0.8,
    },
    optionB: {
      text: '전제부터 다시 보고 완전히 다른 발상을 시도하고 싶다',
      weight: -1,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'work',
      'innovation',
    ],
  },
  {
    id: 'sn-005',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '미술관에서 그림을 볼 때, 더 즐겁게 느껴지는 쪽은',
    optionA: {
      text: '그려진 소재나 기법을 관찰하는 것',
      weight: 0.8,
    },
    optionB: {
      text: '작가의 의도나 시대적 배경을 상상하는 것',
      weight: -0.8,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'art',
      'leisure',
    ],
  },
  {
    id: 'sn-006',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '미래에 대해 생각하는 시간이 더 길어지는 것은',
    optionA: {
      text: '현실적으로 이룰 수 있는 가까운 미래의 계획',
      weight: 0.9,
    },
    optionB: {
      text: '아직 형태가 없는 가능성이나 꿈',
      weight: -0.9,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'future',
      'planning',
    ],
  },
  {
    id: 'sn-007',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '대화 중 "재미있다"고 느끼는 순간은',
    optionA: {
      text: '생생한 경험담이나 구체적인 에피소드',
      weight: 0.8,
    },
    optionB: {
      text: '뜻밖의 시각이나 새로운 관점의 발견',
      weight: -0.9,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'communication',
      'curiosity',
    ],
  },
  {
    id: 'sn-008',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '처음 만들어 보는 요리에 도전할 때',
    optionA: {
      text: '레시피대로 정확하게 만드는 것부터 시작한다',
      weight: 0.9,
    },
    optionB: {
      text: '나만의 어레인지를 바로 시도해보고 싶어진다',
      weight: -0.8,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'lifestyle',
      'creativity',
    ],
  },
  {
    id: 'sn-009',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '흥미로운 글을 읽은 뒤, 더 인상에 남는 것은',
    optionA: {
      text: '소개되어 있던 구체적인 사실이나 데이터',
      weight: 0.8,
    },
    optionB: {
      text: '글 전체에서 느껴진 분위기나 시사점',
      weight: -0.8,
    },
    active: true,
    difficulty: 'hard',
    tags: [
      'information',
      'memory',
    ],
  },
  {
    id: 'sn-010',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '업무 내용을 설명할 때, 자연스럽게 많아지는 것은',
    optionA: {
      text: '구체적인 예나 숫자로 보여주는 것',
      weight: 0.8,
    },
    optionB: {
      text: '비유나 이미지로 전달하는 것',
      weight: -0.9,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'work',
      'communication',
    ],
  },
  {
    id: 'sn-011',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '새로운 기술이나 트렌드 뉴스를 접했을 때',
    optionA: {
      text: '먼저 실용적으로 무엇을 할 수 있을지 생각한다',
      weight: 0.8,
    },
    optionB: {
      text: '이게 세상을 어떻게 바꿀지 상상하게 된다',
      weight: -1,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'future',
      'tech',
    ],
  },
  {
    id: 'sn-012',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '방을 새로 꾸밀 때',
    optionA: {
      text: '사용성과 동선을 우선한다',
      weight: 0.8,
    },
    optionB: {
      text: '이상적인 분위기를 떠올린 뒤 결정한다',
      weight: -0.7,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'lifestyle',
      'design',
    ],
  },
  {
    id: 'sn-013',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '영화나 소설에서 더 좋아하는 쪽은',
    optionA: {
      text: '실화 기반이나 일상을 섬세하게 그린 작품',
      weight: 0.7,
    },
    optionB: {
      text: '판타지나 철학적 주제를 다룬 작품',
      weight: -0.9,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'leisure',
      'preference',
    ],
  },
  {
    id: 'sn-014',
    axis: 'SN',
    format: 'situation',
    locale: 'ko',
    content: '누군가에게 무언가를 배울 때, 효율적이라고 느끼는 방식은',
    optionA: {
      text: '직접 시연을 보면서 순서를 익힌다',
      weight: 0.9,
    },
    optionB: {
      text: '원리나 전체적인 그림을 먼저 이해한다',
      weight: -0.9,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'learning',
      'style',
    ],
  },
  {
    id: 'sn-015',
    axis: 'SN',
    format: 'binary',
    locale: 'ko',
    content: '신뢰할 수 있다고 느끼는 정보의 출처는',
    optionA: {
      text: '실제로 경험한 사람의 이야기',
      weight: 0.9,
    },
    optionB: {
      text: '논리적으로 설득력 있는 이야기',
      weight: -0.8,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'trust',
      'information',
    ],
  },
  {
    id: 'sn-016',
    axis: 'SN',
    format: 'binary',
    locale: 'ko',
    content: '관심이 향하기 쉬운 것은',
    optionA: {
      text: '지금, 눈앞에 있는 것',
      weight: 1,
    },
    optionB: {
      text: '앞으로 일어날 수 있는 것',
      weight: -1,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'core',
      'attention',
    ],
  },
  {
    id: 'sn-017',
    axis: 'SN',
    format: 'binary',
    locale: 'ko',
    content: '나를 표현하는 말에 가까운 것은',
    optionA: {
      text: '현실적·착실함',
      weight: 0.8,
    },
    optionB: {
      text: '상상력·아이디어형',
      weight: -0.8,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'self_image',
    ],
  },
  {
    id: 'sn-018',
    axis: 'SN',
    format: 'binary',
    locale: 'ko',
    content: '판단의 근거로 더 중요하게 여기는 것은',
    optionA: {
      text: '지난 실적이나 데이터',
      weight: 0.9,
    },
    optionB: {
      text: '앞으로의 가능성',
      weight: -0.9,
    },
    active: true,
    difficulty: 'easy',
    tags: [
      'decision',
    ],
  },
  {
    id: 'sn-019',
    axis: 'SN',
    format: 'binary',
    locale: 'ko',
    content: '머릿속에서 더 잘 떠오르는 것은',
    optionA: {
      text: '구체적인 이미지',
      weight: 0.7,
    },
    optionB: {
      text: '추상적인 개념',
      weight: -0.8,
    },
    active: true,
    difficulty: 'hard',
    tags: [
      'cognition',
    ],
  },
  {
    id: 'sn-020',
    axis: 'SN',
    format: 'binary',
    locale: 'ko',
    content: '편안하게 느끼는 상태는',
    optionA: {
      text: '앞이 보이는 안정된 상황',
      weight: 0.7,
    },
    optionB: {
      text: '무엇이 일어날지 모르는 열린 가능성',
      weight: -0.7,
    },
    active: true,
    difficulty: 'medium',
    tags: [
      'comfort',
    ],
  },
];
