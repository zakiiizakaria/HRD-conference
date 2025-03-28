// This file is kept for reference but is no longer used directly
// Form submissions are now handled by /save-form.php in the public directory

<?php
// Database configuration
require_once 'config.php';

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
    // Using PDO for better security
    $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $options = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $options);
    
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
                $sql = "INSERT INTO sponsorship_form (id, full_name, email_address, company_name, job_title, contact_number, interest) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)";
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$id, $fullName, $email, $company, $jobTitle, $contactNumber, $interest]);
                
                $response['success'] = true;
                $response['message'] = 'Sponsorship form submitted successfully and saved to database.';
                break;
                
            case 'speaker':
                // Insert into database
                $sql = "INSERT INTO speaker_form (id, full_name, email_address, company_name, job_title, contact_number) 
                        VALUES (?, ?, ?, ?, ?, ?)";
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$id, $fullName, $email, $company, $jobTitle, $contactNumber]);
                
                $response['success'] = true;
                $response['message'] = 'Speaker form submitted successfully and saved to database.';
                break;
                
            case 'registration':
                // Additional fields for registration form
                $promoCode = isset($_POST['promoCode']) ? sanitizeInput($_POST['promoCode']) : '';
                
                // Insert into database
                $sql = "INSERT INTO registration_form (id, full_name, email_address, company_name, job_title, contact_number, promo_code) 
                        VALUES (?, ?, ?, ?, ?, ?, ?)";
                
                $stmt = $pdo->prepare($sql);
                $stmt->execute([$id, $fullName, $email, $company, $jobTitle, $contactNumber, $promoCode]);
                
                $response['success'] = true;
                $response['message'] = 'Registration form submitted successfully and saved to database.';
                break;
                
            default:
                $response['message'] = 'Invalid form type';
                break;
        }
        
        // Return JSON response
        header('Content-Type: application/json');
        echo json_encode($response);
        exit;
    } else {
        // Not a POST request
        header('Content-Type: application/json');
        echo json_encode(['success' => false, 'message' => 'Only POST requests are allowed']);
        exit;
    }
} catch (Exception $e) {
    // Log the error instead of exposing it
    error_log("Database error: " . $e->getMessage());
    header('Content-Type: application/json');
    echo json_encode(['success' => false, 'message' => 'A database error occurred. Please try again later.']);
    exit;
}
?>
