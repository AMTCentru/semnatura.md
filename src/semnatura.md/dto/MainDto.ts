import { ApiProperty } from '@nestjs/swagger';
import { seResponsabilDto } from './seResponsabilDto';
import { seDateDto } from './seDateDto';
import { ArrayNotEmpty, IsArray, IsNotEmpty, ValidateNested } from '@nestjs/class-validator';
import { Type } from '@nestjs/class-transformer';

export class MainDto {
  @ApiProperty({ type: seResponsabilDto, description: 'Responsabil details' })
  @ValidateNested()
  @IsNotEmpty()
  @Type(() => seResponsabilDto)
  responsabil: seResponsabilDto;

  @ApiProperty({ type: [seDateDto], description: 'List of employees' })
  @IsArray()
  @ArrayNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => seDateDto)
  angajati: seDateDto[];
}
