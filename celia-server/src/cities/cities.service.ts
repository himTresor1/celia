import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(search?: string, limit?: number) {
    const where = search
      ? {
          name: {
            contains: search,
            mode: 'insensitive' as const,
          },
        }
      : {};

    const cities = await this.prisma.city.findMany({
      where,
      take: limit || 100,
      orderBy: {
        name: 'asc',
      },
    });

    return cities;
  }

  async findOne(id: string) {
    const city = await this.prisma.city.findUnique({
      where: { id },
    });

    if (!city) {
      throw new NotFoundException('City not found');
    }

    return city;
  }

  async findByIds(ids: string[]) {
    const cities = await this.prisma.city.findMany({
      where: {
        id: {
          in: ids,
        },
      },
      orderBy: {
        name: 'asc',
      },
    });

    return cities;
  }

  async create(name: string, country?: string) {
    return this.prisma.city.create({
      data: {
        name,
        country,
      },
    });
  }

  async createMany(cities: Array<{ name: string; country?: string }>) {
    // Use upsert to avoid duplicates
    const promises = cities.map((city) =>
      this.prisma.city.upsert({
        where: { name: city.name },
        update: {},
        create: {
          name: city.name,
          country: city.country,
        },
      })
    );

    return Promise.all(promises);
  }
}

