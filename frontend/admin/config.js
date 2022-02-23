import dotenv from "dotenv";
const result = dotenv.config();

export const { PORT } = result.parsed;
