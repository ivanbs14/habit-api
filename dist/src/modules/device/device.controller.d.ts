import { DeviceStateService } from './device-state.service';
export declare class DeviceController {
    private readonly deviceStateService;
    constructor(deviceStateService: DeviceStateService);
    state(): Promise<import("./device-state.service").DeviceStatePayload>;
}
