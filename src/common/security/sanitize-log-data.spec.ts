import { sanitizeLogData } from './sanitize-log-data';

describe('sanitizeLogData', () => {
  it('masks sensitive values recursively', () => {
    expect(
      sanitizeLogData({
        email: 'user@example.com',
        password: 'secret-value',
        nested: { accessToken: 'jwt-value', cpf: '12345678900' },
      }),
    ).toEqual({
      email: 'user@example.com',
      password: '[REDACTED]',
      nested: { accessToken: '[REDACTED]', cpf: '[REDACTED]' },
    });
  });

  it('truncates oversized strings and arrays', () => {
    const result = sanitizeLogData({
      content: 'a'.repeat(2100),
      items: Array.from({ length: 120 }, (_, index) => index),
    }) as { content: string; items: number[] };

    expect(result.content).toContain('[TRUNCATED]');
    expect(result.items).toHaveLength(100);
  });
});
