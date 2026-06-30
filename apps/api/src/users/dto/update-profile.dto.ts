import { IsOptional, IsString, MaxLength, IsUrl, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  displayName?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsUrl()
  avatar?: string;

  // Professional profile fields
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  headline?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  location?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  linkedIn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  availability?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  sectors?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  expertiseAreas?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  qualifications?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  boardExperience?: {
    company: string;
    role: string;
    startYear: number;
    endYear?: number;
    current: boolean;
  }[];
}
