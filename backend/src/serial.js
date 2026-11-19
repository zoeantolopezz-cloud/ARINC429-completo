const { SerialPort } = require('serialport');

let port = null;
let sendQueue = Promise.resolve();

function buildSerialFrame(palabra) {
  if (!/^([0-9A-F]{8})$/i.test(palabra)) {
    throw new Error('La palabra serial debe tener exactamente 8 dígitos hexadecimales');
  }
  return `${palabra.toUpperCase()}\n`;
}

async function sendHex(palabra) {
  const task = sendQueue.then(() => sendHexOnce(palabra));
  sendQueue = task.catch(() => undefined);
  return task;
}

async function sendHexOnce(palabra) {
  const configuredPort = process.env.SERIAL_PORT;
  if (!configuredPort) return { enabled: false, reason: 'SERIAL_PORT no configurado' };

  if (!port || !port.isOpen) {
    port = new SerialPort({
      path: configuredPort,
      baudRate: Number(process.env.SERIAL_BAUD_RATE || 9600),
      autoOpen: false
    });

    await new Promise((resolve, reject) => {
      port.once('open', resolve);
      port.once('error', reject);
      port.open();
    });
  }

  const frame = buildSerialFrame(palabra);

  await new Promise((resolve, reject) => {
    port.write(frame, 'ascii', error => error ? reject(error) : resolve());
  });

  return { enabled: true, path: configuredPort, data: palabra };
}

function closeSerial() {
  if (port?.isOpen) port.close();
}

module.exports = { sendHex, closeSerial, buildSerialFrame };
