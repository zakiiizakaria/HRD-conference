<?php
// Include database configuration
require_once __DIR__ . '/assets/php/config.php';

// Check if database tables exist
try {
    $tables = ['sponsorship_form', 'speaker_form', 'registration_form'];
    $results = [];
    
    foreach ($tables as $table) {
        $sql = "SHOW TABLES LIKE '$table'";
        $stmt = $pdo->prepare($sql);
        $stmt->execute();
        $exists = $stmt->rowCount() > 0;
        
        if ($exists) {
            // Count records in table
            $countSql = "SELECT COUNT(*) as count FROM $table";
            $countStmt = $pdo->prepare($countSql);
            $countStmt->execute();
            $count = $countStmt->fetch(PDO::FETCH_ASSOC)['count'];
            
            $results[$table] = [
                'exists' => true,
                'record_count' => $count
            ];
        } else {
            $results[$table] = [
                'exists' => false,
                'record_count' => 0
            ];
        }
    }
    
    // Check if database exists
    $sql = "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = ?";
    $stmt = $pdo->prepare($sql);
    $stmt->execute([DB_NAME]);
    $dbExists = $stmt->rowCount() > 0;
    
    echo json_encode([
        'success' => true,
        'database_exists' => $dbExists,
        'tables' => $results
    ]);
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage()
    ]);
}
?>
