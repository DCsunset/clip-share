import { createAsyncThunk } from "@reduxjs/toolkit";
import { generateKeyPairs } from "../utils/crypto";

export const initSettings = createAsyncThunk("initSettings", async () => {
	return await generateKeyPairs();
});
