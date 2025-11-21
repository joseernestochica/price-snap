import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '../entities';

export const GetUser = createParamDecorator(
	( data: string, ctx: ExecutionContext ): User => {
		const request = ctx.switchToHttp().getRequest();
		const user = request.user;

		return data ? user?.[ data ] : user;
	},
);






