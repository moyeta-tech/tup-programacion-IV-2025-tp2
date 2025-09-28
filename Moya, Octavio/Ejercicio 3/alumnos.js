import express from 'express'
import { db } from './db.js'
import { body, param, validationResult } from 'express-validator'

const router = express.Router()


// **** AGREGAMOS LAS VALIDACIONES ****
const validarId = param('id').isInt({min:1})

const validarAlumno=[
    body('nombre').isAlpha('es-ES', { ignore: ' ' })
    .isLength({ max: 50 }).withMessage('No puede pasar los 50 caracteres')
    .notEmpty().withMessage('No puede estar vacío'),

    body('nota_1').isFloat({ min:1, max: 10}).notEmpty(),
    body('nota_2').isFloat({ min:1, max: 10}).notEmpty(),
    body('nota_3').isFloat({ min:1, max: 10 }).notEmpty(),

    body('materia_id').isInt({min:1}).withMessage('El id de materia tiene que ser entero')
    .notEmpty().withMessage('No puede estar vacío')
]

const verificarValidacion = (req, res, next) => {
    const validacion = validationResult(req)
    if(!validacion.isEmpty()){
        return res.status(400).json({ success: false, message: 'Error en validación', data: validacion.array() })
    }
    next()
}

 // TRAEMOS TODOS LOS ALUMNOS
router.get('/', async (req, res) => {
    let sql = 'SELECT a.id, a.nombre, a.nota_1, a.nota_2, a.nota_3, m.nombre AS materia' + 
              ' FROM alumnos a JOIN materias m ON a.materia_id = m.id ORDER by a.id'

    const [filas] = await db.execute(sql)
    if (filas.length === 0) {
        return res.status(404).json({ success: false, message: 'No hay alumnos cargados', data: [] });
    }

    res.status(200).json({ success: true, message: 'Datos traídos de la tabla alumnos', data: filas })
})

// TRAEMOS EL ALUMNO CON EL ID
router.get('/:id', validarId, verificarValidacion, async (req, res) => {
    const id = Number(req.params.id)

    const [filas] = await db.execute('SELECT * FROM alumnos WHERE id=?', [id])
    
    if (filas.length === 0) {
        return res.status(404).json({ success: false, message: 'No hay ningun Alumno con ese Id', data: [] });
    }

    res.json({ success: true, message: 'Datos de la tabla alumnos traido mediante ID', data: filas })
})

// CREAMOS UN ALUMNO Y VALIDAMOS QUE NO HAYAN DUPLICADOS
router.post('/', validarAlumno, verificarValidacion, async (req, res) => {
    const { nombre, nota_1, nota_2, nota_3, materia_id } = req.body

    const [filaExistente] = await db.execute('SELECT * FROM alumnos WHERE nombre=? AND materia_id=?', [nombre, materia_id])

    if(filaExistente.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe un alumno con ese nombre' })
    }

    const [fila] = await db.execute('INSERT INTO alumnos (nombre, nota_1, nota_2, nota_3, materia_id) VALUES (?,?,?,?,?)', 
        [nombre, nota_1, nota_2, nota_3, materia_id])

        res.status(200).json({ success: true, message: 'Alumno cargado correctamente', data: { id: fila.insertId, nombre, nota_1, nota_2, nota_3, materia_id } })
})

// MODIFICAMOS UN ALUMNO Y VALIDAMOS QUE NO HAYAN DUPLICADOS CON EL MISMO NOMBRE NI VACIOS

router.put('/:id', validarId, validarAlumno, verificarValidacion, async (req, res) => {
    const id = Number(req.params.id)
    const { nombre, nota_1, nota_2, nota_3, materia_id } = req.body

    const [estaVacio] = await db.execute('SELECT * FROM alumnos WHERE id=?', [id])

    if(estaVacio.length === 0) {
        return res.status(404).json({ success: false, message: 'No se encontró al alumno', data: filaExistente })
    }

    const [filaExistente] = await db.execute('SELECT * FROM alumnos WHERE nombre=? AND materia_id=? AND id<>?', [nombre, materia_id, id])

    if(filaExistente.length > 0) {
        return res.status(400).json({ success: false, message: 'Ya existe un alumno con ese nombre', data: filaExistente })
    }

    await db.execute('UPDATE alumnos SET nombre=?, nota_1=?, nota_2=?, nota_3=?, materia_id=? WHERE id=?', 
        [nombre, nota_1, nota_2, nota_3, materia_id, id]
    )

    res.status(200).json({ success: true, message: 'Se actualizó el alumno', data: {id, nombre, nota_1, nota_2, nota_3, materia_id} })
})

// BORRAMOS UN ALUMNO 
router.delete('/:id', validarId, verificarValidacion, async (req, res) => {
    const id = Number(req.params.id)

    const [estaVacio] = await db.execute('SELECT * FROM alumnos WHERE id=?', [id])

    if(estaVacio.length === 0) {
        return res.status(404).json({ success: false, message: 'No se encontró al alumno', data: estaVacio })
    }

    await db.execute('DELETE FROM alumnos WHERE id=?', [id])

    res.status(200).json({ success: true, message: 'Alumno borrado correctamente' })
})

export default router // EXPORTAMOS COMO DEFAULT