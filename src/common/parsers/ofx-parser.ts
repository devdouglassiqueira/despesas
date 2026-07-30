export type OfxTransaction = Record<string, string>;

const TRANSACTION_PATTERN = /<STMTTRN\b[^>]*>([\s\S]*?)<\/STMTTRN\s*>/gi;
const FIELD_PATTERN = /<([A-Z0-9_]+)\b[^>]*>\s*([^<\r\n]*)/gi;

/** Extracts only transaction fields from OFX SGML/XML files. */
export function parseOfxTransactions(content: string): OfxTransaction[] {
  const transactions: OfxTransaction[] = [];

  for (const match of content.matchAll(TRANSACTION_PATTERN)) {
    const transaction: OfxTransaction = {};
    FIELD_PATTERN.lastIndex = 0;
    for (const field of match[1].matchAll(FIELD_PATTERN)) {
      transaction[field[1].toUpperCase()] = field[2].trim();
    }
    if (Object.keys(transaction).length > 0) transactions.push(transaction);
  }

  return transactions;
}
