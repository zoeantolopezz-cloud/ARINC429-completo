# Propuesta electrónica - borrador

## Estado

Documento de integración basado en bloques. No define componentes, valores, alimentaciones ni conexiones eléctricas hasta obtener mediciones reales de la salida de auriculares y especificaciones del servomotor.

## Cadena propuesta

```text
Salida de auriculares
        |
        v
Protección / bloqueo DC configurable
        |
        v
Etapa de alta impedancia
        |
        v
Acondicionador configurable
        |
        v
Entrada analógica A0 del Arduino UNO
        |
        v
Procesamiento y límites software
        |--------- Salida digital pin 13
        |--------- Salida digital pin 12
        |--------- Preparación PWM pin 9
                           |
                           v
                    Condicionamiento de potencia
                           |
                           v
                     Servomotor futuro
```

## Bloques pendientes

### 1. Interfaz de salida de auriculares

No debe asumirse polaridad, tensión, canal, impedancia ni masa. Confirmar antes de circuitar.

### 2. Protección y acoplamiento

El diseño final debe decidir, según medición:

- protección contra tensión excesiva;
- bloqueo o conservación de DC;
- masa o aislamiento;
- conector o punto de prueba;
- canal izquierdo/derecho.

### 3. Entrada de alta impedancia

Objetivo: cargar mínimamente la salida de auriculares. La topología e impedancia son pendientes de medición y selección.

### 4. Acondicionamiento

Debe mapear la señal observada al rango admitido por el ADC y añadir offset si fuera necesario. No se fija ganancia ni valores hasta medir.

### 5. Arduino UNO

- entrada reservada: `A0`;
- salida digital reservada: `13`;
- salida digital reservada: `12`;
- preparación PWM reservada: `9`;
- alimentación y niveles por confirmar.

### 6. Servomotor

La salida `9` está reservada como PWM con librería `Servo`, pero no se habilita en el firmware hasta confirmar modelo y seguridad.

Debe utilizarse una fuente apropiada para el servomotor, no inferir su consumo desde el pin PWM. La conexión de masas y protecciones deberá validarse.

## Variables configurables de firmware

- `CONDITIONED_SIGNAL_ADC_PIN = A0`;
- `SERVO_PWM_PIN = 9`;
- `SERVO_MIN_US = 1000`;
- `SERVO_MAX_US = 2000`;
- escalas por instrumento.

## Seguridad

- no conectar alimentación ni servomotor hasta medir la señal;
- no alimentar el motor desde los pines digitales o desde la salida de 5 V sin una especificación confirmada;
- verificar corriente máxima y protección contra inversión o bloqueo;
- utilizar límites mecánicos y software;
- desconectar energía antes de modificar cableado.

## Generación de señal por auriculares

El backend genera un archivo WAV mono PCM proporcional al valor. El frontend ofrece el enlace `Audio WAV` y la API entrega `/api/envios/:id/audio.wav`.

El WAV es una señal AC de demostración y no representa por sí solo una tensión DC proporcional segura. Antes de usarlo deben confirmarse:

- canal izquierdo/derecho;
- polaridad y masa;
- tensión pico a pico real;
- impedancia de salida;
- componente DC presente;
- frecuencia y volumen;
- rectificación/filtrado/offset necesarios;
- rango admitido por el ADC;
- límite máximo de reproducción.

No conectar auriculares al circuito hasta completar medición y protección.
