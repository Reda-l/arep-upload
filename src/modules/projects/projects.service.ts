import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/core/prisma-service/prisma-service.service';
import * as handlebars from 'handlebars';
import puppeteer from 'puppeteer';
import * as fs from 'fs';
import { BreakPeriods } from '@prisma/client';

@Injectable()
export class ProjectsService {
  constructor(private prisma: PrismaService) { }

  async findAllProjects(): Promise<any[]> {
    return this.prisma.project.findMany();
  }

  async updateInProgressProjects(): Promise<void> {
    const currentDate = new Date();
    const projectsToUpdate = await this.prisma.project.findMany({
      where: {
        status: {
          not: 'achevé', // Exclude projects with status 'achevé'
        },
      },
    });
  
    for (const project of projectsToUpdate) {
      const { DateDeCommencement, duration } = project;
      // Fetch BreakPeriods for the current project
      const breakPeriods = await this.prisma.breakPeriods.findMany({
        where: {
          projectId: project.id,
        },
      });
  
      if (DateDeCommencement && duration) {
        const completionPercentage = this.calculateCompletionPercentage(
          currentDate,
          DateDeCommencement,
          duration,
          breakPeriods || [] // Pass breakPeriods array or an empty array if it's null or undefined
        );
  
        await this.prisma.project.update({
          where: { id: project.id },
          data: { predprogress: completionPercentage.toString() },
        });
      
    }
  }
  }
  
  private calculateCompletionPercentage(currentDate: Date, startDate: Date, duration: string, breakPeriods: any[]): number {
    const totalDurationInDays = parseInt(duration, 10) * 30;
  
    // Calculate the sum of break periods' breakPeriodInDays
    const breakPeriodsDuration = breakPeriods.reduce((sum, breakPeriod) => {
      return sum + (breakPeriod.breakPeriodInDays || 0);
    }, 0);
  
    const elapsedDurationInDays = this.getDaysDiff(startDate, currentDate) - breakPeriodsDuration;
  
    // Ensure elapsed duration is at least 0 to avoid negative progress
    const nonNegativeElapsedDuration = Math.max(elapsedDurationInDays, 0);

    const progress = Math.min((nonNegativeElapsedDuration / totalDurationInDays) * 100, 100);
    // const progress = (elapsedDurationInDays / totalDurationInDays) * 100;

    // Ensure the progress is capped at 100%
    return Math.round(progress * 100) / 100; // Rounding to two decimal places
  }

  private getDaysDiff(date1: Date, date2: Date): number {
    const oneDayMilliseconds = 24 * 60 * 60 * 1000; // One day in milliseconds
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDayMilliseconds));
  }

  async generatePdf(data: any): Promise<Buffer> {

    // Read your HTML template file
    const templateHtml = fs.readFileSync('templates/index.hbs', 'utf-8');
    // Register Handlebars helper
    // handlebars.registerHelper('eq', function (a, b, options) {
    //   return a === b ? options.fn(this) : options.inverse(this);
    // });
    // Compile the HTML template using Handlebars
    const template = handlebars.compile(templateHtml);

    // Replace placeholders in the template with dynamic data
    const html = template(data);

    // Launch Puppeteer
    const browser = await puppeteer.launch({
      executablePath: '/usr/bin/chromium-browser',
      args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
    });
    const page = await browser.newPage();

    // Set content to the dynamically generated HTML
    await page.setContent(html);

    // Generate PDF buffer
    const pdfBuffer = await page.pdf({
      width: '1500px',
      height: '2000px',
      printBackground: true,
      landscape:true,
      margin: {
        top: '20px',
        bottom: '20px',
        left: '0px',
        right: '0px',
      },
    });

    // Close Puppeteer
    await browser.close();

    return pdfBuffer;
  }


}
