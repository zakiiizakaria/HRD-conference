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

/**
 * Sponsorship Form Handler
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
error_log("[" . date(TIMESTAMP_FORMAT) . "] Sponsorship form submission attempt from IP: " . $_SERVER['REMOTE_ADDR'] . ", User Agent: " . $_SERVER['HTTP_USER_AGENT']);

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
$response['debug']['environment'] = 'production';

// Include the mail helper
// Using require_once for the mail helper as it's not a proper namespace
// that can be imported with 'use' statements
require_once __DIR__ . '/includes/mail-helper.php';

// Only process POST requests
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Create database connection
        $host = "localhost";
        $db_name = "u197368543_hrd_db";
        $username = "u197368543_localhost";
        $password = "Hrd_conference2025";
        $charset = 'utf8mb4';

        $dsn = "mysql:host=$host;dbname=$db_name;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $response['debug']['connection_string'] = "Attempting to connect to: $host, database: $db_name, user: $username";
        
        $pdo = new PDO($dsn, $username, $password, $options);
        $response['debug']['connection'] = "Database connection successful";
        
        // Check if the sponsorship table exists, if not create it
        $pdo->exec("CREATE TABLE IF NOT EXISTS sponsorship_inquiries (id INT AUTO_INCREMENT PRIMARY KEY, full_name VARCHAR(100) NOT NULL, email VARCHAR(100) NOT NULL, company VARCHAR(100) NOT NULL, job_title VARCHAR(100) NOT NULL, contact_number VARCHAR(20) NOT NULL, interest VARCHAR(50) NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)");
        $response['debug']['table_creation'] = "Table check/creation completed";
        
        // Get form data
        $fullName = $_POST['fullName'] ?? '';
        $email = $_POST['email'] ?? '';
        $company = $_POST['company'] ?? '';
        $jobTitle = $_POST['jobTitle'] ?? '';
        $contactNumber = $_POST['contactNumber'] ?? '';
        $interest = $_POST['interest'] ?? '';
        
        $response['debug']['form_data'] = [
            'fullName' => $fullName,
            'email' => $email,
            'company' => $company,
            'jobTitle' => $jobTitle,
            'contactNumber' => $contactNumber,
            'interest' => $interest
        ];
        
        // Validate required fields
        if (empty($fullName) || empty($email) || empty($company)) {
            throw new InvalidArgumentException('Required fields are missing');
        }
        
        // Insert data into database
        $stmt = $pdo->prepare("INSERT INTO sponsorship_inquiries (full_name, email, company, job_title, contact_number, interest) VALUES (?, ?, ?, ?, ?, ?)");
        
        $stmt->execute([
            $fullName,
            $email,
            $company,
            $jobTitle,
            $contactNumber,
            $interest
        ]);
        
        // Get the inserted ID
        $insertId = $pdo->lastInsertId();
        
        error_log("[" . date(TIMESTAMP_FORMAT) . "] Sponsorship data inserted successfully. ID: $insertId");
        $response['debug']['insert'] = "Data inserted successfully";
        
        // Prepare form data for email
        $formData = [
            'fullName' => $fullName,
            'email' => $email,
            'company' => $company,
            'jobTitle' => $jobTitle,
            'contactNumber' => $contactNumber,
            'interest' => $interest
        ];
        
        // Set success response for database storage
        $response['success'] = true;
        $response['message'] = 'Sponsorship inquiry successfully stored in database';
        $response['data'] = [
            'id' => $insertId,
            'fullName' => $fullName,
            'email' => $email
        ];
        
        // Now handle email sending separately
        try {
            error_log("[" . date(TIMESTAMP_FORMAT) . "] Starting email sending process for sponsorship ID: $insertId");
            
            // Send email notification to admin
            $adminEmailHtml = createSponsorshipEmailTemplate($formData);
            $adminEmailResult = sendEmail(
                [
                    'admin@roomofleaders.com',
                    'abdul@roomofleaders.com',
                ],
                'HRD Conference Admin',
                'New Sponsorship Inquiry from ' . $fullName,
                $adminEmailHtml,
                '',
                ['email' => $email, 'name' => $fullName]
            );
            
            // Send confirmation email to user
            $userEmailHtml = createConfirmationEmailTemplate('sponsorship', $formData);
            $userEmailResult = sendEmail(
                $email,
                $fullName,
                'HRD Conference - Sponsorship Inquiry Confirmation',
                $userEmailHtml
            );
            
            $response['debug']['admin_email'] = $adminEmailResult;
            $response['debug']['user_email'] = $userEmailResult;
            
            // Log email status but don't update UI response message
            if ($adminEmailResult['success'] && $userEmailResult['success']) {
                error_log("[" . date(TIMESTAMP_FORMAT) . "] Email notifications sent successfully for sponsorship ID: $insertId");
            } else {
                error_log("[" . date(TIMESTAMP_FORMAT) . "] Issue sending email notifications for sponsorship ID: $insertId");
            }
            
        } catch (Exception $emailException) {
            // Log email error but don't affect the main response success
            error_log("[" . date(TIMESTAMP_FORMAT) . "] Email exception for sponsorship ID: $insertId - " . $emailException->getMessage());
            $response['debug']['email_error'] = $emailException->getMessage();
        }
        
        // Success response is now set in the email handling section
        
    } catch (PDOException $e) {
        $response['message'] = 'Database error: ' . $e->getMessage();
        $response['debug']['error_type'] = 'PDOException';
        $response['debug']['error_message'] = $e->getMessage();
        $response['debug']['error_trace'] = $e->getTraceAsString();
        
        // Log detailed error information
        error_log("[" . date(TIMESTAMP_FORMAT) . "] PDO Exception: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString());
    } catch (InvalidArgumentException $e) {
        $response['message'] = $e->getMessage();
        $response['debug']['error_type'] = 'InvalidArgumentException';
        $response['debug']['error_message'] = $e->getMessage();
        
        // Log validation error
        error_log("[" . date(TIMESTAMP_FORMAT) . "] Validation Error: " . $e->getMessage());
    } catch (Exception $e) {
        $response['message'] = 'Unexpected error: ' . $e->getMessage();
        $response['debug']['error_type'] = 'Exception';
        $response['debug']['error_message'] = $e->getMessage();
        $response['debug']['error_trace'] = $e->getTraceAsString();
        
        // Log general exception
        error_log("[" . date(TIMESTAMP_FORMAT) . "] Unexpected Exception: " . $e->getMessage() . "\nTrace: " . $e->getTraceAsString());
    }
} else {
    $response['message'] = 'Invalid request method';
}

// Return JSON response
echo json_encode($response);
