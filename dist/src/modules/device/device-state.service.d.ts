import { Routine } from '@prisma/client';
import { PrismaService } from '../../prisma.service';
type DeviceRoutinePayload = {
    id: string;
    name: string;
    description: string;
    question: string;
    scheduledTime: string;
    frequency: string;
    isActive: boolean;
};
type DevicePetPayload = {
    id: string;
    name: string;
    mood: string;
    happiness: number;
    userId: string;
    createdAt: string;
    updatedAt: string;
};
export type DeviceStatePayload = {
    dueNow: boolean;
    routine: DeviceRoutinePayload | null;
    nextCheckAt: string | null;
    nextPollInSeconds: number | null;
    pet: DevicePetPayload;
};
export declare class DeviceStateService {
    private readonly prisma;
    private readonly routineResponseWindowMs;
    private readonly zonedDateFormatter;
    constructor(prisma: PrismaService);
    getDeviceState(now?: Date): Promise<DeviceStatePayload>;
    getCurrentDueRoutine(now?: Date): Promise<DeviceRoutinePayload | null>;
    cancelExpiredRoutineCheckins(now?: Date): Promise<void>;
    isRoutineResponseExpired(routine: Routine, now?: Date): Promise<boolean>;
    private fetchDeviceStateSnapshot;
    private runDeviceStateQueries;
    private isRetryablePrismaConnectionError;
    private buildDeviceState;
    private evaluateRoutine;
    private isRoutineExpired;
    private getRoutineResponseDeadline;
    private resolveScheduledDate;
    private startOfDay;
    private startOfNextDay;
    private getZonedDateParts;
    private zonedTimeToUtcDate;
    private getTimeZoneOffsetMs;
    private toRoutinePayload;
    private toPetPayload;
}
export {};
