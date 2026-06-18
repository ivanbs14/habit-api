import { Controller, Get } from '@nestjs/common';
import { DeviceStateService } from './device-state.service';

@Controller('device')
export class DeviceController {
  constructor(private readonly deviceStateService: DeviceStateService) {}

  @Get('state')
  async state() {
    return this.deviceStateService.getDeviceState();
  }
}
