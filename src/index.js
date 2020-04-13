const express = require('express')
require('./db/mongoose')
const userRouter = require('./routers/user')
const taskRouter = require('./routers/task')

const app = express()
const port = process.env.port || 3000

//Registering middleware
// app.use((req, res, next) => {
//     res.status(503).send('Site is under maintenance')
// })

//automatically parses incoming JSON
app.use(express.json())
app.use(userRouter)
app.use(taskRouter)

app.listen(port, () => {
    console.log('Server is up on ' + port)
})

const Task = require('./models/task')
const User = require('./models/user')