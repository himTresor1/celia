import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { RecommendationsService } from './recommendations.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { RecommendationFiltersDto } from './dto/recommendation-filters.dto';

@Controller('recommendations')
@UseGuards(JwtAuthGuard)
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get('suggestions')
  async getSmartSuggestions(
    @CurrentUser() user: any,
    @Query() filters: RecommendationFiltersDto,
  ) {
    const limit = filters.limit || 50;
    delete filters.limit;

    return this.recommendationsService.getSmartSuggestions(
      user.sub,
      filters,
      limit,
    );
  }

  @Get('filtered')
  async getFilteredUsers(
    @CurrentUser() user: any,
    @Query() filters: RecommendationFiltersDto,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.recommendationsService.getFilteredUsers(
      user.sub,
      filters,
      page ? parseInt(page) : 1,
      limit ? parseInt(limit) : 50,
    );
  }
}
