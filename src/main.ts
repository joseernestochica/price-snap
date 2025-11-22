import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap () {
  const app = await NestFactory.create( AppModule );

  // Global prefix
  app.setGlobalPrefix( 'api' );

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe( {
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    } ),
  );

  // CORS configuration
  const corsOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split( ',' ).map( origin => origin.trim() )
    : [ 'http://localhost:4200', 'http://localhost:4210' ];

  app.enableCors( {
    origin: ( origin, callback ) => {
      // Permitir requests sin origen (mobile apps, Postman, etc.)
      if ( !origin ) {
        return callback( null, true );
      }

      // En desarrollo, permitir localhost en cualquier puerto
      if ( process.env.NODE_ENV === 'development' ) {
        if ( origin.startsWith( 'http://localhost:' ) || origin.startsWith( 'http://127.0.0.1:' ) ) {
          return callback( null, true );
        }
      }

      // Verificar si el origen está en la lista permitida
      if ( corsOrigins.includes( origin ) ) {
        return callback( null, true );
      }

      callback( new Error( 'Not allowed by CORS' ) );
    },
    credentials: true,
    methods: [ 'GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS' ],
    allowedHeaders: [ 'Content-Type', 'Authorization', 'Accept' ],
  } );

  await app.listen( process.env.PORT ?? 3006 );
  console.log( `🚀 PriceSnap API running on: http://localhost:${ process.env.PORT ?? 3006 }/api` );
}
bootstrap();
