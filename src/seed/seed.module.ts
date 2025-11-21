import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { User } from 'src/auth/entities';
import { AuthModule } from 'src/auth/auth.module';

@Module( {
	imports: [
		TypeOrmModule.forFeature( [ User ] ),
		AuthModule,
	],
	controllers: [ SeedController ],
	providers: [ SeedService ],
} )
export class SeedModule { }


