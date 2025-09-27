import express from 'express';
import { body, param, validationResult } from "express-validator";
import { conectarDB, db } from './db.js';

conectarDB(); // Conectamos la bd

const validarId = param('id').isInt({min:1})

const verificarValidacion=(req, res, next) => { // Verificamos la validacion con ayuda de este middleware
    const validacion = validationResult(req);
    if (!validacion.isEmpty()) {
        return res.status(400).json({ success: false, message: 'Falla de validación', errores: validacion.array() });
    }
    next();
}

const validarTarea = [
    body('nombre').isAlpha('es-ES', {ignore: ' '}).isLength({max: 50}) // max 50 caracteres
    .notEmpty()
    .withMessage('No puede estar vacío')
    .withMessage('No puede tener mas de 50 caracteres')
    ,
    body('completada').isBoolean()
    .withMessage('Este campo tiene que ser un booleano') 
    .notEmpty()
    .withMessage('No puede estar vacío')
]
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json()); // Interpretar body como JSON

app.get('/tareas', async (req, res) => {

    const [fila] = await db.execute('SELECT * FROM tareas')

    res.json({ success: true, message: 'Datos traidos de la tabla tareas correctamente', data: fila })
})

app.get('/tareas/:id', validarId, verificarValidacion, async (req, res) => {
    const id = Number(req.params.id)

    const [filas] =await db.execute('SELECT * FROM tareas WHERE id=?', [id])

    if(filas.length === 0){
        return res.status(404).json({ success: false, message: 'No hay tareas relacionadas con ese ID' })
    }

    res.status(201).json({ success: true, message: 'Tarea obtenida mediante ID', data: filas})
})

app.post('/tareas', validarTarea, verificarValidacion, async (req, res) => {
    const { nombre, completada } = req.body

   const [rows] = await db.execute('SELECT * FROM tareas WHERE nombre=?', [nombre])

   if(rows.length !== 0){
     return res.status(400).json({ success: false, message: 'Ya hay una tarea cargada con ese nombre', data: rows.insertId })
   }
    
    await db.execute('INSERT INTO tareas (nombre, completada) VALUES (?,?)', 
        [nombre, completada]
    )

    res.status(201).json({ success: true, message: 'Se agregó a la tabla tareas correctamente', data: { nombre, completada } })
})

app.put('/tareas/:id', validarId, validarTarea, verificarValidacion, async (req, res) => {
    const id = Number(req.params.id)
    const {nombre, completada} = req.body

    const [rows] = await db.execute('SELECT * FROM tareas WHERE id=?', [id])
    
    const [dup] = await db.execute(
    'SELECT * FROM tareas WHERE nombre=?',
    [nombre]
    );

    if(dup.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe una tarea con ese nombre' })
    }

    if(rows.length === 0){
        return res.status(404).json({ success: false, message: 'No se encontró la tarea' })
    }
    await db.execute('UPDATE tareas SET nombre=?, completada=?  WHERE id=?', [nombre, completada, id])

    res.status(201).json({ success: true, message: 'Se actualizó la tarea', data: {id, nombre, completada} })
})

app.delete('/tareas/:id', validarId, validarTarea, verificarValidacion, async (req, res) => {
    const id = Number(req.params.id)

    await db.execute('DELETE FROM tareas WHERE id=?', [id])

    res.json({ success: true, message: 'Borrado correctamente de la tabla tareas', id })

})

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});