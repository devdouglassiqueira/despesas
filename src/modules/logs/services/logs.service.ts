import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiLog } from '../domain/api-log.entity';
import { AuditLog } from '../domain/audit-log.entity';
import { Users } from '../../users/domain/users.entity';
import { In } from 'typeorm';

type ListParams = {
  type?: 'api' | 'audit';
  level?: string;
  method?: string;
  url?: string;
  userId?: string | number;
  requestId?: string;
  message?: string;
  error?: string;
  action?: string;
  entity?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  pageSize?: number;
};

@Injectable()
export class LogsService {
  constructor(
    @InjectRepository(ApiLog)
    private readonly apiLogRepo: Repository<ApiLog>,
    @InjectRepository(AuditLog)
    private readonly auditLogRepo: Repository<AuditLog>,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
  ) {}

  async createApiLog(payload: Partial<ApiLog>) {
    const log = this.apiLogRepo.create(payload);
    return await this.apiLogRepo.save(log);
  }

  async createAuditLog(payload: Partial<AuditLog>) {
    const log = this.auditLogRepo.create(payload);
    return await this.auditLogRepo.save(log);
  }

  async list(params: ListParams) {
    const type = params.type === 'audit' ? 'audit' : 'api';
    const page = Math.max(1, Number(params.page) || 1);
    const pageSize = Math.min(200, Math.max(1, Number(params.pageSize) || 20));
    const skip = (page - 1) * pageSize;

    if (type === 'api') {
      const qb = this.apiLogRepo
        .createQueryBuilder('l')
        .orderBy('l.createdAt', 'DESC')
        .skip(skip)
        .take(pageSize);

      if (params.level)
        qb.andWhere('l.level = :level', { level: params.level });
      if (params.method)
        qb.andWhere('l.method = :method', { method: params.method });
      if (params.userId)
        qb.andWhere('l.userId = :userId', { userId: Number(params.userId) });
      if (params.requestId)
        qb.andWhere('l.requestId ILIKE :req', { req: `%${params.requestId}%` });
      if (params.message)
        qb.andWhere('l.message ILIKE :msg', { msg: `%${params.message}%` });
      if (params.error)
        qb.andWhere(
          '(l.errorName ILIKE :err OR l.errorMessage ILIKE :err OR l.stack ILIKE :err)',
          { err: `%${params.error}%` },
        );
      if (params.url)
        qb.andWhere('l.url ILIKE :url', { url: `%${params.url}%` });
      if (params.dateFrom)
        qb.andWhere('l.createdAt >= :df', { df: new Date(params.dateFrom) });
      if (params.dateTo)
        qb.andWhere('l.createdAt <= :dt', { dt: new Date(params.dateTo) });

      const [items, total] = await qb.getManyAndCount();

      // Enrich with username when possible
      const userIds = Array.from(
        new Set((items || []).map((i) => i.userId).filter((v) => !!v)),
      ) as number[];
      let usersMap: Record<number, { username: string; name: string }> = {};
      if (userIds.length > 0) {
        const users = await this.usersRepo.find({
          select: ['id', 'username', 'name'],
          where: { id: In(userIds) },
        });
        usersMap = Object.fromEntries(
          users.map((u) => [u.id, { username: u.username, name: u.name }]),
        );
      }

      const enriched = items.map((i) => ({
        ...i,
        userUsername: i.userId ? usersMap[i.userId]?.username : undefined,
        userName: i.userId ? usersMap[i.userId]?.name : undefined,
      }));

      return { items: enriched, total };
    }

    const qb = this.auditLogRepo
      .createQueryBuilder('l')
      .orderBy('l.createdAt', 'DESC')
      .skip(skip)
      .take(pageSize);

    if (params.level) qb.andWhere('l.level = :level', { level: params.level });
    if (params.userId)
      qb.andWhere('l.userId = :userId', { userId: Number(params.userId) });
    if (params.requestId)
      qb.andWhere('l.requestId ILIKE :req', { req: `%${params.requestId}%` });
    if (params.message)
      qb.andWhere('l.message ILIKE :msg', { msg: `%${params.message}%` });
    if (params.action)
      qb.andWhere('l.action ILIKE :act', { act: `%${params.action}%` });
    if (params.entity)
      qb.andWhere('l.entity ILIKE :ent', { ent: `%${params.entity}%` });
    if (params.entityId) {
      qb.andWhere('l.entity_id = :eid', { eid: params.entityId });
    }
    if (params.dateFrom)
      qb.andWhere('l.createdAt >= :df', { df: new Date(params.dateFrom) });
    if (params.dateTo)
      qb.andWhere('l.createdAt <= :dt', { dt: new Date(params.dateTo) });

    const [items, total] = await qb.getManyAndCount();

    // Enrich with username when possible
    const userIds = Array.from(
      new Set((items || []).map((i) => i.userId).filter((v) => !!v)),
    ) as number[];
    let usersMap: Record<number, { username: string; name: string }> = {};
    if (userIds.length > 0) {
      const users = await this.usersRepo.find({
        select: ['id', 'username', 'name'],
        where: { id: In(userIds) },
      });
      usersMap = Object.fromEntries(
        users.map((u) => [u.id, { username: u.username, name: u.name }]),
      );
    }

    const enriched = items.map((i) => ({
      ...i,
      userUsername: i.userId ? usersMap[i.userId]?.username : undefined,
      userName: i.userId ? usersMap[i.userId]?.name : undefined,
    }));

    return { items: enriched, total };
  }
}
