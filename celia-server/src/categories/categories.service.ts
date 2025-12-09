import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async getEventCategories() {
    return this.prisma.eventCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getInterestCategories() {
    return this.prisma.interestCategory.findMany({
      orderBy: {
        name: 'asc',
      },
    });
  }

  async getColleges(search?: string) {
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: 'insensitive' as const } },
            { location: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    return this.prisma.college.findMany({
      where,
      orderBy: {
        name: 'asc',
      },
    });
  }
}
