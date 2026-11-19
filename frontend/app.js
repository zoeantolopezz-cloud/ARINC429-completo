const API_URL = '/api/envios';

const formulario = document.querySelector('#form-envio');
const instrumento = document.querySelector('#instrumento');
const valor = document.querySelector('#valor');
const envioId = document.querySelector('#envio-id');
const tabla = document.querySelector('#tabla-envios');
const mensaje = document.querySelector('#mensaje');
const botonSubmit = document.querySelector('#boton-submit');
const botonCancelar = document.querySelector('#boton-cancelar');

function mostrarMensaje(texto, error = false) {
  mensaje.textContent = texto;
  mensaje.style.color = error ? '#b42318' : '#16794a';
}

async function pedir(url, opciones = {}) {
  const respuesta = await fetch(url, opciones);
  if (!respuesta.ok && respuesta.status !== 204) {
    const cuerpo = await respuesta.json().catch(() => ({ error: 'Error de comunicación' }));
    throw new Error(cuerpo.error || 'Error de comunicación');
  }
  return respuesta.status === 204 ? null : respuesta.json();
}

async function cargarEnvios() {
  try {
    const envios = await pedir(API_URL);
    tabla.innerHTML = '';

    if (!envios.length) {
      tabla.innerHTML = '<tr><td colspan="6">No hay envíos registrados.</td></tr>';
      return;
    }

    for (const envio of envios) {
      const fila = document.createElement('tr');
      fila.innerHTML = `
        <td>${envio.id}</td>
        <td>${envio.instrumento}</td>
        <td>${envio.valor}</td>
        <td class="palabra">${envio.palabra_arinc}</td>
        <td class="${envio.enviado_serial ? 'ok' : 'no'}">${envio.enviado_serial ? 'Enviado' : 'Sin puerto'}</td>
        <td>
          <button type="button" class="secundario editar" data-id="${envio.id}">Editar</button>
          <button type="button" class="secundario enviar" data-id="${envio.id}">Enviar</button>
          <a class="boton" href="${API_URL}/${envio.id}/audio.wav" target="_blank" rel="noopener">Audio WAV</a>
          <button type="button" class="danger eliminar" data-id="${envio.id}">Eliminar</button>
        </td>`;
      tabla.appendChild(fila);
    }
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
}

async function cargarEstadoSerial() {
  try {
    const estado = await pedir('/api/status');
    const detalle = estado.serialConfigured
      ? `Serial configurado: ${estado.serialPort} a ${estado.baudRate} baudios`
      : 'Serial pendiente de configurar; los envíos se guardarán sin abrir puerto';
    mostrarMensaje(detalle);
  } catch (error) {
    mostrarMensaje(error.message, true);
  }
}

async function enviarExistente(id) {
  try {
    const respuesta = await pedir(`${API_URL}/${id}/enviar`, { method: 'POST' });
    mostrarMensaje(respuesta.serial.enabled
      ? `Palabra ${respuesta.palabra_arinc} enviada por serial.`
      : `No se pudo enviar: ${respuesta.serial.reason || 'puerto no disponible'}`, !respuesta.serial.enabled);
    cargarEnvios();
  } catch (error) { mostrarMensaje(error.message, true); }
}

formulario.addEventListener('submit', async evento => {
  evento.preventDefault();
  if (botonSubmit.disabled) return;
  botonSubmit.disabled = true;
  const datos = { instrumento: instrumento.value, valor: valor.value };
  const editando = Boolean(envioId.value);

  try {
    await pedir(editando ? `${API_URL}/${envioId.value}` : API_URL, {
      method: editando ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datos)
    });
    mostrarMensaje(editando ? 'Envío modificado.' : 'Envío creado.');
    cancelarEdicion();
    cargarEnvios();
  } catch (error) {
    mostrarMensaje(error.message, true);
  } finally {
    botonSubmit.disabled = false;
  }
});

tabla.addEventListener('click', async evento => {
  const boton = evento.target.closest('button');
  if (!boton) return;

  if (boton.classList.contains('editar')) {
    try {
      const envio = await pedir(`${API_URL}/${boton.dataset.id}`);
      envioId.value = envio.id;
      instrumento.value = envio.instrumento;
      valor.value = envio.valor;
      botonSubmit.textContent = 'Guardar cambios';
      botonCancelar.hidden = false;
      instrumento.focus();
    } catch (error) { mostrarMensaje(error.message, true); }
  }

  if (boton.classList.contains('enviar')) {
    enviarExistente(boton.dataset.id);
  }
});

function cancelarEdicion() {
  envioId.value = '';
  formulario.reset();
  botonSubmit.textContent = 'Crear envío';
  botonCancelar.hidden = true;
}

botonCancelar.addEventListener('click', cancelarEdicion);
document.querySelector('#recargar').addEventListener('click', cargarEnvios);
cargarEstadoSerial();
cargarEnvios();
