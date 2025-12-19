import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { CitiesService } from './cities.service';

@ApiTags('Cities')
@Controller('cities')
export class CitiesController {
  constructor(private citiesService: CitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cities with optional search' })
  @ApiQuery({ name: 'search', required: false, description: 'Search cities by name' })
  @ApiQuery({ name: 'limit', required: false, description: 'Limit number of results', type: Number })
  @ApiResponse({
    status: 200,
    description: 'List of cities',
  })
  async findAll(
    @Query('search') search?: string,
    @Query('limit') limit?: string,
  ) {
    const limitNum = limit ? parseInt(limit, 10) : undefined;
    return this.citiesService.findAll(search, limitNum);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get city by ID' })
  @ApiResponse({
    status: 200,
    description: 'City details',
  })
  @ApiResponse({
    status: 404,
    description: 'City not found',
  })
  async findOne(@Param('id') id: string) {
    return this.citiesService.findOne(id);
  }
}

