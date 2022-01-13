import jwt from "jsonwebtoken";
import { Config, TokenPayload } from "../types";

export const generateToken = (data: TokenPayload, config: Config) => {
	return jwt.sign(data, config.jwt.secret, {
		expiresIn: config.jwt.maxAgeInDays * 24 * 3600
	});
};

export const verifyToken = (token: string | null, config: Config) => {
	if (token) {
		try {
			const payload = jwt.verify(token, config.jwt.secret);
			return payload as TokenPayload;
		}
		catch (err) {}
	}
	return null;
};
