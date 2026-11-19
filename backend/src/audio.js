// Genera una señal WAV monoeducativa para representar el valor de un envío.
// La salida de auriculares es AC y no debe considerarse tensión DC directa.
// El circuito externo deberá rectificar/filtrar según mediciones reales.

const INSTRUMENT_SCALES = {
  altimetro: 10000,
  velocidad: 1000,
  rumbo: 360
};

function writeString(buffer, offset, text) {
  buffer.write(text, offset, text.length, 'ascii');
}

function generateAudioWav(instrumento, valor, options = {}) {
  const scale = INSTRUMENT_SCALES[instrumento];
  if (!scale) throw new Error(`Instrumento no reconocido: ${instrumento}`);

  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < -scale || numero > scale) {
    throw new Error(`El valor debe estar entre -${scale} y ${scale}`);
  }

  const sampleRate = Number(options.sampleRate || 44100);
  const durationSeconds = Number(options.durationSeconds || 1);
  const frequency = Number(options.frequency || 1000);
  const sampleCount = Math.floor(sampleRate * durationSeconds);
  const dataSize = sampleCount * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  writeString(buffer, 0, 'RIFF');
  buffer.writeUInt32LE(36 + dataSize, 4);
  writeString(buffer, 8, 'WAVE');
  writeString(buffer, 12, 'fmt ');
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20);
  buffer.writeUInt16LE(1, 22);
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  writeString(buffer, 36, 'data');
  buffer.writeUInt32LE(dataSize, 40);

  // Amplitud normalizada proporcional al valor; conserva el signo con fase.
  const normalized = numero / scale;
  const amplitude = Math.abs(normalized);

  for (let i = 0; i < sampleCount; i += 1) {
    const t = i / sampleRate;
    let sample = Math.sin(2 * Math.PI * frequency * t) * amplitude;
    if (normalized < 0) sample *= -1;
    const pcm = Math.max(-1, Math.min(1, sample));
    buffer.writeInt16LE(Math.round(pcm * 32767), 44 + i * 2);
  }

  return buffer;
}

module.exports = { generateAudioWav, INSTRUMENT_SCALES };
