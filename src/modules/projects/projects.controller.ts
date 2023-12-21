import { Controller, Get, Post, Body, Patch, Param, Delete, Res } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Response } from 'express';

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

  @Get('generate-pdf')
  async generatePdf(@Res() res: Response) {
    const data = {
      // Your dynamic data here
      title: 'Marche N 17/2022 Your dynamic title test',
      cadre_administratif: {
        label: 'programmation', // or 'programmation'/convention
        value: '100',
      },
    };

    const pdfBuffer = await this.projectsService.generatePdf(data);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=your-file.pdf');
    res.send(pdfBuffer);
  }
 
}
