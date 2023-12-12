import { Module } from '@nestjs/common';
import { ProgramsService } from './programs.service';
import { ProgramsController } from './programs.controller';
import { BunnycdnService } from 'src/core/bunnycdn/bunnycdn.service';

@Module({
  controllers: [ProgramsController],
  providers: [ProgramsService, BunnycdnService]
})
export class ProgramsModule {}
