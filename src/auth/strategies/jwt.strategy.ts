import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtPayload } from '../interfaces';
import { User } from '../entities';

@Injectable()
export class JwtStrategy extends PassportStrategy( Strategy ) {
	constructor (
		private readonly configService: ConfigService,
		@InjectRepository( User )
		private readonly userRepository: Repository<User>,
	) {
		const jwtSecret = configService.get( 'JWT_SECRET' );
		if ( !jwtSecret ) {
			throw new Error( 'JWT_SECRET is not defined' );
		}
		
		super( {
			jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
			ignoreExpiration: false,
			secretOrKey: jwtSecret,
		} );
	}

	async validate ( payload: JwtPayload ): Promise<User> {
		const { id } = payload;

		const user = await this.userRepository.findOne( {
			where: { id, isActive: true, isDeleted: false },
		} );

		if ( !user ) {
			throw new UnauthorizedException( 'Token not valid' );
		}

		return user;
	}
}
