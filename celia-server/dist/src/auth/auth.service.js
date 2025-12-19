"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = require("bcrypt");
const prisma_service_1 = require("../prisma/prisma.service");
const otp_service_1 = require("../otp/otp.service");
let AuthService = class AuthService {
    constructor(prisma, jwtService, otpService) {
        this.prisma = prisma;
        this.jwtService = jwtService;
        this.otpService = otpService;
    }
    async sendSignupOtp(email) {
        const existingUser = await this.prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('User with this email already exists');
        }
        await this.otpService.sendOtp(email, 'signup');
        return { message: 'OTP sent successfully' };
    }
    async register(dto) {
        console.log('[AUTH] Register attempt:', { email: dto.email, fullName: dto.fullName });
        const existingUser = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (existingUser) {
            console.log('[AUTH] Register failed - User exists:', dto.email);
            throw new common_1.ConflictException('User with this email already exists');
        }
        if (dto.otpCode) {
            try {
                await this.otpService.verifyOtp(dto.email, dto.otpCode, 'signup');
            }
            catch (error) {
                throw new common_1.BadRequestException('Invalid or expired OTP code');
            }
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
                    profileCompleted: false,
                    emailVerified: !!dto.otpCode,
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
        }
        catch (error) {
            console.error('[AUTH] Database error during registration:', error);
            throw error;
        }
    }
    async login(dto) {
        console.log('[AUTH] Login attempt:', { email: dto.email });
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email },
        });
        if (!user) {
            console.log('[AUTH] Login failed - User not found:', dto.email);
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        console.log('[AUTH] User found, verifying password');
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            console.log('[AUTH] Login failed - Invalid password:', dto.email);
            throw new common_1.UnauthorizedException('Invalid credentials');
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
    async getMe(userId) {
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
    generateToken(userId, email) {
        return this.jwtService.sign({
            sub: userId,
            email,
        });
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService,
        otp_service_1.OtpService])
], AuthService);
//# sourceMappingURL=auth.service.js.map