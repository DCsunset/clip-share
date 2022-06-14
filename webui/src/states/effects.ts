import { AtomEffect } from "recoil";

export function localStorageEffect<T>(key: string): AtomEffect<T> {
	return ({ setSelf, onSet }) => {
		const savedValue = localStorage.getItem(key)
		if (savedValue !== null) {
			setSelf(JSON.parse(savedValue));
		}

		onSet((newValue, _, isReset) => {
			isReset
				? localStorage.removeItem(key)
				: localStorage.setItem(key, JSON.stringify(newValue));
		});
	};
}
