<?php
/**
 * Mail Helper
 * Provides email functionality using PHPMailer for the HRD Conference website
 */

// Enable error reporting for debugging
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Check if PHPMailer is already installed via Composer
if (file_exists(__DIR__ . '/../../vendor/autoload.php')) {
    require_once __DIR__ . '/../../vendor/autoload.php';
} else {
    // If not installed via Composer, download PHPMailer files directly
    if (!file_exists(__DIR__ . '/PHPMailer')) {
        mkdir(__DIR__ . '/PHPMailer', 0777, true);
        
        // Download PHPMailer files
        $files = [
            'Exception.php' => 'https://raw.githubusercontent.com/PHPMailer/PHPMailer/master/src/Exception.php',
            'PHPMailer.php' => 'https://raw.githubusercontent.com/PHPMailer/PHPMailer/master/src/PHPMailer.php',
            'SMTP.php' => 'https://raw.githubusercontent.com/PHPMailer/PHPMailer/master/src/SMTP.php'
        ];
        
        foreach ($files as $filename => $url) {
            $fileContent = file_get_contents($url);
            if ($fileContent !== false) {
                file_put_contents(__DIR__ . '/PHPMailer/' . $filename, $fileContent);
            }
        }
    }
    
    // Include PHPMailer files
    include_once __DIR__ . '/PHPMailer/Exception.php';
    include_once __DIR__ . '/PHPMailer/PHPMailer.php';
    include_once __DIR__ . '/PHPMailer/SMTP.php';
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;
use PHPMailer\PHPMailer\SMTP;

/**
 * Sends an email using PHPMailer with Hostinger SMTP settings
 * 
 * @param string $recipientEmail Recipient's email address
 * @param string $recipientName Recipient's name
 * @param string $subject Email subject
 * @param string $htmlBody HTML content of the email
 * @param string $plainTextBody Plain text content of the email
 * @param array $replyTo Optional reply-to email address and name
 * @param array $attachments Optional array of attachments [['path' => '/path/to/file', 'name' => 'filename.ext']]
 * @return array Result of the email sending operation ['success' => bool, 'message' => string]
 */
function sendEmail($recipientEmail, $recipientName, $subject, $htmlBody, $plainTextBody = '', $replyTo = null, $attachments = []) {
    // Create a new PHPMailer instance
    $mail = new PHPMailer(true);
    
    try {
        // Server settings
        $mail->SMTPDebug = 0;                      // Enable verbose debug output (0 = off, 1 = client messages, 2 = client and server messages)
        $mail->isSMTP();                           // Send using SMTP
        $mail->Host = 'smtp.hostinger.com';  // Set the SMTP server to send through
        $mail->SMTPAuth = true; // Enable SMTP authentication
        $mail->Username = 'admin@hrdconference.com'; // SMTP username
        $mail->Password = 'Hrd_conference2025';  // SMTP password
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS; // Enable implicit TLS encryption
        $mail->Port = 465; // TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`
        
        // Recipients
        $mail->setFrom('admin@hrdconference.com', 'HRD Conference');
        
        // If recipient is an array of emails, add each one
        if (is_array($recipientEmail)) {
            foreach ($recipientEmail as $email) {
                $mail->addAddress($email, $recipientName);
            }
        } else {
            $mail->addAddress($recipientEmail, $recipientName);
        }
        
        // Set Reply-To address if provided
        if ($replyTo && isset($replyTo['email']) && isset($replyTo['name'])) {
            $mail->addReplyTo($replyTo['email'], $replyTo['name']);
        }
        
        // Add attachments if any
        if (!empty($attachments)) {
            foreach ($attachments as $attachment) {
                if (isset($attachment['path']) && file_exists($attachment['path'])) {
                    $mail->addAttachment(
                        $attachment['path'],
                        isset($attachment['name']) ? $attachment['name'] : basename($attachment['path'])
                    );
                }
            }
        }
        
        // Content
        $mail->isHTML(true);
        $mail->Subject = $subject;
        $mail->Body    = $htmlBody;
        
        // Set alternative plain text body if provided
        if (!empty($plainTextBody)) {
            $mail->AltBody = $plainTextBody;
        } else {
            // If you have a plain text version, add it here
            $mail->AltBody = strip_tags(str_replace(['<br>', '<br/>', '<br />'], "\n", $htmlBody));
        }
        
        // Send the email
        $mail->send();
        
        return [
            'success' => true,
            'message' => 'Email has been sent successfully'
        ];
        
    } catch (Exception $e) {
        return [
            'success' => false,
            'message' => "Email could not be sent. Mailer Error: {$mail->ErrorInfo}"
        ];
    }
}

/**
 * Creates HTML email template for sponsorship inquiries
 * 
 * @param array $data Form data
 * @return string HTML email content
 */
function createSponsorshipEmailTemplate($data) {
    $fullName = htmlspecialchars($data['fullName'] ?? '');
    $email = htmlspecialchars($data['email'] ?? '');
    $company = htmlspecialchars($data['company'] ?? '');
    $jobTitle = htmlspecialchars($data['jobTitle'] ?? '');
    $contactNumber = htmlspecialchars($data['contactNumber'] ?? '');
    $interest = htmlspecialchars($data['interest'] ?? '');
    
    return <<<HTML
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #003366; color: white; padding: 10px 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; }
            table td { padding: 8px; border-bottom: 1px solid #ddd; }
            table td:first-child { font-weight: bold; width: 40%; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>New Sponsorship Inquiry</h2>
            </div>
            <div class="content">
                <p>A new sponsorship inquiry has been submitted through the HRD Conference website:</p>
                <table>
                    <tr>
                        <td>Full Name:</td>
                        <td>$fullName</td>
                    </tr>
                    <tr>
                        <td>Email:</td>
                        <td>$email</td>
                    </tr>
                    <tr>
                        <td>Company:</td>
                        <td>$company</td>
                    </tr>
                    <tr>
                        <td>Job Title:</td>
                        <td>$jobTitle</td>
                    </tr>
                    <tr>
                        <td>Contact Number:</td>
                        <td>$contactNumber</td>
                    </tr>
                    <tr>
                        <td>Interest Level:</td>
                        <td>$interest</td>
                    </tr>
                </table>
                
                <p>Please follow up with this inquiry at your earliest convenience.</p>
            </div>
            <div class="footer">
                <p>This is an automated message from the HRD Conference website.</p>
            </div>
        </div>
    </body>
    </html>
    HTML;
}

/**
 * Creates HTML email template for speaker inquiries
 * 
 * @param array $data Form data
 * @return string HTML email content
 */
function createSpeakerEmailTemplate($data) {
    $fullName = htmlspecialchars($data['fullName'] ?? '');
    $email = htmlspecialchars($data['email'] ?? '');
    $company = htmlspecialchars($data['company'] ?? '');
    $jobTitle = htmlspecialchars($data['jobTitle'] ?? '');
    $contactNumber = htmlspecialchars($data['contactNumber'] ?? '');
    
    return <<<HTML
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #003366; color: white; padding: 10px 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; }
            table td { padding: 8px; border-bottom: 1px solid #ddd; }
            table td:first-child { font-weight: bold; width: 40%; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>New Speaker Inquiry</h2>
            </div>
            <div class="content">
                <p>A new speaker inquiry has been submitted through the HRD Conference website:</p>
                <table>
                    <tr>
                        <td>Full Name:</td>
                        <td>$fullName</td>
                    </tr>
                    <tr>
                        <td>Email:</td>
                        <td>$email</td>
                    </tr>
                    <tr>
                        <td>Company:</td>
                        <td>$company</td>
                    </tr>
                    <tr>
                        <td>Job Title:</td>
                        <td>$jobTitle</td>
                    </tr>
                    <tr>
                        <td>Contact Number:</td>
                        <td>$contactNumber</td>
                    </tr>
                </table>
                
                <p>Please review this speaker application at your earliest convenience.</p>
            </div>
            <div class="footer">
                <p>This is an automated message from the HRD Conference website.</p>
            </div>
        </div>
    </body>
    </html>
    HTML;
}

/**
 * Creates HTML email template for registration submissions
 * 
 * @param array $data Form data
 * @return string HTML email content
 */
function createRegistrationEmailTemplate($data) {
    $fullName = htmlspecialchars($data['fullName'] ?? '');
    $email = htmlspecialchars($data['email'] ?? '');
    $company = htmlspecialchars($data['company'] ?? '');
    $jobTitle = htmlspecialchars($data['jobTitle'] ?? '');
    $contactNumber = htmlspecialchars($data['contactNumber'] ?? '');
    $ticketType = htmlspecialchars($data['ticketType'] ?? '');
    
    return <<<HTML
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #003366; color: white; padding: 10px 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; }
            table td { padding: 8px; border-bottom: 1px solid #ddd; }
            table td:first-child { font-weight: bold; width: 40%; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>New Registration Submission</h2>
            </div>
            <div class="content">
                <p>A new registration has been submitted through the HRD Conference website:</p>
                <table>
                    <tr>
                        <td>Full Name:</td>
                        <td>$fullName</td>
                    </tr>
                    <tr>
                        <td>Email:</td>
                        <td>$email</td>
                    </tr>
                    <tr>
                        <td>Company:</td>
                        <td>$company</td>
                    </tr>
                    <tr>
                        <td>Job Title:</td>
                        <td>$jobTitle</td>
                    </tr>
                    <tr>
                        <td>Contact Number:</td>
                        <td>$contactNumber</td>
                    </tr>
                    <tr>
                        <td>Ticket Type:</td>
                        <td>$ticketType</td>
                    </tr>
                </table>
                
                <p>Please process this registration at your earliest convenience.</p>
            </div>
            <div class="footer">
                <p>This is an automated message from the HRD Conference website.</p>
            </div>
        </div>
    </body>
    </html>
    HTML;
}

/**
 * Creates confirmation email template for users who submitted forms
 * 
 * @param string $formType Type of form (sponsorship, speaker, registration)
 * @param array $data Form data
 * @return string HTML email content
 */
function createConfirmationEmailTemplate($formType, $data) {
    $fullName = htmlspecialchars($data['fullName'] ?? '');
    
    $title = '';
    $message = '';
    
    switch ($formType) {
        case 'sponsorship':
            $title = 'Sponsorship Inquiry Confirmation';
            $message = 'Thank you for your interest in sponsoring the HRD Conference. Our team will review your inquiry and get back to you shortly.';
            break;
        case 'speaker':
            $title = 'Speaker Application Confirmation';
            $message = 'Thank you for your interest in speaking at the HRD Conference. Our team will review your application and get back to you shortly.';
            break;
        case 'registration':
            $title = 'Registration Confirmation';
            $message = 'Thank you for registering for the HRD Conference. Our team will process your registration and send you further details shortly.';
            break;
        default:
            $title = 'Form Submission Confirmation';
            $message = 'Thank you for your submission. Our team will get back to you shortly.';
    }
    
    return <<<HTML
    <!DOCTYPE html>
    <html>
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #003366; color: white; padding: 10px 20px; text-align: center; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h2>$title</h2>
            </div>
            <div class="content">
                <p>Dear $fullName,</p>
                <p>$message</p>
                
                <p>If you have any questions, please don't hesitate to contact us.</p>
                
                <p>Best regards,<br>
                HRD Conference Team</p>
            </div>
            <div class="footer">
                <p>This is an automated message from the HRD Conference website.</p>
                <p>&copy; 2025 HRD Conference. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    HTML;
}
