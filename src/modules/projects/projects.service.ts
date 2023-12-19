import { Injectable } from '@nestjs/common';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { PrismaService } from 'src/core/prisma-service/prisma-service.service';

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
      if (DateDeCommencement && duration) {
        const completionPercentage = this.calculateCompletionPercentage(currentDate, DateDeCommencement, duration);

        await this.prisma.project.update({
          where: { id: project.id },
          data: { predprogress: completionPercentage.toString() },
        });
      }
    }
  }

  private calculateCompletionPercentage(currentDate: Date, startDate: Date, duration: string): number {
    const totalDurationInDays = parseInt(duration, 10) * 30;
    const elapsedDurationInDays = this.getDaysDiff(startDate, currentDate);

    const progress = Math.min((elapsedDurationInDays / totalDurationInDays) * 100, 100);

    // Ensure the progress is capped at 100%
    return Math.round(progress * 100) / 100; // Rounding to two decimal places
  }

  private getDaysDiff(date1: Date, date2: Date): number {
    const oneDayMilliseconds = 24 * 60 * 60 * 1000; // One day in milliseconds
    return Math.round(Math.abs((date1.getTime() - date2.getTime()) / oneDayMilliseconds));
  }



}
