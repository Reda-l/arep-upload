import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Cron, CronExpression } from '@nestjs/schedule';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @Post('updateInProgressProjects')
  async updateInProgressProjects(): Promise<void> {
    await this.projectsService.updateInProgressProjects();
  }

  // Schedule the cron job to run every day at 7 AM
  @Cron(CronExpression.EVERY_DAY_AT_7AM)
  async updateInProgressProjectsScheduled(): Promise<void> {
    await this.projectsService.updateInProgressProjects();
  }

  @Get('findAllProjects')
  async findAllProjects(): Promise<any[]> {
    return this.projectsService.findAllProjects();
  }

 
}
