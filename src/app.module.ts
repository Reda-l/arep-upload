import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BunnycdnService } from './core/bunnycdn/bunnycdn.service';
import { ProgramsModule } from './modules/programs/programs.module';
import { ProjectsModule } from './modules/projects/projects.module';

@Module({
  imports: [ProgramsModule, ProjectsModule],
  controllers: [AppController],
  providers: [AppService, BunnycdnService],
})
export class AppModule {}
