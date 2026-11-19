require('dotenv').config();

const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./db');
const { encodeArinc429 } = require('./arinc429');
const { sendHex, closeSerial } = require('./serial');

const app = express();
const PORT = Number(process.env.PORT || 3000);

app.use(cors({ origin: process.env.CORS_ORIGIN || true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', '..', 'frontend')));

function validateEnvio(body) {
  if (!body.instrumento || typeof body.instrumento !== 'string') {
    throw new Error('El instrumento es obligatorio');
  }
  if (body.valor === undefined || body.valor === null || body.valor === '') {
    throw new Error('El valor es obligatorio');
  }
}

app.get('/api/status', (req, res) => {
  res.json({
    api: 'ok',
    serialConfigured: Boolean(process.env.SERIAL_PORT),
    serialPort: process.env.SERIAL_PORT || null,
    baudRate: Number(process.env.SERIAL_BAUD_RATE || 9600)
  });
});

app.get('/api/envios', async (req, res, next) => {
  try {
    const [rows] = await db.query(
      'SELECT id, instrumento, valor, palabra_arinc, enviado_serial, creado_en, actualizado_en FROM envios ORDER BY id DESC'
    );
    res.json(rows);
  } catch (error) { next(error); }
});

app.get('/api/envios/:id', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT id, instrumento, valor, palabra_arinc, enviado_serial, creado_en, actualizado_en FROM envios WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Envío no encontrado' });
    res.json(rows[0]);
  } catch (error) { next(error); }
});

app.post('/api/envios', async (req, res, next) => {
  try {
    validateEnvio(req.body);
    const palabra = encodeArinc429(req.body.instrumento, req.body.valor);

    // Se guarda primero: si el puerto serial falla, el CRUD conserva el envío.
    const [result] = await db.execute(
      'INSERT INTO envios (instrumento, valor, palabra_arinc, enviado_serial) VALUES (?, ?, ?, FALSE)',
      [req.body.instrumento, Number(req.body.valor), palabra]
    );

    // Una única llamada por operación POST. El reenvío manual usa su endpoint aparte.
    const serial = await sendHex(palabra).catch(error => ({ enabled: false, reason: error.message }));
    if (serial.enabled) {
      await db.execute('UPDATE envios SET enviado_serial = TRUE WHERE id = ?', [result.insertId]);
    }

    res.status(201).json({
      id: result.insertId,
      instrumento: req.body.instrumento,
      valor: Number(req.body.valor),
      palabra_arinc: palabra,
      enviado_serial: serial.enabled,
      serial
    });
  } catch (error) { next(error); }
});

app.put('/api/envios/:id', async (req, res, next) => {
  try {
    validateEnvio(req.body);
    const palabra = encodeArinc429(req.body.instrumento, req.body.valor);
    const [result] = await db.execute(
      'UPDATE envios SET instrumento = ?, valor = ?, palabra_arinc = ?, enviado_serial = FALSE WHERE id = ?',
      [req.body.instrumento, Number(req.body.valor), palabra, req.params.id]
    );
    if (!result.affectedRows) return res.status(404).json({ error: 'Envío no encontrado' });

    // Una única operación serial por modificación exitosa.
    const serial = await sendHex(palabra).catch(error => ({ enabled: false, reason: error.message }));
    if (serial.enabled) {
      await db.execute('UPDATE envios SET enviado_serial = TRUE WHERE id = ?', [req.params.id]);
    }

    const [rows] = await db.execute(
      'SELECT id, instrumento, valor, palabra_arinc, enviado_serial, creado_en, actualizado_en FROM envios WHERE id = ?',
      [req.params.id]
    );
    res.json(rows[0]);
  } catch (error) { next(error); }
});

app.post('/api/envios/:id/enviar', async (req, res, next) => {
  try {
    const [rows] = await db.execute(
      'SELECT palabra_arinc FROM envios WHERE id = ?',
      [req.params.id]
    );
    if (!rows.length) return res.status(404).json({ error: 'Envío no encontrado' });

    const serial = await sendHex(rows[0].palabra_arinc)
      .catch(error => ({ enabled: false, reason: error.message }));
    await db.execute('UPDATE envios SET enviado_serial = ? WHERE id = ?', [serial.enabled, req.params.id]);

    res.json({ id: Number(req.params.id), palabra_arinc: rows[0].palabra_arinc, serial });
  } catch (error) { next(error); }
});

app.delete('/api/envios/:id', async (req, res, next) => {
  try {
    const [result] = await db.execute('DELETE FROM envios WHERE id = ?', [req.params.id]);
    if (!result.affectedRows) return res.status(404).json({ error: 'Envío no encontrado' });
    res.status(204).send();
  } catch (error) { next(error); }
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(error.status || 400).json({ error: error.message });
});

const server = app.listen(PORT, () => {
  console.log(`API disponible en http://localhost:${PORT}`);
});

function shutdown() {
  closeSerial();
  server.close(() => process.exit(0));
}
process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
