import { Controller, Get, Post, Body, UseGuards, Query, Param, ParseUUIDPipe, Patch, Delete, Res, Req } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';

import { AuthService } from './auth.service';
import { CreateUserDto, LoginUserDto, UpdateRefreshTokenDto, UpdateUserDto } from './dto';
import { GetByIdsDto } from 'src/common/dto';
import { GetUser, Auth } from './decorators';
import { User } from './entities';
import { ValidRoles } from './interfaces';
import { GetParamsDto } from 'src/common/dto';
import { IpRestricted } from 'src/common/decorators';

@ApiTags( 'Auth' )
@Controller( 'auth' )
export class AuthController {

	constructor (
		private readonly authService: AuthService
	) { }

	@Get( 'users' )
	@Auth( ValidRoles.admin, ValidRoles.expert )
	findAll ( @Query() getParamsDto: GetParamsDto ) {

		return this.authService.findAll( getParamsDto );

	}

	@Post( 'users/by-ids' )
	@Auth( ValidRoles.admin )
	findByIds ( @Body() dto: GetByIdsDto ) {

		return this.authService.findByIds( dto );

	}

	@Get( 'user-admin/:id' )
	// @IpRestricted() // Solo IPs permitidas pueden acceder a esta ruta
	@Auth( ValidRoles.admin, ValidRoles.expert )
	async findOneAdmin ( @Param( 'id', ParseUUIDPipe ) id: string ) {

		const response = await this.authService.findOne( id );
		delete ( response.data as any ).password;
		delete ( response.data as any ).twoFactorSecret;

		return response;

	}

	@Get( 'user' )
	@Auth( ValidRoles.user, ValidRoles.expert, ValidRoles.admin )
	async findOneUser ( @GetUser() user: User ) {

		const { id } = user;

		const response = await this.authService.findOne( id );
		delete ( response.data as any ).password;
		delete ( response.data as any ).twoFactorSecret;
		delete ( response.data as any ).resetPasswordKey;
		return response;

	}

	@Post( 'register' )
	createUser ( @Body() createUserDto: CreateUserDto ) {

		return this.authService.create( createUserDto );

	}

	@Post( 'login' )
	loginUser ( @Body() loginUserDto: LoginUserDto ) {

		return this.authService.login( loginUserDto );

	}

	@Auth()
	@Get( 'check-status' )
	checkAuthStatus ( @GetUser() user: User ) {

		return this.authService.checkAuthStatus( user );

	}

	@Post( 'refresh-token' )
	async refreshToken (
		@Body() updateTokenDto: UpdateRefreshTokenDto
	) {

		return await this.authService.refreshToken( updateTokenDto );

	}

	@Patch( 'user-admin/:id' )
	@Auth( ValidRoles.admin, ValidRoles.expert )
	updateAdmin (
		@Param( 'id', ParseUUIDPipe ) id: string,
		@Body() updateUserDto: UpdateUserDto
	) {

		return this.authService.update( id, updateUserDto );

	}

	@Patch( 'user' )
	@Auth( ValidRoles.user, ValidRoles.admin, ValidRoles.expert )
	updateUser (
		@GetUser() user: User,
		@Body() updateUserDto: UpdateUserDto
	) {

		return this.authService.update( user.id, updateUserDto );

	}

	@Delete( 'refresh-token/:id/:token' )
	deleteRefreshToken (
		@Param( 'id', ParseUUIDPipe ) id: string,
		@Param( 'token', ParseUUIDPipe ) token: string
	) {
		return this.authService.deleteRefreshToken( id, token );
	}

	@Delete( 'user/:id' )
	@Auth( ValidRoles.admin )
	deleteAdmin (
		@Param( 'id', ParseUUIDPipe ) id: string
	) {
		return this.authService.deleteUserSoft( id );
	}


}