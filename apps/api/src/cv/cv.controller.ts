import { Controller, Post, UseInterceptors, UploadedFile, Req } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { CvService } from './cv.service';
import { Public } from '../auth/decorators/public.decorator';

@ApiTags('CV')
@ApiBearerAuth()
@Controller('cv')
export class CvController {
  constructor(private readonly cvService: CvService) {}

  @Public()
  @Post('parse')
  @ApiOperation({ summary: 'Parse a CV and extract profile data' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 10 * 1024 * 1024 } }))
  async parse(@UploadedFile() file: Express.Multer.File, @Req() req: any) {
    return this.cvService.parseCV(file.buffer, file.mimetype, file.originalname);
  }
}
