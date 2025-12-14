import { CategoriesService } from './categories.service';
export declare class CategoriesController {
    private categoriesService;
    constructor(categoriesService: CategoriesService);
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
