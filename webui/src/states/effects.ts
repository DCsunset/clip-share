/**
 * Copyright (C) 2022 DCsunset
 * See full notice in README.md in this project
 */

import { AtomEffect } from "recoil";

const keyPrefix = "clip-share.";

export function localStorageEffect<T>(key: string, init?: () => Promise<T>): AtomEffect<T> {
	const fullKey = `${keyPrefix}${key}`;
	return ({ setSelf, onSet }) => {
		const savedValue = localStorage.getItem(fullKey);
		if (savedValue !== null) {
			setSelf(JSON.parse(savedValue));
		}
		else if (init) {
			// Initialize
			const initialize = async () => {
				const initValue = await init();
				// Store initValue in localStorage
				localStorage.setItem(fullKey, JSON.stringify(initValue));
				return initValue;
			};
			setSelf(initialize());
		}
		
		// The callback is not called due to changes from this effect's own setSelf().
		onSet((newValue, _, isReset) => {
			isReset
				? localStorage.removeItem(fullKey)
				: localStorage.setItem(fullKey, JSON.stringify(newValue));
		});
	};
}
