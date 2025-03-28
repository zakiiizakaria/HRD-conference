<?php
// Include database configuration
require_once __DIR__ . '/assets/php/config.php';

// Define SQL statements to create tables
$tables = [
    'sponsorship_form' => "CREATE TABLE IF NOT EXISTS `sponsorship_form` (
        `id` VARCHAR(36) NOT NULL PRIMARY KEY,
        `full_name` VARCHAR(100) NOT NULL,
        `email_address` VARCHAR(100) NOT NULL,
        `company_name` VARCHAR(100) NOT NULL,
        `job_title` VARCHAR(100) NOT NULL,
        `contact_number` VARCHAR(20) NOT NULL,
        `interest` VARCHAR(100) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    
    'speaker_form' => "CREATE TABLE IF NOT EXISTS `speaker_form` (
        `id` VARCHAR(36) NOT NULL PRIMARY KEY,
        `full_name` VARCHAR(100) NOT NULL,
        `email_address` VARCHAR(100) NOT NULL,
        `company_name` VARCHAR(100) NOT NULL,
        `job_title` VARCHAR(100) NOT NULL,
        `contact_number` VARCHAR(20) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
    
    'registration_form' => "CREATE TABLE IF NOT EXISTS `registration_form` (
        `id` VARCHAR(36) NOT NULL PRIMARY KEY,
        `full_name` VARCHAR(100) NOT NULL,
        `email_address` VARCHAR(100) NOT NULL,
        `company_name` VARCHAR(100) NOT NULL,
        `job_title` VARCHAR(100) NOT NULL,
        `contact_number` VARCHAR(20) NOT NULL,
        `promo_code` VARCHAR(50),
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
];

// Create tables
$results = [];
try {
    foreach ($tables as $table_name => $sql) {
        if ($pdo->exec($sql) !== false) {
            $results[$table_name] = "Table created or already exists";
        } else {
            $results[$table_name] = "Error creating table";
        }
    }
    $success = true;
    $message = "Tables created successfully";
} catch (Exception $e) {
    $success = false;
    $message = "Error: " . $e->getMessage();
}

// Output results
header(CONTENT_TYPE_JSON);
echo json_encode([
    'success' => $success,
    'message' => $message,
    'results' => $results
]);
?>
