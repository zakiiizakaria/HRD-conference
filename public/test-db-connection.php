<?php
// Prevent any errors or warnings from being displayed in the output
error_reporting(0);
ini_set('display_errors', 0);

// Set headers to allow cross-origin requests and specify JSON response
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Database configuration
$host = "localhost";
$username = "root";
$password = "";
$database = "hrd-conference";

try {
    // Try to connect to the server first without specifying a database
    $serverConn = new mysqli($host, $username, $password);
    
    // Check if server connection is successful
    if ($serverConn->connect_error) {
        throw new Exception("Server connection failed: " . $serverConn->connect_error);
    }
    
    // Check if database exists
    $result = $serverConn->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$database'");
    
    if ($result && $result->num_rows == 0) {
        // Database doesn't exist, create it
        $createDb = $serverConn->query("CREATE DATABASE IF NOT EXISTS `$database`");
        if (!$createDb) {
            throw new Exception("Failed to create database: " . $serverConn->error);
        }
        $dbCreated = true;
    } else {
        $dbCreated = false;
    }
    
    // Now connect to the specific database
    $conn = new mysqli($host, $username, $password, $database);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    
    // Create tables if they don't exist
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
    
    // Create tables and check if they exist
    $tableStatus = [];
    foreach ($tables as $table => $sql) {
        // Create table if it doesn't exist
        $conn->query($sql);
        
        // Check if table exists
        $result = $conn->query("SHOW TABLES LIKE '$table'");
        $tableStatus[$table] = ($result && $result->num_rows > 0);
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Database connection successful',
        'server' => $host,
        'database' => $database,
        'database_created' => $dbCreated,
        'tables' => $tableStatus,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
    
} catch (Exception $e) {
    // Return error response
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage(),
        'server' => $host,
        'database' => $database,
        'timestamp' => date('Y-m-d H:i:s')
    ]);
}
?>
