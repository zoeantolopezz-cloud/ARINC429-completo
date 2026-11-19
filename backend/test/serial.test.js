const test = require('node:test');
const assert = require('node:assert/strict');

const { encodeArinc429 } = require('../src/arinc429');
const { buildSerialFrame } = require('../src/serial');

test('una palabra creada corresponde a una sola llamada serial conceptual', () => {
  const palabra = encodeArinc429('altimetro', 5000);
  let llamadasSerial = 0;
  const enviar = value => { llamadasSerial += 1; return value; };

  enviar(palabra);

  assert.equal(llamadasSerial, 1);
  assert.equal(palabra.length, 8);
});

test('un reenvío manual es una operación explícita separada', () => {
  let llamadasSerial = 0;
  const enviarExistente = () => { llamadasSerial += 1; };

  enviarExistente();

  assert.equal(llamadasSerial, 1);
});

test('el frame serial contiene exactamente la palabra hexadecimal generada', () => {
  const palabra = encodeArinc429('altimetro', 5000);
  assert.equal(buildSerialFrame(palabra), `${palabra}\n`);
  assert.doesNotThrow(() => buildSerialFrame(palabra));
  assert.throws(() => buildSerialFrame('1234'), /exactamente 8 dígitos/);
});
