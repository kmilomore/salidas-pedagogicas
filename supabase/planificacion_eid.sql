-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 11-05-2026 a las 10:23:22
-- Versión del servidor: 10.6.24-MariaDB-cll-lve
-- Versión de PHP: 8.3.26

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `camilose_portal`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `planificacion_eid`
--

CREATE TABLE `planificacion_eid` (
  `id` int(11) NOT NULL,
  `plan_id` int(11) NOT NULL,
  `eid_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `planificacion_eid`
--

INSERT INTO `planificacion_eid` (`id`, `plan_id`, `eid_id`) VALUES
(4, 2, 9),
(1, 2, 35),
(2, 2, 36),
(3, 2, 38),
(13, 3, 27),
(12, 3, 30),
(5, 3, 34),
(6, 3, 36),
(7, 3, 42),
(9, 3, 43),
(8, 3, 44),
(10, 3, 45),
(11, 3, 46),
(14, 4, 35),
(15, 4, 36),
(16, 4, 37),
(17, 4, 38),
(21, 5, 12),
(22, 5, 30),
(18, 5, 31),
(19, 5, 34),
(20, 5, 35),
(27, 5, 42),
(26, 5, 43),
(25, 5, 44),
(24, 5, 45),
(23, 5, 46);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `planificacion_eid`
--
ALTER TABLE `planificacion_eid`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uk_plan_eid` (`plan_id`,`eid_id`),
  ADD KEY `fk_pe_eid` (`eid_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `planificacion_eid`
--
ALTER TABLE `planificacion_eid`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `planificacion_eid`
--
ALTER TABLE `planificacion_eid`
  ADD CONSTRAINT `fk_pe_eid` FOREIGN KEY (`eid_id`) REFERENCES `EID` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `fk_pe_plan` FOREIGN KEY (`plan_id`) REFERENCES `planificacion_2026` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
