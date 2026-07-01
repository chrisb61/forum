import { IsOptional, IsString, MaxLength, IsUrl, IsArray, IsBoolean } from 'class-validator';
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
  @IsString()
  twitterX?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(200)
  professionalEmail?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  // GDPR privacy controls
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showEmail?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showPhone?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showLinkedIn?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  profileVisibility?: string;

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
