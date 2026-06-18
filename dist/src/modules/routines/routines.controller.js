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
exports.RoutinesController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
let RoutinesController = class RoutinesController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findAll() {
        return this.prisma.routine.findMany({
            where: { userId: 'user_fixed_001' },
            orderBy: { createdAt: 'asc' },
        });
    }
    async current() {
        const startedAt = Date.now();
        console.log('[routines] GET /routines/current enter');
        const routine = await this.prisma.routine.findFirst({
            where: { userId: 'user_fixed_001' },
            orderBy: { createdAt: 'asc' },
        });
        console.log(`[routines] GET /routines/current exit found=${Boolean(routine)} ${Date.now() - startedAt}ms`);
        return {
            routine,
            message: routine ? 'Current routine loaded.' : 'No routine available.',
        };
    }
};
exports.RoutinesController = RoutinesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RoutinesController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('current'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RoutinesController.prototype, "current", null);
exports.RoutinesController = RoutinesController = __decorate([
    (0, common_1.Controller)('routines'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoutinesController);
//# sourceMappingURL=routines.controller.js.map