import { IsString, IsEnum, IsOptional, IsBoolean, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum OpportunityType {
  NED = 'NED',
  CHAIR = 'CHAIR',
  ADVISORY_BOARD = 'ADVISORY_BOARD',
  COMMITTEE = 'COMMITTEE',
  TRUSTEE = 'TRUSTEE',
  FRACTIONAL_EXECUTIVE = 'FRACTIONAL_EXECUTIVE',
  INVESTOR = 'INVESTOR',
  MENTOR = 'MENTOR',
}

export class CreateOpportunityDto {
  @ApiProperty() @IsString() title: string;
  @ApiProperty() @IsString() organisation: string;
  @ApiProperty({ enum: OpportunityType }) @IsEnum(OpportunityType) type: OpportunityType;
  @ApiProperty() @IsString() description: string;
  @ApiPropertyOptional() @IsOptional() @IsString() requirements?: string;
  @ApiPropertyOptional({ type: [String] }) @IsOptional() @IsArray() sectors?: string[];
  @ApiPropertyOptional() @IsOptional() @IsString() location?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() remuneration?: string;
  @ApiPropertyOptional() @IsOptional() @IsString() timeCommitment?: string;
  @ApiPropertyOptional() @IsOptional() @IsDateString() closingDate?: string;
  @ApiPropertyOptional() @IsOptional() @IsBoolean() isAnonymous?: boolean;
}
