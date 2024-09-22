import { config } from "dotenv";

config({ path: ".env" });

export const PORT = <string>process.env.PORT;
export const DBURL = <string>process.env.DBURL;
export const JWT_SECRET = <string>process.env.JWT_SECRET;
