-- phpMyAdmin SQL Dump
-- version 5.2.2
-- https://www.phpmyadmin.net/
--
-- Servidor: localhost:3306
-- Tiempo de generación: 11-05-2026 a las 10:24:21
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
-- Estructura de tabla para la tabla `EID`
--

CREATE TABLE `EID` (
  `id` int(11) NOT NULL,
  `dimension` varchar(150) NOT NULL,
  `sub_dimension` varchar(255) NOT NULL,
  `numero_estandar` varchar(20) NOT NULL,
  `descripcion_estandar` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `EID`
--

INSERT INTO `EID` (`id`, `dimension`, `sub_dimension`, `numero_estandar`, `descripcion_estandar`) VALUES
(1, 'Liderazgo', 'Liderazgo del sostenedor', '1.1', 'El sostenedor se responsabiliza por el desarrollo del Proyecto Educativo Institucional, el desempeño y el cumplimiento de la normativa vigente de los establecimientos a su cargo.'),
(2, 'Liderazgo', 'Liderazgo del sostenedor', '1.2', 'El sostenedor define formalmente las funciones que asumirá centralizadamente y aquellas que delegará a los equipos directivos de los establecimientos a su cargo, y cumple con sus compromisos.'),
(3, 'Liderazgo', 'Liderazgo del sostenedor', '1.3', 'El sostenedor comunica altas expectativas a los directores de los establecimientos a su cargo, les establece metas desafiantes, clarifica sus atribuciones y evalúa su desempeño.'),
(4, 'Liderazgo', 'Liderazgo del sostenedor', '1.4', 'El sostenedor introduce, de manera oportuna, los cambios estructurales necesarios para asegurar la viabilidad y buen funcionamiento de los establecimientos a su cargo.'),
(5, 'Liderazgo', 'Liderazgo del sostenedor', '1.5', 'El sostenedor genera canales fluidos de comunicación con los directores y las comunidades educativas de los establecimientos a su cargo, y con las instituciones del Estado pertinentes.'),
(6, 'Liderazgo', 'Liderazgo del sostenedor', '1.6', 'El sostenedor se asegura de que los establecimientos a su cargo funcionen en red, y en el caso de tener solo un centro educativo bajo su responsabilidad, procura establecer alianzas con establecimientos similares.'),
(7, 'Liderazgo', 'Liderazgo del director', '2.1', 'El director centra su gestión en el logro de los objetivos académicos y formativos del establecimiento, y se responsabiliza por sus resultados.'),
(8, 'Liderazgo', 'Liderazgo del director', '2.2', 'El director conduce de manera efectiva el funcionamiento general del establecimiento.'),
(9, 'Liderazgo', 'Liderazgo del director', '2.3', 'El director instaura una cultura de altas expectativas y moviliza a la comunidad educativa hacia la mejora continua.'),
(10, 'Liderazgo', 'Liderazgo del director', '2.4', 'El director instaura en el personal una cultura de compromiso y colaboración con la tarea educativa.'),
(11, 'Liderazgo', 'Liderazgo del director', '2.5', 'El director instaura un ambiente cultural y académicamente estimulante.'),
(12, 'Liderazgo', 'Planificación y gestión de resultados', '3.1', 'El director elabora un plan de mejoramiento de acuerdo con el Proyecto Educativo Institucional.'),
(13, 'Liderazgo', 'Planificación y gestión de resultados', '3.2', 'El director monitorea la implementación del plan de mejoramiento, evalúa el cumplimiento de las metas y realiza adecuaciones cuando corresponde.'),
(14, 'Liderazgo', 'Planificación y gestión de resultados', '3.3', 'El director y el equipo directivo sistematizan continuamente los datos relevantes de la gestión escolar y los utilizan para tomar decisiones.'),
(15, 'Gestión pedagógica', 'Gestión curricular', '4.1', 'El director y el equipo técnico-pedagógico coordinan la implementación efectiva de las Bases Curriculares y los programas de estudio'),
(16, 'Gestión pedagógica', 'Gestión curricular', '4.2', 'El director y el equipo técnico-pedagógico acuerdan con los docentes lineamientos pedagógicos comunes para la implementación efectiva del currículum.'),
(17, 'Gestión pedagógica', 'Gestión curricular', '4.3', 'El equipo directivo gestiona la elaboración de planificaciones que contribuyen a la conducción efectiva de los procesos de enseñanza-aprendizaje.'),
(18, 'Gestión pedagógica', 'Gestión curricular', '4.4', 'El equipo directivo y el técnico-pedagógico acompañan a los docentes mediante la observación y retroalimentación de clases.'),
(19, 'Gestión pedagógica', 'Gestión curricular', '4.5', 'El director y el equipo técnico-pedagógico coordinan un proceso efectivo de evaluación y monitoreo de los aprendizajes para la toma de decisiones pedagógicas.'),
(20, 'Gestión pedagógica', 'Enseñanza y aprendizaje en el aula', '5.1', 'Los docentes centran sus clases en los Objetivos de Aprendizaje estipulados en las Bases Curriculares, con un manejo riguroso de las habilidades, contenidos y actitudes a desarrollar.'),
(21, 'Gestión pedagógica', 'Enseñanza y aprendizaje en el aula', '5.2', 'Los docentes usan estrategias efectivas de enseñanza-aprendizaje para el logro de los Objetivos de Aprendizaje.'),
(22, 'Gestión pedagógica', 'Enseñanza y aprendizaje en el aula', '5.3', 'Los docentes establecen vínculos pedagógicos positivos con todos sus estudiantes y generan motivación por la asignatura.'),
(23, 'Gestión pedagógica', 'Enseñanza y aprendizaje en el aula', '5.4', 'Los docentes monitorean el aprendizaje de sus estudiantes y les entregan retroalimentación constante durante las clases.'),
(24, 'Gestión pedagógica', 'Enseñanza y aprendizaje en el aula', '5.5', 'Los docentes se aseguran de que todos sus estudiantes trabajen en clases y promueven el estudio independiente y la responsabilidad.'),
(25, 'Gestión pedagógica', 'Enseñanza y aprendizaje en el aula', '5.6', 'Los docentes hacen uso efectivo del tiempo de clases para que este se destine al proceso de enseñanza-aprendizaje.'),
(26, 'Gestión pedagógica', 'Apoyo al desarrollo de los estudiantes', '6.1', 'El equipo técnico-pedagógico y los docentes identifican tempranamente a los estudiantes que presentan vacíos de aprendizaje o necesidades educativas especiales, y articulan los apoyos necesarios.'),
(27, 'Gestión pedagógica', 'Apoyo al desarrollo de los estudiantes', '6.2', 'El equipo directivo, en conjunto con los docentes, implementan estrategias efectivas para potenciar a los estudiantes con intereses diversos y habilidades destacadas.'),
(28, 'Gestión pedagógica', 'Apoyo al desarrollo de los estudiantes', '6.3', 'El equipo directivo y los docentes identifican a tiempo a los estudiantes que presentan dificultades sociales, afectivas y conductuales, e implementan medidas efectivas para apoyarlos.'),
(29, 'Gestión pedagógica', 'Apoyo al desarrollo de los estudiantes', '6.4', 'El equipo directivo y los docentes implementan estrategias efectivas para evitar la deserción escolar.'),
(30, 'Gestión pedagógica', 'Apoyo al desarrollo de los estudiantes', '6.5', 'El equipo directivo y el técnico-pedagógico incorporan un enfoque inclusivo e intercultural para asegurar el desarrollo de los estudiantes de distintas culturas.'),
(31, 'Formación y convivencia', 'Formación', '7.1', 'El equipo directivo planifica, implementa y monitorea programas e iniciativas para la formación integral de sus estudiantes de acuerdo con el Proyecto Educativo Institucional.'),
(32, 'Formación y convivencia', 'Formación', '7.2', 'El profesor jefe acompaña activamente a los estudiantes de su curso y los orienta formativa y académicamente.'),
(33, 'Formación y convivencia', 'Formación', '7.3', 'El equipo directivo y los docentes transmiten altas expectativas a los estudiantes, y los orientan y apoyan en la toma de decisiones sobre su futuro.'),
(34, 'Formación y convivencia', 'Formación', '7.4', 'El equipo directivo y los docentes promueven hábitos de vida saludable y conductas de autocuidado entre los estudiantes.'),
(35, 'Formación y convivencia', 'Formación', '7.5', 'El equipo directivo y los profesores jefe promueven de manera activa que las familias y los apoderados se involucren y participen en el proceso educativo de los estudiantes.'),
(36, 'Formación y convivencia', 'Convivencia', '8.1', 'El equipo directivo y los docentes promueven, modelan y aseguran un ambiente de amabilidad y respeto entre todos los miembros de la comunidad educativa'),
(37, 'Formación y convivencia', 'Convivencia', '8.2', 'El equipo directivo y los docentes valoran y promueven la diversidad, incluyendo la equidad de género, como parte de la riqueza de los grupos humanos, y previenen cualquier tipo de discriminación.'),
(38, 'Formación y convivencia', 'Convivencia', '8.3', 'El equipo directivo difunde y exige el cumplimiento del Reglamento de Convivencia, que explicita las normas para organizar la vida en común.'),
(39, 'Formación y convivencia', 'Convivencia', '8.4', 'El equipo directivo y los docentes acuerdan reglas y procedimientos para facilitar el desarrollo de las actividades pedagógicas.'),
(40, 'Formación y convivencia', 'Convivencia', '8.5', 'El personal del establecimiento resguarda la integridad física y psicológica de todos los estudiantes durante la jornada escolar.'),
(41, 'Formación y convivencia', 'Convivencia', '8.6', 'El equipo directivo y los docentes abordan decididamente las conductas que atentan contra la sana convivencia dentro del establecimiento'),
(42, 'Formación y convivencia', 'Participación y vida democrática', '9.1', 'El equipo directivo y los docentes promueven el sentido de pertenencia y participación en torno al Proyecto Educativo Institucional.'),
(43, 'Formación y convivencia', 'Participación y vida democrática', '9.2', 'El personal del establecimiento promueve entre los estudiantes un sentido de responsabilidad con la sociedad y el medio ambiente, y los motivan a realizar aportes concretos.'),
(44, 'Formación y convivencia', 'Participación y vida democrática', '9.3', 'El equipo directivo y los docentes fomentan entre los estudiantes la expresión de opiniones, la deliberación y el debate fundamentado de ideas.'),
(45, 'Formación y convivencia', 'Participación y vida democrática', '9.4', 'El equipo directivo promueve la formación democrática y ciudadana, y la participación activa de los estudiantes mediante el apoyo al Centro de Alumnos y a las directivas de curso.'),
(46, 'Formación y convivencia', 'Participación y vida democrática', '9.5', 'El equipo directivo promueve la participación activa de los distintos estamentos de la comunidad educativa para apoyar el desarrollo del Proyecto Educativo Institucional.'),
(47, 'Gestión de recursos', 'Gestión de personal', '10.1', 'El sostenedor o el equipo directivo organiza y maneja de manera efectiva los aspectos administrativos del personal.'),
(48, 'Gestión de recursos', 'Gestión de personal', '10.2', 'El sostenedor o el equipo directivo implementa estrategias efectivas para contar con personal idóneo y competente.'),
(49, 'Gestión de recursos', 'Gestión de personal', '10.3', 'El equipo directivo implementa un sistema de evaluación y retroalimentación del desempeño del personal.'),
(50, 'Gestión de recursos', 'Gestión de personal', '10.4', 'El sostenedor o el equipo directivo gestiona el desarrollo profesional y técnico del personal según las necesidades pedagógicas y administrativas del establecimiento.'),
(51, 'Gestión de recursos', 'Gestión de personal', '10.5', 'El sostenedor y el equipo directivo promueven un clima laboral positivo.'),
(52, 'Gestión de recursos', 'Gestión de recursos financieros', '11.1', 'El sostenedor o el equipo directivo gestiona la matrícula y la asistencia de los estudiantes.'),
(53, 'Gestión de recursos', 'Gestión de recursos financieros', '11.2', 'El sostenedor asegura la sustentabilidad del Proyecto Educativo Institucional de los establecimientos a su cargo, rigiéndose por un presupuesto, controlando los gastos y rindiendo cuenta del uso de los recursos.'),
(54, 'Gestión de recursos', 'Gestión de recursos financieros', '11.3', 'El sostenedor y el equipo directivo se aseguran de cumplir con la normativa vigente.'),
(55, 'Gestión de recursos', 'Gestión de recursos financieros', '11.4', 'El sostenedor y el equipo directivo conocen las redes, programas de apoyo y asistencia técnica disponibles, y los usan para potenciar su Proyecto Educativo Institucional..'),
(56, 'Gestión de recursos', 'Gestión de recursos educativos', '12.1', 'El sostenedor y el equipo directivo se aseguran de mantener la infraestructura y el equipamiento en buen estado para desarrollar la labor educativa'),
(57, 'Gestión de recursos', 'Gestión de recursos educativos', '12.2', 'El sostenedor y el equipo directivo se aseguran de contar con los recursos didácticos y promueven su uso para potenciar el aprendizaje de los estudiantes.'),
(58, 'Gestión de recursos', 'Gestión de recursos educativos', '12.3', 'El sostenedor y el equipo directivo se aseguran de contar con una biblioteca escolar CRA para apoyar el aprendizaje de los estudiantes y fomentar el hábito lector.');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `EID`
--
ALTER TABLE `EID`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `EID`
--
ALTER TABLE `EID`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=59;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
