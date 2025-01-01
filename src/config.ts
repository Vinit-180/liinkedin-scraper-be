import { config } from "dotenv";
import path from "path";

config({
    path:path.resolve(__dirname,`.env`)
})

module.exports ={
    DB_URL:process.env.DATABASE_URL
}