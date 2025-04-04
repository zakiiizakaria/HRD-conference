<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers to allow cross-origin requests and specify JSON response
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Database configuration for Hostinger
$host = "localhost";
$username = "u197368543_localhost";
$password = "Hrd_conference2025";
$database = "u197368543_hrd_db";

// Response array
$response = [
    'success' => false,
    'message' => '',
    'connection_test' => [],
    'server_info' => []
];

try {
    // Test 1: Try mysqli connection
    $response['connection_test']['mysqli'] = [];
    $mysqli = new mysqli($host, $username, $password, $database);
    
    if ($mysqli->connect_error) {
        $response['connection_test']['mysqli']['success'] = false;
        $response['connection_test']['mysqli']['error'] = "Connection failed: " . $mysqli->connect_error;
    } else {
        $response['connection_test']['mysqli']['success'] = true;
        $response['connection_test']['mysqli']['message'] = "Connected successfully using mysqli";
        $response['server_info']['mysqli'] = $mysqli->server_info;
        $mysqli->close();
    }
    
    // Test 2: Try PDO connection
    $response['connection_test']['pdo'] = [];
    try {
        $dsn = "mysql:host=$host;dbname=$database;charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $pdo = new PDO($dsn, $username, $password, $options);
        $response['connection_test']['pdo']['success'] = true;
        $response['connection_test']['pdo']['message'] = "Connected successfully using PDO";
        $response['server_info']['pdo'] = $pdo->getAttribute(PDO::ATTR_SERVER_VERSION);
        
        // Try to query the database to ensure connection is working
        $stmt = $pdo->query("SHOW TABLES");
        $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);
        $response['tables'] = $tables;
        
    } catch (PDOException $e) {
        $response['connection_test']['pdo']['success'] = false;
        $response['connection_test']['pdo']['error'] = "Connection failed: " . $e->getMessage();
    }
    
    // Set overall success based on both tests
    $response['success'] = 
        $response['connection_test']['mysqli']['success'] || 
        $response['connection_test']['pdo']['success'];
    
    if ($response['success']) {
        $response['message'] = "Database connection successful";
    } else {
        $response['message'] = "All connection methods failed";
    }
    
} catch (Exception $e) {
    $response['success'] = false;
    $response['message'] = "Error: " . $e->getMessage();
}

// Return JSON response
echo json_encode($response, JSON_PRETTY_PRINT);
