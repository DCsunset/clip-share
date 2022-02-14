import * as openpgp from "openpgp";

export async function generateKeyPairs() {
	return await openpgp.generateKey({
		// userID not used
		userIDs: [{}],
		type: "ecc",
		curve: "p521",
		format: "armored"
	});
};

export async function generateChallengeResponse(armoredPrivateKey: string) {
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
