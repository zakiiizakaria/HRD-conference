/**
 * Form Handler for Sponsorship, Speaker, and Registration Forms
 * Handles form submissions using PHP backend
 */

// Initialize form handlers immediately
function initializeFormHandlers() {
    // Clear any potential cached EmailJS data
    if (window.localStorage) {
        // Remove any EmailJS related items from localStorage
        Object.keys(localStorage).forEach(key => {
            if (key.includes('emailjs') || key.includes('email-js')) {
                localStorage.removeItem(key);
            }
        });
    }
    
    // Clear any potential service worker cache
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then(registrations => {
            for (let registration of registrations) {
                registration.unregister();
            }
        });
    }
    
    // Function to log errors to server
    window.logErrorToServer = async function(formType, error) {
        try {
            // Determine which endpoint to use based on form type
            const isProduction = window.location.hostname === 'hrdconference.com';
            let logUrl;
            
            // Use the appropriate form handler PHP file directly
            if (formType === 'registration') {
                logUrl = isProduction 
                    ? 'https://hrdconference.com/store-registration.php' 
                    : 'http://localhost:8080/HRD-Conference/public/store-registration.php';
            } else if (formType === 'speaker') {
                logUrl = isProduction 
                    ? 'https://hrdconference.com/store-speaker.php' 
                    : 'http://localhost:8080/HRD-Conference/public/store-speaker.php';
            } else { // Default to sponsorship
                logUrl = isProduction 
                    ? 'https://hrdconference.com/store-sponsorship.php' 
                    : 'http://localhost:8080/HRD-Conference/public/store-sponsorship.php';
            }
            
            // Gather detailed information about the error
            const errorData = {
                formType: formType,
                errorType: error.name || 'Unknown',
                errorMessage: error.message || 'No message',
                userAgent: navigator.userAgent,
                online: navigator.onLine,
                screenWidth: window.innerWidth,
                screenHeight: window.innerHeight,
                isMobile: /iPhone|iPad|iPod|Android/i.test(navigator.userAgent),
                networkType: navigator.connection ? navigator.connection.effectiveType : 'unknown',
                timestamp: new Date().toISOString(),
                url: window.location.href
            };
            
            // Add stack trace if available
            if (error.stack) {
                errorData.stack = error.stack;
            }
            
            // Send error data to server with retry
            const sendWithRetry = async (retries = 3) => {
                try {
                    const response = await fetch(logUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Client-Error': 'true' // Special header to indicate this is an error report
                        },
                        body: JSON.stringify(errorData),
                        credentials: 'include',
                        mode: 'cors',
                        cache: 'no-store',
                        // Longer timeout for error logging
                        timeout: 15000
                    });
                    
                    if (!response.ok) {
                        throw new Error(`Server responded with status ${response.status}`);
                    }
                    
                    return await response.json();
                } catch (err) {
                    if (retries <= 1) throw err;
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    return sendWithRetry(retries - 1);
                }
            };
            
            await sendWithRetry();
        } catch (e) {
            // If logging fails, fallback to console
            console.error('Error logging failed:', e);
        }
    };
    
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
            const formData = new FormData(sponsorForm);
            const fullName = formData.get('fullName');
            const email = formData.get('email');
            const company = formData.get('company');
            const jobTitle = formData.get('jobTitle');
            const contactNumber = formData.get('contactNumber');
            const interest = formData.get('interest');
            
            // Validate form
            if (!fullName || !email || !company || !jobTitle || !contactNumber || !interest) {
                showErrorMessage(sponsorForm, 'Please fill in all required fields.');
                return;
            }
            
            // Append form data
            formData.append('fullName', fullName);
            formData.append('email', email);
            formData.append('company', company);
            formData.append('jobTitle', jobTitle);
            formData.append('contactNumber', contactNumber);
            
            // Send data to PHP script for database storage
            const isProduction = window.location.hostname === 'hrdconference.com';
            const scriptUrl = isProduction 
                ? 'https://hrdconference.com/store-sponsorship.php' 
                : 'http://localhost:8080/HRD-Conference/public/store-sponsorship.php';
            
            // Submit form using the optimized function
            submitFormData(sponsorForm, scriptUrl, formData)
                .then(data => {
                    if (data.success) {
                        // Show success message
                        showSuccessMessage(sponsorForm, 'Your sponsorship inquiry has been successfully submitted and stored in our database.');
                        
                        // Reset form
                        sponsorForm.reset();
                    } else {
                        // Show error message
                        showErrorMessage(sponsorForm, data.message || 'There was a problem with your submission. Please try again.');
                    }
                })
                .catch(error => {
                    // Log error to server-side log file
                    window.logErrorToServer('sponsorship', error);
                    
                    // Show generic error message to user
                    showErrorMessage(sponsorForm, 'There was a problem submitting your form. Please try again or contact us directly at admin@hrdconference.com');
                });
        });
    }

    // Speaking Opportunity Form Handler
    const speakingForm = document.getElementById('speaking-form');
    if (speakingForm) {
        speakingForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(speakingForm);
            const fullName = formData.get('fullName');
            const email = formData.get('email');
            const company = formData.get('company');
            const jobTitle = formData.get('jobTitle');
            const contactNumber = formData.get('contactNumber');
            
            // Validate form
            if (!fullName || !email || !company || !jobTitle || !contactNumber) {
                showErrorMessage(speakingForm, 'Please fill in all required fields.');
                return;
            }
            
            // Append form data
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
            
            // Submit form using the optimized function
            submitFormData(speakingForm, scriptUrl, formData)
                .then(data => {
                    if (data.success) {
                        // Show success message
                        showSuccessMessage(speakingForm, 'Your speaker application has been successfully submitted and stored in our database.');
                        
                        // Reset form
                        speakingForm.reset();
                    } else {
                        // Show error message
                        showErrorMessage(speakingForm, data.message || 'There was a problem with your submission. Please try again.');
                    }
                })
                .catch(error => {
                    // Log error to server-side log file
                    window.logErrorToServer('speaker', error);
                    
                    // Show generic error message to user
                    showErrorMessage(speakingForm, 'There was a problem submitting your form. Please try again or contact us directly at admin@hrdconference.com');
                });
        });
    }
    
    // Registration Form Handler
    const registrationForm = document.getElementById('pricing-form');
    if (registrationForm) {
        registrationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(registrationForm);
            const fullName = formData.get('fullName');
            const email = formData.get('email');
            const company = formData.get('company');
            const jobTitle = formData.get('jobTitle');
            const contactNumber = formData.get('contactNumber');
            const promoCode = formData.get('promoCode') || ''; // Optional
            
            // Validate form
            if (!fullName || !email || !company || !jobTitle || !contactNumber) {
                showErrorMessage(registrationForm, 'Please fill in all required fields.');
                return;
            }
            
            // Append form data
            formData.append('fullName', fullName);
            formData.append('email', email);
            formData.append('company', company);
            formData.append('jobTitle', jobTitle);
            formData.append('contactNumber', contactNumber);
            
            // Send data to PHP script for database storage
            const isProduction = window.location.hostname === 'hrdconference.com';
            const scriptUrl = isProduction 
                ? 'https://hrdconference.com/store-registration.php' 
                : 'http://localhost:8080/HRD-Conference/public/store-registration.php';
            
            // Submit form using the optimized function
            submitFormData(registrationForm, scriptUrl, formData)
                .then(data => {
                    if (data.success) {
                        // Show success message
                        showSuccessMessage(registrationForm, 'Your registration has been successfully submitted and stored in our database.');
                        
                        // Reset form
                        registrationForm.reset();
                    } else {
                        // Show error message
                        showErrorMessage(registrationForm, data.message || 'There was a problem with your submission. Please try again.');
                    }
                })
                .catch(error => {
                    // Log error to server-side log file
                    window.logErrorToServer('registration', error);
                    
                    // Show generic error message to user
                    showErrorMessage(registrationForm, 'There was a problem submitting your form. Please try again or contact us directly at admin@hrdconference.com');
                });
        });
    }
    
    // Helper functions for form feedback
    function showSuccessMessage(form, message) {
        // Remove any existing messages
        removeMessages(form);
        
        // Create success message
        const successMessage = document.createElement('div');
        successMessage.className = 'form-message success-message';
        successMessage.innerHTML = message || '<i class="lni-check-mark-circle"></i> Your form has been submitted successfully!';
        
        // Insert after form
        form.parentNode.insertBefore(successMessage, form.nextSibling);
        
        // Reset form
        form.reset();
        
        // Remove message after 5 seconds
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }
    
    function showErrorMessage(form, message) {
        // Remove any existing messages
        removeMessages(form);
        
        // Create error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'form-message error-message';
        errorMessage.innerHTML = message || '<i class="lni-warning"></i> There was a problem submitting your form. Please try again.';
        
        // Insert after form
        form.parentNode.insertBefore(errorMessage, form.nextSibling);
        
        // Remove message after 5 seconds
        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }
    
    function removeMessages(form) {
        // Remove any existing messages
        const existingMessages = form.parentNode.querySelectorAll('.form-message');
        existingMessages.forEach(message => message.remove());
    }
    
    // Function to submit form with optimized settings for mobile
    async function submitFormData(form, url, formData) {
        // Show loading indicator
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="lni-spinner lni-spin-effect"></i> Sending...';
        
        try {
            // For mobile devices, use XMLHttpRequest which can be more reliable on some mobile networks
            const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            if (isMobile) {
                return new Promise((resolve, reject) => {
                    const xhr = new XMLHttpRequest();
                    
                    // Set up timeout (longer for mobile)
                    xhr.timeout = 30000; // 30 seconds
                    
                    xhr.open('POST', url, true);
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    xhr.setRequestHeader('Cache-Control', 'no-cache');
                    
                    // Handle response
                    xhr.onload = function() {
                        if (xhr.status >= 200 && xhr.status < 300) {
                            try {
                                const data = JSON.parse(xhr.responseText);
                                resolve(data);
                            } catch (e) {
                                reject(new Error('Invalid JSON response'));
                            }
                        } else {
                            reject(new Error('Request failed with status: ' + xhr.status));
                        }
                    };
                    
                    // Handle errors
                    xhr.onerror = function() {
                        reject(new Error('Network error occurred'));
                    };
                    
                    xhr.ontimeout = function() {
                        reject(new Error('Request timed out'));
                    };
                    
                    // Send the form data
                    xhr.send(formData);
                });
            } else {
                // For desktop, use fetch with retry
                const fetchWithRetry = async (retries = 3, delay = 1000) => {
                    try {
                        const response = await fetch(url, {
                            method: 'POST',
                            body: formData,
                            credentials: 'include',
                            mode: 'cors',
                            cache: 'no-store',
                            headers: {
                                'Cache-Control': 'no-cache',
                                'Pragma': 'no-cache',
                                'X-Requested-With': 'XMLHttpRequest',
                                'Accept': 'application/json'
                            }
                        });
                        
                        if (!response.ok) {
                            throw new Error(`Server responded with status ${response.status}`);
                        }
                        
                        return await response.json();
                    } catch (err) {
                        if (retries <= 1) throw err;
                        await new Promise(resolve => setTimeout(resolve, delay));
                        return fetchWithRetry(retries - 1, delay * 1.5);
                    }
                };
                
                return await fetchWithRetry();
            }
        } finally {
            // Reset button state
            submitBtn.innerHTML = originalBtnText;
            submitBtn.disabled = false;
        }
    }
}

// Initialize form handlers
initializeFormHandlers();
