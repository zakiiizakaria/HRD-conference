<?php
// Prevent any errors or warnings from being displayed in the output
error_reporting(0);
ini_set('display_errors', 0);

// Set headers to allow cross-origin requests and specify JSON response
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

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
        throw new Exception("Database connection failed: " . $conn->connect_error);
    }
    
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
        }
    }
    
    // Handle form submissions
    if ($_SERVER["REQUEST_METHOD"] == "POST") {
        $formType = isset($_POST['form_type']) ? sanitizeInput($_POST['form_type']) : '';
        $response = array('success' => false, 'message' => 'Unknown error occurred');
        
        // Common form fields for all forms
        $fullName = isset($_POST['fullName']) ? sanitizeInput($_POST['fullName']) : '';
        $email = isset($_POST['email']) ? sanitizeInput($_POST['email']) : '';
        $company = isset($_POST['company']) ? sanitizeInput($_POST['company']) : '';
        $jobTitle = isset($_POST['jobTitle']) ? sanitizeInput($_POST['jobTitle']) : '';
        $contactNumber = isset($_POST['contactNumber']) ? sanitizeInput($_POST['contactNumber']) : '';
        
        // Generate a unique ID
        $id = generateUniqueId();
        
        // Process based on form type
        switch ($formType) {
            case 'sponsorship':
                // Additional fields for sponsorship form
                $interest = isset($_POST['interest']) ? sanitizeInput($_POST['interest']) : '';
                
                // Insert into database
                $sql = "INSERT INTO sponsorship_form (id, full_name, email_address, company_name, job_title, contact_number, interest) VALUES (?, ?, ?, ?, ?, ?, ?)";
                
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sssssss", $id, $fullName, $email, $company, $jobTitle, $contactNumber, $interest);
                
                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Sponsorship form submitted successfully and saved to database.';
                } else {
                    $response['message'] = 'Error: ' . $stmt->error;
                }
                break;
                
            case 'speaker':
                // Insert into database
                $sql = "INSERT INTO speaker_form (id, full_name, email_address, company_name, job_title, contact_number) VALUES (?, ?, ?, ?, ?, ?)";
                
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("ssssss", $id, $fullName, $email, $company, $jobTitle, $contactNumber);
                
                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Speaker form submitted successfully and saved to database.';
                } else {
                    $response['message'] = 'Error: ' . $stmt->error;
                }
                break;
                
            case 'registration':
                // Additional fields for registration form
                $promoCode = isset($_POST['promoCode']) ? sanitizeInput($_POST['promoCode']) : '';
                
                // Insert into database
                $sql = "INSERT INTO registration_form (id, full_name, email_address, company_name, job_title, contact_number, promo_code) VALUES (?, ?, ?, ?, ?, ?, ?)";
                
                $stmt = $conn->prepare($sql);
                $stmt->bind_param("sssssss", $id, $fullName, $email, $company, $jobTitle, $contactNumber, $promoCode);
                
                if ($stmt->execute()) {
                    $response['success'] = true;
                    $response['message'] = 'Registration form submitted successfully and saved to database.';
                } else {
                    $response['message'] = 'Error: ' . $stmt->error;
                }
                break;
                
            default:
                $response['message'] = 'Invalid form type';
                break;
        }
        
        // Return JSON response
        echo json_encode($response);
        exit;
    } else {
        // Not a POST request
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
