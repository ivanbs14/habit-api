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
exports.DeviceStateService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_1 = require("../../prisma.service");
const FIXED_USER_ID = 'user_fixed_001';
let DeviceStateService = class DeviceStateService {
    constructor(prisma) {
        this.prisma = prisma;
    }
    async getDeviceState(now = new Date()) {
        const [pet, routines, checkinsToday] = await Promise.all([
            this.prisma.pet.findFirst({ where: { userId: FIXED_USER_ID } }),
            this.prisma.routine.findMany({
                where: { userId: FIXED_USER_ID, isActive: true },
                orderBy: { createdAt: 'asc' },
            }),
            this.prisma.routineCheckin.findMany({
                where: {
                    userId: FIXED_USER_ID,
                    createdAt: {
                        gte: this.startOfDay(now),
                        lt: this.startOfNextDay(now),
                    },
                },
                select: { routineId: true },
            }),
        ]);
        if (!pet) {
            throw new common_1.BadRequestException('Pet not found. Run seed first.');
        }
        return this.buildDeviceState(pet, routines, checkinsToday.map((checkin) => checkin.routineId), now);
    }
    async getCurrentDueRoutine(now = new Date()) {
        const state = await this.getDeviceState(now);
        return state.dueNow ? state.routine : null;
    }
    buildDeviceState(pet, routines, checkedRoutineIds, now) {
        const checkedSet = new Set(checkedRoutineIds);
        const evaluated = routines.map((routine) => this.evaluateRoutine(routine, checkedSet, now));
        const dueRoutines = evaluated
            .filter((item) => !item.checkedToday && item.dueAt.getTime() <= now.getTime())
            .sort((left, right) => left.dueAt.getTime() - right.dueAt.getTime());
        const dueRoutine = dueRoutines[0];
        if (dueRoutine) {
            return {
                dueNow: true,
                routine: this.toRoutinePayload(dueRoutine.routine),
                nextCheckAt: dueRoutine.dueAt.toISOString(),
                nextPollInSeconds: 0,
                pet: this.toPetPayload(pet),
            };
        }
        const nextRoutine = evaluated.sort((left, right) => left.nextAt.getTime() - right.nextAt.getTime())[0];
        return {
            dueNow: false,
            routine: null,
            nextCheckAt: nextRoutine ? nextRoutine.nextAt.toISOString() : null,
            nextPollInSeconds: nextRoutine
                ? Math.max(0, Math.ceil((nextRoutine.nextAt.getTime() - now.getTime()) / 1000))
                : null,
            pet: this.toPetPayload(pet),
        };
    }
    evaluateRoutine(routine, checkedSet, now) {
        const dueAt = this.resolveScheduledDate(now, routine.scheduledTime);
        const nextAt = new Date(dueAt);
        const checkedToday = checkedSet.has(routine.id);
        if (checkedToday || dueAt.getTime() <= now.getTime()) {
            nextAt.setDate(nextAt.getDate() + 1);
        }
        return {
            routine,
            dueAt,
            nextAt,
            checkedToday,
        };
    }
    resolveScheduledDate(reference, scheduledTime) {
        const [hoursText, minutesText] = scheduledTime.split(':');
        const hours = Number(hoursText);
        const minutes = Number(minutesText);
        const date = new Date(reference);
        date.setHours(Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0, 0);
        return date;
    }
    startOfDay(reference) {
        const date = new Date(reference);
        date.setHours(0, 0, 0, 0);
        return date;
    }
    startOfNextDay(reference) {
        const date = this.startOfDay(reference);
        date.setDate(date.getDate() + 1);
        return date;
    }
    toRoutinePayload(routine) {
        return {
            id: routine.id,
            name: routine.name,
            description: routine.description,
            question: routine.question,
            scheduledTime: routine.scheduledTime,
            frequency: routine.frequency,
            isActive: routine.isActive,
        };
    }
    toPetPayload(pet) {
        return {
            id: pet.id,
            name: pet.name,
            mood: pet.mood,
            happiness: pet.happiness,
            userId: pet.userId,
            createdAt: pet.createdAt.toISOString(),
            updatedAt: pet.updatedAt.toISOString(),
        };
    }
};
exports.DeviceStateService = DeviceStateService;
exports.DeviceStateService = DeviceStateService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService])
], DeviceStateService);
//# sourceMappingURL=device-state.service.js.map