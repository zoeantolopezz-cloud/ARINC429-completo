#ifndef FIRMWARE_CONFIG_H
#define FIRMWARE_CONFIG_H

// Comunicación serial: debe coincidir con backend/.env
constexpr unsigned long SERIAL_BAUD_RATE = 9600;

// Pantalla LCD 16x2 por 4-bit (componente propuesto, pendiente de confirmar).
#define LCD_ENABLE
constexpr uint8_t LCD_RS_PIN = 7;
constexpr uint8_t LCD_EN_PIN = 6;
constexpr uint8_t LCD_D4_PIN = 5;
constexpr uint8_t LCD_D5_PIN = 4;
constexpr uint8_t LCD_D6_PIN = 3;
constexpr uint8_t LCD_D7_PIN = 2;

// Pines solicitados. Su significado funcional debe confirmarse.
constexpr uint8_t DIGITAL_OUTPUT_13 = 13;
constexpr uint8_t DIGITAL_OUTPUT_12 = 12;

// Preparación de integración: pendiente de confirmar modelo y conector.
constexpr uint8_t CONDITIONED_SIGNAL_ADC_PIN = A0;
constexpr uint8_t SERVO_PWM_PIN = 9;
constexpr uint16_t SERVO_MIN_US = 1000;
constexpr uint16_t SERVO_MAX_US = 2000;

// Escalas educativas equivalentes a backend/src/arinc429.js.
struct InstrumentConfig {
  uint32_t label;
  long scale;
  const char* name;
};

constexpr InstrumentConfig INSTRUMENTS[] = {
  {0x83, 10000, "ALTIMETRO"},
  {0x86, 1000, "VELOCIDAD"},
  {0xC8, 360, "RUMBO"}
};
constexpr uint8_t INSTRUMENT_COUNT = sizeof(INSTRUMENTS) / sizeof(INSTRUMENTS[0]);

#endif
