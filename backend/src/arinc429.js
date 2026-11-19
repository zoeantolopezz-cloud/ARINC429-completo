// Codificación educativa ARINC 429 BNR.
// Bits 1-8: Label; 9-10: SDI; 11-29: Data; 30-31: SSM; 32: paridad.
// Las especificaciones exactas (etiquetas, resolución, rangos y significado SSM)
// deben venir del ICD del instrumento real.

const INSTRUMENTOS = {
  altimetro: { labelOctal: 0o203, escala: 10000 },
  velocidad: { labelOctal: 0o206, escala: 1000 },
  rumbo: { labelOctal: 0o310, escala: 360 }
};

function countOnes(word32) {
  let count = 0;
  for (let bit = 0; bit < 31; bit += 1) {
    if ((word32 >>> bit) & 1) count += 1;
  }
  return count;
}

function oddParity32(word32) {
  // La palabra final debe tener un número impar de unos en los bits 1-32.
  return (countOnes(word32) % 2 === 1) ? 0 : 0x80000000;
}

function getConfig(instrumento) {
  const config = INSTRUMENTOS[instrumento];
  if (!config) throw new Error(`Instrumento no reconocido: ${instrumento}`);
  return config;
}

function encodeArinc429(instrumento, valor, opciones = {}) {
  const config = getConfig(instrumento);
  const numero = Number(valor);
  const sdi = opciones.sdi === undefined ? 0 : Number(opciones.sdi);

  if (!Number.isFinite(numero)) throw new Error('El valor debe ser numérico');
  if (!Number.isInteger(sdi) || sdi < 0 || sdi > 3) {
    throw new Error('SDI debe ser un entero entre 0 y 3');
  }
  if (numero < -config.escala || numero > config.escala) {
    throw new Error(`El valor debe estar entre -${config.escala} y ${config.escala}`);
  }

  // 18 bits de magnitud dentro del campo Data y un bit de signo en el bit 29.
  const maxMagnitude = 0x3ffff;
  const magnitude = Math.min(maxMagnitude, Math.round(Math.abs(numero / config.escala) * maxMagnitude));

  let word = 0;
  word = (word | (config.labelOctal & 0xff)) >>> 0;
  word = (word | ((sdi & 0x3) << 8)) >>> 0;
  word = (word | ((magnitude & 0x3ffff) << 10)) >>> 0;
  if (numero < 0) word = (word | (1 << 28)) >>> 0;

  // SSM=11 positivo/normal; SSM=10 negativo/land-side en esta representación educativa.
  const ssm = numero < 0 ? 0x2 : 0x3;
  word = (word | (ssm << 29)) >>> 0;
  word = (word | oddParity32(word)) >>> 0;

  return word.toString(16).toUpperCase().padStart(8, '0');
}

function decodeArinc429(palabraHex) {
  if (!/^([0-9A-F]{8})$/i.test(palabraHex)) {
    throw new Error('La palabra debe tener exactamente 8 dígitos hexadecimales');
  }

  const word = Number.parseInt(palabraHex, 16) >>> 0;
  return {
    label: (word & 0xff).toString(8).padStart(3, '0'),
    sdi: (word >>> 8) & 0x3,
    data: (word >>> 10) & 0x3ffff,
    sign: (word >>> 28) & 0x1,
    ssm: (word >>> 29) & 0x3,
    parity: (word >>> 31) & 0x1,
    onesIncludingParity: countOnes(word) + ((word >>> 31) & 1)
  };
}

module.exports = { encodeArinc429, decodeArinc429, INSTRUMENTOS };
