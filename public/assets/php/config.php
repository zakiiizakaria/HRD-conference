<?php
// Define constants
define('CONTENT_TYPE_JSON', 'Content-Type: application/json');
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', ''); // In production, use a secure password
define('DB_NAME', 'hrd-conference');

// Create database connection with error handling and security measures
try {
    // Using PDO for better security
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
    // For backward compatibility with mysqli code
    $conn = new mysqli(DB_HOST, DB_USER, DB_PASS, DB_NAME);
    
    // Check connection
    if ($conn->connect_error) {
        throw new Exception("Connection failed: " . $conn->connect_error);
    }
    // Connection successful, but don't output anything to avoid affecting JSON responses
} catch (Exception $e) {
    // Log the error instead of exposing it
    error_log("Database connection error: " . $e->getMessage());
    die("A database error occurred. Please try again later or contact the administrator.");
}
?>
