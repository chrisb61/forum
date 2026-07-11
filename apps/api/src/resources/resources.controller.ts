import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Body,
  Query,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiConsumes } from '@nestjs/swagger';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { ResourcesService } from './resources.service';
import { CurrentUser } from '../common/decorators/user.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { Role } from '@forum/database';

const ALLOWED_DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-powerpoint',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  'audio/mpeg',
  'audio/mp4',
  'audio/wav',
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
];

@ApiTags('Library')
@ApiBearerAuth()
@Controller('library')
export class ResourcesController {
  constructor(private readonly resources: ResourcesService) {}

  @Get()
  @ApiOperation({ summary: 'List approved library resources' })
  list(
    @CurrentUser() user: any,
    @Query('type') type?: string,
    @Query('category') category?: string,
  ) {
    return this.resources.list(user.id, { type, category });
  }

  @Get('pending')
  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'Moderation queue — pending resources' })
  listPending() {
    return this.resources.listPending();
  }

  @Get('my-uploads')
  @ApiOperation({ summary: 'My uploaded resources' })
  myUploads(@CurrentUser() user: any) {
    return this.resources.myUploads(user.id);
  }

  @Get('my-stats')
  @ApiOperation({ summary: 'Download stats for my content' })
  myStats(@CurrentUser() user: any) {
    return this.resources.myDownloadStats(user.id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a single resource' })
  findOne(@Param('id') id: string) {
    return this.resources.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Upload a resource to the library' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: './uploads/library',
        filename: (req, file, cb) => {
          const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
          cb(null, `resource-${unique}${extname(file.originalname)}`);
        },
      }),
      limits: { fileSize: 50 * 1024 * 1024 },
      fileFilter: (req, file, cb) => {
        if (!ALLOWED_DOC_TYPES.includes(file.mimetype)) {
          return cb(new BadRequestException('File type not allowed'), false);
        }
        cb(null, true);
      },
    }),
  )
  upload(
    @CurrentUser() user: any,
    @UploadedFile() file: Express.Multer.File,
    @Body() body: any,
  ) {
    return this.resources.upload(
      user.id,
      {
        title: body.title,
        description: body.description,
        type: body.type,
        embedUrl: body.embedUrl,
        category: body.category,
        tags: body.tags ? body.tags.split(',').map((t: string) => t.trim()) : [],
        ipDeclared: body.ipDeclared === 'true',
        visibility: body.visibility,
        groupId: body.groupId,
      },
      file,
    );
  }

  @Post(':id/download')
  @ApiOperation({ summary: 'Track a download' })
  trackDownload(@Param('id') id: string, @CurrentUser() user: any) {
    return this.resources.trackDownload(id, user.id);
  }

  @Patch(':id/moderate')
  @Roles(Role.MODERATOR, Role.ADMINISTRATOR)
  @ApiOperation({ summary: 'Approve, reject or flag a resource' })
  moderate(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() body: { action: 'APPROVED' | 'REJECTED' | 'FLAGGED'; note?: string },
  ) {
    return this.resources.moderate(id, user.id, body.action, body.note);
  }
}
