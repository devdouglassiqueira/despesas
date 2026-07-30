import { parseOfxTransactions } from './ofx-parser';

describe('parseOfxTransactions', () => {
  it('extracts transaction fields from OFX without parsing external entities', () => {
    const content = `
      <OFX><BANKMSGSRSV1><STMTTRNRS><STMTRS><BANKTRANLIST>
      <STMTTRN><TRNTYPE>DEBIT<DTPOSTED>20260730120000<TRNAMT>-25.50<MEMO>Mercado<FITID>abc</STMTTRN>
      </BANKTRANLIST></STMTRS></STMTTRNRS></BANKMSGSRSV1></OFX>`;

    expect(parseOfxTransactions(content)).toEqual([
      {
        TRNTYPE: 'DEBIT',
        DTPOSTED: '20260730120000',
        TRNAMT: '-25.50',
        MEMO: 'Mercado',
        FITID: 'abc',
      },
    ]);
  });

  it('returns no transaction for malformed content', () => {
    expect(parseOfxTransactions('<!DOCTYPE OFX SYSTEM "untrusted">')).toEqual(
      [],
    );
  });
});
