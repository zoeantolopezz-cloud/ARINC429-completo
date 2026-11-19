# ARINC429-Completo

Proyecto educativo y funcional de interfaz web, API CRUD, base MySQL y preparación de salida serial ARINC 429.

## Estructura

- `frontend/`: HTML, CSS y JavaScript.
- `backend/`: Express, MySQL y SerialPort.
- `arduino/`: reservado para el firmware, todavía no implementado.
- `circuito/`: reservado para esquemas y documentación electrónica, todavía no implementado.

## Requisitos

- Node.js 18 o superior.
- npm.
- MySQL 8.

## Instalación

```bash
cd backend
npm install
cp .env.example .env
```

Crear la base y un usuario MySQL. Como ejemplo, desde una terminal autenticada:

```bash
mysql -u root -p < backend/sql/schema.sql
mysql -u root -p
```

Dentro de MySQL:

```sql
CREATE USER IF NOT EXISTS 'arinc_app'@'localhost' IDENTIFIED BY 'arinc_password';
GRANT ALL PRIVILEGES ON arinc429.* TO 'arinc_app'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

La configuración se puede ajustar en `backend/.env`. Para ejecutar sin puerto serial, dejar `SERIAL_PORT=` vacío. Para usar un Arduino o conversor USB-serie, indicar su ruta, por ejemplo `/dev/ttyUSB0` o `/dev/ttyACM0`.

## Ejecución

```bash
cd backend
npm start
```

Abrir `http://localhost:3000`.

## API

- `GET /api/status`: muestra configuración serial sin abrir hardware.
- `GET /api/envios`: lista todos los envíos.
- `GET /api/envios/:id`: consulta un envío.
- `POST /api/envios`: crea un envío y intenta enviarlo por serial.
- `POST /api/envios/:id/enviar`: reenvía por serial una palabra existente.
- `PUT /api/envios/:id`: modifica un envío y rehace la palabra serial.
- `DELETE /api/envios/:id`: elimina un envío.

Ejemplo:

```bash
curl -X POST http://localhost:3000/api/envios \
  -H 'Content-Type: application/json' \
  -d '{"instrumento":"altimetro","valor":5000}'
```

## Verificación del software

### Pruebas ejecutadas

```bash
cd backend
npm test
```

Resultado actual:

- 9 pruebas aprobadas.
- 1 prueba CRUD integrada omitida por falta de acceso autorizado a MySQL.
- Codificación comprobada para altímetro, velocidad y rumbo.
- Cero, valores negativos, límites y SDI fuera de rango comprobados.
- Paridad impar comprobada sobre la palabra completa de 32 bits.

### Layout ARINC 429 implementado

La implementación educativa BNR utiliza:

- **Label:** bits 1-8, etiquetas octales configuradas por instrumento.
- **SDI:** bits 9-10, configurable de 0 a 3.
- **Data:** bits 11-28, magnitud BNR de 18 bits.
- **Signo:** bit 29.
- **SSM:** bits 30-31; positivo usa `11` y negativo usa `10` en esta representación educativa.
- **Paridad:** bit 32, ajustada a paridad impar.

Estos campos son una representación de demostración. Las etiquetas, resoluciones, rangos y significado de SSM deben validarse con el ICD real del instrumento antes de considerar el sistema operativo.

### Estado de MySQL

El servidor MySQL está activo, pero el usuario `arinc_app` no está autorizado con las credenciales locales y el entorno no tiene permisos `sudo`. Por esta razón no debe afirmarse que el CRUD real pasó la integración.

El administrador autorizado debe ejecutar:

```bash
sudo mysql < backend/sql/setup_user.sql
```

Después verificar:

```bash
mysql -u arinc_app -parinc_password -e 'SELECT 1' arinc429
cd backend
npm test
```

La prueba integrada creará, consultará, modificará y eliminará temporalmente un registro de prueba, y eliminará nuevamente el registro en la limpieza.

### Reenvío serial

Crear y modificar guardan el envío antes de intentar serializar y realizan exactamente una llamada serial por operación. El endpoint manual `/api/envios/:id/enviar` permite reenvíos explícitos independientes.

La cola serial evita escrituras superpuestas. Si `SERIAL_PORT` está vacío, la operación no abre hardware y el envío queda almacenado con `enviado_serial=false`.

## Serial

Al crear un envío, la API escribe en el puerto configurado una palabra hexadecimal seguida de salto de línea. Si no hay puerto configurado, el envío se guarda igual y queda marcado como no enviado. No se han comprobado todavía equipos o buses ARINC 429 reales.

## Alcance técnico importante

La palabra incluida es una codificación BNR educativa para demostración. Los nombres, etiquetas octales, rangos, resolución, SSM y paridad deben coincidir con el ICD real. Antes de usar hardware operativo se necesita confirmar:

- modelo exacto del instrumento;
- etiqueta y resolución del parámetro;
- rango real y número de datos;
- significado exacto de SSM;
- protocolo físico y niveles eléctricos necesarios.

## Estado Arduino y circuito

- Firmware inicial disponible en `arduino/src/arinc429_firmware.ino`.
- El firmware recibe palabras hexadecimales de 8 caracteres a 9600 baudios.
- Identifica el instrumento por Label, valida paridad y muestra instrumento/valor en LCD configurable.
- Los pines digitales `13` y `12` están implementados como salidas configurables derivadas del SSM.
- `A0` queda reservado para la señal acondicionada y `9` para futura salida PWM del servomotor.
- El movimiento del servomotor permanece deshabilitado hasta confirmar hardware y alimentación.
- La propuesta electrónica se documenta en `circuito/PROPUESTA.md`.
- No se fijaron componentes, resistencias ni conexiones eléctricas pendientes de medición.

No hay `arduino-cli` ni core AVR disponible en esta máquina, por lo que la compilación física no pudo ejecutarse.
