import express from 'express'
import { db } from './db.js'
import { body, param, validationResult } from 'express-validator'

const router = express.Router()

// VALIDACIONES ****

const validarId = param('id').isInt({min:1})

const validarMateria=[
    body('nombre').isAlpha('es-ES', { ignore: ' ' }).isLength({max:50})
]

const verificarValidacion = (req, res, next) => {
    const validacion = validationResult(req)
    if(!validacion.isEmpty()){
        return res.status(400).json({ success: false, message: 'Error en validación', data: validacion.array() })
    }
    next()
}

router.get('/', async (req, res) => {

    const [filas] = await db.execute('SELECT * FROM materias ORDER BY materias.id')

    if (filas.length === 0) {
    return res.status(404).json({ success: false, message: 'No hay alumnos cargados', data: [] });
}

    res.status(200).json({ success: true, message: 'Datos traídos de la tabla materias', data: filas })
})

router.get('/:id', validarId, verificarValidacion, async (req, res) => {
    const id = Number(req.params.id)

    const [filas] = await db.execute('SELECT * FROM materias WHERE id=?', [id])
    
    if(filas.length === 0) {
        return res.status(404).json({ success: false, message: 'Materia no encontrada' })
    }

    res.json({ success: true, message: 'Datos de la tabla materias traido mediante ID', data: filas })
})

router.post('/', validarMateria, verificarValidacion, async (req, res) => {
    const { nombre } = req.body

    const [filaExistente] = await db.execute('SELECT * FROM materias WHERE nombre=?', [nombre])

    if(filaExistente.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe una materia con ese nombre', data: filaExistente })
    }

    const [fila] = await db.execute('INSERT INTO materias (nombre) VALUES (?)', 
        [nombre])

        res.status(200).json({ success: true, message: 'Materia cargada correctamente', data: {id: fila.insertId, nombre} })
})

router.put('/:id', validarId, validarMateria, verificarValidacion, async (req, res) => {
    const id = Number(req.params.id)
    const { nombre } = req.body

    const [estaVacio] = await db.execute('SELECT * FROM materias WHERE id=?', [id])

    if(estaVacio.length === 0) {
        return res.status(404).json({ success: false, message: 'No se encontró a la materia', data: filaExistente })
    }

    const [filaExistente] = await db.execute('SELECT * FROM materias WHERE nombre=? AND id<>?', [nombre, id])

    if(filaExistente.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe una materia con ese nombre', data: filaExistente })
    }

    const [fila] = await db.execute('UPDATE materias SET nombre=? WHERE id=?', 
        [nombre, id]
    )

    res.status(200).json({ success: true, message: 'Se actualizó la materia', data: {id, nombre} })
})

router.delete('/:id', validarId, verificarValidacion, async (req, res) => {
    const id = Number(req.params.id)

    const [estaVacio] = await db.execute('SELECT * FROM materias WHERE id=?', [id])

    if(estaVacio.length === 0) {
        return res.status(404).json({ success: false, message: 'No se encontró a la materia', data: estaVacio })
    }

    const [borrada] = await db.execute('DELETE FROM materias WHERE id=?', [id])

    res.status(200).json({ success: true, message: 'Materias borrada correctamente' })
})

export default router // EXPORTAMOS COMO DEFAULT