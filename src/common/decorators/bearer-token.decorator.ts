import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const BearerToken = createParamDecorator(
	( data: unknown, ctx: ExecutionContext ): string | undefined => {
		const request = ctx.switchToHttp().getRequest();
		const authHeader = request.headers.authorization;

		if ( authHeader && authHeader.startsWith( 'Bearer ' ) ) {
			return authHeader.substring( 7 ); // Remover 'Bearer ' (7 caracteres)
		}

		return undefined;
	},
);






