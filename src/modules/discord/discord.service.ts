import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { Client, GatewayIntentBits, Message } from 'discord.js';
import { TransactionsService } from '../transactions/services/transactions.service';

@Injectable()
export class DiscordService implements OnModuleInit {
    private readonly logger = new Logger(DiscordService.name);
    private client: Client;

    constructor(private readonly transactionsService: TransactionsService) {
        this.client = new Client({
            intents: [
                GatewayIntentBits.Guilds,
                GatewayIntentBits.GuildMessages,
                GatewayIntentBits.MessageContent,
            ],
        });
    }

    async onModuleInit() {
        const token = process.env.DISCORD_BOT_TOKEN;
        if (!token) {
            this.logger.warn('DISCORD_BOT_TOKEN não definido. O bot do Discord não será iniciado.');
            return;
        }

        this.client.on('clientReady', () => {
            this.logger.log(`Bot conectado como ${this.client.user?.tag}`);
        });

        this.client.on('messageCreate', async (message) => {
            this.logger.debug(`Recebeu evento de mensagem: [${message.author.tag}] ${message.content}`);
            await this.handleMessage(message);
        });

        try {
            await this.client.login(token);
        } catch (error) {
            this.logger.error('Erro ao conectar bot do Discord', error);
        }
    }

    private async handleMessage(message: Message) {
        // Ignorar mensagens do próprio bot ou de outros bots
        if (message.author.bot) return;

        // Se houver um canal configurado, ignorar mensagens fora dele
        const channelId = process.env.DISCORD_CHANNEL_ID;
        if (channelId && message.channel.id !== channelId) {
            this.logger.debug(`Ignorando mensagem do canal errado: ${message.channel.id}`);
            return;
        }

        const content = message.content.trim();
        this.logger.debug(`Analisando texto da mensagem: "${content}"`);

        // Evitar loop infinito: Ignora as próprias respostas do bot
        if (content.startsWith('✅') || content.startsWith('❌')) {
            return;
        }

        // Inteligência para descobrir se é Entrada ou Saída (Sincronizado com WhatsApp)
        let transactionType = 'expense';
        if (content.trim().startsWith('+') || /\b(receita|entrada|ganho|recebi|sal[aá]rio)\b/i.test(content)) {
            transactionType = 'income';
        }

        let description = content.replace(/^\+\s*/, '');
        let tagStr: string | undefined = undefined;
        let dateStr: string | undefined = undefined;
        let transactionDate = new Date();

        // 1. Extrair Data "dia DD/MM" (fazemos antes para não conflitar com texto)
        const dateRegex = /\bdia\s+(\d{1,2}\/\d{1,2}(?:\/\d{2,4})?)\b/i;
        const dateMatch = description.match(dateRegex);
        if (dateMatch) {
            dateStr = dateMatch[1];
            description = description.replace(dateMatch[0], '').trim();

            const parts = dateStr.split('/');
            const day = parseInt(parts[0], 10);
            const month = parseInt(parts[1], 10) - 1;
            let year = transactionDate.getFullYear();
            if (parts[2]) {
                year = parts[2].length === 2 ? 2000 + parseInt(parts[2], 10) : parseInt(parts[2], 10);
            }
            transactionDate = new Date(year, month, day);
        }

        // 2. Extrair Tag "tag NOME"
        const tagRegex = /\btag\s+(.+)$/i;
        const tagMatch = description.match(tagRegex);
        if (tagMatch) {
            tagStr = tagMatch[1].trim();
            description = description.replace(tagMatch[0], '').trim();
        }

        // 3. Extrair Valor
        // Extrai o primeiro valor numérico que encontrar, permitindo a ordem "Uber 15,14" ou "15,14 Uber"
        const valueRegex = /(?:r\$\s*)?(\d+(?:[.,]\d+)?)(?:\s*reais)?/i;
        const valueMatch = description.match(valueRegex);

        if (!valueMatch) {
            this.logger.debug(`Ignorado: Não encontrou valor numérico na frase.`);
            return;
        }

        const rawAmount = valueMatch[1].replace(',', '.');
        const amount = parseFloat(rawAmount);

        // Limpeza final da descrição
        description = description.replace(valueMatch[0], '')
            .trim()
            .replace(/[.,;]$/, '')
            .replace(/^[.,;]/, '')
            .replace(/\s+[,.;]\s+/, ' ')
            .replace(/^[-\s]+|[-\s]+$/g, '')
            .trim();

        // Se sobrar apenas uma vírgula ou caractere estranho solto, limpamos
        if (description.length <= 1 && /[,.;ç]/.test(description)) {
            description = '';
        }

        if (!description) {
            description = 'Transação Automática';
        }

        if (isNaN(amount) || amount <= 0) {
            this.logger.debug(`Ignorado: Valor inválido ${amount}`);
            return;
        }

        try {
            await this.transactionsService.create({
                amount,
                description,
                type: transactionType,
                date: transactionDate,
                status: 'paid',   // assume pago
                tags: tagStr,
            });

            const formattedAmount = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount);
            
            // Emoji verde para Receita, Vermelho para Despesa
            const icon = transactionType === 'income' ? '🟢' : '🔴';
            const typeName = transactionType === 'income' ? 'Receita' : 'Despesa';

            let replyMsg = `✅ **${typeName} adicionada:**\n**${description}** de ${formattedAmount} ${icon}`;
            if (tagStr) replyMsg += `\n🏷️ Tag: ${tagStr}`;
            if (dateStr) replyMsg += `\n📅 Data: ${transactionDate.toLocaleDateString('pt-BR')}`;

            await message.reply(replyMsg);
            this.logger.log(`Transação criada via Discord: ${description} - ${amount} (${transactionType})`);
        } catch (error) {
            this.logger.error('Erro ao criar transação pelo Discord', error);
            await message.reply('❌ Ocorreu um erro ao tentar salvar a transação no sistema.');
        }
    }
}
