import { Module } from '@nestjs/common';
import { EndorsementsController } from './endorsements.controller';
import { EndorsementsService } from './endorsements.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [EndorsementsController],
  providers: [EndorsementsService],
  exports: [EndorsementsService],
})
export class EndorsementsModule {}
