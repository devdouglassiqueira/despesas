import {
  Controller,
  Get,
  Post,
  Body,
  Put,
  Param,
  Delete,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { CreateUserDto } from '../domain/dto/create-user.dto';
import { UpdateUserDto } from '../domain/dto/update-user.dto';
import { UserService } from '../services/users.service';
import { Permissions } from 'src/common/interfaces/decorators/permissions.decorator';
import { PermissionsGroup } from 'src/common/interfaces/decorators/permissions-group.decorator';

@ApiTags('Users')
@PermissionsGroup('Usuários')
@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post()
  @Permissions('criar_usuario')
  async create(@Body() createUserRequest: CreateUserDto) {
    const { name, email } = await this.userService.create(createUserRequest);

    return {
      name,
      email,
    };
  }

  @Get()
  @Permissions('listar_usuarios')
  async findAll() {
    return await this.userService.findAll();
  }

  @Get(':id')
  @Permissions('listar_usuario_por_id')
  async findOne(@Param('id') id: string) {
    return await this.userService.findOne(+id);
  }

  @Put(':id')
  @Permissions('atualizar_usuario')
  async update(
    @Param('id') id: string,
    @Body() updateUserRequest: UpdateUserDto,
  ) {
    const user = await this.userService.update(+id, updateUserRequest);

    return {
      id: user.id,
      name: user.name,
      email: user.email,
    };
  }

  @Delete(':id')
  @Permissions('deletar_usuario')
  async delete(@Param('id') id: string) {
    return await this.userService.delete(+id);
  }
}
