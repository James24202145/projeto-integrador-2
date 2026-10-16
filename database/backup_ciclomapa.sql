-- MySQL dump 10.13  Distrib 8.0.36, for Linux (x86_64)
--
-- Host: localhost    Database: cicloponto
-- ------------------------------------------------------
-- Server version	8.4.11-0ubuntu0.26.04.1

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `horario`
--

DROP TABLE IF EXISTS `horario`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `horario` (
  `id_horario` int NOT NULL AUTO_INCREMENT,
  `dia_semana` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `abertura` time DEFAULT NULL,
  `fechamento` time DEFAULT NULL,
  `observacao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_ponto` int NOT NULL,
  PRIMARY KEY (`id_horario`),
  KEY `fk_horario_ponto_apoio1_idx` (`id_ponto`),
  CONSTRAINT `fk_horario_ponto_apoio1` FOREIGN KEY (`id_ponto`) REFERENCES `ponto_apoio` (`id_ponto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `horario`
--

LOCK TABLES `horario` WRITE;
/*!40000 ALTER TABLE `horario` DISABLE KEYS */;
/*!40000 ALTER TABLE `horario` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ocorrencia`
--

DROP TABLE IF EXISTS `ocorrencia`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ocorrencia` (
  `id_ocorrencia` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` text COLLATE utf8mb4_unicode_ci NOT NULL COMMENT '\n',
  `data_relato` datetime NOT NULL,
  `status_validacao` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_ponto` int NOT NULL,
  PRIMARY KEY (`id_ocorrencia`),
  KEY `fk_ocorrencia_ponto_apoio1_idx` (`id_ponto`),
  CONSTRAINT `fk_ocorrencia_ponto_apoio1` FOREIGN KEY (`id_ponto`) REFERENCES `ponto_apoio` (`id_ponto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ocorrencia`
--

LOCK TABLES `ocorrencia` WRITE;
/*!40000 ALTER TABLE `ocorrencia` DISABLE KEYS */;
/*!40000 ALTER TABLE `ocorrencia` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `operador`
--

DROP TABLE IF EXISTS `operador`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `operador` (
  `id_operador` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci NOT NULL,
  `natureza` varchar(50) NOT NULL,
  `canal_oficial` varchar(255) DEFAULT NULL,
  `contato` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id_operador`)
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `operador`
--

LOCK TABLES `operador` WRITE;
/*!40000 ALTER TABLE `operador` DISABLE KEYS */;
INSERT INTO `operador` VALUES (1,'Metrô - Monotri','Público / Concessionária',NULL,NULL),(2,'Emtu','Público / Concessionária',NULL,NULL),(3,'Tembici','Público / Concessionária',NULL,NULL),(4,'Metro','Público / Concessionária',NULL,NULL),(5,'Sptrans','Público / Concessionária',NULL,NULL),(6,'Via Quatro','Público / Concessionária',NULL,NULL),(7,'Cptm','Público / Concessionária',NULL,NULL),(8,'Via Mobilidade','Público / Concessionária',NULL,NULL);
/*!40000 ALTER TABLE `operador` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `ponto_apoio`
--

DROP TABLE IF EXISTS `ponto_apoio`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `ponto_apoio` (
  `id_ponto` int NOT NULL AUTO_INCREMENT,
  `nome` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `endereco` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `latitude` decimal(10,8) NOT NULL,
  `longitude` decimal(11,8) NOT NULL,
  `tipo` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `capacidade_vagas` int DEFAULT NULL,
  `gratuito` tinyint(1) DEFAULT NULL,
  `coberto` tinyint(1) DEFAULT NULL,
  `status_operacional` varchar(50) CHARACTER SET armscii8 COLLATE armscii8_general_ci NOT NULL,
  `data_ultima_verificacao` date NOT NULL,
  `id_operador` int NOT NULL,
  PRIMARY KEY (`id_ponto`),
  KEY `fk_ponto_apoio_operador_idx` (`id_operador`),
  CONSTRAINT `fk_ponto_apoio_operador` FOREIGN KEY (`id_operador`) REFERENCES `operador` (`id_operador`)
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `ponto_apoio`
--

LOCK TABLES `ponto_apoio` WRITE;
/*!40000 ALTER TABLE `ponto_apoio` DISABLE KEYS */;
INSERT INTO `ponto_apoio` VALUES (1,'ESTACAO CIDADE UNIVERSITÁRIA','Ciclovia do Rio Pinheiros, Vila Madalena, Alto de Pinheiros, São Paulo, Região Sudeste, 05425-904, Brasil',-23.55786100,-46.71162500,'Bicicletário',60,1,1,'Ativo','2026-10-15',8),(2,'TERMINAL PINHEIROS','Rua Gilberto Sabino, Vila Madalena, Pinheiros, São Paulo, Região Sudeste, 05425-020, Brasil',-23.56624900,-46.70145800,'Paraciclo',2,1,0,'Ativo','2026-10-15',5),(3,'ESTACAO JARDIM COLONIAL','1535, Avenida Ragueb Chohfi, Parque Industrial São Lourenço, São Mateus, São Paulo, Região Sudeste, 03965-005, Brasil',-23.59874700,-46.46890600,'Paraciclo',64,1,0,'Ativo','2026-10-15',1),(4,'ESTACAO BELEM','Belém, Avenida Alcântara Machado, Belém, São Paulo, Região Sudeste, 03302-010, Brasil',-23.54307900,-46.58972800,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(5,'ESTAÇÃO JABAQUARA','Jabaquara - Comitê Paralímpico Brasileiro, 2022, Avenida Engenheiro Armando de Arruda Pereira, Cidade Vargas, Jabaquara, São Paulo, Região Sudeste, 04308-001, Brasil',-23.64615000,-46.64079600,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(6,'ESTACAO PEDRO II','Corredor Expresso Tiradentes, Glicério, Sé, São Paulo, Região Sudeste, 03003-000, Brasil',-23.55064000,-46.62689000,'Bicicletário',90,1,1,'Ativo','2026-10-15',5),(7,'ESTACAO ALBERTO LYON','Passarela Elio Esteves, Cambuci, São Paulo, Região Sudeste, 01516-100, Brasil',-23.56410700,-46.61126600,'Bicicletário',30,1,1,'Ativo','2026-10-15',5),(8,'TERMINAL GRAJAU','Rua Giovanni Bononcini, Vila Cantinho do Céu, Parque Brasil, Grajaú, São Paulo, Região Sudeste, 04843-040, Brasil',-23.73593500,-46.69619700,'Paraciclo',4,1,0,'Ativo','2026-10-15',5),(9,'ESTACAO VILA AURORA','Vila Aurora, 26, Rua Aracy Rondon Amarante, Parque Nações Unidas, Jaraguá, São Paulo, Região Sudeste, 05186-110, Brasil',-23.43864300,-46.74744600,'Bicicletário',144,1,1,'Ativo','2026-10-15',7),(10,'ESTACAO FRADIQUE COUTINHO','Edifício Win Work, 30, Rua Fradique Coutinho, Pinheiros, São Paulo, Região Sudeste, 05416-000, Brasil',-23.56594500,-46.68417900,'Bicicletário',86,1,1,'Ativo','2026-10-15',6),(11,'TERM HID PQ MAR PAULISTA','Rua do Mar Paulista, Jardim Apurá, Pedreira, São Paulo, Região Sudeste, 04462-040, Brasil',-23.69737000,-46.66713600,'Bicicletário',51,1,1,'Ativo','2026-10-15',5),(12,'ESTACAO MATILDE','Rua Alvinópolis, Vila Esperança, Penha, São Paulo, Região Sudeste, 03501-000, Brasil',-23.53176200,-46.53059200,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(13,'TERMINAL JOAO DIAS','Terminal João Dias, Avenida João Dias, Jardim São Luís, São Paulo, Região Sudeste, 05801-060, Brasil',-23.64382100,-46.73374300,'Paraciclo',4,1,0,'Ativo','2026-10-15',5),(14,'TERMINAL JARDIM ANGELA','Terminal Jardim Ângela, Estrada do M\'Boi Mirim, Morro do Índio, Jardim Ângela, São Paulo, Região Sudeste, 04948-970, Brasil',-23.69059600,-46.77395100,'Bicicletário',58,1,1,'Ativo','2026-10-15',5),(15,'ESTACAO SAO PAULO - MORUMBI','2594, Avenida Professor Francisco Morato, Vila Sônia, São Paulo, Região Sudeste, 05512-300, Brasil',-23.58627200,-46.72386400,'Bicicletário',80,1,1,'Ativo','2026-10-15',6),(16,'ESTACAO VILA TOLSTOI','Avenida Professor Luiz Ignácio Anhaia Mello, Vila Tolstói, Sapopemba, São Paulo, Região Sudeste, 03221-200, Brasil',-23.60081500,-46.52714500,'Paraciclo',64,1,0,'Ativo','2026-10-15',1),(17,'ESTACAO JURUBATUBA','Ciclovia do Rio Pinheiros, Campo Grande, Jardim Santo Amaro, Santo Amaro, São Paulo, Região Sudeste, 04766-001, Brasil',-23.67783200,-46.70206600,'Bicicletário',262,1,1,'Ativo','2026-10-15',8),(18,'ESTACAO SANTA CRUZ','Shopping Metrô Santa Cruz, 2564, Terminal Metrô Santa Cruz, Vila Mariana, São Paulo, Região Sudeste, 04038-040, Brasil',-23.59879400,-46.63682200,'Bicicletário',80,1,1,'Ativo','2026-10-15',8),(19,'ESTACAO CAPAO REDONDO','Capão Redondo, Avenida Carlos Caldeira Filho, Jardim Germânia, Capão Redondo, São Paulo, Região Sudeste, 05849-440, Brasil',-23.65957700,-46.76825700,'Paraciclo',16,1,0,'Ativo','2026-10-15',8),(20,'ESTACAO PRIMAVERA- INTERLAGOS','Bicicletário Estação Primavera - Interlagos, Rua Alexandre Jandini, Parque Colonial, Cidade Dutra, São Paulo, Região Sudeste, 04823-280, Brasil',-23.72220900,-46.69188900,'Bicicletário',226,1,1,'Ativo','2026-10-15',8),(21,'ESTACAO ITAIM PAULISTA','Itaim Paulista, Rua Cordão de São Francisco, Vila Itaim, Jardim Helena, São Paulo, Região Sudeste, 08115-100, Brasil',-23.49388400,-46.40227200,'Bicicletário',256,1,1,'Ativo','2026-10-15',7),(22,'TERMINAL SANTO AMARO','Banco24Horas, Avenida Padre José Maria, Jardim Santo Amaro, Santo Amaro, São Paulo, Região Sudeste, 04753-060, Brasil',-23.65419100,-46.71180100,'Bicicletário',52,1,1,'Ativo','2026-10-15',5),(23,'TERMINAL CIDADE TIRADENTES','Terminal Cidade Tiradentes, Avenida Naylor de Oliveira, Chácara Santa Etelvina, Cidade Tiradentes, São Paulo, Região Sudeste, 08490-550, Brasil',-23.58304900,-46.40797800,'Bicicletário',148,1,1,'Ativo','2026-10-15',5),(24,'ESTACAO SAO MATEUS','São Mateus, Avenida Sapopemba, Jardim Três Marias, São Mateus, São Paulo, Região Sudeste, 03963-100, Brasil',-23.61221200,-46.47728000,'Paraciclo',64,1,0,'Ativo','2026-10-15',1),(25,'ESTACAO R DO GRITO','1180, Rua das Juntas Provisórias, Vila Independência, Ipiranga, São Paulo, Região Sudeste, 04214-010, Brasil',-23.59808900,-46.59742800,'Bicicletário',82,1,1,'Ativo','2026-10-15',5),(26,'ESTACAO TUCURUVI','Tucuruvi, 100, Avenida Doutor Antônio Maria Laet, Tucuruvi, São Paulo, Região Sudeste, 02240-000, Brasil',-23.48013500,-46.60346600,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(27,'ESTACAO AUTODROMO','Rua Plínio Schmidt, Cidade Dutra, São Paulo, Região Sudeste, 04816-040, Brasil',-23.70613800,-46.68859400,'Bicicletário',261,1,1,'Ativo','2026-10-15',8),(28,'ESTAÇÃO BUTANTÃ','Avenida Vital Brasil, Caxingui, Butantã, São Paulo, Região Sudeste, 05503-001, Brasil',-23.57171700,-46.70841700,'Bicicletário',149,1,1,'Ativo','2026-10-15',6),(29,'TERMINAL GUARAPIRANGA','Terminal Guarapiranga, Calçada Partilhada Avenida Luis Gushiken, Jardim São Luís, São Paulo, Região Sudeste, 05819-080, Brasil',-23.66906000,-46.73557300,'Bicicletário',62,1,1,'Ativo','2026-10-15',5),(30,'ESTACAO ENGENHERO GOULART (norte)','Ciclovia Parque Ecológico do Tietê, Vila Piratininga, jardim piratininga, Cangaíba, São Paulo, Região Sudeste, 03725-040, Brasil',-23.49783200,-46.52062500,'Bicicletário',200,1,1,'Ativo','2026-10-15',7),(31,'ESTACAO BROOKLIN','Jardim Petrópolis, Santo Amaro, São Paulo, Região Sudeste, 04707-020, Brasil',-23.62648300,-46.68800400,'Bicicletário',30,1,1,'Ativo','2026-10-15',8),(32,'ESTACAO CLUBE ATLETICO IPIRANGA','Avenida do Estado, Vila Monumento, Ipiranga, São Paulo, Região Sudeste, 04201-030, Brasil',-23.57449800,-46.60328600,'Bicicletário',42,1,1,'Ativo','2026-10-15',5),(33,'ESTACAO PARAISO','1491, Rua Vergueiro, Paraíso, Vila Mariana, São Paulo, Região Sudeste, 04103-000, Brasil',-23.57522500,-46.64040200,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(34,'ESTACAO JARDIM ROMANO','Estação Jardim Romano, Rua Rio do Sono, Vila Aymoré, Jardim das Oliveiras, São Paulo, Região Sudeste, 08191-260, Brasil',-23.48480600,-46.38523200,'Bicicletário',240,1,1,'Ativo','2026-10-15',7),(35,'TERMINAL CAMPO LIMPO','Terminal Campo Limpo, 46, Rua Campina Grande, Campo Limpo, São Paulo, Região Sudeste, 05788-250, Brasil',-23.63169200,-46.77197600,'Paraciclo',2,1,0,'Ativo','2026-10-15',5),(36,'TERMINAL SANTO AMARO','Banco24Horas, Avenida Padre José Maria, Jardim Santo Amaro, Santo Amaro, São Paulo, Região Sudeste, 04753-060, Brasil',-23.65427800,-46.71155400,'Paraciclo',8,1,0,'Ativo','2026-10-15',5),(37,'TERMINAL AE CARVALHO','Terminal A.E. Carvalho, Avenida Águia de Haia, Parque Guarani, Itaquera, São Paulo, Região Sudeste, 03890-100, Brasil',-23.51728400,-46.47592300,'Bicicletário',42,1,1,'Ativo','2026-10-15',5),(38,'TERMINAL VILA CARRAO','Terminal Vila Carrao, Avenida 19 de Janeiro, Vila Fernandes, Carrão, São Paulo, Região Sudeste, 03451-040, Brasil',-23.55843600,-46.52270000,'Bicicletário',38,1,1,'Ativo','2026-10-15',5),(39,'TERMINAL SAO MIGUEL','Terminal São Miguel, Rua Tarde de Maio, Jardim Ipê, Vila Curuçá, São Paulo, Região Sudeste, 08080-363, Brasil',-23.49166200,-46.43478000,'Bicicletário',64,1,1,'Ativo','2026-10-15',5),(40,'TERMINAL JARDIM BRITANIA','Rua Domênico Aspari, Jardim Santa Fé, Anhanguera, São Paulo, Região Sudeste, 05271-000, Brasil',-23.43156500,-46.78723000,'Bicicletário',12,1,1,'Ativo','2026-10-15',5),(41,'ESTACAO PARADA INGLESA','Parada Inglesa, Avenida Luiz Dumont Villares, Parada Inglesa, Tucuruvi, São Paulo, Região Sudeste, 02242-005, Brasil',-23.48714600,-46.60891300,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(42,'ESTACAO VILA OLÍMPIA','Ciclovia do Rio Pinheiros, Vila Olímpia, Itaim Bibi, São Paulo, Região Sudeste, 04551-060, Brasil',-23.59279300,-46.69282100,'Bicicletário',94,1,1,'Ativo','2026-10-15',8),(43,'ESTACAO JD SAO PAULO - AYRTON SENNA','286, Parque Domingos Luís, Jardim São Paulo, Santana, São Paulo, Região Sudeste, 02043-080, Brasil',-23.49254300,-46.61676000,'Paraciclo',16,1,0,'Ativo','2026-10-15',4),(44,'ESTACAO PALMEIRAS - BARRA FUNDA','Avenida Mário de Andrade, Barra Funda, São Paulo, Região Sudeste, 01156-001, Brasil',-23.52563400,-46.66718300,'Paraciclo',4,1,0,'Ativo','2026-10-15',4),(45,'ESTACAO HOSPITAL SÃO PAULO','Estação Hospital São Paulo, Rua Pedro de Toledo, Vila Clementino, Vila Mariana, São Paulo, Região Sudeste, 04025-012, Brasil',-23.59827000,-46.64560900,'Bicicletário',30,1,1,'Ativo','2026-10-15',8),(46,'TERMINAL GUARAPIRANGA','Estrada do M\'Boi Mirim, Jardim São Luís, São Paulo, Região Sudeste, 04904-050, Brasil',-23.66916100,-46.73542600,'Paraciclo',4,1,0,'Ativo','2026-10-15',8),(47,'ESTACAO JARDIM HELENA- VILA MARA','Rua São Gonçalo do Rio das Pedras, Vila Grão Mogol, Jardim Helena, São Paulo, Região Sudeste, 08081-000, Brasil',-23.49230300,-46.42082000,'Bicicletário',256,1,1,'Ativo','2026-10-15',7),(48,'ESTACAO ORATORIO','Avenida Professor Luiz Ignácio Anhaia Mello, São Lucas, São Paulo, Região Sudeste, 03294-100, Brasil',-23.58222700,-46.56167400,'Paraciclo',40,1,0,'Ativo','2026-10-15',1),(49,'ESTACAO SAPOPEMBA','Sapopemba, 11260, Avenida Sapopemba, Conjunto Habitacional Teotônio Vilela, Sapopemba, São Paulo, Região Sudeste, 03976-190, Brasil',-23.61462800,-46.50094000,'Paraciclo',64,1,0,'Ativo','2026-10-15',1),(50,'TERMINAL BANDEIRA','6475-10 Jardim Vaz de Lima, Passarela dos Piques, República, São Paulo, Região Sudeste, 01050-020, Brasil',-23.54942100,-46.63969700,'Paraciclo',4,1,0,'Ativo','2026-10-15',5),(51,'ESTACAO TAMANDUATEI','Tamanduateí, Avenida Presidente Wilson, Vila Independência, Ipiranga, São Paulo, Região Sudeste, 04222-001, Brasil',-23.59245700,-46.58991700,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(52,'ESTACAO CAMPO LIMPO','Avenida Carlos Caldeira Filho, Jardim Germânia, Capão Redondo, São Paulo, Região Sudeste, 05763-470, Brasil',-23.64945900,-46.75882300,'Paraciclo',16,1,0,'Ativo','2026-10-15',8),(53,'ESTACAO CAMPO BELO','Viaduto Engenheiro Antonio Moliterno, Brooklin Novo, Itaim Bibi, São Paulo, Região Sudeste, 04619-000, Brasil',-23.61839900,-46.68199300,'Bicicletário',114,1,1,'Ativo','2026-10-15',8),(54,'ESTACAO GRAJAU','Rua Giovanni Bononcini, Vila Cantinho do Céu, Parque Brasil, Grajaú, São Paulo, Região Sudeste, 04843-040, Brasil',-23.73640700,-46.69669600,'Bicicletário',178,1,1,'Ativo','2026-10-15',8),(55,'TERMINAL VILA NOVA CACHOEIRINHA','Avenida Inajar de Souza, Vila Amélia, Cachoeirinha, São Paulo, Região Sudeste, 02739-000, Brasil',-23.47475200,-46.66993900,'Bicicletário',24,1,1,'Ativo','2026-10-15',5),(56,'ESTACAO SE','Bicicletário Estação Sé, Praça da Sé, Glicério, Sé, São Paulo, Região Sudeste, 01001-010, Brasil',-23.55095000,-46.63372400,'Paraciclo',20,1,0,'Ativo','2026-10-15',4),(57,'TERMINAL VARGINHA','6913-21, Rua Ruben Dário, Jardim Iporã, Parelheiros, São Paulo, Região Sudeste, 04864-001, Brasil',-23.76710100,-46.71664100,'Bicicletário',50,1,1,'Ativo','2026-10-15',5),(58,'TERMINAL PARELHEIROS','300, Estrada da Colônia, Jardim Novo Parelheiros, Parelheiros, Vila Roschel, São Paulo, Região Sudeste, 04890-410, Brasil',-23.82818200,-46.72711500,'Paraciclo',4,1,0,'Ativo','2026-10-15',5),(59,'TERMINAL VARGINHA','Terminal Varginha, Avenida Paulo Guilguer Reimberg, Jardim Iporã, Parelheiros, São Paulo, Região Sudeste, 04858-570, Brasil',-23.76716200,-46.71677000,'Paraciclo',4,1,0,'Ativo','2026-10-15',5),(60,'ESTACAO VILA PRUDENTE','Rua Correia Barros, Vila Prudente, São Paulo, Região Sudeste, 03133-000, Brasil',-23.58517500,-46.58313600,'Paraciclo',64,1,0,'Ativo','2026-10-15',1),(61,'ESTACAO CORINTHIANS - ITAQUERA','Cidade Antônio Estêvão de Carvalho, Itaquera, São Paulo, Região Sudeste, 08295-005, Brasil',-23.54270100,-46.47071100,'Paraciclo',56,1,0,'Ativo','2026-10-15',4),(62,'ESTACAO FAZENDA DA JUTA','Avenida Sapopemba, Mata da Juta, Sapopemba, São Paulo, Região Sudeste, 03977-414, Brasil',-23.61171400,-46.48750100,'Paraciclo',64,1,0,'Ativo','2026-10-15',1),(63,'ESTACAO PENHA','Penha - Lojas Besni, Ciclovia Radial Leste (Caminho Verde), Cidade Patriarca, Vila Matilde, São Paulo, Região Sudeste, 03656-120, Brasil',-23.53326100,-46.54264300,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(64,'ESTACAO CEASA','Ceasa, Marginal Pinheiros (Expressa), Bela Aliança, Vila Leopoldina, São Paulo, Região Sudeste, 05310-000, Brasil',-23.53720200,-46.74263500,'Bicicletário',144,1,1,'Ativo','2026-10-15',8),(65,'TERMINAL SACOMA','Rua Francisco Peres, Ipiranga, São Paulo, Região Sudeste, 04279-080, Brasil',-23.60346200,-46.60337600,'Bicicletário',146,1,1,'Ativo','2026-10-15',5),(66,'ESTACAO JAPAO - LIBERDADE','Praça da Liberdade, Avenida da Liberdade, Glicério, Sé, São Paulo, Região Sudeste, 01503-000, Brasil',-23.55504200,-46.63554400,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(67,'ESTACAO SAO MIGUEL PAULISTA','São Miguel Paulista, 136, Rua Beraldo Marcondes, São Miguel, São Paulo, Região Sudeste, 08010-100, Brasil',-23.49031300,-46.44345400,'Bicicletário',208,1,1,'Ativo','2026-10-15',7),(68,'TERMINAL GRAJAU','Terminal Grajaú, Rua Nicolau Paganini, Vila Cantinho do Céu, Parque Brasil, Grajaú, São Paulo, Região Sudeste, 04843-040, Brasil',-23.73581400,-46.69629600,'Bicicletário',54,1,1,'Ativo','2026-10-15',5),(69,'TERMINAL PRINCESA ISABEL','Alameda Glete, Campos Elísios, Santa Cecília, São Paulo, Região Sudeste, 01215-000, Brasil',-23.53418300,-46.64464600,'Bicicletário',66,1,1,'Ativo','2026-10-15',5),(70,'ESTACAO CAPAO VILA DAS BELEZAS','Vila das Belezas, Rua Inácio Preto de Morais, Vila Andrade, São Paulo, Região Sudeste, 05776-340, Brasil',-23.64022600,-46.74576000,'Paraciclo',16,1,0,'Ativo','2026-10-15',8),(71,'ESTACAO ARTUR ALVIM','Ciclovia Radial Leste (Caminho Verde), Cidade Patriarca, Artur Alvim, São Paulo, Região Sudeste, 03656-120, Brasil',-23.54060300,-46.48414700,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(72,'TERMINAL VILA PRUDENTE','Terminal Vila Prudente - Norte, Rua Trocari, Vila Prudente, São Paulo, Região Sudeste, 03133-000, Brasil',-23.58395100,-46.58483200,'Bicicletário',62,1,1,'Ativo','2026-10-15',5),(73,'ESTACAO NSRA APARECIDA','508, Rua das Juntas Provisórias, Vila Independência, Ipiranga, São Paulo, Região Sudeste, 04214-010, Brasil',-23.59130700,-46.59805200,'Bicicletário',46,1,1,'Ativo','2026-10-15',5),(74,'ESTACAO CARRAO','Ciclovia Radial Leste (Caminho Verde), Vila Azevedo, Tatuapé, São Paulo, Região Sudeste, 03314-030, Brasil',-23.53788000,-46.56496700,'Paraciclo',40,1,0,'Ativo','2026-10-15',4),(75,'TERMINAL JARDIM ANGELA','Terminal Jardim Ângela, Estrada do M\'Boi Mirim, Morro do Índio, Jardim Ângela, São Paulo, Região Sudeste, 04948-970, Brasil',-23.69064200,-46.77409600,'Paraciclo',4,1,0,'Ativo','2026-10-15',5),(76,'TERMINAL JOAO DIAS','Terminal João Dias, Avenida João Dias, Jardim São Luís, São Paulo, Região Sudeste, 05801-060, Brasil',-23.64369900,-46.73393000,'Bicicletário',68,1,1,'Ativo','2026-10-15',5),(77,'TERMINAL PARELHEIROS','300, Estrada da Colônia, Jardim Novo Parelheiros, Parelheiros, Vila Roschel, São Paulo, Região Sudeste, 04890-410, Brasil',-23.82828100,-46.72704900,'Bicicletário',26,1,1,'Ativo','2026-10-15',5),(78,'ESTACAO ANA NERY','Avenida do Estado, Cambuci, São Paulo, Região Sudeste, 01516-000, Brasil',-23.55887200,-46.61483900,'Bicicletário',90,1,1,'Ativo','2026-10-15',5),(79,'TERMINAL CAPELINHA','Terminal Capelinha, Condominio Buena Vista, Jardim Germânia, Capão Redondo, São Paulo, Região Sudeste, 05848-000, Brasil',-23.65456900,-46.76174500,'Bicicletário',102,1,1,'Ativo','2026-10-15',5),(80,'ESTACAO CAMILO HADDAD','Ciclovia Monotrilho Linha Prata, São Lucas, Vila Prudente, São Paulo, Região Sudeste, 03294-000, Brasil',-23.59551000,-46.53757300,'Paraciclo',64,1,0,'Ativo','2026-10-15',1),(81,'TERMINAL SAPOPEMBA/ TEOTONIO','Avenida Sapopemba, 11180, Avenida Sapopemba, Conjunto Habitacional Teotônio Vilela, Sapopemba, São Paulo, Região Sudeste, 03976-190, Brasil',-23.61427800,-46.50126900,'Bicicletário',42,1,1,'Ativo','2026-10-15',5),(82,'TERMINAL CASA VERDE','Terminal Casa Verde, Avenida Engenheiro Caetano Alvares, Casa Verde Alta, Casa Verde, São Paulo, Região Sudeste, 02552-065, Brasil',-23.49610900,-46.66245700,'Bicicletário',7,1,1,'Ativo','2026-10-15',5),(83,'ESTACAO TAMANDUATEI','Tamanduateí, Avenida Presidente Wilson, Vila Independência, Ipiranga, São Paulo, Região Sudeste, 04222-001, Brasil',-23.59305100,-46.58960000,'Bicicletário',164,1,1,'Ativo','2026-10-15',7),(84,'ESTACAO GUILHERMINA ESPERANÇA','Rua Almeria, Vila Granada, Penha, São Paulo, Região Sudeste, 03542-000, Brasil',-23.52897300,-46.51638700,'Paraciclo',155,1,0,'Ativo','2026-10-15',4),(85,'ESTAÇÃO DE TRANSFERENCIA ITAQUERA','Avenida José Pinheiro Borges, Vila Carmosina, Itaquera, São Paulo, Região Sudeste, 08210-450, Brasil',-23.53480300,-46.45344300,'Bicicletário',20,1,1,'Ativo','2026-10-15',5),(86,'ESTACAO ENGENHERO GOULART (sul)','Bicicletário Estação Engenheiro Goulart (Sul), Praça Gajé, Engenheiro Goulart, Cangaíba, São Paulo, Região Sudeste, 03725-040, Brasil',-23.49883200,-46.52025500,'Bicicletário',74,1,1,'Ativo','2026-10-15',7),(87,'ESTACAO SANTA CRUZ','Metrô Farma, 2564, Rua Domingos de Morais, Vila Mariana, São Paulo, Região Sudeste, 04038-040, Brasil',-23.59862100,-46.63680400,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(88,'ESTACAO ALTO DA BOA VISTA','Avenida Santo Amaro, Santo Amaro, São Paulo, Região Sudeste, 04701-200, Brasil',-23.64136600,-46.69903200,'Bicicletário',100,1,1,'Ativo','2026-10-15',8),(89,'TERMINAL PIRITUBA','Terminal Pirituba, Viaduto Raimundo Pereira de Magalhães, Piqueri, Pirituba, São Paulo, Região Sudeste, 02945-040, Brasil',-23.48658600,-46.72629700,'Paraciclo',2,1,0,'Ativo','2026-10-15',5),(90,'TERMINAL AMARAL GURGEL','Terminal Amaral Gurgel, Rua Frederico Abranches, Campos Elísios, Santa Cecília, São Paulo, Região Sudeste, 01225-070, Brasil',-23.54056400,-46.64749800,'Bicicletário',41,1,1,'Ativo','2026-10-15',5),(91,'ESTACAO EUCALIPTOS','Eucaliptos, 3144, Indianópolis, Moema, São Paulo, Região Sudeste, 04028-003, Brasil',-23.60972700,-46.66820400,'Bicicletário',92,1,1,'Ativo','2026-10-15',8),(92,'ESTACAO SANTA CECÍLIA','Campos Elísios, Santa Cecília, São Paulo, Região Sudeste, 01225-010, Brasil',-23.53911800,-46.64949100,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(93,'TERMINAL PARQUE DOM PEDRO II','2175-10 Ponto Final, Parque Dom Pedro II, Glicério, Sé, São Paulo, Região Sudeste, 01021-000, Brasil',-23.54715900,-46.63022700,'Bicicletário',156,1,1,'Ativo','2026-10-15',5),(94,'ESTACAO BORBA GATO','Avenida Santo Amaro, Jardim Petrópolis, Santo Amaro, São Paulo, Região Sudeste, 04709-010, Brasil',-23.63321200,-46.69263700,'Bicicletário',84,1,1,'Ativo','2026-10-15',8),(95,'ESTACAO TATUAPE','Tatuapé, Rua Melo Freire, Vila Azevedo, Tatuapé, São Paulo, Região Sudeste, 03307-005, Brasil',-23.54037100,-46.57626000,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(96,'TERMINAL BANDEIRA','6475-10 Jardim Vaz de Lima, Passarela dos Piques, República, São Paulo, Região Sudeste, 01050-020, Brasil',-23.54948600,-46.63962400,'Bicicletário',51,1,1,'Ativo','2026-10-15',5),(97,'ESTACAO AACD - SERVIDOR','Estação AACD-Servidor;AACD – Servidor, 1601, Rua Pedro de Toledo, Indianópolis, Moema, São Paulo, Região Sudeste, 04027-000, Brasil',-23.59753000,-46.65251200,'Bicicletário',36,1,1,'Ativo','2026-10-15',8),(98,'TERMINAL CAMPO LIMPO','Terminal Campo Limpo, 46, Rua Campina Grande, Campo Limpo, São Paulo, Região Sudeste, 05788-250, Brasil',-23.63143500,-46.77215100,'Bicicletário',150,1,1,'Ativo','2026-10-15',5),(99,'TERMINAL PIRITUBA','Terminal Pirituba, Viaduto Raimundo Pereira de Magalhães, Piqueri, Pirituba, São Paulo, Região Sudeste, 02945-040, Brasil',-23.48663900,-46.72646700,'Bicicletário',156,1,1,'Ativo','2026-10-15',5),(100,'ESTACAO USP LESTE','Escola de Artes, Ciências e Humanidades, 1100, Rua Arlindo Bettio, Vila Guaraciaba, Cangaíba, São Paulo, Região Sudeste, 03828-000, Brasil',-23.48501600,-46.50078300,'Bicicletário',270,1,1,'Ativo','2026-10-15',7),(101,'TERMINAL LAPA','Terminal Lapa, Viaduto Comendador Elias Nagib Breim, Água Branca, Lapa, São Paulo, Região Sudeste, 05049-901, Brasil',-23.52025300,-46.69996800,'Bicicletário',74,1,1,'Ativo','2026-10-15',5),(102,'ESTAÇÃO VILA PRUDENTE','Vila Prudente, Rua Itamumbuca, Vila Prudente, São Paulo, Região Sudeste, 03132-100, Brasil',-23.58462500,-46.58183400,'Paraciclo',10,1,0,'Ativo','2026-10-15',4),(103,'TERMINAL PINHEIROS','Rua Gilberto Sabino, Vila Madalena, Pinheiros, São Paulo, Região Sudeste, 05425-020, Brasil',-23.56613500,-46.70157800,'Bicicletário',77,1,1,'Ativo','2026-10-15',5),(104,'TERMINAL JABAQUARA','Expresso Luxo, Rua dos Jequitibás, Vila do Encontro, Jabaquara, São Paulo, Região Sudeste, 05263-030, Brasil',-23.64581300,-46.64219100,'Bicicletário',225,1,1,'Ativo','2026-10-15',2),(105,'ESTACAO MOEMA','Avenida Ibirapuera, Indianópolis, Moema, São Paulo, Região Sudeste, 04029-100, Brasil',-23.60369900,-46.66210100,'Bicicletário',68,1,1,'Ativo','2026-10-15',8),(106,'ESTACAO VILA LOBOS- JAGUARE','CPTM Villa Lobos Jaguaré, Rua Desembargador José Gonçalves Santana, Boaçava, Alto de Pinheiros, São Paulo, Região Sudeste, 05321-010, Brasil',-23.54567700,-46.73245600,'Bicicletário',233,1,1,'Ativo','2026-10-15',8),(107,'TERMINAL MERCADO','Terminal Mercado, Avenida do Estado, Glicério, Sé, São Paulo, Região Sudeste, 01015-080, Brasil',-23.54724300,-46.62889800,'Bicicletário',58,1,1,'Ativo','2026-10-15',5),(108,'ESTACAO SAO LUCAS','Ciclovia Monotrilho Linha Prata, São Lucas, Vila Prudente, São Paulo, Região Sudeste, 03294-000, Brasil',-23.58895000,-46.54460900,'Paraciclo',64,1,0,'Ativo','2026-10-15',1),(109,'ESTACAO VILA UNIAO','Avenida Professor Luiz Ignácio Anhaia Mello, Vila Cunha Bueno, Sapopemba, São Paulo, Região Sudeste, 03260-000, Brasil',-23.60290600,-46.51559800,'Paraciclo',64,1,0,'Ativo','2026-10-15',1),(110,'ESTACAO PINHEIROS','Estação Pinheiros do metrô, 145, Rua Capri, Vila Madalena, Pinheiros, São Paulo, Região Sudeste, 05425-030, Brasil',-23.56748100,-46.70162400,'Bicicletário',117,1,1,'Ativo','2026-10-15',6),(111,'TERMINAL CAPELINHA','Terminal Capelinha, Condominio Buena Vista, Jardim Germânia, Capão Redondo, São Paulo, Região Sudeste, 05848-000, Brasil',-23.65464900,-46.76173500,'Paraciclo',4,1,0,'Ativo','2026-10-15',5),(112,'ESTACAO COMENDADOR ERMELINO','Comendador Ermelino, Avenida Doutor Assis Ribeiro, Parque Boturussu, Ermelino Matarazzo, São Paulo, Região Sudeste, 03814-110, Brasil',-23.48494300,-46.48226600,'Bicicletário',196,1,1,'Ativo','2026-10-15',7),(113,'TERM HID PQ LINEAR CANTINHO DO CEU','Rua Boa Vista, Vila Parque Europa, Parque Residencial Cocaia Cantinho do Céu, Grajaú, São Paulo, Região Sudeste, 04849-522, Brasil',-23.73956500,-46.65676900,'Bicicletário',51,1,1,'Ativo','2026-10-15',5),(114,'ESTACAO JARDIM PLANALTO','Jardim Planalto, 9930, Avenida Sapopemba, Conjunto Habitacional Teotônio Vilela, Sapopemba, São Paulo, Região Sudeste, 03988-000, Brasil',-23.60633600,-46.50773000,'Paraciclo',64,1,0,'Ativo','2026-10-15',1),(115,'LARGO DA BATATA','Avenida Brigadeiro Faria Lima, Vila Madalena, Pinheiros, São Paulo, Região Sudeste, 05426-200, Brasil',-23.56718300,-46.69381700,'Bicicletário',100,1,1,'Ativo','2026-10-15',3),(116,'ESTACAO VILA MADALENA','Via exclusiva de ônibus do Terminal Vila Madalena, Sumarezinho, Pinheiros, São Paulo, Região Sudeste, 05440-050, Brasil',-23.54664800,-46.69069500,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(117,'ESTACAO BRAS','Rua Domingos Paiva, Brás, São Paulo, Região Sudeste, 03043-070, Brasil',-23.54747500,-46.61557700,'Paraciclo',8,1,0,'Ativo','2026-10-15',4),(118,'TERMIAL SÃO MATEUS','Avenida Adélia Chohfi, Jardim Três Marias, São Mateus, São Paulo, Região Sudeste, 08330-010, Brasil',-23.61354800,-46.47631900,'Paraciclo',16,1,0,'Ativo','2026-10-15',2),(119,'ESTACAO ANHANGABAU','Anhangabaú, Largo da Memória, República, São Paulo, Região Sudeste, 01048-100, Brasil',-23.54781500,-46.63924700,'Paraciclo',6,1,0,'Ativo','2026-10-15',4),(120,'TERMINAL PENHA','Avenida Gabriela Mistral, Vila Laís, Penha, São Paulo, Região Sudeste, 03605-000, Brasil',-23.51906700,-46.54680300,'Bicicletário',28,1,1,'Ativo','2026-10-15',5),(121,'TERMINAL ARICANDUVA','Terminal Aricanduva, Parque São Jorge, Tatuapé, São Paulo, Região Sudeste, 03073-080, Brasil',-23.52946300,-46.55395900,'Bicicletário',54,1,1,'Ativo','2026-10-15',5);
/*!40000 ALTER TABLE `ponto_apoio` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `regra_acesso`
--

DROP TABLE IF EXISTS `regra_acesso`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `regra_acesso` (
  `id_regra` int NOT NULL AUTO_INCREMENT,
  `tipo_acesso` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `permanencia_maxima` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `taxas` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `documentos_exigidos` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `restricoes` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_ponto` int NOT NULL,
  PRIMARY KEY (`id_regra`),
  KEY `fk_regra_acesso_ponto_apoio1_idx` (`id_ponto`),
  CONSTRAINT `fk_regra_acesso_ponto_apoio1` FOREIGN KEY (`id_ponto`) REFERENCES `ponto_apoio` (`id_ponto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `regra_acesso`
--

LOCK TABLES `regra_acesso` WRITE;
/*!40000 ALTER TABLE `regra_acesso` DISABLE KEYS */;
/*!40000 ALTER TABLE `regra_acesso` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `seguranca`
--

DROP TABLE IF EXISTS `seguranca`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `seguranca` (
  `id_seguranca` int NOT NULL AUTO_INCREMENT,
  `vigilancia_humana` tinyint(1) DEFAULT NULL,
  `cameras` tinyint(1) DEFAULT NULL,
  `seguro_contra_furto` tinyint(1) DEFAULT NULL,
  `nivel_avaliado` int DEFAULT NULL COMMENT '\n',
  `id_ponto` int NOT NULL,
  PRIMARY KEY (`id_seguranca`),
  KEY `fk_seguranca_ponto_apoio1_idx` (`id_ponto`),
  CONSTRAINT `fk_seguranca_ponto_apoio1` FOREIGN KEY (`id_ponto`) REFERENCES `ponto_apoio` (`id_ponto`)
) ENGINE=InnoDB AUTO_INCREMENT=122 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `seguranca`
--

LOCK TABLES `seguranca` WRITE;
/*!40000 ALTER TABLE `seguranca` DISABLE KEYS */;
INSERT INTO `seguranca` VALUES (1,0,0,0,0,1),(2,0,0,0,0,2),(3,0,0,0,0,3),(4,0,0,0,0,4),(5,0,0,0,0,5),(6,0,0,0,0,6),(7,0,0,0,0,7),(8,0,0,0,0,8),(9,0,0,0,0,9),(10,0,0,0,0,10),(11,0,0,0,0,11),(12,0,0,0,0,12),(13,0,0,0,0,13),(14,0,0,0,0,14),(15,0,0,0,0,15),(16,0,0,0,0,16),(17,0,0,0,0,17),(18,0,0,0,0,18),(19,0,0,0,0,19),(20,0,0,0,0,20),(21,0,0,0,0,21),(22,0,0,0,0,22),(23,0,0,0,0,23),(24,0,0,0,0,24),(25,0,0,0,0,25),(26,0,0,0,0,26),(27,0,0,0,0,27),(28,0,0,0,0,28),(29,0,0,0,0,29),(30,0,0,0,0,30),(31,0,0,0,0,31),(32,0,0,0,0,32),(33,0,0,0,0,33),(34,0,0,0,0,34),(35,0,0,0,0,35),(36,0,0,0,0,36),(37,0,0,0,0,37),(38,0,0,0,0,38),(39,0,0,0,0,39),(40,0,0,0,0,40),(41,0,0,0,0,41),(42,0,0,0,0,42),(43,0,0,0,0,43),(44,0,0,0,0,44),(45,0,0,0,0,45),(46,0,0,0,0,46),(47,0,0,0,0,47),(48,0,0,0,0,48),(49,0,0,0,0,49),(50,0,0,0,0,50),(51,0,0,0,0,51),(52,0,0,0,0,52),(53,0,0,0,0,53),(54,0,0,0,0,54),(55,0,0,0,0,55),(56,0,0,0,0,56),(57,0,0,0,0,57),(58,0,0,0,0,58),(59,0,0,0,0,59),(60,0,0,0,0,60),(61,0,0,0,0,61),(62,0,0,0,0,62),(63,0,0,0,0,63),(64,0,0,0,0,64),(65,0,0,0,0,65),(66,0,0,0,0,66),(67,0,0,0,0,67),(68,0,0,0,0,68),(69,0,0,0,0,69),(70,0,0,0,0,70),(71,0,0,0,0,71),(72,0,0,0,0,72),(73,0,0,0,0,73),(74,0,0,0,0,74),(75,0,0,0,0,75),(76,0,0,0,0,76),(77,0,0,0,0,77),(78,0,0,0,0,78),(79,0,0,0,0,79),(80,0,0,0,0,80),(81,0,0,0,0,81),(82,0,0,0,0,82),(83,0,0,0,0,83),(84,0,0,0,0,84),(85,0,0,0,0,85),(86,0,0,0,0,86),(87,0,0,0,0,87),(88,0,0,0,0,88),(89,0,0,0,0,89),(90,0,0,0,0,90),(91,0,0,0,0,91),(92,0,0,0,0,92),(93,0,0,0,0,93),(94,0,0,0,0,94),(95,0,0,0,0,95),(96,0,0,0,0,96),(97,0,0,0,0,97),(98,0,0,0,0,98),(99,0,0,0,0,99),(100,0,0,0,0,100),(101,0,0,0,0,101),(102,0,0,0,0,102),(103,0,0,0,0,103),(104,0,0,0,0,104),(105,0,0,0,0,105),(106,0,0,0,0,106),(107,0,0,0,0,107),(108,0,0,0,0,108),(109,0,0,0,0,109),(110,0,0,0,0,110),(111,0,0,0,0,111),(112,0,0,0,0,112),(113,0,0,0,0,113),(114,0,0,0,0,114),(115,0,0,0,0,115),(116,0,0,0,0,116),(117,0,0,0,0,117),(118,0,0,0,0,118),(119,0,0,0,0,119),(120,0,0,0,0,120),(121,0,0,0,0,121);
/*!40000 ALTER TABLE `seguranca` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `servico`
--

DROP TABLE IF EXISTS `servico`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `servico` (
  `id_servico` int NOT NULL AUTO_INCREMENT,
  `tipo` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `descricao` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `id_ponto` int NOT NULL,
  PRIMARY KEY (`id_servico`),
  KEY `fk_servico_ponto_apoio1_idx` (`id_ponto`),
  CONSTRAINT `fk_servico_ponto_apoio1` FOREIGN KEY (`id_ponto`) REFERENCES `ponto_apoio` (`id_ponto`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `servico`
--

LOCK TABLES `servico` WRITE;
/*!40000 ALTER TABLE `servico` DISABLE KEYS */;
/*!40000 ALTER TABLE `servico` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-15 23:53:53
