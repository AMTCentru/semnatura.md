import { Module } from '@nestjs/common';
import { SemnaturaMdController } from './semnatura.md.controller';
import { SemnaturaMdService } from './semnatura.md.service';

@Module({
  controllers: [SemnaturaMdController],
  providers: [SemnaturaMdService]
})
export class SemnaturaMdModule {}
