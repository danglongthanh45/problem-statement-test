import { Controller, HttpStatus, Post, UploadedFile, UseGuards, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import AuthUser from 'src/decorators/auth-user.decorator';
import { CustomResponse } from 'src/filter/custom-response';
import { HandleFileService } from './handle-file.service';

@Controller('api')
export class HandleFileController {
  constructor(private readonly appService: HandleFileService) {}

  @Post('upload-file-import')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @AuthUser() userId: number,
    ) {
    await this.appService.handleUploadFile(file, userId);
    const res = new CustomResponse();
    res.statusCode = HttpStatus.OK;
    res.message = "Upload file import success, please check your import file history to see handle file process"
    return res;
  }
}
