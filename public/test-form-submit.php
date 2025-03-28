<?php
// Include database configuration
require_once __DIR__ . '/assets/php/config.php';

// Check if form was submitted
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        // Insert a test record
        $sql = "INSERT INTO sponsorship_form (id, full_name, email_address, company_name, job_title, contact_number, interest) 
                VALUES (?, ?, ?, ?, ?, ?, ?)";
        
        $id = uniqid('test_', true);
        $fullName = 'Test User';
        $email = 'test@example.com';
        $company = 'Test Company';
        $jobTitle = 'Test Job';
        $contactNumber = '123456789';
        $interest = 'Test Interest';
        
        $stmt = $pdo->prepare($sql);
        $result = $stmt->execute([$id, $fullName, $email, $company, $jobTitle, $contactNumber, $interest]);
        
        echo json_encode([
            'success' => $result,
            'message' => 'Test record inserted successfully'
        ]);
    } catch (Exception $e) {
        echo json_encode([
            'success' => false,
            'message' => 'Database error: ' . $e->getMessage()
        ]);
    }
    exit;
}
?>
<!DOCTYPE html>
<html>
<head>
    <title>Test Form Submit</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .container { max-width: 800px; margin: 0 auto; }
        .result { padding: 10px; margin-top: 20px; border: 1px solid #ddd; }
        .success { background-color: #d4edda; color: #155724; }
        .error { background-color: #f8d7da; color: #721c24; }
        button { padding: 10px 15px; background-color: #007bff; color: white; border: none; cursor: pointer; }
        h3 { margin-top: 30px; }
        pre { background-color: #f5f5f5; padding: 10px; overflow: auto; }
    </style>
</head>
<body>
    <div class="container">
        <h1>Database Connection Test</h1>
        
        <div>
            <h2>1. Test Database Connection</h2>
            <div id="connection-status">
                <?php
                if (isset($pdo) && $pdo) {
                    echo '<div class="result success">Database connection successful!</div>';
                } else {
                    echo '<div class="result error">Database connection failed!</div>';
                }
                ?>
            </div>
        </div>
        
        <div>
            <h2>2. Test Form Submission</h2>
            <button id="test-submit">Test Submit to Database</button>
            <div id="submit-result" class="result" style="display: none;"></div>
        </div>
        
        <div>
            <h2>3. Check Database Tables</h2>
            <button id="check-tables">Check Tables</button>
            <div id="tables-result" class="result" style="display: none;"></div>
        </div>
        
        <div>
            <h3>Debug Information</h3>
            <pre id="debug-info">
Database Host: <?php echo DB_HOST; ?>
Database Name: <?php echo DB_NAME; ?>
Database User: <?php echo DB_USER; ?>
PHP Version: <?php echo phpversion(); ?>
Server Software: <?php echo $_SERVER['SERVER_SOFTWARE']; ?>
Document Root: <?php echo $_SERVER['DOCUMENT_ROOT']; ?>
Script Path: <?php echo __FILE__; ?>
            </pre>
        </div>
    </div>
    
    <script>
        document.getElementById('test-submit').addEventListener('click', function() {
            fetch('test-form-submit.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            })
            .then(response => response.json())
            .then(data => {
                const resultDiv = document.getElementById('submit-result');
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = JSON.stringify(data, null, 2);
                resultDiv.className = data.success ? 'result success' : 'result error';
            })
            .catch(error => {
                const resultDiv = document.getElementById('submit-result');
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = 'Error: ' + error.message;
                resultDiv.className = 'result error';
            });
        });
        
        document.getElementById('check-tables').addEventListener('click', function() {
            fetch('check-tables.php')
            .then(response => response.json())
            .then(data => {
                const resultDiv = document.getElementById('tables-result');
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = JSON.stringify(data, null, 2);
                resultDiv.className = 'result';
            })
            .catch(error => {
                const resultDiv = document.getElementById('tables-result');
                resultDiv.style.display = 'block';
                resultDiv.innerHTML = 'Error: ' + error.message;
                resultDiv.className = 'result error';
            });
        });
    </script>
</body>
</html>
