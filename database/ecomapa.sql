-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema ecomapa
-- -----------------------------------------------------
DROP SCHEMA IF EXISTS `ecomapa` ;

-- -----------------------------------------------------
-- Schema ecomapa
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `ecomapa` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci ;
USE `ecomapa` ;

-- -----------------------------------------------------
-- Table `ecomapa`.`operador`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ecomapa`.`operador` ;

CREATE TABLE IF NOT EXISTS `ecomapa`.`operador` (
  `id_operador` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(100) CHARACTER SET 'armscii8' NOT NULL,
  `natureza` VARCHAR(50) NOT NULL,
  `canal_oficial` VARCHAR(255) NULL,
  `contato` VARCHAR(100) NULL,
  PRIMARY KEY (`id_operador`))
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ecomapa`.`ponto_apoio`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ecomapa`.`ponto_apoio` ;

CREATE TABLE IF NOT EXISTS `ecomapa`.`ponto_apoio` (
  `id_ponto` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(150) NOT NULL,
  `endereco` VARCHAR(255) NOT NULL,
  `latitude` DECIMAL(10,8) NOT NULL,
  `longitude` DECIMAL(11,8) NOT NULL,
  `tipo` VARCHAR(50) NOT NULL,
  `capacidade_vagas` INT NULL,
  `gratuito` TINYINT(1) NULL,
  `coberto` TINYINT(1) NULL,
  `status_operacional` VARCHAR(50) CHARACTER SET 'armscii8' NOT NULL,
  `data_ultima_verificacao` DATE NOT NULL,
  `id_operador` INT NOT NULL,
  PRIMARY KEY (`id_ponto`),
  INDEX `fk_ponto_apoio_operador_idx` (`id_operador` ASC) VISIBLE,
  CONSTRAINT `fk_ponto_apoio_operador`
    FOREIGN KEY (`id_operador`)
    REFERENCES `ecomapa`.`operador` (`id_operador`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ecomapa`.`seguranca`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ecomapa`.`seguranca` ;

CREATE TABLE IF NOT EXISTS `ecomapa`.`seguranca` (
  `id_seguranca` INT NOT NULL AUTO_INCREMENT,
  `vigilancia_humana` TINYINT(1) NOT NULL,
  `cameras` TINYINT(1) NOT NULL,
  `seguro_contra_furto` TINYINT(1) NOT NULL,
  `nivel_avaliado` INT NULL COMMENT '\n',
  `id_ponto` INT NOT NULL,
  PRIMARY KEY (`id_seguranca`),
  INDEX `fk_seguranca_ponto_apoio1_idx` (`id_ponto` ASC) VISIBLE,
  CONSTRAINT `fk_seguranca_ponto_apoio1`
    FOREIGN KEY (`id_ponto`)
    REFERENCES `ecomapa`.`ponto_apoio` (`id_ponto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ecomapa`.`horario`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ecomapa`.`horario` ;

CREATE TABLE IF NOT EXISTS `ecomapa`.`horario` (
  `id_horario` INT NOT NULL AUTO_INCREMENT,
  `dia_semana` VARCHAR(50) NOT NULL,
  `abertura` TIME NULL,
  `fechamento` TIME NULL,
  `observacao` VARCHAR(255) NULL,
  `id_ponto` INT NOT NULL,
  PRIMARY KEY (`id_horario`),
  INDEX `fk_horario_ponto_apoio1_idx` (`id_ponto` ASC) VISIBLE,
  CONSTRAINT `fk_horario_ponto_apoio1`
    FOREIGN KEY (`id_ponto`)
    REFERENCES `ecomapa`.`ponto_apoio` (`id_ponto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ecomapa`.`regra_acesso`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ecomapa`.`regra_acesso` ;

CREATE TABLE IF NOT EXISTS `ecomapa`.`regra_acesso` (
  `id_regra` INT NOT NULL AUTO_INCREMENT,
  `tipo_acesso` VARCHAR(100) NOT NULL,
  `permanencia_maxima` VARCHAR(100) NULL,
  `taxas` VARCHAR(100) NULL,
  `documentos_exigidos` VARCHAR(255) NULL,
  `restricoes` VARCHAR(255) NULL,
  `id_ponto` INT NOT NULL,
  PRIMARY KEY (`id_regra`),
  INDEX `fk_regra_acesso_ponto_apoio1_idx` (`id_ponto` ASC) VISIBLE,
  CONSTRAINT `fk_regra_acesso_ponto_apoio1`
    FOREIGN KEY (`id_ponto`)
    REFERENCES `ecomapa`.`ponto_apoio` (`id_ponto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ecomapa`.`servico`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ecomapa`.`servico` ;

CREATE TABLE IF NOT EXISTS `ecomapa`.`servico` (
  `id_servico` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(100) NOT NULL,
  `descricao` VARCHAR(255) NULL,
  `id_ponto` INT NOT NULL,
  PRIMARY KEY (`id_servico`),
  INDEX `fk_servico_ponto_apoio1_idx` (`id_ponto` ASC) VISIBLE,
  CONSTRAINT `fk_servico_ponto_apoio1`
    FOREIGN KEY (`id_ponto`)
    REFERENCES `ecomapa`.`ponto_apoio` (`id_ponto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


-- -----------------------------------------------------
-- Table `ecomapa`.`ocorrencia`
-- -----------------------------------------------------
DROP TABLE IF EXISTS `ecomapa`.`ocorrencia` ;

CREATE TABLE IF NOT EXISTS `ecomapa`.`ocorrencia` (
  `id_ocorrencia` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(50) NOT NULL,
  `descricao` TEXT NOT NULL COMMENT '\n',
  `data_relato` DATETIME NOT NULL,
  `status_validacao` VARCHAR(50) NULL,
  `id_ponto` INT NOT NULL,
  PRIMARY KEY (`id_ocorrencia`),
  INDEX `fk_ocorrencia_ponto_apoio1_idx` (`id_ponto` ASC) VISIBLE,
  CONSTRAINT `fk_ocorrencia_ponto_apoio1`
    FOREIGN KEY (`id_ponto`)
    REFERENCES `ecomapa`.`ponto_apoio` (`id_ponto`)
    ON DELETE NO ACTION
    ON UPDATE NO ACTION)
ENGINE = InnoDB;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
