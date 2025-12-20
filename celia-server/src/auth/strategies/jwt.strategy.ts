import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService.get('JWT_SECRET'),
    });
  }

  async validate(payload: { sub: string; email: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
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

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Ensure id is always present (should be, but adding safety check)
    if (!user.id) {
      console.error('[JwtStrategy] User object missing id! Payload:', payload);
      // Fallback to payload.sub if id is somehow missing
      return { ...user, id: payload.sub, sub: payload.sub };
    }

    // Include sub from JWT payload for consistency with controllers that use user.sub
    return { ...user, sub: payload.sub };
  }
}
