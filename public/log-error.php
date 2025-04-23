<?php
/**
 * Client-side Error Logger
 * Logs JavaScript errors to a server-side log file
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Set up logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/client_errors.log');

// Define timestamp format constant
define('TIMESTAMP_FORMAT', 'Y-m-d H:i:s');

// Get the requesting origin
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';

// Set headers to handle AJAX requests and CORS
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Response array
$response = [
    'success' => false,
    'message' => ''
];

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Get error data from request
        $errorData = json_decode(file_get_contents('php://input'), true);
        
        if (!$errorData) {
            throw new Exception('No error data provided');
        }
        
        // Format error message
        $formType = $errorData['formType'] ?? 'unknown';
        $errorType = $errorData['errorType'] ?? 'unknown';
        $errorMessage = $errorData['errorMessage'] ?? 'No message';
        $userAgent = $errorData['userAgent'] ?? 'unknown';
        $online = $errorData['online'] ? 'yes' : 'no';
        
        $logMessage = "[" . date(TIMESTAMP_FORMAT) . "] Form: $formType, Error: $errorType - $errorMessage, ";
        $logMessage .= "UserAgent: $userAgent, Online: $online, IP: " . $_SERVER['REMOTE_ADDR'];
        
        // Log the error
        error_log($logMessage);
        
        $response['success'] = true;
        $response['message'] = 'Error logged successfully';
        
    } catch (Exception $e) {
        $response['message'] = 'Error logging failed: ' . $e->getMessage();
        error_log("[" . date(TIMESTAMP_FORMAT) . "] Error logging failed: " . $e->getMessage());
    }
} else {
    $response['message'] = 'Invalid request method';
}

// Return JSON response
echo json_encode($response);
