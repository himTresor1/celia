import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Query,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Events')
@Controller('events')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class EventsController {
  constructor(private eventsService: EventsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new event' })
  @ApiResponse({
    status: 201,
    description: 'Event created successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid event data',
  })
  create(@CurrentUser() user: any, @Body() dto: CreateEventDto) {
    return this.eventsService.create(user.id, dto);
  }

  @Get('my')
  @ApiOperation({ summary: 'Get my events (events I created)' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (draft, active, cancelled, completed)',
  })
  @ApiResponse({
    status: 200,
    description: 'List of my events',
  })
  getMyEvents(
    @CurrentUser() user: any,
    @Query('status') status?: string,
  ) {
    return this.eventsService.getMyEvents(user.id, status);
  }

  @Get()
  @ApiOperation({ summary: 'Get all accessible events' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (draft, active, cancelled, completed)',
  })
  @ApiQuery({
    name: 'categoryId',
    required: false,
    description: 'Filter by category ID',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name, description, or location',
  })
  @ApiResponse({
    status: 200,
    description: 'List of events',
  })
  findAll(
    @CurrentUser() user: any,
    @Query('status') status?: string,
    @Query('categoryId') categoryId?: string,
    @Query('search') search?: string,
  ) {
    return this.eventsService.findAll(user.id, status, categoryId, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get event by ID' })
  @ApiResponse({
    status: 200,
    description: 'Event details',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No access to this event',
  })
  findOne(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.findOne(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update event' })
  @ApiResponse({
    status: 200,
    description: 'Event updated successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only host can update',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateEventDto,
  ) {
    return this.eventsService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete event' })
  @ApiResponse({
    status: 200,
    description: 'Event deleted successfully',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Only host can delete',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  delete(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.delete(id, user.id);
  }

  @Post(':id/join')
  @ApiOperation({ summary: 'Join an event' })
  @ApiResponse({
    status: 201,
    description: 'Successfully joined event',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Already attending or event full',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Not invited to private event',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  joinEvent(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.joinEvent(id, user.id);
  }

  @Delete(':id/leave')
  @ApiOperation({ summary: 'Leave an event' })
  @ApiResponse({
    status: 200,
    description: 'Successfully left event',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Not attending or host cannot leave',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  leaveEvent(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.leaveEvent(id, user.id);
  }

  @Get(':id/attendees')
  @ApiOperation({ summary: 'Get event attendees' })
  @ApiResponse({
    status: 200,
    description: 'List of event attendees',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - No access to this event',
  })
  @ApiResponse({
    status: 404,
    description: 'Event not found',
  })
  getAttendees(@Param('id') id: string, @CurrentUser() user: any) {
    return this.eventsService.getEventAttendees(id, user.id);
  }
}
