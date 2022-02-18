import { createAsyncThunk } from "@reduxjs/toolkit";
import { generateKeyPairs } from "../utils/crypto";

export const genKeyPairs = createAsyncThunk("generateKeyPairs", async () => {
	return await generateKeyPairs();
});
