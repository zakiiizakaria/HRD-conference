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
            const isProduction = window.location.hostname === 'hrdconference.com';
            const logUrl = isProduction 
                ? 'https://hrdconference.com/log-error.php' 
                : 'http://localhost:8080/HRD-Conference/public/log-error.php';
            
            // Gather more detailed information
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
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(errorData),
                        // Longer timeout for error logging
                        timeout: 15000
                    });
                    
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
                
            // Detect if on mobile network
            const isMobileNetwork = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            // Add retry mechanism for mobile networks
            const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
                try {
                    const response = await fetch(url, options);
                    
                    // Check if response is ok (status in the range 200-299)
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
                    }
                    
                    return response;
                } catch (err) {
                    if (retries <= 1) throw err;
                    
                    // Exponential backoff - increase delay with each retry
                    const nextDelay = delay * 1.5;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                    return fetchWithRetry(url, options, retries - 1, nextDelay);
                }
            };
            
            // Use more robust fetch with retry for mobile
            fetchWithRetry(scriptUrl, {
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
                },
                // Increase timeout for mobile networks
                timeout: isMobileNetwork ? 30000 : 10000
            })
            .then(response => response.json())
            .then(data => {
                
                if (data.success) {
                    // Show success message
                    showSuccessMessage(sponsorForm, 'Your sponsorship inquiry has been successfully submitted and stored in our database.');
                    
                    // Reset form
                    sponsorForm.reset();
                } else {
                    // Show error message
                    showErrorMessage(sponsorForm, 'There was a problem storing your inquiry: ' + data.message);
                }
            })
            .catch(error => {
                // Log error to server-side log file
                window.logErrorToServer('sponsorship', error);
                
                // Show generic error message to user
                showErrorMessage(sponsorForm, 'There was a problem submitting your form. Please try again or contact us directly at admin@hrdconference.com');
            })
            .finally(() => {
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
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
                
            // Detect if on mobile network
            const isMobileNetwork = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            // Add retry mechanism for mobile networks
            const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
                try {
                    const response = await fetch(url, options);
                    
                    // Check if response is ok (status in the range 200-299)
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
                    }
                    
                    return response;
                } catch (err) {
                    if (retries <= 1) throw err;
                    
                    // Exponential backoff - increase delay with each retry
                    const nextDelay = delay * 1.5;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                    return fetchWithRetry(url, options, retries - 1, nextDelay);
                }
            };
            
            // Use more robust fetch with retry for mobile
            fetchWithRetry(scriptUrl, {
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
                },
                // Increase timeout for mobile networks
                timeout: isMobileNetwork ? 30000 : 10000
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    showSuccessMessage(speakingForm, 'Your speaker application has been successfully submitted and stored in our database.');
                    
                    // Reset form
                    speakingForm.reset();
                } else {
                    // Show error message
                    showErrorMessage(speakingForm, 'There was a problem storing your application: ' + data.message);
                }
            })
            .catch(error => {
                // Log error to server-side log file
                window.logErrorToServer('speaker', error);
                
                // Show generic error message to user
                showErrorMessage(speakingForm, 'There was a problem submitting your form. Please try again or contact us directly at admin@hrdconference.com');
            })
            .finally(() => {
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
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
                
            // Detect if on mobile network
            const isMobileNetwork = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
            
            // Add retry mechanism for mobile networks
            const fetchWithRetry = async (url, options, retries = 3, delay = 1000) => {
                try {
                    const response = await fetch(url, options);
                    
                    // Check if response is ok (status in the range 200-299)
                    if (!response.ok) {
                        const errorText = await response.text();
                        throw new Error(`Server responded with status ${response.status}: ${errorText}`);
                    }
                    
                    return response;
                } catch (err) {
                    if (retries <= 1) throw err;
                    
                    // Exponential backoff - increase delay with each retry
                    const nextDelay = delay * 1.5;
                    await new Promise(resolve => setTimeout(resolve, delay));
                    
                    return fetchWithRetry(url, options, retries - 1, nextDelay);
                }
            };
            
            // Use more robust fetch with retry for mobile
            fetchWithRetry(scriptUrl, {
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
                },
                // Increase timeout for mobile networks
                timeout: isMobileNetwork ? 30000 : 10000
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    showSuccessMessage(registrationForm, 'Your registration has been successfully submitted and stored in our database.');
                    
                    // Reset form
                    registrationForm.reset();
                } else {
                    // Show error message
                    showErrorMessage(registrationForm, 'There was a problem with your registration: ' + data.message);
                }
            })
            .catch(error => {
                // Log error to server-side log file
                window.logErrorToServer('registration', error);
                
                // Show generic error message to user
                showErrorMessage(registrationForm, 'There was a problem submitting your form. Please try again or contact us directly at admin@hrdconference.com');
            })
            .finally(() => {
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            });
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
}

// Initialize form handlers
initializeFormHandlers();
