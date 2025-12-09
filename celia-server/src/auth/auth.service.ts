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
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        fullName: dto.fullName,
        collegeName: dto.collegeName,
        major: dto.major,
        graduationYear: dto.graduationYear,
        bio: dto.bio || '',
        interests: dto.interests || [],
        preferredLocations: dto.preferredLocations || [],
        profileCompleted: !!(
          dto.collegeName &&
          dto.major &&
          dto.graduationYear &&
          dto.bio &&
          dto.interests?.length >= 3
        ),
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
        profileCompleted: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    const token = this.generateToken(user.id, user.email);

    return {
      user,
      token,
    };
  }

  async login(dto: LoginDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const { password, ...userWithoutPassword } = user;

    const token = this.generateToken(user.id, user.email);

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
