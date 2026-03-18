import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction } from '../domain/transaction.entity';
import { CreateTransactionDto, UpdateTransactionDto } from '../domain/dto/create-transaction.dto';
import { Attachment } from '../domain/attachment.entity';

@Injectable()
export class TransactionsService {
    constructor(
        @InjectRepository(Transaction)
        private transactionRepository: Repository<Transaction>,
        @InjectRepository(Attachment)
        private attachmentRepository: Repository<Attachment>,
    ) { }

    async create(createTransactionDto: CreateTransactionDto) {
        const { attachmentUrls, ...data } = createTransactionDto;

        // If it's a simple transaction (no installments)
        if (!data.installmentTotal || data.installmentTotal <= 1) {
            const transaction = this.transactionRepository.create(data);
            if (data.categoryId) transaction.category = { id: data.categoryId } as any;
            if (data.accountId) transaction.account = { id: data.accountId } as any;

            const savedTransaction = await this.transactionRepository.save(transaction);
            await this.handleAttachments(savedTransaction, attachmentUrls);
            return savedTransaction;
        }

        // Handle Installments
        const transactionsToSave: Transaction[] = [];
        let firstTransaction: Transaction | null = null;

        for (let i = 1; i <= data.installmentTotal; i++) {
            const installmentDate = new Date(data.date);
            installmentDate.setMonth(installmentDate.getMonth() + (i - 1));

            const transactionData = {
                ...data,
                date: installmentDate.toISOString().split('T')[0] + 'T12:00:00Z',
                installmentNumber: i,
                installmentTotal: data.installmentTotal,
                status: i === 1 ? data.status || 'paid' : 'pending', // Usually only the first is paid initially
            };

            const transaction = this.transactionRepository.create(transactionData);
            if (data.categoryId) transaction.category = { id: data.categoryId } as any;
            if (data.accountId) transaction.account = { id: data.accountId } as any;

            if (i === 1) {
                firstTransaction = await this.transactionRepository.save(transaction);
                transactionsToSave.push(firstTransaction);
            } else if (firstTransaction) {
                transaction.parentId = firstTransaction.id;
                transactionsToSave.push(transaction);
            } else {
                // This case should not be reachable due to the loop starting at i=1
                transactionsToSave.push(transaction);
            }
        }

        const savedTransactions = await this.transactionRepository.save(transactionsToSave);

        // Handle attachments for the first one
        if (firstTransaction) {
            await this.handleAttachments(firstTransaction, attachmentUrls);
        }

        return savedTransactions[0];
    }

    private async handleAttachments(transaction: Transaction, attachmentUrls?: string[]) {
        if (attachmentUrls && attachmentUrls.length > 0) {
            const attachments = attachmentUrls.map(url =>
                this.attachmentRepository.create({
                    transaction: transaction,
                    url: url,
                    metadata: {}
                })
            );
            await this.attachmentRepository.save(attachments);
            transaction.attachments = attachments;
        }
    }

    async findAll(query: any = {}) {
        const qb = this.transactionRepository.createQueryBuilder('transaction')
            .leftJoinAndSelect('transaction.category', 'category')
            .leftJoinAndSelect('transaction.account', 'account')
            .leftJoinAndSelect('transaction.attachments', 'attachments')
            .orderBy('transaction.date', 'DESC');

        if (query.month && query.year) {
            qb.andWhere('EXTRACT(MONTH FROM transaction.date) = :month', { month: Number(query.month) });
            qb.andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year: Number(query.year) });
        }

        if (query.categoryId) {
            qb.andWhere('transaction.category_id = :categoryId', { categoryId: query.categoryId });
        }

        if (query.type) {
            qb.andWhere('transaction.type = :type', { type: query.type });
        }

        if (query.search) {
            qb.andWhere('transaction.description ILIKE :search', { search: `%${query.search}%` });
        }

        return qb.getMany();
    }

    async findOne(id: number) {
        const transaction = await this.transactionRepository.findOne({
            where: { id },
            relations: ['category', 'account', 'attachments'],
        });
        if (!transaction) {
            throw new NotFoundException(`Transaction with ID ${id} not found`);
        }
        return transaction;
    }

    async update(id: number, updateTransactionDto: UpdateTransactionDto) {
        const transaction = await this.findOne(id);
        const { attachmentUrls, ...data } = updateTransactionDto;

        this.transactionRepository.merge(transaction, data);

        if (data.categoryId) transaction.category = { id: data.categoryId } as any;
        if (data.accountId) transaction.account = { id: data.accountId } as any;

        // Logic for updating attachments can be complex (add/remove). 
        // For now assuming we just add new ones if provided, or replace all if we want simpler logic.
        // The prompt asked for "upload", so maybe we'll handle just adding new ones or handling them separately.
        // For now, I'll just update the transaction fields.

        return this.transactionRepository.save(transaction);
    }

    async remove(id: number) {
        const transaction = await this.findOne(id);
        return this.transactionRepository.remove(transaction);
    }

    async getDashboardSummary(month?: number, year?: number) {
        const currentYear = year || new Date().getFullYear();
        const currentMonth = month || new Date().getMonth() + 1;

        const qbNormal = this.transactionRepository.createQueryBuilder('transaction')
            .where('EXTRACT(MONTH FROM transaction.date) = :month', { month: currentMonth })
            .andWhere('EXTRACT(YEAR FROM transaction.date) = :year', { year: currentYear });

        const transactions = await qbNormal.getMany();

        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const totalExpense = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + Number(t.amount), 0);

        const balance = totalIncome - totalExpense;

        // Group by category for charts
        const categoryMap = new Map<string, number>();
        transactions.filter(t => t.type === 'expense').forEach(t => { // Chart usually expenses
            // If category is loaded (it's not joined above, need to join or load separately, or use categoryId)
            // Check if we need category name. 
            // Let's reload with relations or just use categoryId for now?
            // Better to just group by categoryId and name if available.
            // Actually, qbNormal.getMany() above doesn't load relations unless we tell it.
        });

        // Let's redo the query to get category breakdown easier
        const expensesByCategory = await this.transactionRepository.createQueryBuilder('t')
            .select('c.name', 'category')
            .addSelect('c.color', 'color')
            .addSelect('SUM(t.amount)', 'total')
            .leftJoin('t.category', 'c')
            .where('t.type = :type', { type: 'expense' })
            .andWhere('EXTRACT(MONTH FROM t.date) = :month', { month: currentMonth })
            .andWhere('EXTRACT(YEAR FROM t.date) = :year', { year: currentYear })
            .groupBy('c.name')
            .addGroupBy('c.color')
            .getRawMany();

        // Totals by account (payment method)
        const totalsByAccount = await this.transactionRepository.createQueryBuilder('t')
            .select('a.name', 'account')
            .addSelect('a.type', 'accountType')
            .addSelect('a.color', 'color')
            .addSelect('t.type', 'transactionType')
            .addSelect('SUM(t.amount)', 'total')
            .leftJoin('t.account', 'a')
            .andWhere('EXTRACT(MONTH FROM t.date) = :month', { month: currentMonth })
            .andWhere('EXTRACT(YEAR FROM t.date) = :year', { year: currentYear })
            .groupBy('a.name')
            .addGroupBy('a.type')
            .addGroupBy('a.color')
            .addGroupBy('t.type')
            .getRawMany();

        // Process to get income and expense per account
        const accountSummary = new Map<string, { name: string, type: string, color: string, income: number, expense: number }>();
        totalsByAccount.forEach(item => {
            const key = item.account || 'Sem conta';
            if (!accountSummary.has(key)) {
                accountSummary.set(key, {
                    name: key,
                    type: item.accountType || 'other',
                    color: item.color || '#9e9e9e',
                    income: 0,
                    expense: 0
                });
            }
            const acc = accountSummary.get(key)!;
            if (item.transactionType === 'income') {
                acc.income += Number(item.total);
            } else {
                acc.expense += Number(item.total);
            }
        });

        return {
            period: { month: currentMonth, year: currentYear },
            summary: {
                income: totalIncome,
                expense: totalExpense,
                balance: balance
            },
            expensesByCategory: expensesByCategory.map(item => ({
                category: item.category || 'Outros',
                color: item.color || '#9e9e9e',
                total: Number(item.total)
            })),
            totalsByAccount: Array.from(accountSummary.values()).map(acc => ({
                ...acc,
                balance: acc.income - acc.expense
            }))
        };
    }

    async importTransactions(file: Express.Multer.File, accountId?: number) {
        if (!file) throw new NotFoundException('Arquivo não encontrado');

        const fileContent = file.buffer.toString('utf8');
        const ofx = require('node-ofx-parser');
        let parsedData;

        try {
            parsedData = ofx.parse(fileContent);
        } catch (e) {
            throw new Error('Falha ao processar arquivo OFX.');
        }

        // Handle nested OFX structure
        const stmtTrnRs = parsedData?.OFX?.BANKMSGSRSV1?.STMTTRNRS || parsedData?.OFX?.CREDITCARDMSGSRSV1?.CCSTMTTRNRS;
        const stmtRs = stmtTrnRs?.STMTRS || stmtTrnRs?.CCSTMTRS;
        const stmtTrn = stmtRs?.BANKTRANLIST?.STMTTRN;

        if (!stmtTrn) {
            throw new Error('Nenhuma transação encontrada no arquivo OFX');
        }

        const transactionsData = Array.isArray(stmtTrn) ? stmtTrn : [stmtTrn];

        const transactionsToSave = transactionsData.map(trn => {
            const amount = parseFloat(trn.TRNAMT || '0');
            const type = amount >= 0 ? 'income' : 'expense';
            // Format YYYYMMDDHHMMSS to valid Date
            let dateStr = trn.DTPOSTED || '';
            let date = new Date();
            if (dateStr.length >= 8) {
                date = new Date(`${dateStr.substring(0, 4)}-${dateStr.substring(4, 6)}-${dateStr.substring(6, 8)}T12:00:00Z`);
            }

            const transaction = this.transactionRepository.create({
                description: trn.MEMO || trn.NAME || 'Transação Importada',
                amount: Math.abs(amount),
                type,
                date,
                status: 'paid',
                notes: `OFX ID: ${trn.FITID}`,
            });

            if (accountId) {
                transaction.account = { id: accountId } as any;
            }

            return transaction;
        });

        return this.transactionRepository.save(transactionsToSave);
    }
}

