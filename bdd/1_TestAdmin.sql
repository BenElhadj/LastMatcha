-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : mysqldb:3306
-- Généré le : ven. 04 août 2023 à 06:32
-- Version du serveur : 5.7.42
-- Version de PHP : 8.2.8

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `matcha`
--

DELIMITER $$
--
-- Procédures
--
CREATE DEFINER=`root`@`localhost` PROCEDURE `CALC_RATING` (OUT `visites` INT, OUT `likes` INT, OUT `reported` INT, IN `id_user` INT)  SQL SECURITY INVOKER COMMENT 'Calculate the user''s rating' BEGIN
        SELECT COUNT(*)
        INTO likes
        FROM matcha.matches
        WHERE matched = id_user;
        SELECT COUNT(*)
        INTO visites
        FROM matcha.history
        WHERE visited = id_user;
        SELECT reports
        INTO reported
        FROM matcha.users
        WHERE id = id_user;
    END$$

--
-- Fonctions
--
CREATE DEFINER=`root`@`localhost` FUNCTION `GET_RATING` (`id_user` INT) RETURNS DOUBLE DETERMINISTIC BEGIN
DECLARE likes, visites, reported INT;
CALL `CALC_RATING`(visites, likes, reported, id_user);
RETURN(likes / 20 + visites / 100 - reported / 250);
END$$

DELIMITER ;

-- --------------------------------------------------------

--
-- Structure de la table `blocked`
--

CREATE TABLE `blocked` (
  `id` int(11) NOT NULL,
  `blocker` int(11) NOT NULL,
  `blocked` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

-- --------------------------------------------------------

--
-- Structure de la table `chat`
--

CREATE TABLE `chat` (
  `id` int(11) NOT NULL,
  `id_conversation` int(11) NOT NULL,
  `id_from` int(11) NOT NULL,
  `message` varchar(2048) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) NOT NULL DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=utf8;

--
-- Déchargement des données de la table `chat`
--

INSERT INTO `chat` (`id`, `id_conversation`, `id_from`, `message`, `created_at`, `is_read`) VALUES
(1, 1, 1, 'bonjour', '2023-08-03 16:20:01', 1),
(2, 1, 5, 'bonjour', '2023-08-03 16:20:46', 0),
(3, 3, 1, 'bonjours', '2023-08-04 01:33:32', 0),
(4, 4, 2, 'salut', '2023-08-04 01:35:25', 0);

-- --------------------------------------------------------

--
-- Structure de la table `conversations`
--

CREATE TABLE `conversations` (
  `id_conversation` int(11) NOT NULL,
  `id_user1` int(11) NOT NULL,
  `id_user2` int(11) NOT NULL,
  `last_update` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `allowed` tinyint(1) NOT NULL DEFAULT '1',
  `last_msg` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `conversations`
--

INSERT INTO `conversations` (`id_conversation`, `id_user1`, `id_user2`, `last_update`, `allowed`, `last_msg`) VALUES
(1, 1, 5, '2023-08-03 16:20:46', 0, NULL),
(2, 5, 1, '2023-08-03 16:22:58', 1, NULL),
(3, 1, 12, '2023-08-04 01:33:32', 1, NULL),
(4, 2, 1, '2023-08-04 01:35:25', 1, NULL);

-- --------------------------------------------------------

--
-- Structure de la table `history`
--

CREATE TABLE `history` (
  `id` int(11) NOT NULL,
  `visitor` int(11) NOT NULL,
  `visited` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `history`
--

INSERT INTO `history` (`id`, `visitor`, `visited`, `created_at`) VALUES
(1, 1, 67, '2023-08-02 01:59:53'),
(2, 1, 61, '2023-08-03 02:18:46'),
(3, 1, 61, '2023-08-03 02:25:00'),
(4, 1, 74, '2023-08-03 04:05:02'),
(5, 1, 74, '2023-08-03 04:05:33'),
(6, 4, 94, '2023-08-03 15:48:10'),
(7, 1, 61, '2023-08-03 15:50:31'),
(8, 5, 1, '2023-08-03 16:18:52'),
(9, 1, 5, '2023-08-03 16:19:37'),
(10, 1, 5, '2023-08-03 16:21:46'),
(11, 1, 5, '2023-08-03 16:22:06'),
(12, 1, 5, '2023-08-03 16:22:11'),
(13, 1, 5, '2023-08-03 16:22:17'),
(14, 5, 1, '2023-08-03 16:22:56'),
(15, 5, 1, '2023-08-04 01:09:51'),
(16, 1, 59, '2023-08-04 01:12:21'),
(17, 12, 1, '2023-08-04 01:31:34'),
(18, 1, 12, '2023-08-04 01:33:20'),
(19, 1, 2, '2023-08-04 01:34:37'),
(20, 2, 1, '2023-08-04 01:35:08'),
(21, 2, 1, '2023-08-04 03:31:54');

-- --------------------------------------------------------

--
-- Structure de la table `images`
--

CREATE TABLE `images` (
  `id` int(11) NOT NULL,
  `user_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `profile` tinyint(1) NOT NULL DEFAULT '0',
  `cover` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `images`
--

INSERT INTO `images` (`id`, `user_id`, `name`, `profile`, `cover`, `created_at`) VALUES
(7904, 2, 'https://picsum.photos/200/300?random=5', 0, 0, '2022-08-25 00:39:59'),
(8306, 2, 'https://picsum.photos/200/300?random=7', 0, 0, '2022-08-16 12:15:43'),
(8701, 2, '2-ff8f42946a042ecc7669.png', 0, 1, '2023-08-04 04:16:39'),
(8702, 2, '2-9b6d684f04448dad3048.png', 1, 0, '2023-08-04 04:17:00'),
(8703, 1, '1-272bde9498ecd678e39a.png', 0, 0, '2023-08-04 04:18:12'),
(8705, 1, '1-601e5d26148bfc6b0bae.png', 0, 1, '2023-08-04 04:18:38'),
(8706, 1, '1-f5dc4b563cff46483ef5.png', 1, 0, '2023-08-04 04:19:22');

-- --------------------------------------------------------

--
-- Structure de la table `matches`
--

CREATE TABLE `matches` (
  `id` int(11) NOT NULL,
  `matcher` int(11) NOT NULL,
  `matched` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `matches`
--

INSERT INTO `matches` (`id`, `matcher`, `matched`, `created_at`) VALUES
(2, 1, 61, '2023-08-03 15:50:33'),
(5, 1, 5, '2023-08-03 16:21:48'),
(6, 5, 1, '2023-08-03 16:22:58'),
(7, 1, 59, '2023-08-04 01:12:23'),
(8, 12, 1, '2023-08-04 01:31:39'),
(9, 1, 12, '2023-08-04 01:33:23'),
(10, 1, 2, '2023-08-04 01:34:39'),
(11, 2, 1, '2023-08-04 01:35:10');

-- --------------------------------------------------------

--
-- Structure de la table `notifications`
--

CREATE TABLE `notifications` (
  `id` int(11) NOT NULL,
  `type` varchar(20) NOT NULL,
  `id_from` int(11) NOT NULL,
  `id_to` int(11) NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `is_read` tinyint(1) NOT NULL DEFAULT '0',
  `id_conversation` int(11) NOT NULL DEFAULT '-1'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `notifications`
--

INSERT INTO `notifications` (`id`, `type`, `id_from`, `id_to`, `created_at`, `is_read`, `id_conversation`) VALUES
(1, 'visit', 1, 67, '2023-08-02 01:59:53', 0, -1),
(2, 'visit', 1, 61, '2023-08-03 02:18:46', 0, -1),
(3, 'visit', 1, 61, '2023-08-03 02:25:00', 0, -1),
(4, 'visit', 1, 74, '2023-08-03 04:05:02', 0, -1),
(5, 'visit', 1, 74, '2023-08-03 04:05:33', 0, -1),
(6, 'like', 1, 74, '2023-08-03 04:05:36', 0, -1),
(7, 'unlike', 1, 74, '2023-08-03 04:05:37', 0, -1),
(8, 'visit', 4, 94, '2023-08-03 15:48:10', 0, -1),
(9, 'visit', 1, 61, '2023-08-03 15:50:31', 0, -1),
(10, 'like', 1, 61, '2023-08-03 15:50:33', 0, -1),
(11, 'visit', 5, 1, '2023-08-03 16:18:52', 1, -1),
(12, 'like', 5, 1, '2023-08-03 16:18:54', 1, -1),
(13, 'visit', 1, 5, '2023-08-03 16:19:37', 1, -1),
(14, 'like_back', 1, 5, '2023-08-03 16:19:40', 1, -1),
(15, 'visit', 1, 5, '2023-08-03 16:21:46', 1, -1),
(16, 'unlike', 1, 5, '2023-08-03 16:21:48', 1, -1),
(17, 'like', 1, 5, '2023-08-03 16:21:48', 1, -1),
(18, 'visit', 1, 5, '2023-08-03 16:22:06', 1, -1),
(19, 'visit', 1, 5, '2023-08-03 16:22:11', 1, -1),
(20, 'visit', 1, 5, '2023-08-03 16:22:17', 1, -1),
(21, 'visit', 5, 1, '2023-08-03 16:22:56', 1, -1),
(22, 'like_back', 5, 1, '2023-08-03 16:22:58', 1, -1),
(23, 'visit', 5, 1, '2023-08-04 01:09:51', 1, -1),
(24, 'visit', 1, 59, '2023-08-04 01:12:21', 0, -1),
(25, 'like', 1, 59, '2023-08-04 01:12:23', 0, -1),
(26, 'visit', 12, 1, '2023-08-04 01:31:34', 1, -1),
(27, 'like', 12, 1, '2023-08-04 01:31:39', 1, -1),
(28, 'visit', 1, 12, '2023-08-04 01:33:20', 0, -1),
(29, 'like_back', 1, 12, '2023-08-04 01:33:23', 0, -1),
(30, 'visit', 1, 2, '2023-08-04 01:34:37', 1, -1),
(31, 'like', 1, 2, '2023-08-04 01:34:39', 1, -1),
(32, 'visit', 2, 1, '2023-08-04 01:35:08', 0, -1),
(33, 'like_back', 2, 1, '2023-08-04 01:35:10', 0, -1),
(34, 'visit', 2, 1, '2023-08-04 03:31:54', 0, -1);

-- --------------------------------------------------------

--
-- Structure de la table `tags`
--

CREATE TABLE `tags` (
  `id` int(11) NOT NULL,
  `value` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `tags`
--

INSERT INTO `tags` (`id`, `value`) VALUES
(7, '-42'),
(8, '125'),
(1, '1337'),
(3, '42'),
(5, 'Football'),
(10, 'nodeJS'),
(2, 'PHP'),
(9, 'shooting_stars');

-- --------------------------------------------------------

--
-- Structure de la table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `first_name` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `last_name` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `username` varchar(25) CHARACTER SET utf8 NOT NULL,
  `email` varchar(255) CHARACTER SET utf8 NOT NULL,
  `password` varchar(255) NOT NULL DEFAULT '',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `gender` varchar(20) DEFAULT NULL,
  `looking` varchar(20) DEFAULT NULL,
  `birthdate` date DEFAULT NULL,
  `biography` varchar(510) CHARACTER SET utf8 DEFAULT NULL,
  `tags` varchar(550) CHARACTER SET utf8 DEFAULT NULL,
  `address` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `city` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `country` varchar(255) CHARACTER SET utf8 DEFAULT NULL,
  `postal_code` varchar(50) DEFAULT NULL,
  `phone` varchar(255) DEFAULT NULL,
  `status` datetime DEFAULT CURRENT_TIMESTAMP,
  `lat` varchar(30) NOT NULL DEFAULT '0',
  `lng` varchar(30) NOT NULL DEFAULT '0',
  `vkey` varchar(255) NOT NULL DEFAULT '',
  `rkey` varchar(255) DEFAULT NULL,
  `verified` tinyint(1) NOT NULL DEFAULT '0',
  `google_id` varchar(50) DEFAULT NULL,
  `reports` int(11) DEFAULT '0'
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

--
-- Déchargement des données de la table `users`
--

INSERT INTO `users` (`id`, `first_name`, `last_name`, `username`, `email`, `password`, `created_at`, `gender`, `looking`, `birthdate`, `biography`, `tags`, `address`, `city`, `country`, `postal_code`, `phone`, `status`, `lat`, `lng`, `vkey`, `rkey`, `verified`, `google_id`, `reports`) VALUES
(1, 'Test', 'Admin', 'AdminTest', 'AdminTest@gmail.com', '$2a$10$LG21UOau1qzQ9nCIWNq7iuAltnSsgoPCWHFl5H33PsBRqs0ghyUZK', '2023-07-07 03:09:20', 'female', 'both', '1990-04-09', 'je suis timide', 'musique,devloppement,sport', '5 Passage Bullourde', 'Paris', 'France', '75011', '0605868051', '2023-07-07 03:09:20', '48.841463', '2.3614006', 'a0e06538e2e0570769c4', NULL, 1, NULL, 0),
(2, 'Hamdi', 'ELHADJ', 'TestAdmin', 'belhadj.hamdi@gmail.com', '$2a$10$UdgzWKD3wKGQWMGK.UWdK.dM53o1wmq/XZGXD46ihtJRaMBOf5ZIa', '2023-07-07 03:10:08', 'male', 'both', '1985-02-05', 'je n ai rien a dire', 'sport,musique,devloppement', '107 rue de Charenton', 'Paris', 'France', '75012', '0605868051', '2023-07-07 03:10:08', '48.8414475', '2.3614038', 'e4bb422eaa17a7fac050', NULL, 1, NULL, 0);

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `blocked`
--
ALTER TABLE `blocked`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `chat`
--
ALTER TABLE `chat`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `conversations`
--
ALTER TABLE `conversations`
  ADD PRIMARY KEY (`id_conversation`);

--
-- Index pour la table `history`
--
ALTER TABLE `history`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `images`
--
ALTER TABLE `images`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `matches`
--
ALTER TABLE `matches`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `notifications`
--
ALTER TABLE `notifications`
  ADD PRIMARY KEY (`id`);

--
-- Index pour la table `tags`
--
ALTER TABLE `tags`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `value` (`value`);

--
-- Index pour la table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `blocked`
--
ALTER TABLE `blocked`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT pour la table `chat`
--
ALTER TABLE `chat`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `conversations`
--
ALTER TABLE `conversations`
  MODIFY `id_conversation` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT pour la table `history`
--
ALTER TABLE `history`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=22;

--
-- AUTO_INCREMENT pour la table `images`
--
ALTER TABLE `images`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8707;

--
-- AUTO_INCREMENT pour la table `matches`
--
ALTER TABLE `matches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=12;

--
-- AUTO_INCREMENT pour la table `notifications`
--
ALTER TABLE `notifications`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=35;

--
-- AUTO_INCREMENT pour la table `tags`
--
ALTER TABLE `tags`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
