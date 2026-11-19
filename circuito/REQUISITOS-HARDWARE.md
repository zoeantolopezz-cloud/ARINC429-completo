# Requisitos hardware pendientes

## Estado

La documentación electrónica comienza sin seleccionar componentes ni fijar valores. Esta etapa no incluye un esquema definitivo ni garantiza niveles compatibles.

## Señal de entrada

Confirmar antes de diseñar:

- tipo de conector de salida de auriculares;
- asignación de canales izquierdo/derecho/masa;
- tensión pico a pico máxima disponible;
- tensión DC presente o polarización;
- impedancia de salida;
- ancho de banda o frecuencia utilizada;
- si la señal transporta una tensión proporcional o una modulación digital.

## Etapa de alta impedancia

Debe definirse, según mediciones reales:

- impedancia mínima de entrada requerida;
- rango de tensiones admitidas;
- necesidad de protección contra sobrevoltaje;
- necesidad de desacoplo DC;
- alimentación positiva/negativa disponible;
- referencia de masa o tierra común.

## Acondicionamiento

Confirmar qué conversión es necesaria:

- relación de entrada/salida;
- offset o punto medio;
- rango final compatible con el conversor del Arduino UNO;
- velocidad de actualización;
- posible filtrado analógico;
- precisión y estabilidad requeridas;
- necesidad de señalización y protección.

## Servomotor

Confirmar antes de conectar:

- modelo, tensión y corriente nominal;
- consumo máximo en arranque y bloqueo;
- rango angular mecánico;
- tipo de control PWM aceptado;
- fuente de alimentación separada o común;
- necesidad de conexión de masa común;
- presencia de realimentación o sensor;
- límites seguros de movimiento;
- mecanismo de desaceleración o protección.

## Arduino UNO

Se considera una plataforma candidata, no confirmada como definitiva. Se deberá verificar:

- pin de entrada analógica disponible;
- pin PWM disponible;
- función compartida o conflicto con comunicación serial;
- tensión lógica;
- corriente disponible desde 5 V;
- fuente USB adecuada;
- aislamiento entre señal simulada y alimentaciones.

## Conexiones

No se debe cablear hasta confirmar el diagrama definitivo. Las conexiones pendientes incluyen:

1. salida de auriculares -> conector o bornes de prueba;
2. entrada analógica del acondicionador;
3. salida acondicionada -> entrada ADC del Arduino;
4. salida PWM del Arduino -> entrada del servomotor;
5. alimentación del servomotor;
6. tierra común y aislamiento;
7. USB o fuente del Arduino.

## Seguridad

- no conectar el auricular a tensiones mayores a los límites medidos;
- no alimentar el servomotor directamente desde la salida o desde el regulador del Arduino sin cálculo de corriente;
- medir antes de cerrar circuitos;
- desconectar potencia antes de cambiar cableado;
- validar movimiento con límites mecánicos.
