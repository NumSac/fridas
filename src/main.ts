import { NestFactory } from '@nestjs/core';
import { join } from 'path';
import { AppModule } from './modules/app/app.module';
import { appCreate } from './modules/app/app.create';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(
    AppModule,
  );
  appCreate(app);

  app.useStaticAssets(join(__dirname, '..', 'public'));
  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('ejs');

  await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
