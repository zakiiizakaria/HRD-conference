<?php
// This is a simplified version that just logs the request and returns success
// No database connection required

// Set headers
header('Content-Type: application/json');

// Log the request
$log_file = __DIR__ . '/form_log.txt';
$data = date('Y-m-d H:i:s') . " - Form submission received\n";
$data .= "POST data: " . print_r($_POST, true) . "\n";
$data .= "----------------------------------------\n";
file_put_contents($log_file, $data, FILE_APPEND);

// Return success response
echo json_encode([
    'success' => true,
    'message' => 'Form data received and logged successfully'
]);
?>
