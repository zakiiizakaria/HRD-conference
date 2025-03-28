<?php
// Define constants
define('CONTENT_TYPE_JSON', 'Content-Type: application/json');

// Database configuration
$host = "localhost"; // Database host (usually localhost for XAMPP)
$username = "root";  // Default XAMPP username
$password = "";      // Default XAMPP password (empty)
$database = "hrd-conference"; // Your database name

// Create database connection
try {
    // Using PDO for better security
    $dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    
    // In a production environment, you should use a more secure password
    // and store credentials in environment variables or a separate config file
    // that is not accessible from the web
    $pdo = new PDO($dsn, $username, $password, $options);
    
    // If we get here, connection is successful
    $response = [
        'status' => 'success',
        'message' => 'Database connection successful!'
    ];
} catch (Exception $e) {
    // Log the error instead of exposing it
    error_log("Database error: " . $e->getMessage());
    $response = [
        'status' => 'error',
        'message' => 'Database connection failed. Please check your database configuration.'
    ];
}

// Return JSON response
header(CONTENT_TYPE_JSON);
echo json_encode($response);
?>
