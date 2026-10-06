import { formatWonInput, parseWonAmount, toKoreanWon } from './toKoreanWon';

describe('toKoreanWon', () => {
  it('0 이하는 0원으로 표시한다', () => {
    expect(toKoreanWon(0)).toBe('0원');
    expect(toKoreanWon(-1)).toBe('0원');
  });

  it('피그마 예산 금액을 십·백·천만 단위로 변환한다', () => {
    expect(toKoreanWon(3500000)).toBe('3백 5십만 원');
  });

  it('만·천·백 단위를 띄어 쓴다', () => {
    expect(toKoreanWon(10000)).toBe('1만 원');
    expect(toKoreanWon(12300)).toBe('1만 2천 3백 원');
    expect(toKoreanWon(1000)).toBe('1천 원');
  });

  it('유한하지 않은 값은 0원으로 표시한다', () => {
    expect(toKoreanWon(Number.NaN)).toBe('0원');
    expect(toKoreanWon(Number.POSITIVE_INFINITY)).toBe('0원');
  });
});

describe('parseWonAmount', () => {
  it('숫자만 읽어 금액으로 바꾼다', () => {
    expect(parseWonAmount('3,500,000')).toBe(3500000);
    expect(parseWonAmount('3500000')).toBe(3500000);
  });

  it('빈 값과 숫자가 없으면 0이다', () => {
    expect(parseWonAmount('')).toBe(0);
    expect(parseWonAmount('원')).toBe(0);
  });
});

describe('formatWonInput', () => {
  it('1000단위마다 쉼표를 넣는다', () => {
    expect(formatWonInput('3500000')).toBe('3,500,000');
    expect(formatWonInput('1000')).toBe('1,000');
    expect(formatWonInput('100')).toBe('100');
  });

  it('이미 쉼표가 있어도 같은 형식으로 맞춘다', () => {
    expect(formatWonInput('3,500,000')).toBe('3,500,000');
  });

  it('빈 값은 빈 문자열이다', () => {
    expect(formatWonInput('')).toBe('');
  });
});
