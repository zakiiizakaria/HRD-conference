<?php
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

// Log form submission attempt
$timestamp = date('Y-m-d H:i:s');
error_log("[$timestamp] Speaker form submission attempt from IP: " . $_SERVER['REMOTE_ADDR'] . ", User Agent: " . $_SERVER['HTTP_USER_AGENT']);

// Get the requesting origin
$origin = isset($_SERVER['HTTP_ORIGIN']) ? $_SERVER['HTTP_ORIGIN'] : '*';

// Set headers to handle AJAX requests and CORS - more permissive for international users
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
header('Access-Control-Allow-Credentials: true');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

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
        
        $response['debug']['insert'] = "Data inserted successfully";
        
        // Get additional fields for email
        $topic = $_POST['topic'] ?? 'Not specified';
        $bio = $_POST['bio'] ?? 'Not provided';
        
        // Send email notification to admin
        $formData = [
            'fullName' => $fullName,
            'email' => $email,
            'company' => $company,
            'jobTitle' => $jobTitle,
            'contactNumber' => $contactNumber,
            'topic' => $topic,
            'bio' => $bio
        ];
        
        $adminEmailHtml = createSpeakerEmailTemplate($formData);
        $adminEmailResult = sendEmail(
            [
                'admin@roomofleaders.com',
                'adam@roomofleaders.com',
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
        
        $response['success'] = true;
        $response['message'] = 'Speaker application successfully stored in database and email notifications sent';
        $response['data'] = [
            'id' => $pdo->lastInsertId(),
            'fullName' => $fullName,
            'email' => $email
        ];
        
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
