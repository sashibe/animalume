import type { Question, Axis, Localized } from '../shared/types';

const emptyLoc = (): Localized => ({ ja: '', ko: '' });

function generateId(): string {
  return Math.random().toString(36).slice(2, 10);
}

export function newQuestion(axis: Axis = 'EI'): Question {
  return {
    id: generateId(),
    axis,
    content: emptyLoc(),
    optionA: { text: emptyLoc(), weight: 1 },
    optionB: { text: emptyLoc(), weight: -1 },
  };
}

export const AXIS_POLES: Record<Axis, { positive: string; negative: string; label: string }> = {
  EI: { positive: 'E（外向）', negative: 'I（内向）', label: '外向 ↔ 内向' },
  SN: { positive: 'S（感覚）', negative: 'N（直観）', label: '感覚 ↔ 直観' },
  TF: { positive: 'T（思考）', negative: 'F（感情）', label: '思考 ↔ 感情' },
  JP: { positive: 'J（判断）', negative: 'P（知覚）', label: '判断 ↔ 知覚' },
};
