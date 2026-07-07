
import { Injectable, BadRequestException } from '@nestjs/common';
import * as fs from 'fs';
import * as ofx from 'node-ofx-parser';
import { parse as csvParse } from 'csv-parse/sync';

@Injectable()
export class ImportacaoService {
    async parseFile(file: Express.Multer.File) {
        if (!file) throw new BadRequestException('Arquivo não enviado');

        const ext = file.originalname?.split('.').pop()?.toLowerCase();

        // Ler conteúdo do buffer
        const content = file.buffer.toString('utf8');

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
            const data = ofx.parse(content);
            // Navegar na estrutura OFX para achar as transações
            // Geralmente OFX -> BANKMSGSRSV1 -> STMTTRNRS -> STMTRS -> BANKTRANLIST -> STMTTRN
            const statement = data.OFX?.BANKMSGSRSV1?.STMTTRNRS?.STMTRS?.BANKTRANLIST?.STMTTRN;

            if (!statement) return [];

            // Pode ser array ou objeto único
            const transactions = Array.isArray(statement) ? statement : [statement];

            return transactions.map((t) => {
                // Formatar data: 20240108120000 -> 2024-01-08
                const rawDate = t.DTPOSTED || '';
                const dateStr = rawDate.slice(0, 8); // YYYYMMDD
                const formattedDate = `${dateStr.slice(0, 4)}-${dateStr.slice(4, 6)}-${dateStr.slice(6, 8)}`;

                // Valor
                const valor = parseFloat(t.TRNAMT);
                const tipo = valor < 0 ? 'saida' : 'entrada';
                let descricao = t.MEMO || 'Sem descrição';
                let categoria = '';

                // Regra para Contribuições
                if (descricao.includes('Pix recebida') || descricao.includes('Transferência recebida')) {
                    descricao = 'Contribuições';
                    categoria = 'Contribuições';
                }

                return {
                    data: formattedDate,
                    descricao: descricao,
                    contato: this.extractContactFromDescription(t.MEMO || ''), // Use original memo for contact extraction
                    categoria: categoria,
                    valor: Math.abs(valor).toFixed(2),
                    tipo: tipo,
                    rawId: t.FITID
                };
            });
        } catch (e) {
            console.error('Erro ao parsear OFX', e);
            throw new BadRequestException('Erro ao ler arquivo OFX');
        }
    }

    private parseCsv(content: string) {
        try {
            // Tenta detectar cabeçalho ou assume padrão: Data, Descricao, Valor
            const records = csvParse(content, {
                columns: true,
                skip_empty_lines: true,
                trim: true,
                relax_column_count: true
            });

            return records.map((r: any) => {
                // Tenta achar colunas comuns
                const dateKey = Object.keys(r).find(k => k.toLowerCase().includes('data') || k.toLowerCase().includes('date'));
                const descKey = Object.keys(r).find(k => k.toLowerCase().includes('desc') || k.toLowerCase().includes('hist') || k.toLowerCase().includes('memo'));
                const valKey = Object.keys(r).find(k => k.toLowerCase().includes('valor') || k.toLowerCase().includes('subtotal') || k.toLowerCase().includes('amount'));

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
            }).filter((i: any) => i !== null);

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
