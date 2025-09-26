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

const validarRectangulo = [
    body('base').isFloat({ min:1, max: 5 }) // De 1 hasta 5 dígitos
    .notEmpty()
    .withMessage('No puede estar vacío')
    .withMessage('No puede tener mas de 5 dígitos')
    .custom(value => value >= 0)
    .withMessage('No puede ser 0 o negativo') // Validamos que no se pueda enviar datos negativos o 0
    ,
    body('altura').isFloat({ min:1, max: 5 }) 
    .notEmpty()
    .withMessage('No puede estar vacío')
    .withMessage('No puede tener mas de 5 dígitos')
    .custom(value => value >= 0)
    .withMessage('No puede ser 0 o negativo')]
const app = express();
const port = process.env.PORT || 3000;
app.use(express.json()); // Interpretar body como JSON

app.get('/tareas', async (req, res) => {

    const [fila] = await db.execute('SELECT * FROM tareas')

    res.json({ success: true, message: 'Datos traidos de la tabla tareas correctamente', data: fila })
})

app.post('/tareas', async (req, res) => {
    const { nombre, completada } = req.body

    await db.execute('INSERT INTO tareas (nombre, completada) VALUES (?,?)', 
        [nombre, completada]
    )

    res.status(201).json({ success: true, message: 'Se agregó a la tabla tareas correctamente', data: { nombre, completada } })
})

app.put('/:id', async (req, res) => {})

app.delete('/tareas/:id', async (req, res) => {
    const id = Number(req.params.id)

    await db.execute('DELETE FROM tareas WHERE id=?', [id])

    res.json({ success: true, message: 'Borrado correctamente de la tabla tareas', id })

})

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});