import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as admin from 'firebase-admin';
import * as firebase from './config/firebase.json';
async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Enable CORS with default options
  admin.initializeApp({
    credential: admin.credential.cert(JSON.parse(JSON.stringify(firebase))),
    storageBucket: 'arep-b1382.appspot.com',
  });


  app.enableCors();
  await app.listen(3000, '0.0.0.0');
}
bootstrap();
