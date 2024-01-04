import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Req,
} from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Response } from 'express';
import handlebars from 'handlebars';

@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) { }

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
  handleImages = async (images) => {
    const imgsUrls: any[] = [];
    for (const img of images) {
      const response = await fetch(`https://storage.bunnycdn.com/arep/${img}`, {
        headers: {
          AccessKey: 'e8bc0049-976f-4c50-a4193a7a5ce2-bddf-4aaa',
        }
      });
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      imgsUrls.push(url)
    }
    return (imgsUrls);
  };
  @Post('generate-pdf')
  async generatePdf(@Res() res: Response, @Body() data: any) {
    // Register #eq helper
    handlebars.registerHelper('eq', function (a, b, options) {
      return a === b ? options.fn(this) : options.inverse(this);
    });
    handlebars.registerHelper('formatCurrency', function (value) {
      // Use Intl.NumberFormat to format the number as currency
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
      }).format(value).replace('$', ''); // Remove the currency symbol
    });
    // const images = await this.handleImages(data.images)
    const images = (data.images)
    const today: Date = new Date();
    const formattedDate: string = `${today.getDate()}/${today.getMonth() + 1
      }/${today.getFullYear()}`;
    data = {
      // Your dynamic data here
      num_marche : data.project_number,
      title: data?.title,
      date: formattedDate,
      cadre_administratif: data?.cadre_administratif,
      montant_du_marche: data?.amount,
      titulaire: data?.contractor,
      date_os: new Date(data?.DateDeCommencement).toLocaleDateString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      }),
      delai_previsionnel: data?.duration,
      consistance_des_travaux: data?.consistance_des_travaux,
      points_de_blocage: data.points_de_blocage,
      points_particuliers: data?.points_particuliers,
      av_delai: data?.predprogress,
      av_physique: data?.realprogress,
      av_financier: data?.paidprogress,
      montant_paye: data?.dernierDecompteMontant,
      image1: images.length >= 1 ? images[0] : 'https://firebasestorage.googleapis.com/v0/b/arep-b1382.appspot.com/o/2023_12_22_101240_7990453.jpg?alt=media&token=9dddf043-6342-439d-bce2-aad54a2a6bcd',
      image2: images.length >= 2 ? images[1] : 'https://firebasestorage.googleapis.com/v0/b/arep-b1382.appspot.com/o/2023_12_22_101240_7990453.jpg?alt=media&token=9dddf043-6342-439d-bce2-aad54a2a6bcd'
    };

    const pdfBuffer = await this.projectsService.generatePdf(data);
    if (pdfBuffer) {
      console.log("buffer send");
    }
    // Set response headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=your-file.pdf');
    res.send(pdfBuffer);
  }
}
