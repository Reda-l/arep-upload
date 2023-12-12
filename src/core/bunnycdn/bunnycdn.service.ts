import { Injectable } from '@nestjs/common';
import BunnyStorage from 'bunnycdn-storage';

@Injectable()
export class BunnycdnService {
    // bunnyCdn credentials
    private readonly apiKey = 'e8bc0049-976f-4c50-a4193a7a5ce2-bddf-4aaa';
    private readonly storageZoneName = 'arep';
    private readonly region = '';

    private readonly bunnyStorage: any;

    constructor() {
        this.bunnyStorage = new BunnyStorage(this.apiKey, this.storageZoneName, this.region);
    }

    async uploadFile(filename: string, fileBuffer: Buffer): Promise<void> {
    
      return  await this.bunnyStorage.upload(fileBuffer, filename);
    }
}
