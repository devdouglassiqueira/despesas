import { Injectable, OnModuleInit } from '@nestjs/common';
import { DiscoveryService, MetadataScanner } from '@nestjs/core';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permissions } from '../domain/permissions.entity';
import { PERMISSIONS_GROUP_KEY } from 'src/common/interfaces/decorators/permissions-group.decorator';

@Injectable()
export class PermissionExplorerService implements OnModuleInit {
  constructor(
    private readonly discoveryService: DiscoveryService,
    private readonly metadataScanner: MetadataScanner,
    @InjectRepository(Permissions)
    private readonly permissionsRepository: Repository<Permissions>,
  ) {}

  async onModuleInit() {
    console.log('Iniciando varredura de controllers para permissões...');
    const controllers = this.discoveryService.getControllers();

    // Mapa para armazenar permissões com seus respectivos grupos
    const permissionMap = new Map<string, string>(); // chave: "permission|group", valor: group

    controllers.forEach((wrapper) => {
      const { instance } = wrapper;
      if (!instance) return;

      // Obtém o grupo definido pelo decorator @PermissionsGroup ou usa o nome do controller como fallback
      let group = Reflect.getMetadata(
        PERMISSIONS_GROUP_KEY,
        instance.constructor,
      );
      if (!group) {
        const controllerName = instance.constructor.name;
        group = controllerName.endsWith('Controller')
          ? controllerName.replace('Controller', '').toLowerCase()
          : controllerName.toLowerCase();
      }

      const prototype = Object.getPrototypeOf(instance);
      const methodNames = this.metadataScanner.getAllMethodNames(prototype);
      methodNames.forEach((methodName) => {
        const methodRef = prototype[methodName];
        const permissions = Reflect.getMetadata('permissions', methodRef);
        if (permissions) {
          if (Array.isArray(permissions)) {
            permissions.forEach((permission) => {
              console.log(
                `Encontrada permissão: ${permission} no grupo ${group}`,
              );
              permissionMap.set(`${permission}|${group}`, group);
            });
          } else {
            console.log(
              `Encontrada permissão: ${permissions} no grupo ${group}`,
            );
            permissionMap.set(`${permissions}|${group}`, group);
          }
        }
      });
    });

    // Consulta para obter o maior ID atualmente presente na tabela
    const maxIdData = await this.permissionsRepository
      .createQueryBuilder('permissions')
      .select('MAX(permissions.id)', 'max')
      .getRawOne();

    const maxId = maxIdData && maxIdData.max ? parseInt(maxIdData.max, 10) : 0;
    console.log(`Maior ID atual encontrado: ${maxId}`);

    // Atualiza a sequência do PostgreSQL com base no maior ID encontrado
    if (maxId > 0) {
      // Se há registros, a próxima chamada a nextval deve retornar maxId + 1
      console.log(`Atualizando sequência para o próximo ID: ${maxId + 1}`);
      await this.permissionsRepository.query(
        `SELECT setval(pg_get_serial_sequence('"permissions"', 'id'), ${maxId}, true);`,
      );
    } else {
      // Se não há registros, configure a sequência para iniciar em 1 (is_called false faz com que o próximo nextval retorne 1)
      console.log(`Tabela vazia, iniciando sequência com o valor 1.`);
      await this.permissionsRepository.query(
        `SELECT setval(pg_get_serial_sequence('"permissions"', 'id'), 1, false);`,
      );
    }

    // Persiste cada permissão única no banco de dados, sem atribuir manualmente o id
    for (const [permissionKey, group] of permissionMap.entries()) {
      const [permissionName] = permissionKey.split('|');
      const exists = await this.permissionsRepository.findOne({
        where: { name: permissionName, group: group },
      });
      if (!exists) {
        await this.permissionsRepository.save({
          name: permissionName,
          group: group,
        });
        console.log(
          `Permissão "${permissionName}" do grupo "${group}" inserida automaticamente no banco de dados.`,
        );
      } else {
        console.log(
          `Permissão "${permissionName}" do grupo "${group}" já existe no banco de dados.`,
        );
      }
    }
  }
}
