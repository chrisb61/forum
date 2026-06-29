import { IsString, MinLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  threadId: string;

  @ApiProperty()
  @IsString()
  @MinLength(1)
  content: string;
}

export class UpdatePostDto {
  @ApiProperty()
  @IsString()
  @MinLength(1)
  content: string;
}
