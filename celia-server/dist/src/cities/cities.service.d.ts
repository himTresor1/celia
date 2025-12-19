import { PrismaService } from '../prisma/prisma.service';
export declare class CitiesService {
    private prisma;
    constructor(prisma: PrismaService);
    findAll(search?: string, limit?: number): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        country: string | null;
    }[]>;
    findOne(id: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        country: string | null;
    }>;
    findByIds(ids: string[]): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        country: string | null;
    }[]>;
    create(name: string, country?: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        country: string | null;
    }>;
    createMany(cities: Array<{
        name: string;
        country?: string;
    }>): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        country: string | null;
    }[]>;
}
