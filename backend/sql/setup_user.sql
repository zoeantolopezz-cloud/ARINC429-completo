-- Ejecutar como administrador: sudo mysql < backend/sql/setup_user.sql
CREATE DATABASE IF NOT EXISTS arinc429
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'arinc_app'@'localhost'
  IDENTIFIED BY 'arinc_password';

ALTER USER 'arinc_app'@'localhost'
  IDENTIFIED BY 'arinc_password';

GRANT ALL PRIVILEGES ON arinc429.* TO 'arinc_app'@'localhost';
FLUSH PRIVILEGES;

USE arinc429;

CREATE TABLE IF NOT EXISTS envios (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  instrumento VARCHAR(64) NOT NULL,
  valor DECIMAL(12,4) NOT NULL,
  palabra_arinc CHAR(8) NOT NULL,
  enviado_serial BOOLEAN NOT NULL DEFAULT FALSE,
  creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  actualizado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  INDEX idx_instrumento (instrumento)
);
