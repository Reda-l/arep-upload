import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { BunnycdnService } from 'src/core/bunnycdn/bunnycdn.service';
import { FileInterceptor } from '@nestjs/platform-express';


@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService, private bunnyCDNService: BunnycdnService) { }

  // Upload img in bunnyCDN
  @Post('upload/image')
  @UseInterceptors(
    FileInterceptor('image')
  )
  async upload(@UploadedFile() file): Promise<string> {
    let filePath: string = ''

    const folderPath = 'programme/images'; // upload path in bunny

    if (file) {
        const { buffer } = file;
        const currentDate = new Date().toISOString().replace(/[^a-zA-Z0-9]/g, '_').split('T')[0];
        const currentTime = new Date().toISOString().split('T')[1].replace(/\..+/, '').replace(/:/g, '');
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_').replace(/ /g, '_');
        const randomName = `${currentDate}_${currentTime}_${originalName}`;
        const filenameWithFolder = `${folderPath}/${randomName}`;
        filePath = filenameWithFolder;
        await this.bunnyCDNService.uploadFile(filenameWithFolder, buffer);
    }

    return filePath;
  }
}
