import { Controller, Get, Post, Body, Patch, Param, Delete, UploadedFile, UseInterceptors, UploadedFiles } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { BunnycdnService } from 'src/core/bunnycdn/bunnycdn.service';
import { AnyFilesInterceptor, FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import * as admin from 'firebase-admin';
import { diskStorage } from 'multer'
import { extname } from 'path'

@Controller('programs')
export class ProgramsController {
  constructor(private readonly programsService: ProgramsService, private bunnyCDNService: BunnycdnService) { }

  // Upload img in bunnyCDN
  @Post('upload/file')
  @UseInterceptors(
    FileInterceptor('file')
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
    const Decomptes = data?.data ? JSON.parse(data?.data)?.Decomptes : []
    const rapports = data?.data ? JSON.parse(data?.data)?.rapports : []
    const images = data?.data ? JSON.parse(data?.data)?.images : []
    const newData: any = {}
    let decomptesCounter = 0
    let rapportsCounter = 0
    let imagesCounter = 0
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
        if (!newData[file.fieldname]) {
          newData[file.fieldname] = []
        }
        if (file.fieldname === "Decomptes") {
          newData[file.fieldname].push({
            ...Decomptes[decomptesCounter],
            fichier: filePath,
          })
          decomptesCounter++
        } else if (file.fieldname === "rapports") {
          newData[file.fieldname].push({
            ...rapports[rapportsCounter],
            fichier: filePath,
          })
          rapportsCounter++
        } else if (file.fieldname === "images") {
          newData[file.fieldname].push({
            ...images[imagesCounter],
            fichier: filePath,
          })
          imagesCounter++
        }
        else {
          newData[file.fieldname]?.push(filePath);
        }
      }
    }
    return newData

  }
  // Upload img in firebase
  @Post('upload/firebase/file')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        // destination: './uploads',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('')
          cb(null, `${randomName}${extname(file.originalname)}`)
        }
      })
    })
  )
  async uploadFirebaseFile(@UploadedFile() file): Promise<any> {
    if (!file) return null;
    const bucketName = 'arep-b1382.appspot.com';
    const bucket = admin.storage().bucket(bucketName);
    const folder = "images"
    const options = {
      public: true,
      destination: folder + '/' + file.filename,
    };
    await bucket.upload(file.path, options);
    const fileUrl = `https://storage.googleapis.com/${bucketName}/${folder}/${file.filename}`;
    console.log(`File uploaded successfully: ${fileUrl}`);

    return fileUrl;
  }

  async deleteFile(filePath: string): Promise<any> {
    if (!filePath) return null;
    const bucketName = 'arep-b1382.appspot.com';
    const fileName = filePath.split('/').pop();
    const file = await admin
      .storage()
      .bucket(bucketName)
      .file("images" + '/' + fileName);
    file
      .exists()
      .then((exists) => {
        if (!exists[0]) {
          console.error('File does not exist');
          return;
        }
        // Delete the file
        file
          .delete()
          .then(() => {
            console.log('File deleted successfully');
          })
          .catch((error) => {
            console.error('Error deleting file:', error);
          });
      })
      .catch((error) => {
        console.error('Error checking file existence:', error);
      });
  }

}
