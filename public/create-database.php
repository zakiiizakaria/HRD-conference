<?php
// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Database connection parameters for local XAMPP MySQL
$host = 'localhost';
$username = 'root'; // Local XAMPP default username
$password = ''; // Local XAMPP default empty password

try {
    // Connect to MySQL without specifying a database
    $pdo = new PDO("mysql:host=$host", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Create database if it doesn't exist
    $dbName = 'u197368543_hrd_conference';
    $pdo->exec("CREATE DATABASE IF NOT EXISTS `$dbName`");
    echo "Database '$dbName' created or already exists.<br>";
    
    // Connect to the newly created database
    $pdo = new PDO("mysql:host=$host;dbname=$dbName", $username, $password);
    
    // Create sponsorship_inquiries table if it doesn't exist
    $pdo->exec("CREATE TABLE IF NOT EXISTS sponsorship_inquiries (
        id INT AUTO_INCREMENT PRIMARY KEY,
        full_name VARCHAR(100) NOT NULL,
        email VARCHAR(100) NOT NULL,
        company VARCHAR(100) NOT NULL,
        job_title VARCHAR(100) NOT NULL,
        contact_number VARCHAR(20) NOT NULL,
        interest VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
    echo "Table 'sponsorship_inquiries' created or already exists.<br>";
    
    echo "<h2>Database setup completed successfully!</h2>";
    echo "<p>You can now test the sponsorship form submission.</p>";
    
} catch(PDOException $e) {
    echo "<h2>Database Error:</h2>";
    echo "<p>" . $e->getMessage() . "</p>";
}
?>
