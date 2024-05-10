import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const SSLPORT = 3000;
  await app.listen(SSLPORT, () => {
    console.log(
      '\n' + '    --http服务器已启动' + ': http://localhost:%s' + '\n\n',
      SSLPORT,
    );
  });
}
bootstrap();
