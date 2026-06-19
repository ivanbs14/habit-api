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
const client_1 = require("@prisma/client");
const prisma_service_1 = require("../../prisma.service");
const routine_checkin_constants_1 = require("../routine-checkins/routine-checkin.constants");
const FIXED_USER_ID = 'user_fixed_001';
const DEVICE_TIME_ZONE = 'America/Fortaleza';
let DeviceStateService = class DeviceStateService {
    constructor(prisma) {
        this.prisma = prisma;
        this.routineResponseWindowMs = routine_checkin_constants_1.ROUTINE_RESPONSE_WINDOW_MS;
        this.zonedDateFormatter = new Intl.DateTimeFormat('en-CA', {
            timeZone: DEVICE_TIME_ZONE,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hourCycle: 'h23',
        });
    }
    async getDeviceState(now = new Date()) {
        await this.cancelExpiredRoutineCheckins(now);
        const [pet, routines, checkinsToday] = await this.fetchDeviceStateSnapshot(now);
        if (!pet) {
            throw new common_1.BadRequestException('Pet not found. Run seed first.');
        }
        return this.buildDeviceState(pet, routines, checkinsToday.map((checkin) => checkin.routineId), now);
    }
    async getCurrentDueRoutine(now = new Date()) {
        const state = await this.getDeviceState(now);
        return state.dueNow ? state.routine : null;
    }
    async cancelExpiredRoutineCheckins(now = new Date()) {
        const [routines, checkinsToday] = await Promise.all([
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
        const checkedSet = new Set(checkinsToday.map((checkin) => checkin.routineId));
        const expiredRoutines = routines.filter((routine) => this.isRoutineExpired(routine, checkedSet, now));
        if (expiredRoutines.length === 0) {
            return;
        }
        await this.prisma.routineCheckin.createMany({
            data: expiredRoutines.map((routine) => ({
                routineId: routine.id,
                userId: FIXED_USER_ID,
                status: routine_checkin_constants_1.AUTOMATIC_ROUTINE_CANCEL_STATUS,
            })),
        });
    }
    async isRoutineResponseExpired(routine, now = new Date()) {
        const expiresAt = this.getRoutineResponseDeadline(routine, now);
        if (expiresAt.getTime() > now.getTime()) {
            return false;
        }
        const existingCheckin = await this.prisma.routineCheckin.findFirst({
            where: {
                userId: FIXED_USER_ID,
                routineId: routine.id,
                createdAt: {
                    gte: this.startOfDay(now),
                    lt: this.startOfNextDay(now),
                },
            },
            orderBy: { createdAt: 'desc' },
            select: { status: true },
        });
        return !existingCheckin || existingCheckin.status === routine_checkin_constants_1.AUTOMATIC_ROUTINE_CANCEL_STATUS;
    }
    async fetchDeviceStateSnapshot(now) {
        try {
            return await this.runDeviceStateQueries(now);
        }
        catch (error) {
            if (!this.isRetryablePrismaConnectionError(error)) {
                throw error;
            }
            await this.prisma.$disconnect();
            await this.prisma.$connect();
            return this.runDeviceStateQueries(now);
        }
    }
    runDeviceStateQueries(now) {
        return Promise.all([
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
    }
    isRetryablePrismaConnectionError(error) {
        return error instanceof client_1.Prisma.PrismaClientKnownRequestError && error.code === 'P1017';
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
    isRoutineExpired(routine, checkedSet, now) {
        if (checkedSet.has(routine.id)) {
            return false;
        }
        return this.getRoutineResponseDeadline(routine, now).getTime() <= now.getTime();
    }
    getRoutineResponseDeadline(routine, now) {
        const dueAt = this.resolveScheduledDate(now, routine.scheduledTime);
        return new Date(dueAt.getTime() + this.routineResponseWindowMs);
    }
    resolveScheduledDate(reference, scheduledTime) {
        const [hoursText, minutesText] = scheduledTime.split(':');
        const hours = Number(hoursText);
        const minutes = Number(minutesText);
        const parts = this.getZonedDateParts(reference);
        return this.zonedTimeToUtcDate(parts.year, parts.month, parts.day, Number.isFinite(hours) ? hours : 0, Number.isFinite(minutes) ? minutes : 0, 0);
    }
    startOfDay(reference) {
        const parts = this.getZonedDateParts(reference);
        return this.zonedTimeToUtcDate(parts.year, parts.month, parts.day, 0, 0, 0);
    }
    startOfNextDay(reference) {
        const parts = this.getZonedDateParts(reference);
        return this.zonedTimeToUtcDate(parts.year, parts.month, parts.day + 1, 0, 0, 0);
    }
    getZonedDateParts(date) {
        const rawParts = this.zonedDateFormatter.formatToParts(date);
        const parts = new Map(rawParts.map((part) => [part.type, part.value]));
        return {
            year: Number(parts.get('year') ?? '0'),
            month: Number(parts.get('month') ?? '1'),
            day: Number(parts.get('day') ?? '1'),
            hour: Number(parts.get('hour') ?? '0'),
            minute: Number(parts.get('minute') ?? '0'),
            second: Number(parts.get('second') ?? '0'),
        };
    }
    zonedTimeToUtcDate(year, month, day, hour, minute, second) {
        const utcGuess = Date.UTC(year, month - 1, day, hour, minute, second, 0);
        const firstPass = new Date(utcGuess - this.getTimeZoneOffsetMs(new Date(utcGuess)));
        const correctedOffset = this.getTimeZoneOffsetMs(firstPass);
        return new Date(utcGuess - correctedOffset);
    }
    getTimeZoneOffsetMs(reference) {
        const parts = this.getZonedDateParts(reference);
        const wallClockAsUtc = Date.UTC(parts.year, parts.month - 1, parts.day, parts.hour, parts.minute, parts.second, 0);
        return wallClockAsUtc - reference.getTime();
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