const PASSWORD_MIN_LENGTH = 8;
const PASSWORD_MAX_LENGTH = 64;

export function validatePasswordLength(value: string): true | string {
  const trimmed = value.trim();

  if (trimmed.length < PASSWORD_MIN_LENGTH) {
    return '8자 이상 입력해주세요';
  }

  if (trimmed.length > PASSWORD_MAX_LENGTH) {
    return '64자 이하로 입력해주세요';
  }

  return true;
}

export function validatePasswordMatch(
  value: string,
  password: string,
): true | string {
  return value.trim() === password.trim() || '비밀번호가 일치하지 않습니다';
}
