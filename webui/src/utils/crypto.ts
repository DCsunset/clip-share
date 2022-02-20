import * as openpgp from "openpgp";

export async function getFingerprint(armoredPublicKey: string) {
	const publicKey = await openpgp.readKey({
		armoredKey: armoredPublicKey
	});
	// fingerprint is human-readable format
	return publicKey.getFingerprint()
		.match(/.{1,2}/g)!
		.slice(0, 6)
		.join(":");
};

export async function generateKeyPairs() {
	const { publicKey, privateKey } = await openpgp.generateKey({
		// userID not used
		userIDs: [{}],
		type: "ecc",
		curve: "p521",
		format: "armored"
	});
	const fingerprint = await getFingerprint(publicKey);
	return { publicKey, privateKey, fingerprint };
};

export async function generateChallenge(armoredPrivateKey: string) {
	const privateKey = await openpgp.readPrivateKey({
		armoredKey: armoredPrivateKey
	});
	const message = await openpgp.createMessage({
		text: `clip-share-${new Date().toISOString()}`
	});
	const signedMessage = await openpgp.sign({
		message,
		signingKeys: privateKey
	});

	return signedMessage;
}
