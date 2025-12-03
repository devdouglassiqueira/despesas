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
  ) {}

  async onApplicationBootstrap() {
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
