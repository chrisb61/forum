import { IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ description: 'Username or email' })
  @IsString()
  identifier: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  password: string;
}
