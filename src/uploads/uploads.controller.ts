import {
  Controller,
  Post,
  UseInterceptors,
  UploadedFile,
  Query,
  Req,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Request } from 'express';
import { UploadsService } from './uploads.service';

@Controller()
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) { }

  /**
   * Universal upload-image endpoint: POST /upload-image
   * Accessible directly at the root api level (e.g. /api/upload-image)
   */
  @Post('upload-image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageRoot(
    @UploadedFile() file: Express.Multer.File,
    @Query('storage') storage?: 'local' | 'bunny',
    @Req() request?: Request,
  ) {
    if (!file) {
      throw new BadRequestException('File is required (form-data field name: "file")');
    }
    const hostUrl = `${request.protocol}://${request.get('host')}`;
    return this.uploadsService.uploadImage(file, storage, hostUrl);
  }

  /**
   * Modular upload-image endpoint: POST /uploads/image
   * Also accessible under the uploads prefix
   */
  @Post('uploads/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImageModular(
    @UploadedFile() file: Express.Multer.File,
    @Query('storage') storage?: 'local' | 'bunny',
    @Req() request?: Request,
  ) {
    if (!file) {
      throw new BadRequestException('File is required (form-data field name: "file")');
    }
    const hostUrl = `${request.protocol}://${request.get('host')}`;
    return this.uploadsService.uploadImage(file, storage, hostUrl);
  }

  /**
   * Universal upload-subtitle endpoint: POST /upload-subtitle
   * Accessible directly at the root api level (e.g. /api/upload-subtitle)
   */
  @Post('upload-subtitle')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSubtitleRoot(
    @UploadedFile() file: Express.Multer.File,
    @Query('storage') storage?: 'local' | 'bunny',
    @Req() request?: Request,
  ) {
    if (!file) {
      throw new BadRequestException('File is required (form-data field name: "file")');
    }
    const hostUrl = `${request.protocol}://${request.get('host')}`;
    return this.uploadsService.uploadSubtitle(file, storage, hostUrl);
  }

  /**
   * Modular upload-subtitle endpoint: POST /uploads/subtitle
   * Also accessible under the uploads prefix
   */
  @Post('uploads/subtitle')
  @UseInterceptors(FileInterceptor('file'))
  async uploadSubtitleModular(
    @UploadedFile() file: Express.Multer.File,
    @Query('storage') storage?: 'local' | 'bunny',
    @Req() request?: Request,
  ) {
    if (!file) {
      throw new BadRequestException('File is required (form-data field name: "file")');
    }
    const hostUrl = `${request.protocol}://${request.get('host')}`;
    return this.uploadsService.uploadSubtitle(file, storage, hostUrl);
  }
}
