import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const PORT = process.env.PORT || 3000;
  
  const app = await NestFactory.create(AppModule);

   // Configure CORS
   app.enableCors({
    origin: '*', // Schimbați '*' cu domeniile de încredere
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    allowedHeaders: 'Content-Type, Authorization',
  });
  
  await app.listen(PORT, () => console.log (`Server started on port = ${PORT}`))

}
bootstrap();
