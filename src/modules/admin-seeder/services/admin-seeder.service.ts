import {
  Injectable,
  OnApplicationBootstrap,
  Logger,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Roles } from 'src/modules/roles/domain/roles.entity';
import { Permissions } from 'src/modules/permissions/domain/permissions.entity';
import { RolePermissions } from 'src/modules/role-permissions/domain/role-permissions.entity';
import { Users } from 'src/modules/users/domain/users.entity';
import { Hasher } from 'src/common/interfaces/criptography/hasher.interface';

@Injectable()
export class AdminSeederService implements OnApplicationBootstrap {
  private readonly logger = new Logger(AdminSeederService.name);

  constructor(
    @InjectRepository(Roles)
    private readonly rolesRepo: Repository<Roles>,
    @InjectRepository(Permissions)
    private readonly permissionsRepo: Repository<Permissions>,
    @InjectRepository(RolePermissions)
    private readonly rolePermRepo: Repository<RolePermissions>,
    @InjectRepository(Users)
    private readonly usersRepo: Repository<Users>,
    @Inject('Hasher') private readonly hasher: Hasher,
  ) { }

  async onApplicationBootstrap() {
    const permissionsToSeed = [
      { name: 'criar_usuario', group: 'Usuários' },
      { name: 'listar_usuarios', group: 'Usuários' },
      { name: 'listar_usuario_por_id', group: 'Usuários' },
      { name: 'atualizar_usuario', group: 'Usuários' },
      { name: 'deletar_usuario', group: 'Usuários' },
      { name: 'get_me', group: 'Usuários' },
      { name: 'criar_role', group: 'Roles' },
      { name: 'listar_roles', group: 'Roles' },
      { name: 'listar_roles_por_id', group: 'Roles' },
      { name: 'atualizar_role', group: 'Roles' },
      { name: 'deletar_role', group: 'Roles' },
      { name: 'criar_permissao', group: 'Permissões' },
      { name: 'listar_permissoes', group: 'Permissões' },
      { name: 'atualizar_permissao', group: 'Permissões' },
      { name: 'deletar_permissao', group: 'Permissões' },
      { name: 'atribuir_permissoes_role', group: 'Atribuição' },
      { name: 'atualizar_permissoes_role', group: 'Atribuição' },
      { name: 'atualizar_relacao_role_permissao', group: 'Atribuição' },
      { name: 'criar_relacao_role_permissao', group: 'Atribuição' },
      { name: 'deletar_relacao_role_permissao', group: 'Atribuição' },
      { name: 'deletar_relacoes_role_permissao', group: 'Atribuição' },
      { name: 'listar_relacoes_role_permissao', group: 'Atribuição' },
      { name: 'criar_despesas', group: 'Despesas' },
      { name: 'listar_despesas', group: 'Despesas' },
      { name: 'listar_despesas_filtros', group: 'Despesas' },
      { name: 'listar_despesas_por_id', group: 'Despesas' },
      { name: 'atualizar_despesas', group: 'Despesas' },
      { name: 'deletar_despesas', group: 'Despesas' },
      { name: 'criar_categoria', group: 'Categorias' },
      { name: 'listar_categorias', group: 'Categorias' },
      { name: 'criar_contato', group: 'Contatos' },
      { name: 'listar_contatos', group: 'Contatos' },
      { name: 'criar_controle_despesas', group: 'Controle de Despesas' },
      { name: 'listar_controle_despesas', group: 'Controle de Despesas' },
      { name: 'listar_controle_despesas_por_id', group: 'Controle de Despesas' },
      { name: 'atualizar_controle_despesas', group: 'Controle de Despesas' },
      { name: 'deletar_controle_despesas', group: 'Controle de Despesas' },
      { name: 'listar_logs', group: 'Logs' },
    ];

    for (const p of permissionsToSeed) {
      const exists = await this.permissionsRepo.findOne({
        where: { name: p.name },
      });
      if (!exists) {
        await this.permissionsRepo.save(this.permissionsRepo.create(p));
        this.logger.log(`Permissão "${p.name}" criada.`);
      }
    }

    let adminRole = await this.rolesRepo.findOne({ where: { name: 'admin' } });

    if (!adminRole) {
      adminRole = await this.rolesRepo.save(
        new Roles({ name: 'admin', description: 'Administrador do sistema' }),
      );
      this.logger.log('Role "admin" criada.');
    }

    const todasPerms = await this.permissionsRepo.find();
    const jaVinculadas = new Set(
      (await this.rolePermRepo.find({ where: { roleId: adminRole.id } })).map(
        (rp) => rp.permissionsId,
      ),
    );

    const novasAssociacoes = todasPerms
      .filter((p) => !jaVinculadas.has(p.id))
      .map((p) =>
        this.rolePermRepo.create({ roleId: adminRole.id, permissionsId: p.id }),
      );

    if (novasAssociacoes.length) {
      await this.rolePermRepo.save(novasAssociacoes);
      this.logger.log(
        `Foram ligadas ${novasAssociacoes.length} permissões ao role "admin".`,
      );
    }

    const email = 'admin@admin.com';
    const usuarioExiste = await this.usersRepo.findOne({ where: { email } });

    if (!usuarioExiste) {
      const hashed = await this.hasher.hash('1qaz2wsx');
      await this.usersRepo.save(
        this.usersRepo.create({
          name: 'Admin User',
          username: 'admin',
          email,
          password: hashed,
          birthday: '1970-01-01',
          status: 'active',
          roleId: adminRole.id,
        }),
      );
      this.logger.log('Usuário admin "Admin User" criado.');
    } else {
      this.logger.log('Usuário admin já existe – nada a fazer.');
    }
  }
}
