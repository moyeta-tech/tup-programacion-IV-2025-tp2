import express from 'express'
import { conectarDB, db } from './db.js';
import  alumnosRouter  from './alumnos.js'
import  materiasRouter  from './materias.js'

conectarDB()

const app = express()
const port = process.env.PORT

app.use(express.json())

// Usamos los dos routers
app.use("/alumnos", alumnosRouter)
app.use("/materias", materiasRouter)

app.listen(port, () => {
    console.log(`La aplicación esta corriendo en el puerto ${port || 3000}`)
})