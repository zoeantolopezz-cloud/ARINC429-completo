# Pruebas seriales del firmware

Enviar al puerto del Arduino una palabra hexadecimal por línea.

```text
E8000083
58000283
64000186
D40003C8
NO_ES_HEXA
```

Respuestas esperadas según el firmware educativo:

- palabra válida: `OK <INSTRUMENTO> <VALOR>`;
- palabra con formato incorrecto: `ERR_FORMAT`;
- paridad incorrecta: `ERR_PARITY`;
- Label no configurado: `ERR_LABEL`.

No probar movimiento de servomotor hasta confirmar alimentación, pin y límites mecánicos. El ejemplo deja `updateServo(...)` comentado.
