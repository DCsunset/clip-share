import fs from "fs";
import { Config } from "./types";
import { isConfig } from "./types.guard";

export function readConfig() {
	const configPath = process.env.CONFIG_PATH || "/data/config.json";

	try {
		const rawConfig = JSON.parse(fs.readFileSync(configPath, "utf-8"));
		if (!isConfig(rawConfig)) {
			throw new Error("invalid config");
		}
		const config = rawConfig as Config;
		return config;
	}
	catch (err) {
		console.error("Error reading config: ", (err as Error).message);
		process.exit(1);
	}
};
