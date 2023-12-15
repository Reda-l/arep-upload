import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { BunnycdnService } from 'src/core/bunnycdn/bunnycdn.service';
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';


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
      filePath = `${folderPath}/${randomName}`;
      await this.bunnyCDNService.uploadFile(filePath, buffer);
    }
    return filePath;
  }
  // Upload img in bunnyCDN
  @Post('upload/files')
  @UseInterceptors(
    AnyFilesInterceptor()
  )
  async uploadFile(@UploadedFiles() files, @Body() data) {
    const newData = {
      ordresDeServices: [],
      avenants: [],
      Decomptes: [],

    }
    for (const file of files) {
      const folderPath = 'programme/files'; // upload path in bunny
      let filePath: string = ''
      if (file) {
        const { buffer } = file;
        const currentDate = new Date().toISOString().replace(/[^a-zA-Z0-9]/g, '_').split('T')[0];
        const currentTime = new Date().toISOString().split('T')[1].replace(/\..+/, '').replace(/:/g, '');
        const originalName = file.originalname.replace(/[^a-zA-Z0-9.]/g, '_').replace(/ /g, '_');
        const randomName = `${currentDate}_${currentTime}_${originalName}`;
        filePath = `${folderPath}/${randomName}`;
        await this.bunnyCDNService.uploadFile(filePath, buffer);
        if (file.fieldname === "Decomptes") {
          newData[file.fieldname].push({ fichier: filePath, titre: file.originalname })
        } else
          newData[file.fieldname].push(filePath);
      }
    }
    return newData

  }

}
