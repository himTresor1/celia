import { PrismaService } from '../prisma/prisma.service';
export declare class CategoriesService {
    private prisma;
    constructor(prisma: PrismaService);
    getEventCategories(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        icon: string | null;
    }[]>;
    getInterestCategories(): Promise<{
        id: string;
        createdAt: Date;
        name: string;
    }[]>;
    getColleges(search?: string): Promise<{
        id: string;
        createdAt: Date;
        name: string;
        domain: string | null;
        location: string | null;
    }[]>;
}
