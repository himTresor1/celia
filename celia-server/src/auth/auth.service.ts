import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    console.log('[AUTH] Register attempt:', { email: dto.email, fullName: dto.fullName });

    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      console.log('[AUTH] Register failed - User exists:', dto.email);
      throw new ConflictException('User with this email already exists');
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
        collegeVerified: true,
        profileCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return user;
  }

  private generateToken(userId: string, email: string) {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }
}
