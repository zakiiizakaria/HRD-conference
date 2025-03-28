-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS `hrd-conference`;

-- Use the database
USE `hrd-conference`;

-- Create registration_form table
CREATE TABLE IF NOT EXISTS `registration_form` (
  `id` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email_address` VARCHAR(255) NOT NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `job_title` VARCHAR(255) NOT NULL,
  `contact_number` VARCHAR(255) NOT NULL,
  `promo_code` VARCHAR(255),
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create speaker_form table
CREATE TABLE IF NOT EXISTS `speaker_form` (
  `id` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email_address` VARCHAR(255) NOT NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `job_title` VARCHAR(255) NOT NULL,
  `contact_number` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Create sponsorship_form table
CREATE TABLE IF NOT EXISTS `sponsorship_form` (
  `id` VARCHAR(255) NOT NULL,
  `full_name` VARCHAR(255) NOT NULL,
  `email_address` VARCHAR(255) NOT NULL,
  `company_name` VARCHAR(255) NOT NULL,
  `job_title` VARCHAR(255) NOT NULL,
  `contact_number` VARCHAR(255) NOT NULL,
  `interest` VARCHAR(255) NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
