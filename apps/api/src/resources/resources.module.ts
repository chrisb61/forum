import { Module } from '@nestjs/common';
import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';
import { CvSubmissionsController } from './cv-submissions.controller';
import { CvSubmissionsService } from './cv-submissions.service';

@Module({
  controllers: [ResourcesController, CoursesController, CvSubmissionsController],
  providers: [ResourcesService, CoursesService, CvSubmissionsService],
})
export class ResourcesModule {}
