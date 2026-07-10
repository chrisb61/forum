import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { CvSubmissionsService } from './cv-submissions.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@forum/database';

const ALLOWED_CV_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

@ApiTags('CV Submissions')
@ApiBearerAuth()
@Controller('cv-submissions')
export class CvSubmissionsController {
  constructor(private readonly cvSubmissions: CvSubmissionsService) {}

  @Get('mine')
  @ApiOperation({ summary: 'My CV submission history' })
  mySubmissions(@CurrentUser() user: any) {
    return this.cvSubmissions.mySubmissions(user.id);
  }

  @Get()
  @Roles(Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'All CV submissions (admin)' })
  listAll() {
    return this.cvSubmissions.listAll();
  }

  @Post()
  @ApiOperation({ summary: 'Submit CV for professional review' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/cv-submissions',
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `cv-${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_CV_TYPES.includes(file.mimetype)) {
          return cb(new BadRequestException('Only PDF and Word documents are accepted'), false);
        }
        cb(null, true);
      },
    }),
  )
  submit(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: { notes?: string },
  ) {
    if (!file) throw new BadRequestException('No file uploaded');
    return this.cvSubmissions.submit(user.id, file, body.notes);
  }

  @Patch(':id/status')
  @Roles(Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'Update CV submission status' })
  updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; reviewerNote?: string },
  ) {
    return this.cvSubmissions.updateStatus(id, body.status, body.reviewerNote);
  }
}
