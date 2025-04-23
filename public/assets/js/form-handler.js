/**
 * Form Handler for Sponsorship, Speaker, and Registration Forms
 * Handles form submissions using PHP backend
 * With special handling for iPhone SE and older iPhones
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
            
            // Detect if this is an iPhone SE or older iPhone
            const isOlderIPhone = navigator.userAgent.includes('iPhone') && 
                (navigator.userAgent.includes('iPhone OS 9') || 
                 navigator.userAgent.includes('iPhone OS 10') || 
                 navigator.userAgent.includes('iPhone OS 11') || 
                 navigator.userAgent.includes('iPhone OS 12') || 
                 navigator.userAgent.includes('iPhone OS 13') ||
                 navigator.userAgent.includes('iPhone SE'));
            
            // For iPhone SE and older iPhones, use Fetch API instead of XMLHttpRequest
            if (isOlderIPhone) {
                // Using Fetch API for iPhone SE
                
                // Use Fetch API for iPhone SE
                fetch(scriptUrl, {
                    method: 'POST',
                    body: formData,
                    mode: 'cors',
                    cache: 'no-cache',
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer'
                })
                .then(response => {

                    return response.json();
                })
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
                    
                    // Reset button state
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                })
                .catch(error => {

                    
                    // Show iOS device compatibility message
                    const deviceMessage = `
                        <div style="padding: 15px; background-color: #f8f9fa; border-radius: 5px; margin-bottom: 15px;">
                            <h4 style="margin-top: 0; color: #0056b3;">Device Compatibility Notice</h4>
                            <p>We've detected that you're using an iOS device which may have compatibility issues with our form submission system.</p>
                            <p>For the best experience, please:</p>
                            <ul>
                                <li>Try using a desktop or laptop computer</li>
                                <li>Use a device with a newer version of iOS</li>
                                <li>Contact us directly at <a href="mailto:admin@hrdconference.com">admin@hrdconference.com</a></li>
                            </ul>
                        </div>
                    `;
                    showErrorMessage(sponsorForm, deviceMessage);
                    
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });
            } else {
                // Use XMLHttpRequest for modern devices
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
                                    showErrorMessage(sponsorForm, 'There was a problem submitting your inquiry. Please try again later.');
                                }
                            } catch (e) {
                                showErrorMessage(sponsorForm, 'There was a problem processing your submission. Please try again later.');
                            }
                        } else {
                            showErrorMessage(sponsorForm, 'We encountered a server issue while processing your submission. Please try again later.');
                        }
                        
                        // Reset button state
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                    }
                };
                
                xhr.onerror = function(e) {
                    // Check if this is an iPhone or iOS device
                    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('iOS')) {
                        // Show a polite message for iOS devices
                        const deviceMessage = `
                            <div style="padding: 15px; background-color: #f8f9fa; border-radius: 5px; margin-bottom: 15px;">
                                <h4 style="margin-top: 0; color: #0056b3;">Device Compatibility Notice</h4>
                                <p>We've detected that you're using an iOS device which may have compatibility issues with our form submission system.</p>
                                <p>For the best experience, please:</p>
                                <ul>
                                    <li>Try using a desktop or laptop computer</li>
                                    <li>Use a device with a newer version of iOS</li>
                                    <li>Contact us directly at <a href="mailto:admin@hrdconference.com">admin@hrdconference.com</a></li>
                                </ul>
                            </div>
                        `;
                        showErrorMessage(sponsorForm, deviceMessage);
                    } else {
                        showErrorMessage(sponsorForm, 'Network error occurred. Please check your connection and try again.');
                    }
                    
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                };
                
                xhr.ontimeout = function() {
                    showErrorMessage(sponsorForm, 'Your request is taking longer than expected. Please try again later.');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                };
                
                // Add additional headers and settings for better mobile compatibility
                try {
                    xhr.open('POST', scriptUrl, true);
                    xhr.timeout = 30000; // 30 seconds timeout
                    
                    // Add a specific header to identify mobile submissions
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    

                    
                    // Send the form data
                    xhr.send(formData);
                    

                } catch (e) {
                    // Catch any errors that occur during request setup

                    showErrorMessage(sponsorForm, 'There was a problem connecting to our server. Please try again later.');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
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
            
            // Detect if this is an iPhone SE or older iPhone
            const isOlderIPhone = navigator.userAgent.includes('iPhone') && 
                (navigator.userAgent.includes('iPhone OS 9') || 
                 navigator.userAgent.includes('iPhone OS 10') || 
                 navigator.userAgent.includes('iPhone OS 11') || 
                 navigator.userAgent.includes('iPhone OS 12') || 
                 navigator.userAgent.includes('iPhone OS 13') ||
                 navigator.userAgent.includes('iPhone SE'));
            
            // For iPhone SE and older iPhones, use Fetch API instead of XMLHttpRequest
            if (isOlderIPhone) {
                // Using Fetch API for iPhone SE
                
                // Use Fetch API for iPhone SE
                fetch(scriptUrl, {
                    method: 'POST',
                    body: formData,
                    mode: 'cors',
                    cache: 'no-cache',
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer'
                })
                .then(response => {

                    return response.json();
                })
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
                    
                    // Reset button state
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                })
                .catch(error => {

                    
                    // Show iOS device compatibility message
                    const deviceMessage = `
                        <div style="padding: 15px; background-color: #f8f9fa; border-radius: 5px; margin-bottom: 15px;">
                            <h4 style="margin-top: 0; color: #0056b3;">Device Compatibility Notice</h4>
                            <p>We've detected that you're using an iOS device which may have compatibility issues with our form submission system.</p>
                            <p>For the best experience, please:</p>
                            <ul>
                                <li>Try using a desktop or laptop computer</li>
                                <li>Use a device with a newer version of iOS</li>
                                <li>Contact us directly at <a href="mailto:admin@hrdconference.com">admin@hrdconference.com</a></li>
                            </ul>
                        </div>
                    `;
                    showErrorMessage(speakingForm, deviceMessage);
                    
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });
            } else {
                // Use XMLHttpRequest for modern devices
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
                                    showErrorMessage(speakingForm, 'There was a problem submitting your application. Please try again later.');
                                }
                            } catch (e) {
                                showErrorMessage(speakingForm, 'There was a problem processing your submission. Please try again later.');
                            }
                        } else {
                            showErrorMessage(speakingForm, 'We encountered a server issue while processing your submission. Please try again later.');
                        }
                        
                        // Reset button state
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                    }
                };
                
                xhr.onerror = function(e) {
                    // Check if this is an iPhone or iOS device
                    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('iOS')) {
                        // Show a polite message for iOS devices
                        const deviceMessage = `
                            <div style="padding: 15px; background-color: #f8f9fa; border-radius: 5px; margin-bottom: 15px;">
                                <h4 style="margin-top: 0; color: #0056b3;">Device Compatibility Notice</h4>
                                <p>We've detected that you're using an iOS device which may have compatibility issues with our form submission system.</p>
                                <p>For the best experience, please:</p>
                                <ul>
                                    <li>Try using a desktop or laptop computer</li>
                                    <li>Use a device with a newer version of iOS</li>
                                    <li>Contact us directly at <a href="mailto:admin@hrdconference.com">admin@hrdconference.com</a></li>
                                </ul>
                            </div>
                        `;
                        showErrorMessage(speakingForm, deviceMessage);
                    } else {
                        showErrorMessage(speakingForm, 'Network error occurred. Please check your connection and try again.');
                    }
                    
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                };
                
                xhr.ontimeout = function() {
                    showErrorMessage(speakingForm, 'Your request is taking longer than expected. Please try again later.');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                };
                
                // Add additional headers and settings for better mobile compatibility
                try {
                    xhr.open('POST', scriptUrl, true);
                    xhr.timeout = 30000; // 30 seconds timeout
                    
                    // Add a specific header to identify mobile submissions
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    

                    
                    // Send the form data
                    xhr.send(formData);
                    

                } catch (e) {
                    // Catch any errors that occur during request setup

                    showErrorMessage(speakingForm, 'There was a problem connecting to our server. Please try again later.');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
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
            
            // Detect if this is an iPhone SE or older iPhone
            const isOlderIPhone = navigator.userAgent.includes('iPhone') && 
                (navigator.userAgent.includes('iPhone OS 9') || 
                 navigator.userAgent.includes('iPhone OS 10') || 
                 navigator.userAgent.includes('iPhone OS 11') || 
                 navigator.userAgent.includes('iPhone OS 12') || 
                 navigator.userAgent.includes('iPhone OS 13') ||
                 navigator.userAgent.includes('iPhone SE'));
            
            // For iPhone SE and older iPhones, use Fetch API instead of XMLHttpRequest
            if (isOlderIPhone) {
                // Using Fetch API for iPhone SE
                
                // Use Fetch API for iPhone SE
                fetch(scriptUrl, {
                    method: 'POST',
                    body: formData,
                    mode: 'cors',
                    cache: 'no-cache',
                    redirect: 'follow',
                    referrerPolicy: 'no-referrer'
                })
                .then(response => {

                    return response.json();
                })
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
                    
                    // Reset button state
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                })
                .catch(error => {

                    
                    // Show iOS device compatibility message
                    const deviceMessage = `
                        <div style="padding: 15px; background-color: #f8f9fa; border-radius: 5px; margin-bottom: 15px;">
                            <h4 style="margin-top: 0; color: #0056b3;">Device Compatibility Notice</h4>
                            <p>We've detected that you're using an iOS device which may have compatibility issues with our form submission system.</p>
                            <p>For the best experience, please:</p>
                            <ul>
                                <li>Try using a desktop or laptop computer</li>
                                <li>Use a device with a newer version of iOS</li>
                                <li>Contact us directly at <a href="mailto:admin@hrdconference.com">admin@hrdconference.com</a></li>
                            </ul>
                        </div>
                    `;
                    showErrorMessage(registrationForm, deviceMessage);
                    
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                });
            } else {
                // Use XMLHttpRequest for modern devices
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
                                    showErrorMessage(registrationForm, 'There was a problem submitting your registration. Please try again later.');
                                }
                            } catch (e) {
                                showErrorMessage(registrationForm, 'There was a problem processing your submission. Please try again later.');
                            }
                        } else {
                            showErrorMessage(registrationForm, 'We encountered a server issue while processing your submission. Please try again later.');
                        }
                        
                        // Reset button state
                        submitBtn.innerHTML = originalBtnText;
                        submitBtn.disabled = false;
                    }
                };
                
                xhr.onerror = function(e) {
                    // Check if this is an iPhone or iOS device
                    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('iOS')) {
                        // Show a polite message for iOS devices
                        const deviceMessage = `
                            <div style="padding: 15px; background-color: #f8f9fa; border-radius: 5px; margin-bottom: 15px;">
                                <h4 style="margin-top: 0; color: #0056b3;">Device Compatibility Notice</h4>
                                <p>We've detected that you're using an iOS device which may have compatibility issues with our form submission system.</p>
                                <p>For the best experience, please:</p>
                                <ul>
                                    <li>Try using a desktop or laptop computer</li>
                                    <li>Use a device with a newer version of iOS</li>
                                    <li>Contact us directly at <a href="mailto:admin@hrdconference.com">admin@hrdconference.com</a></li>
                                </ul>
                            </div>
                        `;
                        showErrorMessage(registrationForm, deviceMessage);
                    } else {
                        showErrorMessage(registrationForm, 'Network error occurred. Please check your connection and try again.');
                    }
                    
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                };
                
                xhr.ontimeout = function() {
                    showErrorMessage(registrationForm, 'Your request is taking longer than expected. Please try again later.');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                };
                
                // Add additional headers and settings for better mobile compatibility
                try {
                    xhr.open('POST', scriptUrl, true);
                    xhr.timeout = 30000; // 30 seconds timeout
                    
                    // Add a specific header to identify mobile submissions
                    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
                    

                    
                    // Send the form data
                    xhr.send(formData);
                    

                } catch (e) {
                    // Catch any errors that occur during request setup

                    showErrorMessage(registrationForm, 'There was a problem connecting to our server. Please try again later.');
                    submitBtn.innerHTML = originalBtnText;
                    submitBtn.disabled = false;
                }
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
