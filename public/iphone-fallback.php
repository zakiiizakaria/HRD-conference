<?php
/**
 * iPhone Fallback Form Handler
 * A simple form handler for iPhone SE devices that have issues with AJAX
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Get the requesting origin - use wildcard for maximum compatibility
$origin = '*';

// Set headers to handle AJAX requests and CORS - extra permissive for older iPhones
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: POST, GET, OPTIONS, PUT, DELETE');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With, Origin, Accept');
header('Access-Control-Max-Age: 86400'); // 24 hours cache for preflight
header('Access-Control-Allow-Credentials: true');
header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
header('Pragma: no-cache');
header('Expires: 0');

// For older browsers and iPhone SE
header('Connection: keep-alive');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Log form submission attempt
error_log("[" . date('Y-m-d H:i:s') . "] iPhone fallback form submission attempt from IP: " . $_SERVER['REMOTE_ADDR'] . ", User Agent: " . $_SERVER['HTTP_USER_AGENT']);

// Determine which form was submitted
$formType = isset($_POST['form_type']) ? $_POST['form_type'] : 'unknown';

// Process the form based on its type
$result = ['success' => false, 'message' => 'Unknown form type'];

switch ($formType) {
    case 'sponsor':
        $result = processFormData('sponsorship_inquiries', [
            'fullName' => $_POST['fullName'] ?? '',
            'email' => $_POST['email'] ?? '',
            'company' => $_POST['company'] ?? '',
            'jobTitle' => $_POST['jobTitle'] ?? '',
            'contactNumber' => $_POST['contactNumber'] ?? '',
            'interest' => $_POST['interest'] ?? '',
            'device_info' => $_POST['device_info'] ?? ''
        ]);
        break;
    
    case 'speaker':
        $result = processFormData('speaker_inquiries', [
            'fullName' => $_POST['fullName'] ?? '',
            'email' => $_POST['email'] ?? '',
            'company' => $_POST['company'] ?? '',
            'jobTitle' => $_POST['jobTitle'] ?? '',
            'contactNumber' => $_POST['contactNumber'] ?? '',
            'device_info' => $_POST['device_info'] ?? ''
        ]);
        break;
    
    case 'registration':
        $result = processFormData('registration_submissions', [
            'fullName' => $_POST['fullName'] ?? '',
            'email' => $_POST['email'] ?? '',
            'company' => $_POST['company'] ?? '',
            'jobTitle' => $_POST['jobTitle'] ?? '',
            'contactNumber' => $_POST['contactNumber'] ?? '',
            'promoCode' => $_POST['promoCode'] ?? '',
            'device_info' => $_POST['device_info'] ?? ''
        ]);
        break;
        
    default:
        // Default case for unknown form types
        $result = [
            'success' => false,
            'message' => 'Unknown form type: ' . htmlspecialchars($formType)
        ];
        error_log("Unknown form type submitted: " . $formType);
        break;
}

// Return the result as JSON
echo json_encode($result);

/**
 * Process form data and store it in the database
 * 
 * @param string $tableName The name of the table to store data in
 * @param array $data The form data to store
 * @return array Result with success status and message
 */
function processFormData($tableName, $data) {
    // Check if we're in local environment
    $isLocalEnvironment = $_SERVER['HTTP_HOST'] === 'localhost:8080' || $_SERVER['HTTP_HOST'] === 'localhost';
    
    // Database connection parameters
    if ($isLocalEnvironment) {
        // XAMPP local database connection parameters
        $host = "localhost";
        $db_name = "u197368543_hrd_db";
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
    
    try {
        // Create database connection
        $dsn = "mysql:host=$host;dbname=$db_name;charset=$charset";
        $options = [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES => false,
        ];
        
        $pdo = new PDO($dsn, $username, $password, $options);
        
        // Create table if it doesn't exist
        createTableIfNotExists($pdo, $tableName);
        
        // Prepare column names and placeholders for the SQL query
        $columns = implode(', ', array_keys($data));
        $placeholders = implode(', ', array_fill(0, count($data), '?'));
        
        // Prepare and execute the SQL query
        $sql = "INSERT INTO $tableName ($columns) VALUES ($placeholders)";
        $stmt = $pdo->prepare($sql);
        $stmt->execute(array_values($data));
        
        return [
            'success' => true,
            'message' => 'Form data stored successfully in the database.',
            'data' => ['id' => $pdo->lastInsertId()]
        ];
    } catch (PDOException $e) {
        error_log("Database error: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ];
    } catch (Exception $e) {
        error_log("General error: " . $e->getMessage());
        return [
            'success' => false,
            'message' => 'Error: ' . $e->getMessage()
        ];
    }
}

/**
 * Create a table if it doesn't exist
 * 
 * @param PDO $pdo PDO connection
 * @param string $tableName Table name
 */
function createTableIfNotExists($pdo, $tableName) {
    switch ($tableName) {
        case 'sponsorship_inquiries':
            $sql = "CREATE TABLE IF NOT EXISTS $tableName (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullName VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                company VARCHAR(255) NOT NULL,
                jobTitle VARCHAR(255) NOT NULL,
                contactNumber VARCHAR(50) NOT NULL,
                interest VARCHAR(100) NOT NULL,
                device_info TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )";
            break;
            
        case 'speaker_inquiries':
            $sql = "CREATE TABLE IF NOT EXISTS $tableName (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullName VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                company VARCHAR(255) NOT NULL,
                jobTitle VARCHAR(255) NOT NULL,
                contactNumber VARCHAR(50) NOT NULL,
                device_info TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )";
            break;
            
        case 'registration_submissions':
            $sql = "CREATE TABLE IF NOT EXISTS $tableName (
                id INT AUTO_INCREMENT PRIMARY KEY,
                fullName VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                company VARCHAR(255) NOT NULL,
                jobTitle VARCHAR(255) NOT NULL,
                contactNumber VARCHAR(50) NOT NULL,
                promoCode VARCHAR(100),
                device_info TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )";
            break;
            
        default:
            // Define a custom exception class for table errors
            class TableNotFoundException extends Exception {}
            throw new TableNotFoundException("Unknown table: $tableName");
    }
    
    $pdo->exec($sql);
}
