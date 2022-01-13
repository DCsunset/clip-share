import { FastifyPluginAsync } from "fastify";
import FastifyPlugin from "fastify-plugin";

function tokenFromHeader(header?: string) {
	if (header && header.length > 0) {
		const fields = header.split(" ");
		if (fields.length === 2 && fields[0] === "Bearer") {
			return fields[1];
		}
	}
	return null;
}

// using declaration merging
declare module 'fastify' {
  interface FastifyRequest {
		token: string | null;
  }
}

export interface TokenPluginOptions {
	cookieName: string;
}

const tokenPlugin: FastifyPluginAsync<TokenPluginOptions> = async (fastify, options) => {
	fastify.decorateRequest("token", null);

	fastify.addHook("preHandler", async req => {
		const token = req.cookies[options.cookieName] ??
			tokenFromHeader(req.headers.authorization);
		req.token = token;
	});
}

export default FastifyPlugin(tokenPlugin);
