import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { SendSignupOtpDto } from './dto/send-signup-otp.dto';
import { VerifySignupOtpDto } from './dto/verify-signup-otp.dto';
import { EmailService } from '../email/email.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async register(dto: RegisterDto & { otpCode?: string }) {
    console.log('[AUTH] Register attempt:', { email: dto.email, fullName: dto.fullName });

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      console.log('[AUTH] Register failed - User exists:', dto.email);
      throw new ConflictException('User with this email already exists');
    }

    // Verify OTP if provided
    if (dto.otpCode) {
      const otp = await this.prisma.signupOtp.findFirst({
        where: {
          email: dto.email,
          code: dto.otpCode,
          verified: false,
        },
        orderBy: {
          createdAt: 'desc',
        },
      });

      if (!otp || new Date() > otp.expiresAt) {
        throw new BadRequestException('Invalid or expired OTP code');
      }

      // Mark OTP as verified
      await this.prisma.signupOtp.update({
        where: { id: otp.id },
        data: { verified: true },
      });
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    console.log('[AUTH] Password hashed successfully');

    try {
      const user = await this.prisma.user.create({
        data: {
          email: dto.email,
          password: hashedPassword,
          fullName: dto.fullName,
          bio: '',
          interests: [],
          preferredLocations: [],
          profileCompleted: false, // Will be completed via profile-setup screen
          emailVerified: !!dto.otpCode, // Mark as verified if OTP was provided
        },
        select: {
          id: true,
          email: true,
          fullName: true,
          collegeName: true,
          major: true,
          graduationYear: true,
          bio: true,
          avatarUrl: true,
          photoUrls: true,
          interests: true,
          preferredLocations: true,
          collegeVerified: true,
          profileCompleted: false,
          createdAt: true,
          updatedAt: true,
        },
      });

      console.log('[AUTH] User created successfully:', { id: user.id, email: user.email });

      const token = this.generateToken(user.id, user.email);
      console.log('[AUTH] JWT token generated');

      return {
        user,
        token,
      };
    } catch (error) {
      console.error('[AUTH] Database error during registration:', error);
      throw error;
    }
  }

  async login(dto: LoginDto) {
    console.log('[AUTH] Login attempt:', { email: dto.email });

    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      console.log('[AUTH] Login failed - User not found:', dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('[AUTH] User found, verifying password');
    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      console.log('[AUTH] Login failed - Invalid password:', dto.email);
      throw new UnauthorizedException('Invalid credentials');
    }

    console.log('[AUTH] Login successful:', { id: user.id, email: user.email });

    const { password, ...userWithoutPassword } = user;

    const token = this.generateToken(user.id, user.email);
    console.log('[AUTH] JWT token generated');

    return {
      user: userWithoutPassword,
      token,
    };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        fullName: true,
        collegeName: true,
        major: true,
        graduationYear: true,
        bio: true,
        avatarUrl: true,
        photoUrls: true,
        interests: true,
        preferredLocations: true,
        preferredCityIds: true,
        collegeVerified: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  async sendSignupOtp(dto: SendSignupOtpDto) {
    console.log('[AUTH] Sending signup OTP to:', dto.email);

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Generate 6-digit OTP
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + 10); // OTP expires in 10 minutes

    // Delete any existing OTPs for this email
    await this.prisma.signupOtp.deleteMany({
      where: { email: dto.email },
    });

    // Create new OTP
    await this.prisma.signupOtp.create({
      data: {
        email: dto.email,
        code,
        expiresAt,
      },
    });

    // Send OTP via email
    await this.emailService.sendSignupOtpEmail(dto.email, code);

    console.log('[AUTH] OTP sent successfully to:', dto.email);
    return { message: 'OTP sent successfully' };
  }

  async verifySignupOtp(dto: VerifySignupOtpDto) {
    console.log('[AUTH] Verifying OTP for:', dto.email);

    const otp = await this.prisma.signupOtp.findFirst({
      where: {
        email: dto.email,
        code: dto.code,
        verified: false,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!otp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    if (new Date() > otp.expiresAt) {
      throw new BadRequestException('OTP has expired');
    }

    // Mark OTP as verified
    await this.prisma.signupOtp.update({
      where: { id: otp.id },
      data: { verified: true },
    });

    console.log('[AUTH] OTP verified successfully for:', dto.email);
    return { message: 'OTP verified successfully' };
  }

  private generateToken(userId: string, email: string) {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }
}
