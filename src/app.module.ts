import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SemnaturaMdModule } from './semnatura.md/semnatura.md.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env'
    }),
    SemnaturaMdModule,
  ],
})
export class AppModule {}
