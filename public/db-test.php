<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers for JSON response
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Database configuration
$host = "localhost";
$username = "u197368543_hrd";
$password = "7rR/bOAyE";
$database = "u197368543_hrd_db";

// Test database connection
try {
    // Connect to database
    $conn = new mysqli($host, $username, $password, $database);
    
    // Check connection
    if ($conn->connect_error) {
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed: ' . $conn->connect_error,
            'host' => $host,
            'username' => $username,
            'database' => $database
        ]);
        exit;
    }
    
    // Try to create a test table
    $testTableSql = "CREATE TABLE IF NOT EXISTS `test_table` (
        `id` INT AUTO_INCREMENT PRIMARY KEY,
        `test_data` VARCHAR(100) NOT NULL,
        `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )";
    
    if (!$conn->query($testTableSql)) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to create test table: ' . $conn->error,
            'sql' => $testTableSql
        ]);
        exit;
    }
    
    // Try to insert test data
    $testData = "Test data " . date('Y-m-d H:i:s');
    $insertSql = "INSERT INTO test_table (test_data) VALUES (?)";
    $stmt = $conn->prepare($insertSql);
    
    if (!$stmt) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to prepare statement: ' . $conn->error,
            'sql' => $insertSql
        ]);
        exit;
    }
    
    $stmt->bind_param("s", $testData);
    
    if (!$stmt->execute()) {
        echo json_encode([
            'success' => false,
            'message' => 'Failed to insert test data: ' . $stmt->error
        ]);
        exit;
    }
    
    // Success!
    echo json_encode([
        'success' => true,
        'message' => 'Database connection and operations successful!',
        'inserted_data' => $testData,
        'host' => $host,
        'username' => $username,
        'database' => $database
    ]);
    
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Exception: ' . $e->getMessage()
    ]);
}
?>
