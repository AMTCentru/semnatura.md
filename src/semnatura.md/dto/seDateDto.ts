import { IsBoolean, IsEmail, IsNumber, IsString, Length } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class seDateDto {
  @ApiProperty({ description: 'Employee last name' })
  @IsString()
  nume: string;

  @ApiProperty({ description: 'Employee first name' })
  @IsString()
  prenume: string;

  @ApiProperty({ description: 'Employee function' })
  @IsString()
  functia: string;

  @ApiProperty({ description: 'Employee personal phone number' })
  @IsString()
  telefonPersonal: string;

  @ApiProperty({ description: 'Employee IDNP', example: '1234567890123' })
  @IsString()
  @Length(13, 13)
  idnp: string;

  @ApiProperty({ description: 'Employee email address' })
  @IsEmail()
  posta: string;

  @ApiProperty({ description: 'Flag indicating if the employee is active' })
  @IsBoolean()
  stick: boolean;

  @ApiProperty({ description: 'Duration', example: 1 })
  @IsNumber()
  perioada: number;

  @ApiProperty({ description: 'Employee ID', example: 1 })
  @IsNumber()
  id: number;
}
