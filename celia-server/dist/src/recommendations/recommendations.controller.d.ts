import { RecommendationsService } from './recommendations.service';
import { RecommendationFiltersDto } from './dto/recommendation-filters.dto';
export declare class RecommendationsController {
    private readonly recommendationsService;
    constructor(recommendationsService: RecommendationsService);
    getSmartSuggestions(user: any, filters: RecommendationFiltersDto): Promise<any[]>;
    getFilteredUsers(user: any, filters: RecommendationFiltersDto, page?: string, limit?: string): Promise<any>;
}
