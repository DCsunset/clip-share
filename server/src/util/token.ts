import jwt from "jsonwebtoken";
import { Config } from "../types";

export const generateToken = (data: any, config: Config) => {
	return jwt.sign(data, config.jwt.secret, {
		expiresIn: config.jwt.maxAgeInDays * 24 * 3600
	});
};

export const verifyToken = (token: string | null, config: Config) => {
	if (token) {
		try {
			jwt.verify(token, config.jwt.secret);
			return true;
		}
		catch (err) {}
	}
	return false;
};
