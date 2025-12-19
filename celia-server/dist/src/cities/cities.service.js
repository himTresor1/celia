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
exports.CitiesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../prisma/prisma.service");
let CitiesService = class CitiesService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll(search, limit) {
        const where = search
            ? {
                name: {
                    contains: search,
                    mode: 'insensitive',
                },
            }
            : {};
        const cities = await this.prisma.city.findMany({
            where,
            take: limit || 100,
            orderBy: {
                name: 'asc',
            },
        });
        return cities;
    }
    async findOne(id) {
        const city = await this.prisma.city.findUnique({
            where: { id },
        });
        if (!city) {
            throw new common_1.NotFoundException('City not found');
        }
        return city;
    }
    async findByIds(ids) {
        const cities = await this.prisma.city.findMany({
            where: {
                id: {
                    in: ids,
                },
            },
            orderBy: {
                name: 'asc',
            },
        });
        return cities;
    }
    async create(name, country) {
        return this.prisma.city.create({
            data: {
                name,
                country,
            },
        });
    }
    async createMany(cities) {
        const promises = cities.map((city) => this.prisma.city.upsert({
            where: { name: city.name },
            update: {},
            create: {
                name: city.name,
                country: city.country,
            },
        }));
        return Promise.all(promises);
    }
};
exports.CitiesService = CitiesService;
exports.CitiesService = CitiesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], CitiesService);
//# sourceMappingURL=cities.service.js.map