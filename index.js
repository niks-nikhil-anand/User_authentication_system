import express from "express"
import userRoutes from "./routes/userRoutes.js"

const app = express()
const PORT = 8000


app.use(express.json())

app.get("/" , (req, res) => {
    res.send("This is nikhil")
})

app.use("/users" , userRoutes)

app.listen(PORT , () => {
    console.log(`Server is listining on ${PORT}`)
})