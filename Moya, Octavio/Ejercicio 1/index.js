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

app.get('/superficies', async (req, res) => {
    let sql = 'SELECT * FROM rectangulos'

    const [rows] = await db.execute(sql)
    console.log(rows)
    res.json({ success: true, data: rows })
})

app.post('/superficies', validarRectangulo, verificarValidacion, async (req, res) => {
    const { base, altura } = req.body

    const perimetro = 2*(Number(base)+Number(altura))
    const area = base*altura

    await db.execute('INSERT INTO rectangulos (base, altura, perimetro, area) VALUES (?, ?, ?, ?)', 
        [base, altura, perimetro, area]
    )

    res.status(201).json({ success: true, data: {altura, base, perimetro, area} })


})

app.put('/superficies/:id', validarId, validarRectangulo, verificarValidacion, async (req, res) => {
    const id = Number(req.params.id)
    const { base, altura } = req.body

    const perimetro = 2*(Number(base)+Number(altura))
    const area = base*altura

    await db.execute('UPDATE rectangulos SET base=?, altura=?, perimetro=?, area=? WHERE id=?', 
        [base, altura, perimetro, area, id])
    
    res.json({ success: true, message: 'Datos cambiados con éxito', data: {id, base, altura, perimetro, area}})
})

app.delete('/superficies/:id', validarId, verificarValidacion, async (req, res) => {
      const id = Number(req.params.id)
      
      await db.execute('DELETE FROM rectangulos where id=?', [id])

      res.json({ success: true, message: 'Se elimino de la tabla Rectangulos', id })
})

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});