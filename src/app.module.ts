import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { BunnycdnService } from './core/bunnycdn/bunnycdn.service';
import { ProgramsModule } from './modules/programs/programs.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { PrismaService } from './core/prisma-service/prisma-service.service';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [ProgramsModule, ProjectsModule, ScheduleModule.forRoot()],
  controllers: [AppController],
  providers: [AppService, BunnycdnService, PrismaService],
})
export class AppModule {}
