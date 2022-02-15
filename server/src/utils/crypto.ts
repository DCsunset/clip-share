import openpgp from "openpgp";
import { DateTime } from "luxon";

export async function getFingerprint(armoredPublicKey: string) {
	const publicKey = await openpgp.readKey({
		armoredKey: armoredPublicKey
	});
	// fingerprint is human-readable format
	return publicKey.getFingerprint()
		.match(/.{1,2}/g)!
		.join(":");
};

export async function verifyChallenge(armoredPublicKey: string, signedChallenge: string) {
	let challenge: string;
	try {
		const publicKey = await openpgp.readKey({
			armoredKey: armoredPublicKey
		});
		const message = await openpgp.readMessage({
			armoredMessage: signedChallenge
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

		if (!challenge.startsWith("clip-share-")) {
			throw new Error();
		}

		const timestamp = challenge.substring(11);
		const date = DateTime.fromISO(timestamp);
		if (date.isValid) {
			const diff = date.diffNow("hours").hours;
			if (Math.abs(diff) < 1) {
				return true;
			}
		}
		return false;
	}
	catch (err) {
		return true;
	}
};
