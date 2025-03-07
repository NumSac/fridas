import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export function appCreate(app: INestApplication): void {
  /*
   * Use validation pipes globally
   */
  app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
        transformOptions: {
          enableImplicitConversion: true,
        },
      }),
  );

  /**
   * swagger configuration
   */
  const swaggerConfig = new DocumentBuilder()
      .setTitle('Fridas C2')
      .setDescription('Use the base API URL as http://localhost:3000')
      .setTermsOfService('http://localhost:3000/terms-of-service')
      .setLicense(
          'MIT License',
          'https://github.com/git/git-scm.com/blob/main/MIT-LICENSE.txt',
      )
      .addServer('http://localhost:3000')
      .setVersion('1.0')
      .build();

  // Instantiate Document
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('api', app, document);

  // Enable CORS
  app.enableCors();
}