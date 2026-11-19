#include <LiquidCrystal.h>
#include <Servo.h>
#include "firmware_config.h"

LiquidCrystal lcd(LCD_RS_PIN, LCD_EN_PIN, LCD_D4_PIN, LCD_D5_PIN, LCD_D6_PIN, LCD_D7_PIN);
Servo servo;

String serialBuffer;
bool lcdAvailable = true;

uint32_t parseHex32(const String& hexadecimal) {
  uint32_t word = 0;
  for (uint8_t i = 0; i < hexadecimal.length(); ++i) {
    char c = hexadecimal.charAt(i);
    uint8_t digit;
    if (c >= '0' && c <= '9') digit = c - '0';
    else if (c >= 'A' && c <= 'F') digit = c - 'A' + 10;
    else if (c >= 'a' && c <= 'f') digit = c - 'a' + 10;
    else return 0;
    word = (word << 4) | digit;
  }
  return word;
}

bool validHexWord(const String& hexadecimal) {
  if (hexadecimal.length() != 8) return false;
  for (uint8_t i = 0; i < 8; ++i) {
    char c = hexadecimal.charAt(i);
    if (!((c >= '0' && c <= '9') || (c >= 'A' && c <= 'F') || (c >= 'a' && c <= 'f'))) return false;
  }
  return true;
}

uint8_t countOnes32(uint32_t word) {
  uint8_t count = 0;
  for (uint8_t bit = 0; bit < 32; ++bit) {
    if ((word >> bit) & 1UL) ++count;
  }
  return count;
}

const InstrumentConfig* findInstrument(uint32_t word) {
  uint32_t label = word & 0xFFUL;
  for (uint8_t i = 0; i < INSTRUMENT_COUNT; ++i) {
    if (INSTRUMENTS[i].label == label) return &INSTRUMENTS[i];
  }
  return nullptr;
}

float decodeValue(uint32_t word, long scale) {
  uint32_t magnitude = (word >> 10) & 0x3FFFFUL;
  bool negative = ((word >> 28) & 1UL) != 0;
  float value = (float)magnitude / 262143.0f * (float)scale;
  return negative ? -value : value;
}

void showLCD(const char* instrument, float value) {
  if (!lcdAvailable) return;
  lcd.clear();
  lcd.setCursor(0, 0);
  lcd.print(instrument);
  lcd.setCursor(0, 1);
  lcd.print("V:");
  lcd.print(value, 2);
}

void updateDigitalOutputs(uint32_t word) {
  // Codificación configurable de demostración: SSM determina ambos pines.
  uint8_t ssm = (word >> 29) & 0x3UL;
  digitalWrite(DIGITAL_OUTPUT_13, ssm & 0x2);
  digitalWrite(DIGITAL_OUTPUT_12, ssm & 0x1);
}

void updateServo(float value, long scale) {
  // Salida preparada pero no activada hasta confirmar el servomotor.
  int mapped = map((long)value, -scale, scale, SERVO_MIN_US, SERVO_MAX_US);
  mapped = constrain(mapped, SERVO_MIN_US, SERVO_MAX_US);
  servo.writeMicroseconds(mapped);
}

void processWord(const String& hexadecimal) {
  if (!validHexWord(hexadecimal)) {
    Serial.println("ERR_FORMAT");
    return;
  }

  uint32_t word = parseHex32(hexadecimal);
  if (countOnes32(word) % 2 != 1) {
    Serial.println("ERR_PARITY");
    return;
  }

  const InstrumentConfig* instrument = findInstrument(word);
  if (instrument == nullptr) {
    Serial.println("ERR_LABEL");
    return;
  }

  float value = decodeValue(word, instrument->scale);
  showLCD(instrument->name, value);
  updateDigitalOutputs(word);

  // Desactivado hasta confirmar integración y alimentación del servomotor.
  // updateServo(value, instrument->scale);

  Serial.print("OK ");
  Serial.print(instrument->name);
  Serial.print(" ");
  Serial.println(value, 2);
}

void setup() {
  Serial.begin(SERIAL_BAUD_RATE);

  pinMode(DIGITAL_OUTPUT_13, OUTPUT);
  pinMode(DIGITAL_OUTPUT_12, OUTPUT);
  digitalWrite(DIGITAL_OUTPUT_13, LOW);
  digitalWrite(DIGITAL_OUTPUT_12, LOW);

#ifdef LCD_ENABLE
  lcd.begin(16, 2);
  lcd.print("ARINC429 READY");
#endif

  serialBuffer.reserve(16);
  Serial.println("ARINC429 UNO READY");
}

void loop() {
  while (Serial.available() > 0) {
    char c = Serial.read();
    if (c == '\n' || c == '\r') {
      serialBuffer.trim();
      if (serialBuffer.length() > 0) processWord(serialBuffer);
      serialBuffer = "";
    } else {
      serialBuffer += c;
      if (serialBuffer.length() > 16) {
        serialBuffer = "";
        Serial.println("ERR_FORMAT");
      }
    }
  }
}
