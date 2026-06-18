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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoutineCheckinsController = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const create_routine_checkin_dto_1 = require("./create-routine-checkin.dto");
const routine_checkin_status_enum_1 = require("./routine-checkin-status.enum");
let RoutineCheckinsController = class RoutineCheckinsController {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async create(body) {
        const routine = await this.prisma.routine.findUnique({ where: { id: body.routineId } });
        if (!routine) {
            throw new common_1.BadRequestException('Routine not found.');
        }
        const pet = await this.prisma.pet.findFirst({ where: { userId: 'user_fixed_001' } });
        if (!pet) {
            throw new common_1.BadRequestException('Pet not found. Run seed first.');
        }
        const { mood, delta, message } = this.resolveMoodRule(body.status);
        const nextHappiness = Math.max(0, Math.min(100, pet.happiness + delta));
        const [checkin, updatedPet] = await this.prisma.$transaction([
            this.prisma.routineCheckin.create({
                data: {
                    routineId: routine.id,
                    userId: 'user_fixed_001',
                    status: body.status,
                },
            }),
            this.prisma.pet.update({
                where: { id: pet.id },
                data: {
                    mood,
                    happiness: nextHappiness,
                    updatedAt: new Date(),
                },
            }),
        ]);
        await this.prisma.petEvent.create({
            data: {
                petId: updatedPet.id,
                type: 'routine_checkin',
                payloadJson: JSON.stringify({
                    routineId: routine.id,
                    status: body.status,
                    happinessDelta: delta,
                }),
            },
        });
        return {
            checkin,
            pet: {
                name: updatedPet.name,
                mood: updatedPet.mood,
                happiness: updatedPet.happiness,
            },
            message,
        };
    }
    resolveMoodRule(status) {
        switch (status) {
            case routine_checkin_status_enum_1.RoutineCheckinStatus.DONE:
                return { mood: 'happy', delta: 10, message: 'Good job! HabitPet is happy.' };
            case routine_checkin_status_enum_1.RoutineCheckinStatus.NOT_DONE:
                return { mood: 'sad', delta: -5, message: 'No worries, let us try again soon.' };
            case routine_checkin_status_enum_1.RoutineCheckinStatus.POSTPONED:
            default:
                return { mood: 'normal', delta: -1, message: 'Okay, postponed for later.' };
        }
    }
};
exports.RoutineCheckinsController = RoutineCheckinsController;
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [create_routine_checkin_dto_1.CreateRoutineCheckinDto]),
    __metadata("design:returntype", Promise)
], RoutineCheckinsController.prototype, "create", null);
exports.RoutineCheckinsController = RoutineCheckinsController = __decorate([
    (0, common_1.Controller)('routine-checkins'),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], RoutineCheckinsController);
//# sourceMappingURL=routine-checkins.controller.js.map