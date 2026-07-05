import { IsEmail, IsString, IsOptional, IsIn, MinLength, MaxLength, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty()
  @IsString()
  @MinLength(3)
  @MaxLength(30)
  @Matches(/^[a-zA-Z0-9_-]+$/, { message: 'Username may only contain letters, numbers, underscores, and hyphens' })
  username: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ enum: ['PROFESSIONAL', 'STUDENT', 'CORPORATE'] })
  @IsOptional()
  @IsIn(['PROFESSIONAL', 'STUDENT', 'CORPORATE'])
  memberType?: string;

  @ApiProperty()
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password: string;
}
