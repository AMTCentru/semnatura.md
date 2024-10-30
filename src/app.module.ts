import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SemnaturaMdModule } from './semnatura.md/semnatura.md.module';
import { FileModule } from './file/file.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: '.env'
    }),
    SemnaturaMdModule,
    FileModule
  ],
})
export class AppModule {}
