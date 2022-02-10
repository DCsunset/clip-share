import openpgp from "openpgp";
import { DateTime } from "luxon";
import { HttpError } from "../types";

export function getFingerprint(publicKey: openpgp.Key) {
	// fingerprint is human-readable format
	return publicKey.getFingerprint()
		.match(/.{1,2}/g)!
		.join(":");
};

export async function verifyChallengeReponse(publicKey: openpgp.Key, response: string) {
	let challenge: string;
	try {
		const message = await openpgp.readMessage({
			armoredMessage: response
		});
		const result = await openpgp.verify({
			message,
			verificationKeys: publicKey
		});
		const verified = await result.signatures[0].verified;
		if (!verified) {
			throw new Error();
		}

		challenge = result.data;
	}
	catch (err) {
		throw new HttpError(401, "Invalid challenge response");
	}

	if (!challenge.startsWith("clip-share-")) {
		throw new HttpError(401, "Invalid challenge response");
	}

	const timestamp = challenge.substring(11);
	const date = DateTime.fromISO(timestamp);
	if (date.isValid) {
		const diff = date.diffNow("hours").hours;
		if (Math.abs(diff) < 1) {
			return;
		}
	}
	throw new HttpError(401, "Expired challenge");
};
