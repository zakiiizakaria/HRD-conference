/**
 * Form Handler for Sponsorship, Speaker, and Registration Forms
 * Handles form submissions using PHP backend
 * With simplified approach for maximum compatibility across all devices including iOS
 */

// Make sure this script runs as soon as possible
window.onload = function() {
    console.log('Form handler script loaded and initializing...');
    // Slight delay to ensure all DOM elements are fully loaded
    setTimeout(function() {
        initFormHandlers();
    }, 100);
};

// Also try to initialize immediately in case window.onload is overridden
(function() {
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        setTimeout(initFormHandlers, 100);
    } else {
        document.addEventListener('DOMContentLoaded', function() {
            setTimeout(initFormHandlers, 100);
        });
    }
})();

// Function to handle form submissions
function initFormHandlers() {
    // Helper function to handle form submissions
    function submitForm(form, endpoint, successMessage) {
        // Show loading state
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="lni-spinner lni-spin-effect"></i> Sending...';
        
        // Create form data from the form
        const formData = new FormData(form);
        
        // Add device info
        formData.append('device_info', navigator.userAgent);
        
        // Determine the submit URL based on hostname
        const host = window.location.hostname;
        const isLocal = host === 'localhost' || host === '127.0.0.1';
        let submitUrl;
        if (isLocal) {
            submitUrl = '/HRD-Conference/public/' + endpoint;
        } else {
            submitUrl = '/' + endpoint;
        }
        console.log('Submitting to URL:', submitUrl);
        
        // Create a simple XMLHttpRequest (most compatible with all browsers)
        const xhr = new XMLHttpRequest();
        xhr.open('POST', submitUrl, true);
        
        // Set timeout - shorter timeout for better UX
        xhr.timeout = 10000; // 10 seconds
        
        // Setup completion handler
        xhr.onload = function() {
            if (xhr.status >= 200 && xhr.status < 300) {
                try {
                    // Try to parse JSON response
                    const response = JSON.parse(xhr.responseText);
                    if (response.success) {
                        showSuccessMessage(form, successMessage || 'Your submission has been successfully received.');
                        form.reset();
                    } else {
                        showErrorMessage(form, response.message || 'There was an error processing your submission. Please try again.');
                    }
                } catch (e) {
                    // If not JSON, check for success string in response
                    if (xhr.responseText.includes('success') && xhr.responseText.includes('true')) {
                        showSuccessMessage(form, successMessage || 'Your submission has been successfully received.');
                        form.reset();
                    } else {
                        showErrorMessage(form, 'There was a problem with the server response. Please try again later.');
                        console.error('Response parsing error:', e);
                    }
                }
            } else {
                showErrorMessage(form, 'Server error (' + xhr.status + '). Please try again later.');
            }
            
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        };
        
        // Error handler
        xhr.onerror = function() {
            showErrorMessage(form, 'Network error. Please check your connection and try again.');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        };
        
        // Timeout handler
        xhr.ontimeout = function() {
            showErrorMessage(form, 'Request is taking too long. Please try again later.');
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        };
        
        // Send the request
        xhr.send(formData);
        
        return false; // Prevent form submission
    }
    
    // Direct form attachment to prevent refreshes
    console.log('Looking for forms to attach handlers to...');
    
    // Sponsorship Form Handler
    const sponsorForm = document.getElementById('sponsor-form');
    if (sponsorForm) {
        console.log('Found sponsor form, attaching handler');
        sponsorForm.onsubmit = function(e) {
            console.log('Sponsor form submitted');
            e.preventDefault();
            e.stopPropagation();
            submitForm(sponsorForm, 'store-sponsorship.php', 'Your sponsorship inquiry has been successfully submitted!');
            return false; // Triple ensure no form submission
        };
    } else {
        console.log('Could not find sponsor form with ID "sponsor-form"');
    }
    
    // Speaker Form Handler
    const speakingForm = document.getElementById('speaking-form');
    if (speakingForm) {
        console.log('Found speaking form, attaching handler');
        speakingForm.onsubmit = function(e) {
            console.log('Speaking form submitted');
            e.preventDefault();
            e.stopPropagation();
            submitForm(speakingForm, 'store-speaker.php', 'Your speaking application has been successfully submitted!');
            return false; // Triple ensure no form submission
        };
    } else {
        console.log('Could not find speaking form with ID "speaking-form"');
    }
    
    // Registration Form Handler
    const registrationForm = document.getElementById('registration-form');
    if (registrationForm) {
        console.log('Found registration form, attaching handler');
        registrationForm.onsubmit = function(e) {
            console.log('Registration form submitted');
            e.preventDefault();
            e.stopPropagation();
            submitForm(registrationForm, 'store-registration.php', 'Your registration has been successfully submitted!');
            return false; // Triple ensure no form submission
        };
    } else {
        console.log('Could not find registration form with ID "registration-form"');
    }
    
    // Backup form handling - catch any forms that might have been missed
    document.querySelectorAll('form').forEach(function(form) {
        if (form.id === 'sponsor-form' || form.id === 'speaking-form' || form.id === 'registration-form') {
            // Already handled above
            return;
        }
        
        console.log('Found additional form, attaching generic handler:', form.id || 'unnamed form');
        form.onsubmit = function(e) {
            console.log('Generic form submitted:', form.id || 'unnamed form');
            e.preventDefault();
            e.stopPropagation();
            
            // Determine the endpoint based on form attributes or naming convention
            let endpoint = 'store-registration.php'; // Default fallback
            if (form.hasAttribute('data-endpoint')) {
                endpoint = form.getAttribute('data-endpoint');
            } else if (form.id && form.id.includes('sponsor')) {
                endpoint = 'store-sponsorship.php';
            } else if (form.id && (form.id.includes('speak') || form.id.includes('speaker'))) {
                endpoint = 'store-speaker.php';
            }
            
            submitForm(form, endpoint, 'Your form has been successfully submitted!');
            return false;
        };
    });
}

// Helper functions for form feedback
function showSuccessMessage(form, customMessage) {
    // Remove any existing messages
    removeMessages(form);
    
    // Create success message
    const successMessage = document.createElement('div');
    successMessage.className = 'form-message success-message';
    successMessage.innerHTML = customMessage || '<i class="lni-check-mark-circle"></i> Your form has been submitted successfully!';
    
    // Insert after form
    form.parentNode.insertBefore(successMessage, form.nextSibling);
    
    // Remove message after 5 seconds
    setTimeout(() => {
        if (successMessage.parentNode) {
            successMessage.parentNode.removeChild(successMessage);
        }
    }, 5000);
}

function showErrorMessage(form, customMessage) {
    // Remove any existing messages
    removeMessages(form);
    
    // Create error message
    const errorMessage = document.createElement('div');
    errorMessage.className = 'form-message error-message';
    errorMessage.innerHTML = customMessage || '<i class="lni-warning"></i> There was a problem submitting your form. Please try again.';
    
    // Insert after form
    form.parentNode.insertBefore(errorMessage, form.nextSibling);
    
    // Remove message after 15 seconds
    setTimeout(() => {
        if (errorMessage.parentNode) {
            errorMessage.parentNode.removeChild(errorMessage);
        }
    }, 15000); // Longer timeout for error messages to allow reading
}

function removeMessages(form) {
    // Remove any existing messages
    const existingMessages = form.parentNode.querySelectorAll('.form-message');
    existingMessages.forEach(message => {
        if (message.parentNode) {
            message.parentNode.removeChild(message);
        }
    });
}

// Function to log errors to server
function logErrorToServer(formType, error) {
    console.error('Form submission error:', formType, error);
    // This function can be expanded to send error logs to the server if needed
}
