import crypto from "crypto";
import { DateTime } from "luxon";
import { HttpError } from "../types";

export const computeFingerprint = (publicKey: crypto.KeyObject) => {
	// deterministic generation for fingerprint
	const encoded = publicKey.export({
		type: "spki",
		format: "pem"
	});
	const hash = crypto.createHash("sha-1");
	hash.update(encoded);
	return hash.digest("hex");
};

export const verifyChallengeReponse = (publicKey: crypto.KeyObject, response: string) => {
	let challenge: string;
	try {
		// Decode base64
		const buffer = Buffer.from(response, "base64");
		challenge = crypto.publicDecrypt(publicKey, buffer).toString("utf-8");
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
	throw new HttpError(401, "Invalid challenge response");
};
