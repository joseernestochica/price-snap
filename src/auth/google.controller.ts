import { Controller, Get, Query, Res, Req, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GoogleService } from './google.service';

@ApiTags( 'Auth - Google' )
@Controller( 'auth/google' )
export class GoogleController {
	constructor ( private readonly googleService: GoogleService ) { }

	@Get()
	async start ( @Query( 'redirect_uri' ) appRedirect: string, @Res() res: any ) {
		return this.googleService.start( appRedirect, res );
	}

	@Get( 'callback' )
	async callback ( @Req() req: any, @Res() res: any ) {
		return this.googleService.callback( req, res );
	}

	@Post( 'exchange-cookie' )
	async exchangeCookie ( @Req() req: any ) {
		const accessToken = req?.cookies?.access_token;
		const refreshToken = req?.cookies?.refresh_token;

		if ( !accessToken || !refreshToken ) {
			return {
				message: 'Missing cookies',
				statusCode: 400,
			};
		}

		return {
			token: accessToken,
			refreshToken,
			message: 'Tokens from cookies',
			statusCode: 200,
		};
	}

	@Post( 'clear-cookies' )
	async clearCookies ( @Res() res: any ) {
		res.clearCookie( 'access_token', { path: '/' } );
		res.clearCookie( 'refresh_token', { path: '/' } );
		res.clearCookie( 'g_state', { path: '/api/auth/google' } );
		res.clearCookie( 'g_verifier', { path: '/api/auth/google' } );
		res.clearCookie( 'g_appredir', { path: '/api/auth/google' } );

		return res.status( 200 ).json( { message: 'Cookies cleared', statusCode: 200 } );
	}
}
