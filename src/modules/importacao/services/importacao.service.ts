import { Injectable, BadRequestException } from '@nestjs/common';
import { parse as csvParse } from 'csv-parse/sync';
import { parseOfxTransactions } from '../../../common/parsers/ofx-parser';

@Injectable()
export class ImportacaoService {
  async parseFile(file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Arquivo não enviado');

    const ext = file.originalname?.split('.').pop()?.toLowerCase();

    const content = this.decodeFileContent(file.buffer);

    if (ext === 'ofx') {
      return this.parseOfx(content);
    } else if (ext === 'csv') {
      return this.parseCsv(content);
    } else {
      throw new BadRequestException('Formato não suportado. Use OFX ou CSV.');
    }
  }

  private parseOfx(content: string) {
    try {
      const transactions = parseOfxTransactions(content);

      if (transactions.length === 0) {
        throw new BadRequestException(
          'Nenhuma transação foi encontrada no arquivo OFX.',
        );
      }

      return transactions.map((t) => {
        // Formatar data: 20240108120000 -> 2024-01-08
        const rawDate = this.getOfxValue(t, 'DTPOSTED');
        const dateStr = rawDate.slice(0, 8); // YYYYMMDD
        if (!/^\d{8}$/.test(dateStr)) {
          throw new BadRequestException(
            'O arquivo OFX possui uma transação com data inválida.',
          );
        }
        const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;

        // Valor
        const valor = this.parseOfxAmount(this.getOfxValue(t, 'TRNAMT'));
        if (Number.isNaN(valor)) {
          throw new BadRequestException(
            'O arquivo OFX possui uma transação com valor inválido.',
          );
        }
        const tipo = valor < 0 ? 'saida' : 'entrada';
        const memo = this.getOfxValue(t, 'MEMO');
        let descricao = memo || this.getOfxValue(t, 'NAME') || 'Sem descrição';
        let categoria = '';

        // Regra para Contribuições
        if (
          descricao.includes('Pix recebida') ||
          descricao.includes('Transferência recebida')
        ) {
          descricao = 'Contribuições';
          categoria = 'Contribuições';
        }

        return {
          data: formattedDate,
          descricao: descricao,
          contato: this.extractContactFromDescription(memo), // Use original memo for contact extraction
          categoria: categoria,
          valor: Math.abs(valor).toFixed(2),
          tipo: tipo,
          rawId: this.getOfxValue(t, 'FITID'),
        };
      });
    } catch (e) {
      if (e instanceof BadRequestException) {
        throw e;
      }
      console.error('Erro ao parsear OFX', e);
      throw new BadRequestException('Erro ao ler arquivo OFX');
    }
  }

  private decodeFileContent(buffer: Buffer): string {
    const header = buffer.toString('latin1', 0, Math.min(buffer.length, 2048));
    const charset = header
      .match(/(?:CHARSET|ENCODING)\s*:\s*([^\r\n]+)/i)?.[1]
      ?.trim()
      .toUpperCase();

    // Arquivos OFX brasileiros ainda são frequentemente emitidos em Windows-1252.
    // Latin-1 preserva os caracteres usados em português sem corromper a estrutura do XML/SGML.
    if (
      charset &&
      /^(1252|WINDOWS-1252|ISO-8859-1|LATIN1|USASCII)$/.test(charset)
    ) {
      return buffer.toString('latin1');
    }

    return buffer.toString('utf8');
  }

  private normalizeOfxContent(content: string): string {
    return (
      content
        .replace(/^\uFEFF/, '')
        // node-ofx-parser só identifica a raiz como "<OFX>". Aceitar a grafia
        // minúscula/mista evita falha em arquivos OFX XML emitidos por alguns bancos.
        .replace(/<ofx\b[^>]*>/i, '<OFX>')
        .replace(/<\/ofx\s*>/i, '</OFX>')
    );
  }

  private findTransactions(data: unknown): Record<string, unknown>[] {
    const transactions: Record<string, unknown>[] = [];

    const visit = (value: unknown, key?: string) => {
      if (Array.isArray(value)) {
        value.forEach((item) => visit(item, key));
        return;
      }

      if (!value || typeof value !== 'object') return;

      if (key?.toUpperCase() === 'STMTTRN') {
        transactions.push(value as Record<string, unknown>);
        return;
      }

      Object.entries(value as Record<string, unknown>).forEach(
        ([childKey, childValue]) => {
          visit(childValue, childKey);
        },
      );
    };

    visit(data);
    return transactions;
  }

  private getOfxValue(
    transaction: Record<string, unknown>,
    field: string,
  ): string {
    const key = Object.keys(transaction).find(
      (name) => name.toUpperCase() === field,
    );
    const value = key ? transaction[key] : '';
    return value == null ? '' : String(value).trim();
  }

  private parseOfxAmount(value: string): number {
    const normalized = value.replace(/\s/g, '');

    if (!normalized) return Number.NaN;

    if (normalized.includes(',') && normalized.includes('.')) {
      const decimalSeparator =
        normalized.lastIndexOf(',') > normalized.lastIndexOf('.') ? ',' : '.';
      const withoutThousands =
        decimalSeparator === ','
          ? normalized.replace(/\./g, '').replace(',', '.')
          : normalized.replace(/,/g, '');
      return Number(withoutThousands);
    }

    return Number(normalized.replace(',', '.'));
  }

  private parseCsv(content: string) {
    try {
      // Tenta detectar cabeçalho ou assume padrão: Data, Descricao, Valor
      const records = csvParse(content, {
        columns: true,
        skip_empty_lines: true,
        trim: true,
        relax_column_count: true,
      });

      return records
        .map((r: any) => {
          // Tenta achar colunas comuns
          const dateKey = Object.keys(r).find(
            (k) =>
              k.toLowerCase().includes('data') ||
              k.toLowerCase().includes('date'),
          );
          const descKey = Object.keys(r).find(
            (k) =>
              k.toLowerCase().includes('desc') ||
              k.toLowerCase().includes('hist') ||
              k.toLowerCase().includes('memo'),
          );
          const valKey = Object.keys(r).find(
            (k) =>
              k.toLowerCase().includes('valor') ||
              k.toLowerCase().includes('subtotal') ||
              k.toLowerCase().includes('amount'),
          );

          if (!dateKey || !valKey) return null;

          let valor = parseFloat(String(r[valKey]).replace(',', '.')); // Tenta normalizar BR
          if (isNaN(valor)) valor = parseFloat(String(r[valKey]));

          const tipo = valor < 0 ? 'saida' : 'entrada';
          const descricao = descKey ? r[descKey] : 'Sem descrição';

          let parsedDate = r[dateKey];
          if (parsedDate && parsedDate.includes('/')) {
            const parts = parsedDate.split('/');
            if (parts.length >= 3) {
              // Assuming DD/MM/YYYY
              const d = parts[0].padStart(2, '0');
              const m = parts[1].padStart(2, '0');
              const y = parts[2].substring(0, 4);
              parsedDate = `${y}-${m}-${d}`;
            }
          }

          return {
            data: parsedDate,
            descricao: descricao,
            contato: this.extractContactFromDescription(descricao),
            valor: Math.abs(valor).toFixed(2),
            tipo: tipo,
          };
        })
        .filter((i: any) => i !== null);
    } catch (e) {
      console.error('Erro ao parsear CSV', e);
      throw new BadRequestException('Erro ao ler arquivo CSV');
    }
  }

  private extractContactFromDescription(description: string): string | null {
    if (!description) return null;

    // Exemplo: Transf Pix recebida - MARINES POVOA CORREA - 016.442.607-86
    const pixRegex = /^Transf Pix recebida\s*-\s*(.+?)\s*-/;
    let match = description.match(pixRegex);
    if (match && match[1]) {
      return match[1].trim().toUpperCase();
    }

    // Tenta pegar PIX genérico (ex: Pix enviado - Fulano, Transferência Pix - Sicrano)
    const pixRegex2 = /Pix[^\-]*-\s*(.+)/i;
    match = description.match(pixRegex2);
    if (match && match[1]) {
      return match[1].split('-')[0].trim().toUpperCase();
    }

    // Tenta Transferência genérica
    const transfRegex = /Transfer.ncia[^\-]*-\s*(.+)/i;
    match = description.match(transfRegex);
    if (match && match[1]) {
      return match[1].split('-')[0].trim().toUpperCase();
    }

    return null;
  }
}
