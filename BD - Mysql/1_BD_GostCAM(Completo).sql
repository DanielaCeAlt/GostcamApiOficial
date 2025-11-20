-- =============================================
-- GOSTCAM
-- =============================================

-- ========================
-- SECCIÓN 1: CONFIGURACIÓN INICIAL
-- ========================
SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- ========================
-- SECCIÓN 2: CREACIÓN DE ESQUEMAS
-- ========================

DROP SCHEMA IF EXISTS `GostCAM`;
CREATE SCHEMA `GostCAM` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci;

-- ========================
-- SECCIÓN 3: TABLAS DE CATÁLOGO (GostCAM)
-- ========================
USE `GostCAM`;

-- Tabla: Estados
DROP TABLE IF EXISTS `GostCAM`.`Estados`;
CREATE TABLE `GostCAM`.`Estados` (
  `idEstado` INT NOT NULL AUTO_INCREMENT,
  `Estado` VARCHAR(20) NULL DEFAULT NULL,
  PRIMARY KEY (`idEstado`)
) ENGINE = InnoDB;

-- Tabla: Municipios
DROP TABLE IF EXISTS `GostCAM`.`Municipios`;
CREATE TABLE `GostCAM`.`Municipios` (
  `idMunicipios` INT NOT NULL AUTO_INCREMENT,
  `Municipio` VARCHAR(50) NOT NULL,
  PRIMARY KEY (`idMunicipios`)
) ENGINE = InnoDB;

-- Tabla: Zonas
DROP TABLE IF EXISTS `GostCAM`.`Zonas`;
CREATE TABLE `GostCAM`.`Zonas` (
  `idZona` INT NOT NULL AUTO_INCREMENT,
  `Zona` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`idZona`)
) ENGINE = InnoDB;

-- Tabla: nivelusuarios
DROP TABLE IF EXISTS `GostCAM`.`nivelusuarios`;
CREATE TABLE `GostCAM`.`nivelusuarios` (
  `idNivelUsuario` INT NOT NULL AUTO_INCREMENT,
  `NivelUsuario` VARCHAR(20) NOT NULL,
  PRIMARY KEY (`idNivelUsuario`)
) ENGINE = InnoDB;

-- ========================
-- SECCIÓN 4: TABLAS PRINCIPALES (GostCAM)
-- ========================

-- Tabla: Sucursales
DROP TABLE IF EXISTS `GostCAM`.`Sucursales`;
CREATE TABLE `GostCAM`.`Sucursales` (
  `idCentro` VARCHAR(4) NOT NULL,
  `Sucursal` VARCHAR(30) NOT NULL,
  `idZona` INT NOT NULL,
  `idEstado` INT NOT NULL,
  `idMunicipios` INT NOT NULL,
  `Direccion` VARCHAR(200) NULL,
  PRIMARY KEY (`idCentro`),
  INDEX `FkIdZonas_idx` (`idZona` ASC),
  INDEX `FkIdEstado_idx` (`idEstado` ASC),
  INDEX `FkIdMunicipio_idx` (`idMunicipios` ASC),
  CONSTRAINT `FkdEstado`
    FOREIGN KEY (`idEstado`)
    REFERENCES `GostCAM`.`Estados` (`idEstado`),
  CONSTRAINT `FkIdMunicipio`
    FOREIGN KEY (`idMunicipios`)
    REFERENCES `GostCAM`.`Municipios` (`idMunicipios`),
  CONSTRAINT `FkIdZonas`
    FOREIGN KEY (`idZona`)
    REFERENCES `GostCAM`.`Zonas` (`idZona`)
) ENGINE = InnoDB;

-- Tabla: Usuarios
DROP TABLE IF EXISTS `GostCAM`.`Usuarios`;
CREATE TABLE `GostCAM`.`Usuarios` (
  `idUsuarios` INT NOT NULL AUTO_INCREMENT,
  `NombreUsuario` VARCHAR(45) NOT NULL,
  `NivelUsuario` INT NOT NULL,
  `Correo` VARCHAR(254) NOT NULL,
  `Contraseña` VARCHAR(255) NOT NULL,
  `Estatus` TINYINT NOT NULL DEFAULT 1,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idUsuarios`),
  INDEX `IdNivelUsuario_idx` (`NivelUsuario` ASC),
  UNIQUE INDEX `Correo_UNIQUE` (`Correo` ASC),
  CONSTRAINT `IdNivelUsuario`
    FOREIGN KEY (`NivelUsuario`)
    REFERENCES `GostCAM`.`nivelusuarios` (`idNivelUsuario`)
) ENGINE = InnoDB;

-- ========================
-- SECCIÓN 5: TABLAS PRINCIPALES (GostCAM)
-- ========================
USE `GostCAM`;

-- Tabla: TipoMovimiento
DROP TABLE IF EXISTS `GostCAM`.`TipoMovimiento`;
CREATE TABLE `GostCAM`.`TipoMovimiento` (
  `idTipoMov` INT NOT NULL AUTO_INCREMENT,
  `tipoMovimiento` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idTipoMov`)
) ENGINE = InnoDB;

-- Tabla: EstatusEquipo
DROP TABLE IF EXISTS `GostCAM`.`EstatusEquipo`;
CREATE TABLE `GostCAM`.`EstatusEquipo` (
  `idEstatus` INT NOT NULL AUTO_INCREMENT,
  `estatus` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idEstatus`)
) ENGINE = InnoDB;

-- Tabla: TipoEquipo
DROP TABLE IF EXISTS `GostCAM`.`TipoEquipo`;
CREATE TABLE `GostCAM`.`TipoEquipo` (
  `idTipoEquipo` INT NOT NULL AUTO_INCREMENT,
  `nombreTipo` VARCHAR(45) NOT NULL,
  `descripcion` VARCHAR(45) NOT NULL,
  PRIMARY KEY (`idTipoEquipo`)
) ENGINE = InnoDB;

-- Tabla: PosicionEquipo
DROP TABLE IF EXISTS `GostCAM`.`PosicionEquipo`;
CREATE TABLE `GostCAM`.`PosicionEquipo` (
  `idPosicion` INT NOT NULL AUTO_INCREMENT,
  `idCentro` CHAR(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `NombrePosicion` VARCHAR(100) NOT NULL,
  `Descripcion` VARCHAR(200) NULL,
  `TipoArea` ENUM('INTERIOR', 'EXTERIOR', 'ALMACEN', 'OFICINA', 'SALA_SERVIDORES', 'TALLER', 'ESTACIONAMIENTO', 'AREA_PUBLICA', 'BODEGA', 'OTRO') NOT NULL DEFAULT 'INTERIOR',
  PRIMARY KEY (`idPosicion`),
  INDEX `fk_PosicionEquipo_idCentro_idx` (`idCentro` ASC),
  CONSTRAINT `fk_PosicionEquipo_idCentro`
    FOREIGN KEY (`idCentro`)
    REFERENCES `GostCAM`.`Sucursales` (`idCentro`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_spanish2_ci;

-- Tabla: Equipo
DROP TABLE IF EXISTS `GostCAM`.`Equipo`;
CREATE TABLE `GostCAM`.`Equipo` (
  `no_serie` VARCHAR(50) NOT NULL,
  `nombreEquipo` VARCHAR(50) NOT NULL,
  `modelo` VARCHAR(40) NOT NULL,
  `idTipoEquipo` INT NOT NULL,
  `numeroActivo` VARCHAR(20) NOT NULL,
  `fechaAlta` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `idUsuarios` INT NOT NULL,
  `idPosicion` INT NOT NULL,
  `idEstatus` INT NOT NULL,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`no_serie`),
  INDEX `fk_Equipo_EstatusEquipo1_idx` (`idEstatus` ASC),
  INDEX `idTipoEquipo_idx` (`idTipoEquipo` ASC),
  INDEX `idUsuarioResponsable_idx` (`idUsuarios` ASC),
  INDEX `idPosicion_idx` (`idPosicion` ASC),
  UNIQUE INDEX `numeroActivo_UNIQUE` (`numeroActivo` ASC),
  CONSTRAINT `fk_Equipo_EstatusEquipo1`
    FOREIGN KEY (`idEstatus`)
    REFERENCES `GostCAM`.`EstatusEquipo` (`idEstatus`),
  CONSTRAINT `idTipoEquipo`
    FOREIGN KEY (`idTipoEquipo`)
    REFERENCES `GostCAM`.`TipoEquipo` (`idTipoEquipo`),
  CONSTRAINT `idUsuarios`
    FOREIGN KEY (`idUsuarios`)
    REFERENCES `GostCAM`.`Usuarios` (`idUsuarios`),
  CONSTRAINT `idPosicion`
    FOREIGN KEY (`idPosicion`)
    REFERENCES `GostCAM`.`PosicionEquipo` (`idPosicion`)
) ENGINE = InnoDB;

-- Tabla: MovimientoInventario
CREATE TABLE `GostCAM`.`MovimientoInventario` (
  `idMovimientoInv` INT NOT NULL AUTO_INCREMENT,
  `origen_idCentro`  CHAR(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `destino_idCentro` CHAR(4) CHARACTER SET utf8mb4 COLLATE utf8mb4_spanish2_ci NOT NULL,
  `idTipoMov` INT NOT NULL,
  `fecha` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `fechaFin` DATETIME NULL,
  `estatusMovimiento` ENUM('ABIERTO','CERRADO','CANCELADO') NOT NULL DEFAULT 'ABIERTO',
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `fecha_actualizacion` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`idMovimientoInv`),
  INDEX `fk_MovimientoInventario_TipoMovimiento1_idx` (`idTipoMov`),
  INDEX `idx_origen` (`origen_idCentro`),
  INDEX `idx_destino` (`destino_idCentro`),
  CONSTRAINT `fk_MovimientoInventario_TipoMovimiento1`
    FOREIGN KEY (`idTipoMov`)
    REFERENCES `GostCAM`.`TipoMovimiento` (`idTipoMov`),
  CONSTRAINT `fk_MovimientoInventario_origen`
    FOREIGN KEY (`origen_idCentro`)
    REFERENCES `GostCAM`.`Sucursales` (`idCentro`)
    ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_MovimientoInventario_destino`
    FOREIGN KEY (`destino_idCentro`)
    REFERENCES `GostCAM`.`Sucursales` (`idCentro`)
    ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB
  DEFAULT CHARSET=utf8mb4
  COLLATE=utf8mb4_spanish2_ci;

-- Tabla: DetMovimiento
DROP TABLE IF EXISTS `GostCAM`.`DetMovimiento`;
CREATE TABLE `GostCAM`.`DetMovimiento` (
  `idDetMov` INT NOT NULL AUTO_INCREMENT,
  `idMovimientoInv` INT NOT NULL,
  `no_serie` VARCHAR(50) NOT NULL,
  `cantidad` INT NOT NULL DEFAULT 1,
  `fecha_creacion` DATETIME DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`idDetMov`),
  INDEX `idMovimientoInv_idx` (`idMovimientoInv` ASC),
  INDEX `no_serie_idx` (`no_serie` ASC),
  CONSTRAINT `idMovimientoInv`
    FOREIGN KEY (`idMovimientoInv`)
    REFERENCES `GostCAM`.`MovimientoInventario` (`idMovimientoInv`)
    ON DELETE CASCADE,
  CONSTRAINT `no_serie`
    FOREIGN KEY (`no_serie`)
    REFERENCES `GostCAM`.`Equipo` (`no_serie`)
) ENGINE = InnoDB;

-- ========================
-- SECCIÓN 6: DATOS INICIALES
-- ========================

-- Insertar datos en nivelusuarios
INSERT INTO `GostCAM`.`nivelusuarios` (`idNivelUsuario`, `NivelUsuario`) VALUES 
(1, 'Administrador'),
(2, 'Supervisor'),
(3, 'Técnico'),
(4, 'Usuario'),
(5, 'Consulta');

-- Insertar datos en Estados
INSERT INTO `GostCAM`.`Estados` (`idEstado`, `Estado`) VALUES 
(1, 'Jalisco'),
(2, 'Michoacán'),
(3, 'Colima'),
(4, 'Guerrero'),
(5, 'Guanajuato'),
(6, 'Sinaloa'),
(7, 'Sonora'),
(8, 'Puebla'),
(9, 'SanLuisPotosi'),
(10, 'Yucatan'),
(11, 'QuintanaRoo'),
(12, 'Campeche'),
(13, 'BajaCaliforniaSur'),
(14, 'EstadoDeMexico');

-- Insertar datos en Municipios
INSERT INTO `GostCAM`.`Municipios` (`idMunicipios`, `Municipio`) VALUES 
(1, 'Zamora'),
(2, 'Guadalajara'),
(3, 'Acapulco'),
(4, 'Guanajuato'),
(5, 'Guasave'),
(6, 'LaPiedad'),
(7, 'LosMochis'),
(8, 'Morelia'),
(9, 'Uruapan'),
(10, 'Zihuatanejo'),
(11, 'Yucatan'),
(12, 'Merida');

-- Insertar datos en Zonas
INSERT INTO `GostCAM`.`Zonas` (`idZona`, `Zona`) VALUES 
(1, 'Matriz'),
(2, 'PacificoSur'),
(3, 'Norpacifico'),
(4, 'Peninsula'),
(5, 'Chihuahua'),
(6, 'OccidenteBajio'),
(7, 'OccidenteNorte');

-- Insertar datos en Sucursales
INSERT INTO `GostCAM`.`Sucursales` (`idCentro`, `Sucursal`, `idZona`, `idEstado`, `idMunicipios`, `Direccion`) VALUES 
('T005', 'Merza Lazaro Cardenas', 2, 1, 2, 'Av. Central 123, Col. Centro'),
('T008', 'Merza Celaya', 6, 5, 4, 'Blvd. Norte 456, Industrial'),
('T011', 'Merza Jardines de Catedral', 1, 4, 3, 'Costera 789, Acapulco'),
('T014', 'Merza Estacion', 1, 14, 2, 'Eje Central 321, CDMX');

-- Insertar datos en Usuarios (contraseña: password123 en bcrypt)
INSERT IGNORE INTO `GostCAM`.`Usuarios` (`idUsuarios`, `NombreUsuario`, `NivelUsuario`, `Correo`, `Contraseña`, `Estatus`) VALUES
(1, 'Admin', 1, 'admin@gostcam.com', 'Pass123', 1),
(2, 'Admin Principal', 1, 'admin1@gostcam.com', '$2b$12$r6Qc8WnW7Vz3kK1Q8YhZeuJ9WQcR7S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5', 1),
(3, 'Supervisor Centro', 2, 'supervisor@gostcam.com', '$2b$12$r6Qc8WnW7Vz3kK1Q8YhZeuJ9WQcR7S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5', 1),
(4, 'Técnico Juan', 3, 'tecnico@gostcam.com', '$2b$12$r6Qc8WnW7Vz3kK1Q8YhZeuJ9WQcR7S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5', 1),
(5, 'Técnico María', 3, 'tecnico2@gostcam.com', '$2b$12$r6Qc8WnW7Vz3kK1Q8YhZeuJ9WQcR7S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5', 1),
(6, 'Usuario Carlos', 4, 'usuario@gostcam.com', '$2b$12$r6Qc8WnW7Vz3kK1Q8YhZeuJ9WQcR7S2T3U4V5W6X7Y8Z9A0B1C2D3E4F5', 1);

-- Insertar datos en PosicionEquipo 
INSERT INTO `GostCAM`.`PosicionEquipo` (`idPosicion`, `idCentro`, `NombrePosicion`, `Descripcion`, `TipoArea`) VALUES 
(1, 'T011', 'Recepción Principal', 'Área principal de recepción', 'INTERIOR'),
(2, 'T011', 'Oficinas Administrativas', 'Oficinas del personal administrativo', 'OFICINA'),
(3, 'T005', 'Almacén General', 'Área de almacenamiento de equipos', 'ALMACEN'),
(4, 'T005', 'Sala de Servidores', 'Sala de equipos servidores', 'SALA_SERVIDORES'),
(5, 'T008', 'Taller de Mantenimiento', 'Taller para reparación', 'TALLER'),
(6, 'T014', 'Área Externa', 'Área exterior vigilada', 'EXTERIOR');

-- Insertar datos en TipoMovimiento
INSERT INTO `GostCAM`.`TipoMovimiento` (`idTipoMov`, `tipoMovimiento`) VALUES 
(1, 'ALTA'),
(2, 'BAJA'),
(3, 'TRASLADO'),
(4, 'MANTENIMIENTO'),
(5, 'REPARACIÓN');

-- Insertar datos en EstatusEquipo
INSERT INTO `GostCAM`.`EstatusEquipo` (`idEstatus`, `estatus`) VALUES 
(1, 'Disponible'),
(2, 'En uso'),
(3, 'Mantenimiento'),
(4, 'Baja'),
(5, 'Extraviado'),
(6, 'Dañado'),
(7, 'En reparación'),
(8, 'Obsoleto');

-- Insertar datos en TipoEquipo
INSERT INTO `GostCAM`.`TipoEquipo` (`idTipoEquipo`, `nombreTipo`, `descripcion`) VALUES 
(1, 'Camara 360', 'Cámara de 360 grados'),
(2, 'Camara Domo', 'Cámara tipo domo'),
(3, 'Camara PTZ', 'Cámara PTZ (Pan-Tilt-Zoom)'),
(4, 'NVR', 'Network Video Recorder'),
(5, 'DVR', 'Digital Video Recorder'),
(6, 'Switch', 'Switch de red'),
(7, 'Disco Duro', 'Disco duro para almacenamiento'),
(8, 'Transmisor', 'Transmisor de señal'),
(9, 'OverHead', 'Equipo overhead'),
(10, 'Sensor Movimiento', 'Sensor de movimiento básico'),
(11, 'Sensor Movimiento 360', 'Sensor de movimiento 360°'),
(12, 'Sensor Movimiento Doble Tecnologia', 'Sensor doble tecnología'),
(13, 'Sensor Impacto', 'Sensor de impacto'),
(14, 'Boton Panico', 'Botón de pánico'),
(15, 'Sirena', 'Sirena de alarma'),
(16, 'Detector Humo', 'Detector de humo'),
(17, 'Transformador', 'Transformador eléctrico'),
(18, 'Tarjeta', 'Tarjeta electrónica'),
(19, 'Bateria', 'Batería de respaldo'),
(20, 'Fotoceldas', 'Fotoceldas de seguridad'),
(21, 'Teclados Alarma', 'Teclados para alarmas');

-- Insertar datos en Equipo
INSERT INTO `GostCAM`.`Equipo` (`no_serie`, `nombreEquipo`, `modelo`, `idTipoEquipo`, `numeroActivo`, `fechaAlta`, `idUsuarios`, `idPosicion`, `idEstatus`) VALUES 
('CAM-001-2024', 'Cámara Exterior 360°', 'DH-IPC-HDBW2831TN-AS', 1, 'ACT-001', NOW(), 2, 1, 2),
('SEN-001-2024', 'Sensor Movimiento PIR', 'DS-PD-I85', 10, 'ACT-002', NOW(), 3, 3, 1),
('DVR-001-2024', 'Grabadora 8 Canales', 'XVR5108HI-I3', 5, 'ACT-003', NOW(), 2, 2, 2),
('CAM-002-2024', 'Cámara Domo Interior', 'DH-IPC-HDW2831TN-AS', 2, 'ACT-004', NOW(), 1, 4, 3),
('NVR-001-2024', 'NVR 16 Canales', 'DS-7616NI-I2', 4, 'ACT-005', NOW(), 3, 2, 7),
('SW-001-2024', 'Switch PoE 24 Puertos', 'TL-SG1024PE', 6, 'ACT-006', NOW(), 4, 5, 1),
('SEN-002-2024', 'Sensor Movimiento 360', 'DS-PD-M85', 11, 'ACT-007', NOW(), 2, 6, 2);

-- Insertar datos en MovimientoInventario
INSERT INTO `GostCAM`.`MovimientoInventario` (`idMovimientoInv`, `origen_idCentro`, `destino_idCentro`, `idTipoMov`, `fecha`, `estatusMovimiento`) VALUES 
(1, 'T005', 'T005', 1, '2024-01-15 10:00:00', 'CERRADO'),
(2, 'T005', 'T008', 3, '2024-01-20 14:30:00', 'CERRADO'),
(3, 'T008', 'T011', 3, '2024-02-01 09:15:00', 'CERRADO'),
(4, 'T011', 'T014', 4, '2024-02-15 16:45:00', 'ABIERTO'),
(5, 'T014', 'T014', 1, '2024-02-20 11:30:00', 'CERRADO'),
(6, 'T005', 'T008', 3, '2024-03-01 15:20:00', 'CERRADO');

-- Insertar datos en DetMovimiento
INSERT INTO `GostCAM`.`DetMovimiento` (`idDetMov`, `idMovimientoInv`, `no_serie`, `cantidad`) VALUES 
(1, 1, 'CAM-001-2024', 1),
(2, 1, 'SEN-001-2024', 1),
(3, 2, 'CAM-001-2024', 1),
(4, 3, 'DVR-001-2024', 1),
(5, 4, 'CAM-002-2024', 1),
(6, 5, 'SW-001-2024', 1),
(7, 5, 'SEN-002-2024', 1),
(8, 6, 'SW-001-2024', 1);

-- ========================
-- SECCIÓN 7: VISTAS
-- ========================

-- Vista: Equipos completos con información
CREATE OR REPLACE VIEW VistaEquiposCompletos AS
SELECT 
    e.no_serie,
    e.nombreEquipo,
    e.modelo,
    te.nombreTipo as TipoEquipo,
    te.descripcion as DescripcionTipo,
    e.numeroActivo,
    e.fechaAlta,
    u.NombreUsuario as UsuarioAsignado,
    es.estatus as EstatusEquipo,
    s.Sucursal as SucursalActual,
    p.NombrePosicion as PosicionActual,
    p.TipoArea as TipoArea,
    z.Zona as ZonaSucursal,
    est.Estado as EstadoSucursal,
    m.Municipio as MunicipioSucursal
FROM `GostCAM`.`Equipo` e
JOIN `GostCAM`.`TipoEquipo` te ON e.idTipoEquipo = te.idTipoEquipo
JOIN `GostCAM`.`Usuarios` u ON e.idUsuarios = u.idUsuarios
JOIN `GostCAM`.`EstatusEquipo` es ON e.idEstatus = es.idEstatus
JOIN `GostCAM`.`PosicionEquipo` p ON e.idPosicion = p.idPosicion
JOIN `GostCAM`.`Sucursales` s ON p.idCentro = s.idCentro
JOIN `GostCAM`.`Zonas` z ON s.idZona = z.idZona
JOIN `GostCAM`.`Estados` est ON s.idEstado = est.idEstado
JOIN `GostCAM`.`Municipios` m ON s.idMunicipios = m.idMunicipios;

-- Vista: Movimientos detallados
CREATE OR REPLACE VIEW VistaMovimientosDetallados AS
SELECT 
    m.idMovimientoInv,
    m.fecha,
    tm.tipoMovimiento,
    m.estatusMovimiento,
    s_origen.Sucursal as SucursalOrigen,
    s_origen.idCentro as CentroOrigen,
    s_destino.Sucursal as SucursalDestino,
    s_destino.idCentro as CentroDestino,
    d.no_serie,
    e.nombreEquipo,
    te.nombreTipo as TipoEquipo,
    d.cantidad,
    m.fechaFin,
    z_origen.Zona as ZonaOrigen,
    z_destino.Zona as ZonaDestino
FROM `GostCAM`.`MovimientoInventario` m
JOIN `GostCAM`.`TipoMovimiento` tm ON m.idTipoMov = tm.idTipoMov
JOIN `GostCAM`.`Sucursales` s_origen ON m.origen_idCentro = s_origen.idCentro
JOIN `GostCAM`.`Sucursales` s_destino ON m.destino_idCentro = s_destino.idCentro
JOIN `GostCAM`.`Zonas` z_origen ON s_origen.idZona = z_origen.idZona
JOIN `GostCAM`.`Zonas` z_destino ON s_destino.idZona = z_destino.idZona
JOIN `GostCAM`.`DetMovimiento` d ON m.idMovimientoInv = d.idMovimientoInv
JOIN `GostCAM`.`Equipo` e ON d.no_serie = e.no_serie
JOIN `GostCAM`.`TipoEquipo` te ON e.idTipoEquipo = te.idTipoEquipo;

-- Vista: Inventario por estatus (ACTUALIZADA)
CREATE OR REPLACE VIEW VistaInventarioPorEstatus AS
SELECT 
    es.estatus,
    te.nombreTipo as TipoEquipo,
    p.TipoArea,
    COUNT(e.no_serie) as Cantidad,
    GROUP_CONCAT(e.nombreEquipo SEPARATOR ', ') as Equipos,
    SUM(CASE WHEN es.estatus = 'Disponible' THEN 1 ELSE 0 END) as Disponibles,
    SUM(CASE WHEN es.estatus = 'En uso' THEN 1 ELSE 0 END) as EnUso,
    SUM(CASE WHEN es.estatus IN ('Mantenimiento', 'En reparación') THEN 1 ELSE 0 END) as EnMantenimiento
FROM `GostCAM`.`Equipo` e
JOIN `GostCAM`.`EstatusEquipo` es ON e.idEstatus = es.idEstatus
JOIN `GostCAM`.`TipoEquipo` te ON e.idTipoEquipo = te.idTipoEquipo
JOIN `GostCAM`.`PosicionEquipo` p ON e.idPosicion = p.idPosicion
GROUP BY es.estatus, te.nombreTipo, p.TipoArea
ORDER BY es.estatus, te.nombreTipo;

-- Vista: Historial de movimientos por equipo
CREATE OR REPLACE VIEW VistaHistorialMovimientos AS
SELECT 
    e.no_serie,
    e.nombreEquipo,
    m.idMovimientoInv,
    tm.tipoMovimiento,
    m.fecha,
    s_origen.Sucursal as Origen,
    s_destino.Sucursal as Destino,
    m.estatusMovimiento,
    DATEDIFF(COALESCE(m.fechaFin, NOW()), m.fecha) as DiasDuracion
FROM `GostCAM`.`Equipo` e
JOIN `GostCAM`.`DetMovimiento` d ON e.no_serie = d.no_serie
JOIN `GostCAM`.`MovimientoInventario` m ON d.idMovimientoInv = m.idMovimientoInv
JOIN `GostCAM`.`TipoMovimiento` tm ON m.idTipoMov = tm.idTipoMov
JOIN `GostCAM`.`Sucursales` s_origen ON m.origen_idCentro = s_origen.idCentro
JOIN `GostCAM`.`Sucursales` s_destino ON m.destino_idCentro = s_destino.idCentro
ORDER BY e.no_serie, m.fecha DESC;

-- ========================
-- SECCIÓN 8: PROCEDIMIENTOS ALMACENADOS - ACTUALIZADOS (COMPLETO)
-- ========================
DELIMITER //

-- Procedimiento: Registrar alta de equipo (ACTUALIZADO)
CREATE PROCEDURE sp_RegistrarAltaEquipo(
    IN p_no_serie VARCHAR(50),
    IN p_nombreEquipo VARCHAR(50),
    IN p_modelo VARCHAR(40),
    IN p_idTipoEquipo INT,
    IN p_numeroActivo VARCHAR(20),
    IN p_idUsuarios INT,
    IN p_idPosicion INT,
    IN p_idEstatus INT,
    IN p_idCentro VARCHAR(4)
)
BEGIN
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Verificar si el número de serie ya existe
    IF EXISTS (SELECT 1 FROM `GostCAM`.`Equipo` WHERE no_serie = p_no_serie) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El número de serie ya existe';
    END IF;

    -- Verificar que la posición pertenezca al centro
    IF NOT EXISTS (SELECT 1 FROM `GostCAM`.`PosicionEquipo` WHERE idPosicion = p_idPosicion AND idCentro = p_idCentro) THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'La posición no pertenece al centro especificado';
    END IF;

    -- Insertar equipo
    INSERT INTO `GostCAM`.`Equipo` (no_serie, nombreEquipo, modelo, idTipoEquipo, numeroActivo, idUsuarios, idPosicion, idEstatus)
    VALUES (p_no_serie, p_nombreEquipo, p_modelo, p_idTipoEquipo, p_numeroActivo, p_idUsuarios, p_idPosicion, p_idEstatus);

    -- Registrar movimiento de alta
    INSERT INTO `GostCAM`.`MovimientoInventario` (origen_idCentro, destino_idCentro, idTipoMov, estatusMovimiento)
    VALUES (p_idCentro, p_idCentro, 1, 'CERRADO');

    -- Registrar detalle del movimiento
    INSERT INTO `GostCAM`.`DetMovimiento` (idMovimientoInv, no_serie, cantidad)
    VALUES (LAST_INSERT_ID(), p_no_serie, 1);
    
    COMMIT;
END //

-- Procedimiento: Registrar baja de equipo
CREATE PROCEDURE sp_RegistrarBajaEquipo(
    IN p_no_serie VARCHAR(50),
    IN p_idCentro VARCHAR(4),
    IN p_motivo VARCHAR(200)
)
BEGIN
    DECLARE v_estatus_actual INT;
    
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;
    
    START TRANSACTION;
    
    -- Verificar si el equipo existe
    SELECT idEstatus INTO v_estatus_actual 
    FROM `GostCAM`.`Equipo` 
    WHERE no_serie = p_no_serie;
    
    IF v_estatus_actual IS NULL THEN
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Equipo no encontrado';
    ELSEIF v_estatus_actual = 4 THEN -- 4 = Baja
        SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'El equipo ya está dado de baja';
    ELSE
        -- Registrar movimiento de baja
        INSERT INTO `GostCAM`.`MovimientoInventario` (origen_idCentro, destino_idCentro, idTipoMov, estatusMovimiento)
        VALUES (p_idCentro, p_idCentro, 2, 'CERRADO');

        -- Registrar detalle del movimiento
        INSERT INTO `GostCAM`.`DetMovimiento` (idMovimientoInv, no_serie, cantidad)
        VALUES (LAST_INSERT_ID(), p_no_serie, 1);

        -- Actualizar estatus del equipo a Baja
        UPDATE `GostCAM`.`Equipo` 
        SET idEstatus = 4 
        WHERE no_serie = p_no_serie;
        
        COMMIT;
    END IF;
END //

-- Procedimiento: Consultar movimientos de equipo
CREATE PROCEDURE sp_ConsultarMovimientosEquipo(
    IN p_no_serie VARCHAR(50)
)
BEGIN
    SELECT 
        m.idMovimientoInv,
        tm.tipoMovimiento,
        m.fecha,
        s_origen.Sucursal as SucursalOrigen,
        s_destino.Sucursal as SucursalDestino,
        m.estatusMovimiento,
        m.fechaFin
    FROM `GostCAM`.`MovimientoInventario` m
    JOIN `GostCAM`.`TipoMovimiento` tm ON m.idTipoMov = tm.idTipoMov
    JOIN `GostCAM`.`Sucursales` s_origen ON m.origen_idCentro = s_origen.idCentro
    JOIN `GostCAM`.`Sucursales` s_destino ON m.destino_idCentro = s_destino.idCentro
    JOIN `GostCAM`.`DetMovimiento` d ON m.idMovimientoInv = d.idMovimientoInv
    WHERE d.no_serie = p_no_serie
    ORDER BY m.fecha DESC;
END //

-- Procedimiento: Obtener inventario por sucursal (ACTUALIZADO Y COMPLETO)
CREATE PROCEDURE sp_ObtenerInventarioSucursal(
    IN p_idCentro VARCHAR(4)
)
BEGIN
    SELECT 
        e.no_serie,
        e.nombreEquipo,
        e.modelo,
        te.nombreTipo as TipoEquipo,
        e.numeroActivo,
        es.estatus,
        u.NombreUsuario as UsuarioAsignado,
        p.NombrePosicion as Posicion,
        e.fechaAlta
    FROM `GostCAM`.`Equipo` e
    JOIN `GostCAM`.`TipoEquipo` te ON e.idTipoEquipo = te.idTipoEquipo
    JOIN `GostCAM`.`EstatusEquipo` es ON e.idEstatus = es.idEstatus
    JOIN `GostCAM`.`PosicionEquipo` p ON e.idPosicion = p.idPosicion
    LEFT JOIN `GostCAM`.`Usuarios` u ON e.idUsuarios = u.idUsuarios
    WHERE p.idCentro = p_idCentro
    ORDER BY te.nombreTipo, e.nombreEquipo;
END //

DELIMITER ;

-- ========================
-- SECCIÓN 9: VERIFICACIÓN FINAL
-- ========================
SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;

-- Mensaje de éxito
SELECT '✅ Base de datos GOSTCAM creada exitosamente!' as Mensaje;

-- Mostrar resumen de datos
SELECT 
    'Estados' as Tabla,
    COUNT(*) as Registros
FROM `GostCAM`.`Estados`
UNION ALL
SELECT 
    'Municipios',
    COUNT(*) 
FROM `GostCAM`.`Municipios`
UNION ALL
SELECT 
    'Zonas',
    COUNT(*) 
FROM `GostCAM`.`Zonas`
UNION ALL
SELECT 
    'Sucursales',
    COUNT(*) 
FROM `GostCAM`.`Sucursales`
UNION ALL
SELECT 
    'Usuarios',
    COUNT(*) 
FROM `GostCAM`.`Usuarios`
UNION ALL
SELECT 
    'PosicionEquipo',
    COUNT(*) 
FROM `GostCAM`.`PosicionEquipo`
UNION ALL
SELECT 
    'Equipo',
    COUNT(*) 
FROM `GostCAM`.`Equipo`
UNION ALL
SELECT 
    'TipoEquipo',
    COUNT(*) 
FROM `GostCAM`.`TipoEquipo`
UNION ALL
SELECT 
    'MovimientoInventario',
    COUNT(*) 
FROM `GostCAM`.`MovimientoInventario`;

-- Mostrar estructura de tabla Equipo
SHOW CREATE TABLE `GostCAM`.`Equipo`;
  