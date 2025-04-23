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
            
            // Get input elements directly to properly check their values
            const fullNameInput = sponsorForm.querySelector('input[name="fullName"]');
            const emailInput = sponsorForm.querySelector('input[name="email"]');
            const companyInput = sponsorForm.querySelector('input[name="company"]');
            const jobTitleInput = sponsorForm.querySelector('input[name="jobTitle"]');
            const contactNumberInput = sponsorForm.querySelector('input[name="contactNumber"]');
            const interestInput = sponsorForm.querySelector('select[name="interest"]');
            
            // Get values from inputs
            const fullName = fullNameInput ? fullNameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const company = companyInput ? companyInput.value.trim() : '';
            const jobTitle = jobTitleInput ? jobTitleInput.value.trim() : '';
            const contactNumber = contactNumberInput ? contactNumberInput.value.trim() : '';
            const interest = interestInput ? interestInput.value.trim() : '';
            
            // Form validation is now handled in the submitFormData function
            
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
            
            // Form validation is now handled in the submitFormData function
            
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
            
            // Get input elements directly to properly check their values
            const fullNameInput = registrationForm.querySelector('input[placeholder="Full Name"]');
            const emailInput = registrationForm.querySelector('input[placeholder="Email Address"]');
            const companyInput = registrationForm.querySelector('input[placeholder="Company Name"]');
            const jobTitleInput = registrationForm.querySelector('input[placeholder="Job Title"]');
            const contactNumberInput = registrationForm.querySelector('input[placeholder="Contact Number"]');
            const promoCodeInput = registrationForm.querySelector('input[placeholder="Promo Code (optional)"]');
            
            // Get values from inputs
            const fullName = fullNameInput ? fullNameInput.value.trim() : '';
            const email = emailInput ? emailInput.value.trim() : '';
            const company = companyInput ? companyInput.value.trim() : '';
            const jobTitle = jobTitleInput ? jobTitleInput.value.trim() : '';
            const contactNumber = contactNumberInput ? contactNumberInput.value.trim() : '';
            const promoCode = promoCodeInput ? promoCodeInput.value.trim() : ''; // Optional
            
            // Form validation is now handled in the submitFormData function
            
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
    
    // Function to validate form fields before submission
    function validateForm(form) {
        let isValid = true;
        let errorMessage = '';
        
        // Determine which form we're validating
        const isRegistrationForm = form.id === 'pricing-form';
        const isSpeakingForm = form.id === 'speaking-form';
        const isSponsorForm = form.id === 'sponsor-form';
        
        // Get all required inputs based on form type
        let requiredFields = [];
        
        if (isRegistrationForm) {
            requiredFields = [
                { element: form.querySelector('input[placeholder="Full Name"]'), name: 'Full Name' },
                { element: form.querySelector('input[placeholder="Email Address"]'), name: 'Email Address' },
                { element: form.querySelector('input[placeholder="Company Name"]'), name: 'Company Name' },
                { element: form.querySelector('input[placeholder="Job Title"]'), name: 'Job Title' },
                { element: form.querySelector('input[placeholder="Contact Number"]'), name: 'Contact Number' }
            ];
        } else if (isSpeakingForm) {
            requiredFields = [
                { element: form.querySelector('input[placeholder="Full Name"]'), name: 'Full Name' },
                { element: form.querySelector('input[placeholder="Email Address"]'), name: 'Email Address' },
                { element: form.querySelector('input[placeholder="Company Name"]'), name: 'Company Name' },
                { element: form.querySelector('input[placeholder="Job Title"]'), name: 'Job Title' },
                { element: form.querySelector('input[placeholder="Contact Number"]'), name: 'Contact Number' },
                { element: form.querySelector('textarea[placeholder="Speaking Topic"]'), name: 'Speaking Topic' }
            ];
        } else if (isSponsorForm) {
            requiredFields = [
                { element: form.querySelector('input[name="fullName"]'), name: 'Full Name' },
                { element: form.querySelector('input[name="email"]'), name: 'Email Address' },
                { element: form.querySelector('input[name="company"]'), name: 'Company Name' },
                { element: form.querySelector('input[name="jobTitle"]'), name: 'Job Title' },
                { element: form.querySelector('input[name="contactNumber"]'), name: 'Contact Number' },
                { element: form.querySelector('select[name="interest"]'), name: 'Interest Level' }
            ];
        }
        
        // Check each required field
        const missingFields = [];
        for (const field of requiredFields) {
            if (!field.element || !field.element.value.trim()) {
                isValid = false;
                missingFields.push(field.name);
            }
        }
        
        // Create error message if needed
        if (missingFields.length > 0) {
            errorMessage = 'Please fill in the following required fields: ' + missingFields.join(', ');
        }
        
        return { isValid, errorMessage };
    }
    
    // Function to submit form with optimized settings for mobile
    async function submitFormData(form, url, formData) {
        // First validate the form
        const validation = validateForm(form);
        if (!validation.isValid) {
            showErrorMessage(form, validation.errorMessage);
            return Promise.reject(new Error(validation.errorMessage));
        }
        
        // Show loading indicator
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="lni-spinner lni-spin-effect"></i> Sending...';
        
        try {
            // Detect device type
            const isIOS = /iPhone|iPad|iPod/i.test(navigator.userAgent);
            const isAndroid = /Android/i.test(navigator.userAgent);
            const isMobile = isIOS || isAndroid;
            
            // Special handling for iOS devices
            if (isIOS) {
                return new Promise((resolve, reject) => {
                    // Create a hidden iframe for iOS form submission
                    // This avoids issues with iOS Safari's handling of XMLHttpRequest and FormData
                    const iframe = document.createElement('iframe');
                    iframe.name = 'hidden_iframe_' + Date.now();
                    iframe.style.display = 'none';
                    document.body.appendChild(iframe);
                    
                    // Create a temporary form
                    const tempForm = document.createElement('form');
                    tempForm.method = 'POST';
                    tempForm.action = url;
                    tempForm.target = iframe.name;
                    tempForm.style.display = 'none';
                    tempForm.enctype = 'multipart/form-data';
                    
                    // Add all form data to the temporary form
                    for (const pair of formData.entries()) {
                        const input = document.createElement('input');
                        input.type = 'hidden';
                        input.name = pair[0];
                        input.value = pair[1];
                        tempForm.appendChild(input);
                    }
                    
                    // Add a special field to indicate this is an AJAX request
                    const ajaxInput = document.createElement('input');
                    ajaxInput.type = 'hidden';
                    ajaxInput.name = 'is_ajax_request';
                    ajaxInput.value = '1';
                    tempForm.appendChild(ajaxInput);
                    
                    // Add the form to the document
                    document.body.appendChild(tempForm);
                    
                    // Set up a timeout
                    const timeoutId = setTimeout(() => {
                        cleanUp();
                        reject(new Error('Request timed out'));
                    }, 30000); // 30 seconds timeout
                    
                    // Function to clean up the temporary elements
                    const cleanUp = () => {
                        clearTimeout(timeoutId);
                        if (iframe) {
                            iframe.onload = null;
                            document.body.removeChild(iframe);
                        }
                        if (tempForm) {
                            document.body.removeChild(tempForm);
                        }
                    };
                    
                    // Handle the response
                    iframe.onload = function() {
                        try {
                            // Try to get the response from the iframe
                            const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
                            const responseText = iframeContent.body.innerText || iframeContent.body.textContent;
                            
                            let data;
                            try {
                                data = JSON.parse(responseText);
                            } catch (e) {
                                // If not valid JSON, create a success response anyway
                                data = { success: true, message: 'Form submitted successfully' };
                            }
                            
                            cleanUp();
                            resolve(data);
                        } catch (e) {
                            cleanUp();
                            // If we can't parse the response but the form submitted, consider it a success
                            resolve({ success: true, message: 'Form submitted successfully' });
                        }
                    };
                    
                    // Handle errors
                    iframe.onerror = function() {
                        cleanUp();
                        reject(new Error('Network error occurred'));
                    };
                    
                    // Submit the form
                    tempForm.submit();
                });
            } 
            // For Android and other mobile devices, use XMLHttpRequest
            else if (isMobile) {
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
                                // If not valid JSON but status is OK, consider it a success
                                if (xhr.status === 200) {
                                    resolve({ success: true, message: 'Form submitted successfully' });
                                } else {
                                    reject(new Error('Invalid JSON response'));
                                }
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
            } 
            // For desktop, use fetch with retry
            else {
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
