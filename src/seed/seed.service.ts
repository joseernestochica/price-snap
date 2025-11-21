import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/auth/entities';
import { USERS_SEED } from './data';

@Injectable()
export class SeedService {
	constructor (
		@InjectRepository( User )
		private readonly userRepository: Repository<User>,
	) { }

	async seedUsersFromData (): Promise<{ inserted: number }> {
		const users = USERS_SEED.map( ( u ) => ( { ...u } ) );

		const existing = await this.userRepository.find( {
			where: users.map( ( u ) => ( { email: u.email.toLowerCase() } ) ),
			select: { email: true },
		} );
		const existingEmails = new Set( existing.map( ( e ) => e.email ) );

		const toInsert = users.filter( ( u ) => !existingEmails.has( u.email.toLowerCase() ) );
		if ( toInsert.length === 0 ) return { inserted: 0 };

		const entities = this.userRepository.create( toInsert as Partial<User>[] );
		await this.userRepository.save( entities );

		return { inserted: entities.length };
	}
}


