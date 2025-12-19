import { CitiesService } from './cities.service';
export declare class CitiesController {
    private citiesService;
    constructor(citiesService: CitiesService);
    findAll(search?: string, limit?: string): Promise<{
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
}
