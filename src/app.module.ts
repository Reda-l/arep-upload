import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BunnycdnService } from './core/bunnycdn/bunnycdn.service';

@Module({
  imports: [],
  controllers: [AppController],
  providers: [AppService, BunnycdnService],
})
export class AppModule {}
