import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Response } from 'express';
import handlebars from 'handlebars';

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
    // Register #eq helper
    handlebars.registerHelper('eq', function (a, b, options) {
      return a === b ? options.fn(this) : options.inverse(this);
    });
    const today: Date = new Date();
    const formattedDate: string = `${today.getDate()}/${
      today.getMonth() + 1
    }/${today.getFullYear()}`;
    const data = {
      // Your dynamic data here
      title: `Marche N 17/2022 TRAVAUX D'AMENAGEMENT DE 13 TERRAINS DE PROXIMITE MULTIDISCIPLINAIRE EN MILIEU `,
      date: formattedDate,
      cadre_administratif: {
        label: 'programmation', // or 'programmation'/convention
        value: '100',
      },
      montant_du_marche: '46 269 380.77',
      titulaire: 'STRO',
      date_os: '10/02/2023',
      delai_previsionnel: '18',
      consistance_des_travaux: [
        'Construction de canal en béton armé sur un linéaire de 3.45km',
        'Construction de six Dalots',
      ],
      points_de_blocage: [
        
      ],
      points_particuliers: [
        'Présence de sol vaseux sur le fond de fouille',
        'Travaux dans un milieu saturé',
      ],
      av_delai: '53',
      av_physique: '60',
      av_financier: '50',
      montant_paye: '200500',
    };
    
    const pdfBuffer = await this.projectsService.generatePdf(data);

    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=your-file.pdf');
    res.send(pdfBuffer);
  }
}
