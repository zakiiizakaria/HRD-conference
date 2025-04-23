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

// Define log file paths
$logDir = __DIR__ . '/logs';
$clientErrorLog = $logDir . '/client_errors.log';

// Create logs directory if it doesn't exist
if (!file_exists($logDir)) {
    mkdir($logDir, 0755, true);
}

// Set error log path
ini_set('error_log', $clientErrorLog);

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
        
        // Make sure log directory exists and is writable
        if (!file_exists($logDir)) {
            mkdir($logDir, 0755, true);
        }
        
        // Log the error
        error_log($logMessage);
        
        // Also write directly to file as a backup method
        file_put_contents($clientErrorLog, $logMessage . PHP_EOL, FILE_APPEND);
        
        // Log request details for debugging
        $requestDetails = "\nRequest Details:\n";
        $requestDetails .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
        $requestDetails .= "User Agent: " . ($_SERVER['HTTP_USER_AGENT'] ?? 'unknown') . "\n";
        $requestDetails .= "Referer: " . ($_SERVER['HTTP_REFERER'] ?? 'unknown') . "\n";
        $requestDetails .= "Request Method: " . $_SERVER['REQUEST_METHOD'] . "\n";
        $requestDetails .= "Request Time: " . date(TIMESTAMP_FORMAT) . "\n";
        
        file_put_contents($clientErrorLog, $requestDetails, FILE_APPEND);
        
        $response['success'] = true;
        $response['message'] = 'Error logged successfully';
        
    } catch (Exception $e) {
        $response['message'] = 'Error logging failed: ' . $e->getMessage();
        
        // Ensure we capture logging failures even if error_log fails
        $errorMsg = "[" . date(TIMESTAMP_FORMAT) . "] Error logging failed: " . $e->getMessage();
        error_log($errorMsg);
        
        // Direct file write as backup
        if (file_exists($logDir) || mkdir($logDir, 0755, true)) {
            file_put_contents($logDir . '/logging_errors.log', $errorMsg . PHP_EOL, FILE_APPEND);
        }
    }
} else {
    $response['message'] = 'Invalid request method';
}

// Return JSON response
echo json_encode($response);
