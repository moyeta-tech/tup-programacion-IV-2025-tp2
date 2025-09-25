import express from 'express';
import { body, param, query, validationResult } from "express-validator";
import { conectarDB, db } from './db.js';

conectarDB();

const validarId = param('id').isInt({min:1})


const app = express();
const port = process.env.PORT || 3000;
app.use(express.json()); // Interpretar body como JSON

app.get('/superficies', async (req, res) => {
    let sql = 'SELECT * FROM rectangulos'

    const [rows] = await db.execute(sql)
    console.log(rows)
    res.json({ success: true, data: rows })
})

app.post('/superficies', async (req, res) => {
    const { base, altura } = req.body

    const perimetro = 2*(base+altura)
    const area = base*altura

    await db.execute('INSERT INTO rectangulos (base, altura, perimetro, area) VALUES (?, ?, ?, ?)', 
        [base, altura, perimetro, area]
    )

    res.status(201).json({ success: true, data: {altura, base, perimetro, area} })


})

app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});