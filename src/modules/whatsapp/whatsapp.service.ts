import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client, LocalAuth, Message } from 'whatsapp-web.js';
import * as qrcode from 'qrcode-terminal';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import OpenAI from 'openai';
import { TransactionsService } from '../transactions/services/transactions.service';

@Injectable()
export class WhatsappService implements OnModuleInit {
    private readonly logger = new Logger(WhatsappService.name);
    private client: Client;
    private openai: OpenAI | null = null;

    constructor(private readonly transactionsService: TransactionsService) {
        this.client = new Client({
            authStrategy: new LocalAuth({ dataPath: './.wwebjs_auth' }),
            puppeteer: {
                args: ['--no-sandbox', '--disable-setuid-sandbox'],
            }
        });
    }

    async onModuleInit() {
        this.logger.log('⚠️ WhatsApp Service INTERNO DESATIVADO. Use o bot em /whatsapp-web.js/bot.js');
        
        if (process.env.ENABLE_WHATSAPP === 'true') {
            this.logger.warn('Para usar o WhatsApp, rode o comando: node bot.js na pasta whatsapp-web.js');
        }
        return;
    }

    private async handleMessage(message: Message) {
        if (message.isStatus) return;

        // Ignorar mensagens de Canais (Newsletters) que quebram a lib
        if (message.from.includes('@newsletter') || message.to.includes('@newsletter')) {
            return;
        }

        let chat;
        try {
            chat = await message.getChat();
        } catch (error) {
            this.logger.error('Erro ao obter chat da mensagem', error);
            return;
        }

        const allowedGroupId = process.env.WHATSAPP_ALLOWED_GROUP_ID;

        if (allowedGroupId) {
            // Se o usuário configurou um grupo, o bot SÓ responde e lê nesse grupo.
            if (chat.id._serialized !== allowedGroupId) {
                return;
            }
        } else {
            // Comportamento original se nenhum grupo for configurado no .env
            if (chat.isGroup) {
                // Se a mensagem chegou num grupo, o bot ignora E imprime o ID no terminal pra ele descobrir.
                this.logger.debug(`[GRUPO DESCOBERTO] O ID do grupo "${chat.name}" é: ${chat.id._serialized}`);
                return; 
            }

            // Regra original para restringir chats privados
            const allowedNumber = process.env.WHATSAPP_ALLOWED_NUMBER;
            if (allowedNumber && message.from !== allowedNumber && message.to !== allowedNumber) {
                return;
            }
        }

        this.logger.debug(`>> Mensagem Recebida: de=${message.from} tipo=${message.type}`);
        
        let content = '';

        // Detecção de Áudio/Voz (ptt = Push To Talk, que é a nota de voz do zap)
        const isAudio = message.hasMedia && (
            String(message.type) === 'audio' || 
            String(message.type) === 'voice' || 
            String(message.type) === 'ptt'
        );

        if (isAudio) {
            this.logger.debug(`Recebeu um áudio/voz do tipo "${message.type}". Iniciando transcrição...`);
            try {
                const media = await message.downloadMedia();
                if (!media || !media.data) {
                    throw new Error('Não foi possível baixar a mídia do áudio');
                }
                content = await this.transcribeAudio(media.data, media.mimetype);
                this.logger.debug(`Áudio transcrito com sucesso: "${content}"`);
                
                if (!content) {
                    await message.reply('❌ Não consegui entender o que você disse no áudio.');
                    return;
                }
            } catch (error) {
                this.logger.error('Erro ao processar áudio', error);
                await message.reply('❌ Ocorreu um erro ao processar seu áudio.');
                return;
            }
        } else {
            content = message.body?.trim() || '';
        }

        if (!content) return;

        // PRIORIDADE: Evitar loop infinito. Ignora as próprias respostas do bot.
        if (content.startsWith('✅') || content.startsWith('❌')) {
            return;
        }

        this.logger.debug(`Analisando conteúdo final: "${content}"`);

        // Limpeza inicial: Remover pontuações comuns que o Whisper coloca no fim
        let cleanContent = content.replace(/[,.;]$/, '').trim();

        // Inteligência para descobrir se é Entrada ou Saída
        let transactionType = 'expense';
        if (cleanContent.trim().startsWith('+') || /\b(receita|entrada|ganho|recebi|sal[aá]rio)\b/i.test(cleanContent)) {
            transactionType = 'income';
        }

        let description = cleanContent.replace(/^\+\s*/, '');
        let tagStr: string | undefined = undefined;
        let dateStr: string | undefined = undefined;
        let transactionDate = new Date();

        // 1. Extrair Data - Suporte para "dia 20/03" OU "dia 20 de março"
        const dateRegex = /\bdia\s+(\d{1,2}(?:\s*de\s*|[/-])\d{1,2}(?:\s*de\s*|[/-])?(?:\d{2,4})?|\d{1,2}\s*de\s*[a-záãç]+)/i;
        const dateMatch = description.match(dateRegex);
        
        if (dateMatch) {
            const rawDate = dateMatch[1].toLowerCase();
            description = description.replace(dateMatch[0], '').trim();

            // Tentar converter meses por extenso para número (ex: "março" -> 3)
            const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
            let day, month, year = transactionDate.getFullYear();

            if (rawDate.includes('de')) {
                const parts = rawDate.split(/\s*de\s*/);
                day = parseInt(parts[0], 10);
                const monthName = parts[1];
                const monthIndex = months.findIndex(m => monthName.startsWith(m.substring(0, 3)));
                month = monthIndex !== -1 ? monthIndex : (parseInt(monthName, 10) - 1);
                if (parts[2]) year = parseInt(parts[2], 10);
            } else {
                const parts = rawDate.split(/[/-]/);
                day = parseInt(parts[0], 10);
                month = parseInt(parts[1], 10) - 1;
                if (parts[2]) year = parts[2].length === 2 ? 2000 + parseInt(parts[2], 10) : parseInt(parts[2], 10);
            }

            if (!isNaN(day) && !isNaN(month)) {
                transactionDate = new Date(year, month, day);
                dateStr = transactionDate.toLocaleDateString('pt-BR');
            }
        }

        // 2. Extrair Tag
        const tagRegex = /\btag\s+([^,.]+)/i; // Pára na vírgula ou ponto
        const tagMatch = description.match(tagRegex);
        if (tagMatch) {
            tagStr = tagMatch[1].trim();
            description = description.replace(tagMatch[0], '').trim();
        }

        // 3. Extrair Valor
        const valueRegex = /(?:r\$\s*)?(\d+(?:[.,]\d+)?)(?:\s*reais)?/i;
        const valueMatch = description.match(valueRegex);

        if (!valueMatch) {
            this.logger.debug(`Ignorado: Não encontrou valor numérico.`);
            return;
        }

        const rawAmount = valueMatch[1].replace(',', '.');
        const amount = parseFloat(rawAmount);

        // Limpeza final da descrição
        description = description.replace(valueMatch[0], '')
            .trim()                     // Tiramos os espaços logo de cara
            .replace(/[.,;]$/, '')      // Remove pontuação de final AGORA que tiramos o espaço
            .replace(/^[.,;]/, '')      // Remove pontuação de começo
            .replace(/\s+[,.;]\s+/, ' ') // Remove pontuação boiando no meio
            .replace(/^[-\s]+|[-\s]+$/g, '') 
            .trim();                    // Garante que o resultado está limpo

        // Se sobrar apenas uma vírgula ou caractere estranho solto, limpamos tudo
        if (description.length <= 1 && /[,.;ç]/.test(description)) {
            description = '';
        }

        if (!description) {
            description = 'Transação Automática';
        }

        if (isNaN(amount) || amount <= 0) {
            return;
        }

        this.logger.debug(`Processando transação via WhatsApp: ${description} - ${amount} (${transactionType})`);

        try {
            await this.transactionsService.create({
                amount,
                description,
                type: transactionType,
                date: transactionDate,
                status: 'paid',
                tags: tagStr,
            });

            const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
            
            const icon = transactionType === 'income' ? '🟢' : '🔴';
            const typeName = transactionType === 'income' ? 'Receita' : 'Despesa';

            let replyMsg = `✅ *${typeName} adicionada:*\n**${description}** de ${formattedAmount} ${icon}`;
            if (tagStr) replyMsg += `\n🏷️ Tag: ${tagStr}`;
            if (dateStr) replyMsg += `\n📅 Data: ${dateStr}`;

            await message.reply(replyMsg);
            this.logger.log(`Transação criada via WhatsApp com sucesso`);
        } catch (error) {
            this.logger.error('Erro ao criar transação via WhatsApp', error);
            await message.reply('❌ Ocorreu um erro ao salvar a transação no sistema.');
        }
    }

    private async transcribeAudio(base64Data: string, mimetype: string): Promise<string> {
        if (!this.openai) {
            throw new Error('OpenAI client not initialized');
        }

        const tempDir = os.tmpdir();
        // WhatsApp audio usually comes as audio/ogg; codecs=opus
        const extension = mimetype.split('/')[1].split(';')[0] || 'ogg';
        const tempFilePath = path.join(tempDir, `whatsapp_audio_${Date.now()}.${extension}`);

        try {
            fs.writeFileSync(tempFilePath, new Uint8Array(Buffer.from(base64Data, 'base64')));

            const model = process.env.GROQ_API_KEY ? 'whisper-large-v3' : 'whisper-1';
            
            const transcription = await this.openai.audio.transcriptions.create({
                file: fs.createReadStream(tempFilePath),
                model: model,
                language: 'pt',
            });

            return transcription.text;
        } finally {
            if (fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }
        }
    }
}
