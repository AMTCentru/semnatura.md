import { IsEmail, IsString, Length } from '@nestjs/class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class seResponsabilDto {
  @ApiProperty({ description: 'Responsible person last name' })
  @IsString()
  nume: string;

  @ApiProperty({ description: 'Responsible person first name' })
  @IsString()
  prenume: string;

  @ApiProperty({ description: 'Responsible person IDNP', example: '1234567890123' })
  @IsString()
  @Length(13, 13)
  idnp: string;

  @ApiProperty({ description: 'Responsible person email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Responsible person phone number' })
  @IsString()
  telefon: string;
}
