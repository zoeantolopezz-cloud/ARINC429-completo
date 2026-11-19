# Arduino UNO - Preparación

La implementación definitiva del firmware queda pendiente hasta confirmar las conexiones y el hardware.

## Consideración inicial

Arduino UNO se considera como plataforma candidata. El firmware deberá recibir datos seriales desde la API y convertirlos a una señal analógica o proporcional que controle el circuito de acondicionamiento y el servomotor.

## Datos pendientes

- pin exacto del ADC;
- pin PWM o salida alternativa;
- fuente y consumo del servomotor;
- interfaz eléctrica del acondicionador;
- si el Arduino recibe la palabra hexadecimal completa o solo un valor normalizado;
- velocidad y estabilidad del enlace serial;
- protocolo final de texto y delimitadores;
- polaridad y rango de la señal después del acondicionamiento.

## Protocolo serial propuesto como borrador

La API puede enviar una palabra hexadecimal de ocho caracteres seguida de `LF`:

```text
4A2035CF\n
```

Este formato no implica que el firmware real use directamente el bus ARINC 429. Antes de implementarlo se debe confirmar si el Arduino debe recibir:

- palabra completa;
- etiqueta;
- datos normalizados;
- o una variable derivada de valor/instrumento.

## Validación futura

1. comprobar puerto detectado;
2. validar comunicación sin mover el servomotor;
3. limitar el movimiento por software;
4. usar alimentación separada para el servomotor;
5. confirmar tierra común;
6. realizar pruebas lentas y con carga mínima;
7. documentar mediciones de tensión y corriente.

# Firmware Arduino UNO

## Estado

Implementación inicial disponible. Requiere Arduino UNO, una LCD compatible o desactivar `LCD_ENABLE`, y la librería `LiquidCrystal` incluida con Arduino IDE. `Servo.h` es parte del paquete de librerías de Arduino.

No se ha comprobado firmware sobre hardware real.

## Entradas y salida

- Puerto serial a 9600 baudios.
- Una palabra hexadecimal de 8 caracteres seguida de `LF` o `CRLF`.
- LCD 16×2 configurable en modo 4-bit, según el modelo de pantalla confirmado.
- Pines digitales `13` y `12`.
- Pin ADC `A0` reservado para una señal acondicionada futura.
- Pin PWM `9` reservado para preparación del servomotor; la llamada está comentada.

## Reutilización del backend

La API serializa cada palabra como por ejemplo:

```text
E8000083
```

El firmware acepta mayúsculas o minúsculas, valida longitud y paridad, extrae el Label, identifica el instrumento y obtiene el valor educativo BNR.

## Configuración

Editar `src/firmware_config.h` antes de cargar:

- baud rate;
- pines LCD;
- pines digitales;
- pin ADC;
- pin del servo;
- límites configurables en microsegundos;
- escalas e instrumentos.

## Ejecución

1. Abrir `src/arinc429_firmware.ino` en Arduino IDE.
2. Seleccionar placa `Arduino Uno`.
3. Seleccionar puerto serie correspondiente.
4. Compilar y cargar.
5. Abrir Monitor Serial a 9600 baudios.
6. Enviar una línea hexadecimal de prueba.

## LCD

Una vez comprobada físicamente una pantalla, puede mostrarse en:

- línea 1: instrumento;
- línea 2: valor con dos decimales.

Si no existe la pantalla, cambiar `LCD_ENABLE` a comentario. Esto evita asumir su conexión.

## Pines 13 y 12

Ambos se configuran como salidas digitales. Su estado se deriva del SSM en esta versión educativa. La semántica física real debe confirmarse con el circuito.

## Servomotor

No se habilita el movimiento automático porque faltan confirmar modelo, alimentación, corriente, pin, rango y posición segura. `updateServo(...)` está presente y comentado en `processWord(...)`.

## Suposiciones documentadas

- LCD 16×2 con interfaz 4-bit.
- Señal de entrada futura en `A0`.
- Servo futuro en PWM `9`.
- Límites iniciales de PWM expresados como microsegundos configurables.
- Escalas educativas iguales a las usadas en el backend.

## Pruebas

Ver `src/TEST_MESSAGES.md`.
