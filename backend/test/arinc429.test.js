const test = require('node:test');
const assert = require('node:assert/strict');
const { encodeArinc429, decodeArinc429 } = require('../src/arinc429');

function countOnes(word) {
  let count = 0;
  for (let bit = 0; bit < 32; bit += 1) {
    if ((word >>> bit) & 1) count += 1;
  }
  return count;
}

for (const [instrumento, valor, labelEsperado] of [
  ['altimetro', 5000, '203'],
  ['velocidad', 250, '206'],
  ['rumbo', -90, '310']
]) {
  test(`genera campos válidos para ${instrumento} con valor ${valor}`, () => {
    const hexadecimal = encodeArinc429(instrumento, valor, { sdi: 2 });
    assert.match(hexadecimal, /^[0-9A-F]{8}$/);

    const campos = decodeArinc429(hexadecimal);
    assert.equal(campos.label, labelEsperado);
    assert.equal(campos.sdi, 2);
    assert.equal(campos.sign, valor < 0 ? 1 : 0);
    assert.equal(campos.ssm, valor < 0 ? 2 : 3);

    const word = Number.parseInt(hexadecimal, 16) >>> 0;
    assert.equal(countOnes(word) % 2, 1, 'la paridad debe ser impar');
  });
}

test('convierte cero a magnitud cero y SSM positivo', () => {
  const campos = decodeArinc429(encodeArinc429('velocidad', 0));
  assert.equal(campos.data, 0);
  assert.equal(campos.sign, 0);
  assert.equal(campos.ssm, 3);
});

test('rechaza SDI fuera de rango', () => {
  assert.throws(() => encodeArinc429('altimetro', 1000, { sdi: 4 }), /SDI/);
});

test('rechaza instrumentos desconocidos', () => {
  assert.throws(() => encodeArinc429('inexistente', 1), /no reconocido/);
});

test('rechaza valores fuera de escala', () => {
  assert.throws(() => encodeArinc429('altimetro', 10001), /valor debe estar/);
});

test('valores positivos y negativos conservan magnitud', () => {
  const positiva = decodeArinc429(encodeArinc429('rumbo', 90));
  const negativa = decodeArinc429(encodeArinc429('rumbo', -90));
  assert.equal(positiva.data, negativa.data);
  assert.equal(positiva.sign, 0);
  assert.equal(negativa.sign, 1);
  assert.equal(positiva.ssm, 3);
  assert.equal(negativa.ssm, 2);
});

test('mínimo y máximo mantienen exactamente ocho dígitos hexadecimales', () => {
  for (const valor of [10000, -10000]) {
    const hexadecimal = encodeArinc429('altimetro', valor);
    assert.equal(hexadecimal.length, 8);
    assert.match(hexadecimal, /^[0-9A-F]{8}$/);
  }
});
