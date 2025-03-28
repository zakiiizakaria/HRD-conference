<?php
// Prevent any errors or warnings from being displayed in the output
error_reporting(0);
ini_set('display_errors', 0);

// Set headers to allow cross-origin requests and specify JSON response
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');

// Simple test response
echo json_encode([
    'success' => true,
    'message' => 'PHP is working correctly',
    'timestamp' => date('Y-m-d H:i:s')
]);
?>
