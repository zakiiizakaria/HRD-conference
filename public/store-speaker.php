<?php
// Allow requests from the specific production origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    // Check if the origin is the specific production domain
    if ($_SERVER['HTTP_ORIGIN'] === 'https://hrdconference.com') {
        header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
        header('Access-Control-Allow-Credentials: true'); // Allow cookies if needed
        header('Access-Control-Max-Age: 86400'); // Cache preflight requests for 1 day
    }
    // You might add 'http://localhost' here for local testing if needed
    // elseif ($_SERVER['HTTP_ORIGIN'] === 'http://localhost') {
    //    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    //    // ... other headers ...
    // }
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD'])) {
        // Allow specific methods
        header("Access-Control-Allow-Methods: POST, OPTIONS");
    }
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS'])) {
        // Allow specific headers
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    }
    exit(0); // Exit after sending OPTIONS headers
}

// Make sure the content type is JSON even if there's an error later
header('Content-Type: application/json');

// --- TEMPORARY DEBUG LOGGING using error_log() ---
$logMessage = "[HRD_FORM_DEBUG] "; // Add a prefix to easily find the log entry
$logMessage .= "SCRIPT=store-speaker.php | ";
$logMessage .= "METHOD=" . $_SERVER['REQUEST_METHOD'] . " | ";
$logMessage .= "ORIGIN=" . (isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : 'N/A') . " | ";
$logMessage .= "IP=" . $_SERVER['REMOTE_ADDR'] . " | ";
$logMessage .= "USER_AGENT=" . (isset($_SERVER['HTTP_USER_AGENT']) ? $_SERVER['HTTP_USER_AGENT'] : 'N/A') . " | ";
$logMessage .= "POST_DATA=" . json_encode($_POST);
error_log($logMessage); // Use error_log() instead of file_put_contents
// --- END TEMPORARY DEBUG LOGGING ---


/**
 * Speaker Form Handler
 * Stores form submissions in the database and sends email notifications
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Enable custom error logging
ini_set('log_errors', 1);
ini_set('error_log', __DIR__ . '/form_errors.log');

// Define timestamp format constant
define('TIMESTAMP_FORMAT', 'Y-m-d H:i:s');

// Log form submission attempt
error_log("[" . date(TIMESTAMP_FORMAT) . "] Speaker form submission attempt from IP: " . $_SERVER['REMOTE_ADDR'] . ", User Agent: " . $_SERVER['HTTP_USER_AGENT']);

// Get the requesting origin
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';

// Set headers to handle AJAX requests and CORS - more permissive for international users
// header('Content-Type: application/json'); // Already set above
// header("Access-Control-Allow-Origin: $origin");
// header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
// header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
// header('Access-Control-Allow-Credentials: true');
// header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
// header('Pragma: no-cache');
// header('Expires: 0');

// Handle preflight OPTIONS request
// if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
//     http_response_code(200);
//     exit;
// }

// For testing purposes, let's use local database connection first
// Once it works locally, we can update to production credentials
$isLocalEnvironment = false; // Set to false when deploying to production

if ($isLocalEnvironment) {
    // Local XAMPP database connection parameters
    $host = "localhost";
    $db_name = "u197368543_hrd_db"; // Using the same database name for consistency
    $username = "root"; // XAMPP default username
    $password = ""; // XAMPP default password (empty)
} else {
    // Hostinger production database connection parameters
    $host = "localhost";
    $db_name = "u197368543_hrd_db";
    $username = "u197368543_localhost";
    $password = "Hrd_conference2025";
}

$charset = 'utf8mb4';

// Response array
$response = [
    'success' => false,
    'message' => '',
    'data' => null,
    'debug' => []
];

// Add debug info
$response['debug']['request_method'] = $_SERVER['REQUEST_METHOD'];
$response['debug']['post_data'] = $_POST;
$response['debug']['environment'] = $isLocalEnvironment ? 'local' : 'production';

// Include the mail helper
// Using require_once for the mail helper as it's not a proper namespace
// that can be imported with 'use' statements
require_once __DIR__ . '/includes/mail-helper.php';

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Create database connection
        $dsn = "mysql:host=$host;dbname=$db_name;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $response['debug']['connection_string'] = "Attempting to connect to: $host, database: $db_name, user: $username";
        
        $pdo = new PDO($dsn, $username, $password, $options);
        $response['debug']['connection'] = "Database connection successful";
        
        // Check if the speaker table exists, if not create it
        $pdo->exec("CREATE TABLE IF NOT EXISTS speaker_inquiries (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(100) NOT NULL,
            company VARCHAR(100) NOT NULL,
            job_title VARCHAR(100) NOT NULL,
            contact_number VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )");
        $response['debug']['table_creation'] = "Table check/creation completed";
        
        // Get form data
        $fullName = $_POST['fullName'] ?? '';
        $email = $_POST['email'] ?? '';
        $company = $_POST['company'] ?? '';
        $jobTitle = $_POST['jobTitle'] ?? '';
        $contactNumber = $_POST['contactNumber'] ?? '';
        
        $response['debug']['form_data'] = [
            'fullName' => $fullName,
            'email' => $email,
            'company' => $company,
            'jobTitle' => $jobTitle,
            'contactNumber' => $contactNumber
        ];
        
        // Validate required fields
        if (empty($fullName) || empty($email) || empty($company)) {
            throw new InvalidArgumentException('Required fields are missing');
        }
        
        // Insert data into database
        $stmt = $pdo->prepare("INSERT INTO speaker_inquiries (full_name, email, company, job_title, contact_number) VALUES (?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $fullName,
            $email,
            $company,
            $jobTitle,
            $contactNumber
        ]);
        
        // Get the inserted ID
        $insertId = $pdo->lastInsertId();
        
        error_log("[" . date(TIMESTAMP_FORMAT) . "] Speaker data inserted successfully. ID: $insertId");
        $response['debug']['insert'] = "Data inserted successfully";
        
        // Prepare form data for email
        $formData = [
            'fullName' => $fullName,
            'email' => $email,
            'company' => $company,
            'jobTitle' => $jobTitle,
            'contactNumber' => $contactNumber,
        ];
        
        // Set success response for database storage
        $response['success'] = true;
        $response['message'] = 'Speaker application successfully stored in database';
        $response['data'] = [
            'id' => $insertId,
            'fullName' => $fullName,
            'email' => $email
        ];
        
        // Now handle email sending separately
        try {
            error_log("[" . date(TIMESTAMP_FORMAT) . "] Starting email sending process for speaker ID: $insertId");
            
            // Send email notification to admin
            $adminEmailHtml = createSpeakerEmailTemplate($formData);
            $adminEmailResult = sendEmail(
                [
                    'admin@roomofleaders.com',
                    'abdul@roomofleaders.com',
                ],
                'HRD Conference Admin',
                'New Speaker Application from ' . $fullName,
                $adminEmailHtml,
                '',
                ['email' => $email, 'name' => $fullName]
            );
            
            // Send confirmation email to user
            $userEmailHtml = createConfirmationEmailTemplate('speaker', $formData);
            $userEmailResult = sendEmail(
                $email,
                $fullName,
                'HRD Conference - Speaker Application Confirmation',
                $userEmailHtml
            );
            
            $response['debug']['admin_email'] = $adminEmailResult;
            $response['debug']['user_email'] = $userEmailResult;
            
            // Log email status but don't update UI response message
            if ($adminEmailResult['success'] && $userEmailResult['success']) {
                error_log("[" . date(TIMESTAMP_FORMAT) . "] Email notifications sent successfully for speaker ID: $insertId");
            } else {
                error_log("[" . date(TIMESTAMP_FORMAT) . "] Issue sending email notifications for speaker ID: $insertId");
            }
            
        } catch (Exception $emailException) {
            // Log email error but don't affect the main response success
            error_log("[" . date(TIMESTAMP_FORMAT) . "] Email exception for speaker ID: $insertId - " . $emailException->getMessage());
            $response['debug']['email_error'] = $emailException->getMessage();
        }
        
    } catch (PDOException $e) {
        $response['message'] = 'Database error: ' . $e->getMessage();
        $response['debug']['error_type'] = 'PDOException';
        $response['debug']['error_message'] = $e->getMessage();
        $response['debug']['error_trace'] = $e->getTraceAsString();
    } catch (InvalidArgumentException $e) {
        $response['message'] = $e->getMessage();
        $response['debug']['error_type'] = 'InvalidArgumentException';
        $response['debug']['error_message'] = $e->getMessage();
    } catch (Exception $e) {
        $response['message'] = 'Unexpected error: ' . $e->getMessage();
        $response['debug']['error_type'] = 'Exception';
        $response['debug']['error_message'] = $e->getMessage();
        $response['debug']['error_trace'] = $e->getTraceAsString();
    }
} else {
    $response['message'] = 'Invalid request method';
}

// Return JSON response
echo json_encode($response);
