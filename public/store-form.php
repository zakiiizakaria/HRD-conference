<?php
// Enable error reporting for troubleshooting
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Set headers to allow cross-origin requests and specify JSON response
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Log request information
$requestLog = [
    'time' => date('Y-m-d H:i:s'),
    'method' => $_SERVER['REQUEST_METHOD'],
    'post_data' => $_POST,
    'raw_input' => file_get_contents('php://input')
];
error_log('Request received: ' . json_encode($requestLog));

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

// Database configuration for Hostinger
$host = "127.0.0.1";  // From your phpMyAdmin screenshot
$username = "u197368543_root"; // From your database users screenshot
$password = "Hrd_conference2025";
$database = "u197368543_hrd_conference"; // From your database name screenshot

// Function to generate a unique ID
function generateUniqueId() {
    return uniqid('', true);
}

// Function to sanitize input data
function sanitizeInput($data) {
    $data = trim($data);
    $data = stripslashes($data);
    $data = htmlspecialchars($data);
    return $data;
}

// Create database connection
try {
    // Connect to MySQL server
    $conn = new mysqli($host, $username, $password, $database);
    
    // Check connection
    if ($conn->connect_error) {
        error_log("Database connection failed: " . $conn->connect_error);
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    
    error_log("Database connection successful");
    
    // Create tables if they don't exist
    $tables = [
        'sponsorship_form' => "CREATE TABLE IF NOT EXISTS `sponsorship_form` (
            `id` VARCHAR(36) NOT NULL PRIMARY KEY,
            `full_name` VARCHAR(100) NOT NULL,
            `email_address` VARCHAR(100) NOT NULL,
            `company_name` VARCHAR(100) NOT NULL,
            `job_title` VARCHAR(100) NOT NULL,
            `contact_number` VARCHAR(20) NOT NULL,
            `interest` VARCHAR(100) NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        
        'speaker_form' => "CREATE TABLE IF NOT EXISTS `speaker_form` (
            `id` VARCHAR(36) NOT NULL PRIMARY KEY,
            `full_name` VARCHAR(100) NOT NULL,
            `email_address` VARCHAR(100) NOT NULL,
            `company_name` VARCHAR(100) NOT NULL,
            `job_title` VARCHAR(100) NOT NULL,
            `contact_number` VARCHAR(20) NOT NULL,
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;",
        
        'registration_form' => "CREATE TABLE IF NOT EXISTS `registration_form` (
            `id` VARCHAR(36) NOT NULL PRIMARY KEY,
            `full_name` VARCHAR(100) NOT NULL,
            `email_address` VARCHAR(100) NOT NULL,
            `company_name` VARCHAR(100) NOT NULL,
            `job_title` VARCHAR(100) NOT NULL,
            `contact_number` VARCHAR(20) NOT NULL,
            `promo_code` VARCHAR(50),
            `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;"
    ];
    
    foreach ($tables as $table => $sql) {
        if (!$conn->query($sql)) {
            error_log("Error creating table $table: " . $conn->error);
        } else {
            error_log("Table $table created or already exists");
        }
    }
    
    // Handle form submissions
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        error_log("Processing POST request");
        
        // Check if this is a FormData submission or JSON
        $contentType = isset($_SERVER["CONTENT_TYPE"]) ? trim($_SERVER["CONTENT_TYPE"]) : '';
        
        if (strpos($contentType, 'application/json') !== false) {
            // Handle JSON input
            $jsonInput = file_get_contents('php://input');
            $postData = json_decode($jsonInput, true);
            error_log("Received JSON data: " . $jsonInput);
        } else {
            // Use regular POST data
            $postData = $_POST;
            error_log("Received POST data: " . json_encode($_POST));
        }
        
        $formType = isset($postData['form_type']) ? sanitizeInput($postData['form_type']) : '';
        error_log("Form type: $formType");
        
        $response = array('success' => false, 'message' => 'Unknown error occurred');
        
        // Common form fields for all forms
        $fullName = isset($postData['fullName']) ? sanitizeInput($postData['fullName']) : '';
        $email = isset($postData['email']) ? sanitizeInput($postData['email']) : '';
        $company = isset($postData['company']) ? sanitizeInput($postData['company']) : '';
        $jobTitle = isset($postData['jobTitle']) ? sanitizeInput($postData['jobTitle']) : '';
        $contactNumber = isset($postData['contactNumber']) ? sanitizeInput($postData['contactNumber']) : '';
        
        error_log("Form data: Name=$fullName, Email=$email, Company=$company, JobTitle=$jobTitle, Contact=$contactNumber");
        
        // Generate a unique ID
        $id = generateUniqueId();
        
        // Process based on form type
        switch ($formType) {
            case 'sponsorship':
                // Additional fields for sponsorship form
                $interest = isset($postData['interest']) ? sanitizeInput($postData['interest']) : '';
                error_log("Interest: $interest");
                
                // Insert into database
                $sql = "INSERT INTO sponsorship_form (id, full_name, email_address, company_name, job_title, contact_number, interest) VALUES (?, ?, ?, ?, ?, ?, ?)";
                error_log("SQL: $sql");
                
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    error_log("Prepare failed: " . $conn->error);
                    $response['message'] = 'Error preparing statement: ' . $conn->error;
                    break;
                }
                
                $stmt->bind_param("sssssss", $id, $fullName, $email, $company, $jobTitle, $contactNumber, $interest);
                
                if ($stmt->execute()) {
                    error_log("Insert successful");
                    $response['success'] = true;
                    $response['message'] = 'Sponsorship form submitted successfully and saved to database.';
                } else {
                    error_log("Insert failed: " . $stmt->error);
                    $response['message'] = 'Error: ' . $stmt->error;
                }
                break;
                
            case 'speaker':
                // Insert into database
                $sql = "INSERT INTO speaker_form (id, full_name, email_address, company_name, job_title, contact_number) VALUES (?, ?, ?, ?, ?, ?)";
                error_log("SQL: $sql");
                
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    error_log("Prepare failed: " . $conn->error);
                    $response['message'] = 'Error preparing statement: ' . $conn->error;
                    break;
                }
                
                $stmt->bind_param("ssssss", $id, $fullName, $email, $company, $jobTitle, $contactNumber);
                
                if ($stmt->execute()) {
                    error_log("Insert successful");
                    $response['success'] = true;
                    $response['message'] = 'Speaker form submitted successfully and saved to database.';
                } else {
                    error_log("Insert failed: " . $stmt->error);
                    $response['message'] = 'Error: ' . $stmt->error;
                }
                break;
                
            case 'registration':
                // Additional fields for registration form
                $promoCode = isset($postData['promoCode']) ? sanitizeInput($postData['promoCode']) : '';
                error_log("Promo code: $promoCode");
                
                // Insert into database
                $sql = "INSERT INTO registration_form (id, full_name, email_address, company_name, job_title, contact_number, promo_code) VALUES (?, ?, ?, ?, ?, ?, ?)";
                error_log("SQL: $sql");
                
                $stmt = $conn->prepare($sql);
                if (!$stmt) {
                    error_log("Prepare failed: " . $conn->error);
                    $response['message'] = 'Error preparing statement: ' . $conn->error;
                    break;
                }
                
                $stmt->bind_param("sssssss", $id, $fullName, $email, $company, $jobTitle, $contactNumber, $promoCode);
                
                if ($stmt->execute()) {
                    error_log("Insert successful");
                    $response['success'] = true;
                    $response['message'] = 'Registration form submitted successfully and saved to database.';
                } else {
                    error_log("Insert failed: " . $stmt->error);
                    $response['message'] = 'Error: ' . $stmt->error;
                }
                break;
                
            default:
                error_log("Invalid form type: $formType");
                $response['message'] = 'Invalid form type';
                break;
        }
        
        // Return JSON response
        error_log("Sending response: " . json_encode($response));
        echo json_encode($response);
        exit;
    } else {
        // Not a POST request
        error_log("Not a POST request: " . $_SERVER["REQUEST_METHOD"]);
        echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed']);
        exit;
    }
} catch (Exception $e) {
    // Log the error instead of exposing it
    error_log("Database error: " . $e->getMessage());
    echo json_encode(['success' => false, 'message' => 'A database error occurred: ' . $e->getMessage()]);
    exit;
}
?>
