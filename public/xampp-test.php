<?php
// This file tests your XAMPP configuration and MySQL connection

// Step 1: Check if PHP is working
echo "<h1>XAMPP Configuration Test</h1>";
echo "<h2>Step 1: PHP Check</h2>";
echo "<p>✅ PHP is working! (You can see this message)</p>";

// Step 2: Check MySQL connection
echo "<h2>Step 2: MySQL Connection Check</h2>";
try {
    $host = "localhost";
    $username = "root";
    $password = "";
    
    // Try to connect to MySQL server without specifying a database
    $conn = new mysqli($host, $username, $password);
    
    if ($conn->connect_error) {
        echo "<p>❌ MySQL connection failed: " . $conn->connect_error . "</p>";
        echo "<p>Please check that MySQL is running in XAMPP Control Panel.</p>";
    } else {
        echo "<p>✅ MySQL connection successful!</p>";
        
        // Step 3: Check if database exists
        echo "<h2>Step 3: Database Check</h2>";
        $database = "hrd-conference";
        $result = $conn->query("SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$database'");
        
        if ($result && $result->num_rows > 0) {
            echo "<p>✅ Database '$database' exists!</p>";
        } else {
            echo "<p>❌ Database '$database' does not exist.</p>";
            echo "<p>Creating database...</p>";
            
            if ($conn->query("CREATE DATABASE IF NOT EXISTS `$database`")) {
                echo "<p>✅ Database '$database' created successfully!</p>";
            } else {
                echo "<p>❌ Failed to create database: " . $conn->error . "</p>";
            }
        }
        
        // Step 4: Check if tables exist
        echo "<h2>Step 4: Tables Check</h2>";
        
        // Connect to the database
        $dbConn = new mysqli($host, $username, $password, $database);
        
        if ($dbConn->connect_error) {
            echo "<p>❌ Failed to connect to database: " . $dbConn->connect_error . "</p>";
        } else {
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
                // Check if table exists
                $result = $dbConn->query("SHOW TABLES LIKE '$table'");
                
                if ($result && $result->num_rows > 0) {
                    echo "<p>✅ Table '$table' exists!</p>";
                } else {
                    echo "<p>❌ Table '$table' does not exist.</p>";
                    echo "<p>Creating table...</p>";
                    
                    if ($dbConn->query($sql)) {
                        echo "<p>✅ Table '$table' created successfully!</p>";
                    } else {
                        echo "<p>❌ Failed to create table: " . $dbConn->error . "</p>";
                    }
                }
            }
        }
    }
} catch (Exception $e) {
    echo "<p>❌ Error: " . $e->getMessage() . "</p>";
}

// Step 5: Test form submission
echo "<h2>Step 5: Test Form Submission</h2>";
echo "<p>Click the button below to test inserting a record into the database:</p>";
?>

<form method="post" action="xampp-test.php">
    <input type="hidden" name="test_submission" value="1">
    <button type="submit">Test Database Insert</button>
</form>

<?php
// Handle test submission
if (isset($_POST['test_submission'])) {
    try {
        // Connect to the database
        $dbConn = new mysqli($host, $username, $password, $database);
        
        if ($dbConn->connect_error) {
            echo "<p>❌ Failed to connect to database: " . $dbConn->connect_error . "</p>";
        } else {
            // Generate a unique ID
            $id = uniqid('test_', true);
            
            // Insert test data
            $sql = "INSERT INTO sponsorship_form (id, full_name, email_address, company_name, job_title, contact_number, interest) 
                    VALUES (?, ?, ?, ?, ?, ?, ?)";
            
            $stmt = $dbConn->prepare($sql);
            $fullName = "Test User";
            $email = "test@example.com";
            $company = "Test Company";
            $jobTitle = "Test Job";
            $contactNumber = "123456789";
            $interest = "Test Interest";
            
            $stmt->bind_param("sssssss", $id, $fullName, $email, $company, $jobTitle, $contactNumber, $interest);
            
            if ($stmt->execute()) {
                echo "<p>✅ Test record inserted successfully!</p>";
                echo "<p>Your database is working correctly!</p>";
            } else {
                echo "<p>❌ Failed to insert test record: " . $stmt->error . "</p>";
            }
        }
    } catch (Exception $e) {
        echo "<p>❌ Error: " . $e->getMessage() . "</p>";
    }
}
?>

<h2>Next Steps</h2>
<p>If all steps above show green checkmarks (✅), your XAMPP configuration is working correctly!</p>
<p>You can now use the form-handler.js file to submit forms to your database.</p>

<style>
    body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
    h1, h2 { color: #333; }
    p { margin: 10px 0; line-height: 1.5; }
    button { padding: 10px 15px; background-color: #4CAF50; color: white; border: none; cursor: pointer; }
    button:hover { background-color: #45a049; }
</style>
