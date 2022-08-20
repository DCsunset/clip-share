/**
 * Copyright (C) 2022 DCsunset
 * See full notice in README.md in this project
 */

import fs from "node:fs";
import merge from "lodash/merge";
import { Config, PartialConfig } from "./types";
import { isPartialConfig} from "./types.guard";

const defaultConfig: Config = {
	bufferSize: {
		share: 10,
		unpair: 10
	}
};

export function readConfig() {
	const configPath = process.env.CONFIG_PATH || "/app/config.json";
	let config: PartialConfig;

	try {
		config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
		if (!isPartialConfig(config)) {
			console.error("Invalid config");
			process.exit(1);
		}
	}
	catch (err) {
		// No config
		config = {};
	}

	return merge(defaultConfig, config);
};
