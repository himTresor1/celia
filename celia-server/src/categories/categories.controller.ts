import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Categories & Reference Data')
@Controller('categories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class CategoriesController {
  constructor(private categoriesService: CategoriesService) {}

  @Get('events')
  @ApiOperation({ summary: 'Get all event categories' })
  @ApiResponse({
    status: 200,
    description: 'List of event categories',
  })
  getEventCategories() {
    return this.categoriesService.getEventCategories();
  }

  @Get('interests')
  @ApiOperation({ summary: 'Get all interest categories' })
  @ApiResponse({
    status: 200,
    description: 'List of interest categories',
  })
  getInterestCategories() {
    return this.categoriesService.getInterestCategories();
  }

  @Get('colleges')
  @ApiOperation({ summary: 'Get all colleges' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search colleges by name or location',
  })
  @ApiResponse({
    status: 200,
    description: 'List of colleges',
  })
  getColleges(@Query('search') search?: string) {
    return this.categoriesService.getColleges(search);
  }
}
