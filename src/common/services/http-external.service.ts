import { Injectable, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { AxiosError, AxiosResponse } from 'axios';
import { catchError, firstValueFrom, retry } from 'rxjs';
import { ConfigService } from '@nestjs/config';

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

export interface ExternalRequestOptions {
	method: HttpMethod;
	endpoint: string;
	data?: any;
	params?: any;
	bearerToken?: string;
	headers?: Record<string, string>;
	responseType?: 'json' | 'stream' | 'arraybuffer';
	returnRawResponse?: boolean;
}

@Injectable()
export class HttpExternalService {

	private readonly logger = new Logger( HttpExternalService.name );
	private readonly apiUrl: string;
	private readonly timeout: number;
	private readonly retryAttempts: number;
	private readonly retryDelay: number;

	constructor (
		private readonly httpService: HttpService,
		private readonly configService: ConfigService,
	) {

		this.apiUrl = this.configService.get<string>( 'EXTERNAL_USER_API_URL' ) || '';
		this.timeout = this.configService.get<number>( 'EXTERNAL_USER_API_TIMEOUT', 5000 );
		this.retryAttempts = this.configService.get<number>( 'EXTERNAL_USER_API_RETRY_ATTEMPTS', 3 );
		this.retryDelay = this.configService.get<number>( 'EXTERNAL_USER_API_RETRY_DELAY', 1000 );

		this.logger.log( `HttpExternalService initialized with:
			- API URL: ${ this.apiUrl }
			- Timeout: ${ this.timeout }ms
			- Retry Attempts: ${ this.retryAttempts }
			- Retry Delay: ${ this.retryDelay }ms` );
	}

	private buildHeaders ( bearerToken?: string, extraHeaders?: Record<string, string> ): Record<string, string> {

		const headers: Record<string, string> = {
			'Content-Type': 'application/json',
			...( extraHeaders || {} ),
		};

		if ( bearerToken ) {
			headers[ 'Authorization' ] = `Bearer ${ bearerToken }`;
		}

		return headers;

	}

	async request<T> ( options: ExternalRequestOptions ): Promise<any> {

		const { method, endpoint, data, params, bearerToken, headers, responseType, returnRawResponse } = options;
		const url = `${ this.apiUrl }${ endpoint }`;

		try {

			const effectiveTimeout = Math.max( 1000, this.timeout || 5000 );
			const effectiveRetries = Math.max( 1, this.retryAttempts || 3 );

			// Headers
			const isForm = typeof ( data as any )?.getHeaders === 'function';
			const mergedHeaders = isForm ? headers : this.buildHeaders( bearerToken, headers );

			this.logger.debug( `HTTP External request ${ method } ${ url } timeout: ${ effectiveTimeout }ms, retries: ${ effectiveRetries }` );

			const response$ = this.httpService.request( {
				method,
				url,
				data,
				params,
				headers: mergedHeaders,
				timeout: effectiveTimeout,
				responseType: responseType || 'json',
			} ).pipe(
				retry( effectiveRetries ),
				catchError( ( error: AxiosError ) => {
					this.logger.error( `External API Error: ${ method } ${ url }`, error.response?.data || error.message );
					throw this.mapApiError( error );
				} )
			);

			const response: AxiosResponse<T> = await firstValueFrom( response$ );
			return returnRawResponse ? response : response.data;

		} catch ( error ) {
			if ( error instanceof HttpException ) {
				throw error;
			}
			throw new HttpException( 'External API service unavailable', HttpStatus.SERVICE_UNAVAILABLE );
		}
	}

	private mapApiError ( error: AxiosError ): HttpException {

		const response = error.response;
		if ( !response ) {
			return new HttpException( 'External API connection failed', HttpStatus.SERVICE_UNAVAILABLE );
		}

		const statusCode = response.status;
		const message = ( response.data as any )?.message || 'External API error';

		switch ( statusCode ) {
			case 400:
				return new HttpException( message, HttpStatus.BAD_REQUEST );
			case 401:
				return new HttpException( message, HttpStatus.UNAUTHORIZED );
			case 403:
				return new HttpException( message, HttpStatus.FORBIDDEN );
			case 404:
				return new HttpException( message, HttpStatus.NOT_FOUND );
			case 409:
				return new HttpException( message, HttpStatus.CONFLICT );
			default:
				return new HttpException( message, HttpStatus.INTERNAL_SERVER_ERROR );
		}

	}
}
