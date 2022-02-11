import openpgp from "openpgp";

export async function generateKeyPairs() {
	return await openpgp.generateKey({
		// userID not used
		userIDs: [{}],
		type: "ecc",
		curve: "p521",
		format: "armored"
	});
};
