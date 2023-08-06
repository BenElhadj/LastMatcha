-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : mysqldb:3306
-- Généré le : sam. 05 août 2023 à 13:11
-- Version du serveur : 5.7.42
-- Version de PHP : 8.2.8
SET
  SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";

START TRANSACTION;

SET
  time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;

/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;

/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;

/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `matcha`
--
-- --------------------------------------------------------
--
-- Structure de la table `tags`
--
CREATE TABLE
  `tags` (
    `id` int (11) NOT NULL,
    `value` varchar(100) NOT NULL
  ) ENGINE = InnoDB DEFAULT CHARSET = latin1;

--
-- Déchargement des données de la table `tags`
--
INSERT INTO
  `tags` (`id`, `value`)
VALUES
  (1, '42'),
  (2, '125'),
  (3, 'RNCP-5'),
  (4, 'RNCP-7'),
  (5, 'Web'),
  (6, 'Front-end'),
  (7, 'Back-end'),
  (8, 'sports'),
  (9, 'cinema'),
  (10, 'music');

--
-- Index pour les tables déchargées
--
--
-- Index pour la table `tags`
--
ALTER TABLE `tags` ADD PRIMARY KEY (`id`),
ADD UNIQUE KEY `value` (`value`);

--
-- AUTO_INCREMENT pour les tables déchargées
--
--
-- AUTO_INCREMENT pour la table `tags`
--
ALTER TABLE `tags` MODIFY `id` int (11) NOT NULL AUTO_INCREMENT,
AUTO_INCREMENT = 11;

COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;

/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;

/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;