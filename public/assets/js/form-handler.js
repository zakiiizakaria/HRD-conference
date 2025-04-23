/**
 * Form Handler for Sponsorship, Speaker, and Registration Forms
 * Handles form submissions using PHP backend
 */

// Initialize form handlers immediately
function initializeFormHandlers() {
    document.addEventListener('DOMContentLoaded', function() {
        initFormHandlers();
    });
}

// Function to handle form submissions
function initFormHandlers() {
    
    // Sponsorship Form Handler
    const sponsorForm = document.getElementById('sponsor-form');
    if (sponsorForm) {
        sponsorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const fullName = sponsorForm.querySelector('input[name="fullName"]').value;
            const email = sponsorForm.querySelector('input[name="email"]').value;
            const company = sponsorForm.querySelector('input[name="company"]').value;
            const jobTitle = sponsorForm.querySelector('input[name="jobTitle"]').value;
            const contactNumber = sponsorForm.querySelector('input[name="contactNumber"]').value;
            const interest = sponsorForm.querySelector('select[name="interest"]').value;
            
            // Show loading state
            const submitBtn = sponsorForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="lni-spinner lni-spin-effect"></i> Sending...';
            submitBtn.disabled = true;
            
            // Create form data for AJAX request
            const formData = new FormData();
            formData.append('fullName', fullName);
            formData.append('email', email);
            formData.append('company', company);
            formData.append('jobTitle', jobTitle);
            formData.append('contactNumber', contactNumber);
            formData.append('interest', interest);
            
            // Send data to PHP script for database storage
            const isProduction = window.location.hostname === 'hrdconference.com';
            const scriptUrl = isProduction 
                ? 'https://hrdconference.com/store-sponsorship.php' 
                : 'http://localhost:8080/HRD-Conference/public/store-sponsorship.php';
                
            // Add detailed debug info
            formData.append('device_info', navigator.userAgent);
            
            // Add network information if available
            if (navigator.connection) {
                formData.append('network_type', navigator.connection.type || 'unknown');
                formData.append('network_downlink', navigator.connection.downlink || 'unknown');
                formData.append('network_rtt', navigator.connection.rtt || 'unknown');
            }
            
            // Use XMLHttpRequest instead of fetch for better compatibility on mobile
            const xhr = new XMLHttpRequest();
            
            // Set up event listeners
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            if (data.success) {
                                // Show success message
                                showSuccessMessage(sponsorForm, 'Your sponsorship inquiry has been successfully submitted and stored in our database.');
                                
                                // Reset form
                                sponsorForm.reset();
                            } else {
                                // Show error message
                                showErrorMessage(sponsorForm, 'There was a problem storing your inquiry: ' + data.message);
                            }
                        } catch (e) {
                            showErrorMessage(sponsorForm, 'Error parsing response: ' + e.message + '<br>Response: ' + xhr.responseText.substring(0, 200));
                        }
                    } else {
                        showErrorMessage(sponsorForm, 'Server error: ' + xhr.status + ' ' + xhr.statusText + '<br>Response: ' + xhr.responseText.substring(0, 200));
                    }
                    
                    // Reset button state
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            };
            
            xhr.onerror = function(e) {
                // Get detailed error information
                const errorDetails = {
                    readyState: xhr.readyState,
                    status: xhr.status,
                    statusText: xhr.statusText || 'No status text',
                    responseType: xhr.responseType,
                    responseURL: xhr.responseURL || 'No response URL',
                    errorEvent: e ? e.type : 'No event details'
                };
                
                console.error('XHR Error Details:', errorDetails);
                
                // Special handling for iPhone SE
                if (navigator.userAgent.includes('iPhone') && !navigator.userAgent.includes('iPhone OS 1') && !navigator.userAgent.includes('iPhone OS 1')) {
                    showErrorMessage(sponsorForm, 'Network error on iPhone. Please try using WiFi instead of cellular data, or try again later.<br>Error details: ' + JSON.stringify(errorDetails));
                } else {
                    showErrorMessage(sponsorForm, 'Network error occurred. Please check your connection and try again.<br>Error details: ' + JSON.stringify(errorDetails));
                }
                
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            };
            
            xhr.ontimeout = function() {
                showErrorMessage(sponsorForm, 'Request timed out. Please try again.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            };
            
            // Add additional headers and settings for better mobile compatibility
            try {
                // Open and send the request
                xhr.open('POST', scriptUrl, true);
                xhr.timeout = 30000; // 30 seconds timeout
                
                // Log the request details for debugging
                console.log('Sending request to:', scriptUrl);
                
                // Add a specific header to identify mobile submissions
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                
                // Send the form data
                xhr.send(formData);
                
                // Log that the request was sent
                console.log('Request sent successfully');
            } catch (e) {
                // Catch any errors that occur during request setup
                console.error('Error setting up request:', e);
                showErrorMessage(sponsorForm, 'Error setting up request: ' + e.message);
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }

    // Speaking Opportunity Form Handler
    const speakingForm = document.getElementById('speaking-form');
    if (speakingForm) {
        speakingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const fullName = speakingForm.querySelector('input[placeholder="Full Name"]').value;
            const email = speakingForm.querySelector('input[placeholder="Email Address"]').value;
            const company = speakingForm.querySelector('input[placeholder="Company Name"]').value;
            const jobTitle = speakingForm.querySelector('input[placeholder="Job Title"]').value;
            const contactNumber = speakingForm.querySelector('input[placeholder="Contact Number"]').value;
            
            // Show loading state
            const submitBtn = speakingForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="lni-spinner lni-spin-effect"></i> Sending...';
            submitBtn.disabled = true;
            
            // Create form data for AJAX request
            const formData = new FormData();
            formData.append('fullName', fullName);
            formData.append('email', email);
            formData.append('company', company);
            formData.append('jobTitle', jobTitle);
            formData.append('contactNumber', contactNumber);
            
            // Send data to PHP script for database storage
            const isProduction = window.location.hostname === 'hrdconference.com';
            const scriptUrl = isProduction 
                ? 'https://hrdconference.com/store-speaker.php' 
                : 'http://localhost:8080/HRD-Conference/public/store-speaker.php';
                
            // Add detailed debug info
            formData.append('device_info', navigator.userAgent);
            
            // Add network information if available
            if (navigator.connection) {
                formData.append('network_type', navigator.connection.type || 'unknown');
                formData.append('network_downlink', navigator.connection.downlink || 'unknown');
                formData.append('network_rtt', navigator.connection.rtt || 'unknown');
            }
            
            // Use XMLHttpRequest instead of fetch for better compatibility on mobile
            const xhr = new XMLHttpRequest();
            
            // Set up event listeners
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            if (data.success) {
                                // Show success message
                                showSuccessMessage(speakingForm, 'Your speaker application has been successfully submitted and stored in our database.');
                                
                                // Reset form
                                speakingForm.reset();
                            } else {
                                // Show error message
                                showErrorMessage(speakingForm, 'There was a problem storing your application: ' + data.message);
                            }
                        } catch (e) {
                            showErrorMessage(speakingForm, 'Error parsing response: ' + e.message + '<br>Response: ' + xhr.responseText.substring(0, 200));
                        }
                    } else {
                        showErrorMessage(speakingForm, 'Server error: ' + xhr.status + ' ' + xhr.statusText + '<br>Response: ' + xhr.responseText.substring(0, 200));
                    }
                    
                    // Reset button state
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            };
            
            xhr.onerror = function(e) {
                // Get detailed error information
                const errorDetails = {
                    readyState: xhr.readyState,
                    status: xhr.status,
                    statusText: xhr.statusText || 'No status text',
                    responseType: xhr.responseType,
                    responseURL: xhr.responseURL || 'No response URL',
                    errorEvent: e ? e.type : 'No event details'
                };
                
                console.error('XHR Error Details:', errorDetails);
                
                // Special handling for iPhone SE
                if (navigator.userAgent.includes('iPhone') && !navigator.userAgent.includes('iPhone OS 1') && !navigator.userAgent.includes('iPhone OS 1')) {
                    showErrorMessage(speakingForm, 'Network error on iPhone. Please try using WiFi instead of cellular data, or try again later.<br>Error details: ' + JSON.stringify(errorDetails));
                } else {
                    showErrorMessage(speakingForm, 'Network error occurred. Please check your connection and try again.<br>Error details: ' + JSON.stringify(errorDetails));
                }
                
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            };
            
            xhr.ontimeout = function() {
                showErrorMessage(speakingForm, 'Request timed out. Please try again.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            };
            
            // Add additional headers and settings for better mobile compatibility
            try {
                // Open and send the request
                xhr.open('POST', scriptUrl, true);
                xhr.timeout = 30000; // 30 seconds timeout
                
                // Log the request details for debugging
                console.log('Sending request to:', scriptUrl);
                
                // Add a specific header to identify mobile submissions
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                
                // Send the form data
                xhr.send(formData);
                
                // Log that the request was sent
                console.log('Request sent successfully');
            } catch (e) {
                // Catch any errors that occur during request setup
                console.error('Error setting up request:', e);
                showErrorMessage(speakingForm, 'Error setting up request: ' + e.message);
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Registration Form Handler
    const registrationForm = document.getElementById('pricing-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const fullName = registrationForm.querySelector('input[placeholder="Full Name"]').value;
            const email = registrationForm.querySelector('input[placeholder="Email Address"]').value;
            const company = registrationForm.querySelector('input[placeholder="Company Name"]').value;
            const jobTitle = registrationForm.querySelector('input[placeholder="Job Title"]').value;
            const contactNumber = registrationForm.querySelector('input[placeholder="Contact Number"]').value;
            const promoCode = registrationForm.querySelector('input[placeholder="Promo Code (optional)"]').value;
            
            // Show loading state
            const submitBtn = registrationForm.querySelector('button[type="submit"]');
            const originalBtnText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="lni-spinner lni-spin-effect"></i> Sending...';
            submitBtn.disabled = true;
            
            // Create form data for AJAX request
            const formData = new FormData();
            formData.append('fullName', fullName);
            formData.append('email', email);
            formData.append('company', company);
            formData.append('jobTitle', jobTitle);
            formData.append('contactNumber', contactNumber);
            formData.append('promoCode', promoCode);
            
            // Send data to PHP script for database storage
            const isProduction = window.location.hostname === 'hrdconference.com';
            const scriptUrl = isProduction 
                ? 'https://hrdconference.com/store-registration.php' 
                : 'http://localhost:8080/HRD-Conference/public/store-registration.php';
                
            // Add detailed debug info
            formData.append('device_info', navigator.userAgent);
            
            // Add network information if available
            if (navigator.connection) {
                formData.append('network_type', navigator.connection.type || 'unknown');
                formData.append('network_downlink', navigator.connection.downlink || 'unknown');
                formData.append('network_rtt', navigator.connection.rtt || 'unknown');
            }
            
            // Use XMLHttpRequest instead of fetch for better compatibility on mobile
            const xhr = new XMLHttpRequest();
            
            // Set up event listeners
            xhr.onreadystatechange = function() {
                if (xhr.readyState === 4) {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        try {
                            const data = JSON.parse(xhr.responseText);
                            if (data.success) {
                                // Show success message
                                showSuccessMessage(registrationForm, 'Your registration has been successfully submitted and stored in our database.');
                                
                                // Reset form
                                registrationForm.reset();
                            } else {
                                // Show error message
                                showErrorMessage(registrationForm, 'There was a problem with your registration: ' + data.message);
                            }
                        } catch (e) {
                            showErrorMessage(registrationForm, 'Error parsing response: ' + e.message + '<br>Response: ' + xhr.responseText.substring(0, 200));
                        }
                    } else {
                        showErrorMessage(registrationForm, 'Server error: ' + xhr.status + ' ' + xhr.statusText + '<br>Response: ' + xhr.responseText.substring(0, 200));
                    }
                    
                    // Reset button state
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
            };
            
            xhr.onerror = function(e) {
                // Get detailed error information
                const errorDetails = {
                    readyState: xhr.readyState,
                    status: xhr.status,
                    statusText: xhr.statusText || 'No status text',
                    responseType: xhr.responseType,
                    responseURL: xhr.responseURL || 'No response URL',
                    errorEvent: e ? e.type : 'No event details'
                };
                
                console.error('XHR Error Details:', errorDetails);
                
                // Special handling for iPhone SE
                if (navigator.userAgent.includes('iPhone') && !navigator.userAgent.includes('iPhone OS 1') && !navigator.userAgent.includes('iPhone OS 1')) {
                    showErrorMessage(registrationForm, 'Network error on iPhone. Please try using WiFi instead of cellular data, or try again later.<br>Error details: ' + JSON.stringify(errorDetails));
                } else {
                    showErrorMessage(registrationForm, 'Network error occurred. Please check your connection and try again.<br>Error details: ' + JSON.stringify(errorDetails));
                }
                
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            };
            
            xhr.ontimeout = function() {
                showErrorMessage(registrationForm, 'Request timed out. Please try again.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            };
            
            // Add additional headers and settings for better mobile compatibility
            try {
                // Open and send the request
                xhr.open('POST', scriptUrl, true);
                xhr.timeout = 30000; // 30 seconds timeout
                
                // Log the request details for debugging
                console.log('Sending request to:', scriptUrl);
                
                // Add a specific header to identify mobile submissions
                xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                
                // Send the form data
                xhr.send(formData);
                
                // Log that the request was sent
                console.log('Request sent successfully');
            } catch (e) {
                // Catch any errors that occur during request setup
                console.error('Error setting up request:', e);
                showErrorMessage(registrationForm, 'Error setting up request: ' + e.message);
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }
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
        
        // Reset form
        form.reset();
        
        // Remove message after 5 seconds
        setTimeout(() => {
            successMessage.remove();
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
            errorMessage.remove();
        }, 15000); // Longer timeout for error messages to allow reading
    }
    
    function removeMessages(form) {
        // Remove any existing messages
        const existingMessages = form.parentNode.querySelectorAll('.form-message');
        existingMessages.forEach(message => message.remove());
    }
}

// Initialize form handlers
initializeFormHandlers();
