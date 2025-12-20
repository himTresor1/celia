import { Body, Controller, Post, Get, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendSignupOtpDto } from './dto/send-signup-otp.dto';
import { VerifySignupOtpDto } from './dto/verify-signup-otp.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({
    status: 201,
    description: 'User successfully registered',
  })
  @ApiResponse({
    status: 409,
    description: 'User with this email already exists',
  })
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({
    status: 200,
    description: 'User successfully logged in',
  })
  @ApiResponse({
    status: 401,
    description: 'Invalid credentials',
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('send-signup-otp')
  @ApiOperation({ summary: 'Send OTP for signup' })
  @ApiResponse({
    status: 200,
    description: 'OTP sent successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'User not found',
  })
  sendSignupOtp(@Body() dto: SendSignupOtpDto) {
    return this.authService.sendSignupOtp(dto);
  }

  @Post('verify-signup-otp')
  @ApiOperation({ summary: 'Verify signup OTP' })
  @ApiResponse({
    status: 200,
    description: 'OTP verified successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid or expired OTP',
  })
  verifySignupOtp(@Body() dto: VerifySignupOtpDto) {
    return this.authService.verifySignupOtp(dto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Current user profile',
  })
  @ApiResponse({
    status: 401,
    description: 'Unauthorized',
  })
  getMe(@CurrentUser() user: any) {
    return this.authService.getMe(user.id);
  }
}
