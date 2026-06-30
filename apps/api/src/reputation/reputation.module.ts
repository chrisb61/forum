import { Module } from '@nestjs/common';
import { ReputationService } from './reputation.service';
import { ReputationController } from './reputation.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  providers: [ReputationService],
  controllers: [ReputationController],
  exports: [ReputationService],
})
export class ReputationModule {}
