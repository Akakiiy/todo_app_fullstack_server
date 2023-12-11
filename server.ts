import bcrypt from "bcrypt"
import cors from "cors"
import express from "express"
import jwt from "jsonwebtoken"
import { v4 } from "uuid"

import pool from "./db"

const app = express()
app.use(cors())
app.use(express.json())

const PORT = process.env.PORT || 8000

/**
 * get all todos
 * */
app.get("/todos/:userEmail", async (req, res) => {
  const { userEmail } = req.params

  try {
    const todos = await pool.query("SELECT * FROM todos WHERE user_email = $1", [userEmail])
    res.json(todos.rows)
  } catch (error) {
    console.error(error)
  }
})

/**
 * create a new todo
 * */
app.post("/todos", async (req, res) => {
  const { user_email, title, progress, data } = req.body
  const id = v4()

  try {
    const newTodo = await pool.query(
      "INSERT INTO todos(id, user_email, title, progress, data) VALUES($1, $2, $3, $4, $5);",
      [id, user_email, title, progress, data]
    )

    res.json({ id, user_email, title, progress, data })
  } catch (error) {
    console.error(error)
  }
})

/**
 * edit todo by id
 * */
app.put("/todos/:id", async (req, res) => {
  const { id } = req.params
  const { user_email, title, progress, data } = req.body

  try {
    const editTodo = await pool.query(
      "UPDATE todos SET user_email = $1, title = $2, progress = $3, data = $4 WHERE id = $5;",
      [user_email, title, progress, data, id]
    )

    res.json({ id, user_email, title, progress, data })
  } catch (error) {
    console.error(error)
  }
})

/**
 * delete todo
 * */
app.delete("/todos/:id", async (req, res) => {
  const { id } = req.params

  try {
    const deleteTodo = await pool.query("DELETE FROM todos WHERE id = $1;", [id])
    res.json(deleteTodo)
  } catch (error) {
    console.error(error)
  }
})

/**
 * signup
 * */
app.post("/signup", async (req, res) => {
  const { email, password } = req.body
  const salt = bcrypt.genSaltSync(10)
  const hashedPassword = bcrypt.hashSync(password, salt)

  try {
    const signUp = await pool.query(
      "INSERT INTO users (email, hashed_password) VALUES($1, $2)",
      [email, hashedPassword]
    )

    const token = jwt.sign({ email }, "secret", { expiresIn: "1hr" })

    res.json({ email, token })
  } catch (error: any) {
    console.error(error)
    if (error) {
      res.json({ error: error.detail })
    }
  }
})

/**
 * login
 * */
app.post("/login", async (req, res) => {
  const { email, password } = req.body
  try {
    const users = await pool.query(
      "SELECT * FROM users WHERE email = $1;",
      [email]
    )

    if (!users.rows.length) {
      res.json({ error: "Пользователь не существует" })
    }

    const successPassword = await bcrypt.compare(password, users.rows[0].hashed_password)
    const token = jwt.sign({ email }, "secret", { expiresIn: "1hr" })

    if (successPassword) {
      res.json({ email: users.rows[0].email, token })
    } else {
      res.json({ error: "Вход не удался" })
    }
  } catch (error) {
    console.error(error)
  }
})

app.listen(PORT, () => {
  console.log(`server running on PORT ${PORT}`)
})
