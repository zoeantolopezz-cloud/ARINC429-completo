const test = require('node:test');
const assert = require('node:assert/strict');

require('dotenv').config({ path: require('node:path').join(__dirname, '..', '.env') });
const db = require('../src/db');

async function databaseDisponible() {
  try {
    await db.query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
}

test('CRUD real de envíos con MySQL', async t => {
  if (!(await databaseDisponible())) {
    t.skip('MySQL no está configurado o el usuario arinc_app no tiene acceso');
    return;
  }

  let id;
  try {
    const [creado] = await db.execute(
      'INSERT INTO envios (instrumento, valor, palabra_arinc, enviado_serial) VALUES (?, ?, ?, FALSE)',
      ['velocidad', 250.1234, 'TEST0001']
    );
    id = creado.insertId;

    const [consultado] = await db.execute(
      'SELECT id, instrumento, valor, palabra_arinc FROM envios WHERE id = ?', [id]
    );
    assert.equal(consultado.length, 1);
    assert.equal(consultado[0].instrumento, 'velocidad');

    await db.execute(
      'UPDATE envios SET instrumento = ?, valor = ?, palabra_arinc = ? WHERE id = ?',
      ['rumbo', -45, 'TEST0002', id]
    );

    const [modificado] = await db.execute(
      'SELECT instrumento, valor, palabra_arinc FROM envios WHERE id = ?', [id]
    );
    assert.equal(modificado[0].instrumento, 'rumbo');
    assert.equal(modificado[0].palabra_arinc, 'TEST0002');

    await db.execute('DELETE FROM envios WHERE id = ?', [id]);
    const [eliminado] = await db.execute('SELECT id FROM envios WHERE id = ?', [id]);
    assert.equal(eliminado.length, 0);
  } finally {
    if (id) await db.execute('DELETE FROM envios WHERE id = ?', [id]).catch(() => undefined);
    await db.end();
  }
});
