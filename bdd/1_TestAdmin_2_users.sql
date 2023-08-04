-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : mysqldb:3306
-- Généré le : ven. 04 août 2023 à 06:33
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
-- AUTO_INCREMENT pour la table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=103;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
