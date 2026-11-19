const test = require('node:test');
const assert = require('node:assert/strict');
const { generateAudioWav } = require('../src/audio');

test('genera un archivo WAV mono PCM válido', () => {
  const wav = generateAudioWav('altimetro', 5000);
  assert.equal(wav.subarray(0, 4).toString('ascii'), 'RIFF');
  assert.equal(wav.subarray(8, 12).toString('ascii'), 'WAVE');
  assert.equal(wav.subarray(36, 40).toString('ascii'), 'data');
  assert.equal(wav.readUInt16LE(22), 1);
  assert.equal(wav.readUInt16LE(34), 16);
});

test('rechaza valores fuera de la escala del instrumento', () => {
  assert.throws(() => generateAudioWav('rumbo', 361), /valor debe estar/);
});

test('valores positivos y negativos producen amplitudes opuestas', () => {
  const positive = generateAudioWav('velocidad', 500, { durationSeconds: 0.01 });
  const negative = generateAudioWav('velocidad', -500, { durationSeconds: 0.01 });
  let positiveSignChanges = 0;
  let negativeSignChanges = 0;

  for (let i = 44; i < positive.length - 2; i += 2) {
    const a = positive.readInt16LE(i);
    const b = positive.readInt16LE(i + 2);
    if ((a < 0 && b >= 0) || (a >= 0 && b < 0)) positiveSignChanges++;
  }
  for (let i = 44; i < negative.length - 2; i += 2) {
    const a = negative.readInt16LE(i);
    const b = negative.readInt16LE(i + 2);
    if ((a < 0 && b >= 0) || (a >= 0 && b < 0)) negativeSignChanges++;
  }

  assert.equal(positiveSignChanges > 0, true);
  assert.equal(negativeSignChanges > 0, true);
});
