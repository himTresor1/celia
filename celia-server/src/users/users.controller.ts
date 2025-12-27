import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Body,
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
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateLocationDto } from './dto/update-location.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Users')
@Controller('users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with optional filters' })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search by name, college, or major',
  })
  @ApiQuery({
    name: 'interests',
    required: false,
    description: 'Filter by interests (comma-separated)',
  })
  @ApiQuery({
    name: 'college',
    required: false,
    description: 'Filter by college name',
  })
  @ApiResponse({
    status: 200,
    description: 'List of users',
  })
  findAll(
    @Query('search') search?: string,
    @Query('interests') interests?: string,
    @Query('college') college?: string,
  ) {
    const interestArray = interests ? interests.split(',') : undefined;
    return this.usersService.findAll(search, interestArray, college);
  }

  @Get('recommendations')
  @ApiOperation({
    summary: 'Get user recommendations based on Celia Algorithm',
  })
  @ApiQuery({
    name: 'lat',
    required: false,
    type: Number,
    description: 'Latitude for location matching',
  })
  @ApiQuery({
    name: 'lng',
    required: false,
    type: Number,
    description: 'Longitude for location matching',
  })
  @ApiResponse({
    status: 200,
    description: 'List of recommended users with match scores',
  })
  getRecommendations(
    @CurrentUser() user: any,
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
  ) {
    return this.usersService.getRecommendations(user.id, lat, lng);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({
    status: 200,
    description: 'User details',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Get(':id/stats')
  @ApiOperation({ summary: 'Get user statistics' })
  @ApiResponse({
    status: 200,
    description: 'User statistics',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  getUserStats(@Param('id') id: string) {
    return this.usersService.getUserStats(id);
  }

  @Get(':id/events')
  @ApiOperation({ summary: 'Get user events' })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['hosted', 'attending'],
    description: 'Type of events to retrieve',
  })
  @ApiResponse({
    status: 200,
    description: 'List of user events',
  })
  getUserEvents(
    @Param('id') id: string,
    @Query('type') type: 'hosted' | 'attending' = 'hosted',
  ) {
    return this.usersService.getUserEvents(id, type);
  }

  @Patch('push-token')
  @ApiOperation({ summary: 'Update user push notification token' })
  @ApiResponse({
    status: 200,
    description: 'Push token updated',
  })
  updatePushToken(
    @CurrentUser() user: any,
    @Body() dto: { pushToken: string },
  ) {
    return this.usersService.updatePushToken(user.id, dto.pushToken);
  }

  @Patch('location')
  @ApiOperation({ summary: 'Update user last known location' })
  @ApiResponse({
    status: 200,
    description: 'Location updated',
  })
  updateLocation(@CurrentUser() user: any, @Body() dto: UpdateLocationDto) {
    console.log('UpdateLocationDTO received:', dto);
    return this.usersService.updateLocation(user.id, dto.lat, dto.lng);
  }

  @Post('send-college-verification-otp')
  @ApiOperation({ summary: 'Send OTP for college email verification' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
  })
  sendCollegeVerificationOtp(
    @CurrentUser() user: any,
    @Body() dto: { email: string },
  ) {
    return this.usersService.sendCollegeVerificationOtp(user.id, dto.email);
  }

  @Post('verify-college-email')
  @ApiOperation({ summary: 'Verify college email with OTP' })
  @ApiResponse({
    status: 200,
    description: 'College email verified successfully',
  })
  verifyCollegeEmail(
    @CurrentUser() user: any,
    @Body() dto: { email: string; otpCode: string },
  ) {
    return this.usersService.verifyCollegeEmail(
      user.id,
      dto.email,
      dto.otpCode,
    );
  }

    @Patch(':id')
  @ApiOperation({ summary: 'Update user profile' })
  @ApiResponse({
    status: 200,
    description: 'User profile updated',
  })
  @ApiResponse({
    status: 403,
    description: 'Forbidden - Can only update own profile',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  update(
    @Param('id') id: string,
    @CurrentUser() user: any,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, user.id, dto);
  }
}
