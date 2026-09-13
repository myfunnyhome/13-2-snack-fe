const SMALL_UNITS: readonly string[] = ['', '십', '백', '천'];
const LARGE_UNITS: readonly string[] = ['', '만', '억', '조'];
const SMALL_UNIT_VALUES: readonly number[] = [1, 10, 100, 1000];

export function parseWonAmount(value: string): number {
  const digits = value.replace(/\D/g, '');

  if (digits === '') {
    return 0;
  }

  return Number(digits);
}

export function formatWonInput(value: string): string {
  const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');

  if (digits === '') {
    return '';
  }

  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatKoreanNumberGroup(
  groupValue: number,
  largeUnit: string,
): string {
  if (groupValue === 0) {
    return '';
  }

  const parts: string[] = [];
  let remaining = groupValue;

  for (let unitIndex = 3; unitIndex >= 0; unitIndex -= 1) {
    const unitValue = SMALL_UNIT_VALUES[unitIndex];
    const digit = Math.floor(remaining / unitValue);
    remaining %= unitValue;

    if (digit === 0) {
      continue;
    }

    parts.push(`${digit}${SMALL_UNITS[unitIndex]}`);
  }

  parts[parts.length - 1] += largeUnit;

  return parts.join(' ');
}

export function toKoreanWon(amount: number): string {
  if (!Number.isFinite(amount) || amount <= 0) {
    return '0원';
  }

  const integerAmount = Math.floor(amount);
  const groupTexts: string[] = [];
  let remaining = integerAmount;
  let largeUnitIndex = 0;

  while (remaining > 0 && largeUnitIndex < LARGE_UNITS.length) {
    const groupValue = remaining % 10000;
    remaining = Math.floor(remaining / 10000);

    const groupText = formatKoreanNumberGroup(
      groupValue,
      LARGE_UNITS[largeUnitIndex],
    );

    if (groupText !== '') {
      groupTexts.unshift(groupText);
    }

    largeUnitIndex += 1;
  }

  if (groupTexts.length === 0) {
    return '0원';
  }

  return `${groupTexts.join(' ')} 원`;
}
