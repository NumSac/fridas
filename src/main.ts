import { NestFactory } from '@nestjs/core';
import { AppModule } from './modules/app/app.module';
import { appCreate } from './modules/app/app.create';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  appCreate(app);

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
