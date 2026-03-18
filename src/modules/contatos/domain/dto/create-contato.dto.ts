import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateContatoDto {
    @ApiProperty()
    @IsString()
    @IsNotEmpty()
    nome: string;
}
