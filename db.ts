import dotenv from "dotenv"
import { Pool } from "pg"

dotenv.config()

const pool = new Pool({
  user: process.env.USERNAME,
  password: process.env.PASSWORD,
  host: process.env.HOST,
  port: process.env.DBPORT ? Number(process.env.DBPORT) : undefined,
  database: "todoapp"
})

export default pool
