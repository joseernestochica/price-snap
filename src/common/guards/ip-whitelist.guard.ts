import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';

@Injectable()
export class IpWhitelistGuard implements CanActivate {

	constructor ( private readonly configService: ConfigService ) { }

	canActivate ( context: ExecutionContext ): boolean {

		const request = context.switchToHttp().getRequest<Request>();
		const clientIp = this.getClientIp( request );

		// Obtener la lista de IPs permitidas desde las variables de entorno
		const allowedIps = this.configService.get<string>( 'ALLOWED_IPS', '' ).split( ',' ).map( ip => ip.trim() );

		// Si no hay IPs configuradas, permitir todas
		if ( !allowedIps || allowedIps.length === 0 || ( allowedIps.length === 1 && allowedIps[ 0 ] === '' ) ) {
			return true;
		}

		// Verificar si la IP del cliente está en la lista blanca
		if ( !allowedIps.includes( clientIp ) ) {
			throw new ForbiddenException( `Access denied for IP: ${ clientIp }` );
		}

		return true;

	}

	private getClientIp ( request: Request ): string {

		// Obtener la IP real del cliente, considerando proxies
		const xForwardedFor = request.headers[ 'x-forwarded-for' ] as string;
		const xRealIp = request.headers[ 'x-real-ip' ] as string;
		const cfConnectingIp = request.headers[ 'cf-connecting-ip' ] as string;

		if ( cfConnectingIp ) {
			return cfConnectingIp;
		}

		if ( xRealIp ) {
			return xRealIp;
		}

		if ( xForwardedFor ) {
			// x-forwarded-for puede contener múltiples IPs separadas por comas
			return xForwardedFor.split( ',' )[ 0 ].trim();
		}

		return request.ip || request.connection.remoteAddress || 'unknown';

	}
}






