const SENSITIVE_KEYS = new Set([
  'authorization',
  'cookie',
  'password',
  'senha',
  'token',
  'accesstoken',
  'refreshtoken',
  'secret',
  'cpf',
  'cnpj',
]);

const MAX_DEPTH = 5;
const MAX_STRING_LENGTH = 2000;

export function sanitizeLogData(value: unknown, depth = 0): unknown {
  if (value === null || value === undefined) return value;
  if (depth >= MAX_DEPTH) return '[TRUNCATED]';

  if (typeof value === 'string') {
    return value.length > MAX_STRING_LENGTH
      ? `${value.slice(0, MAX_STRING_LENGTH)}...[TRUNCATED]`
      : value;
  }

  if (typeof value !== 'object') return value;

  if (Array.isArray(value)) {
    return value.slice(0, 100).map((item) => sanitizeLogData(item, depth + 1));
  }

  return Object.fromEntries(
    Object.entries(value as Record<string, unknown>).map(([key, item]) => [
      key,
      SENSITIVE_KEYS.has(key.toLowerCase())
        ? '[REDACTED]'
        : sanitizeLogData(item, depth + 1),
    ]),
  );
}
