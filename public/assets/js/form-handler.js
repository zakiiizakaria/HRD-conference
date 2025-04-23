/**
 * Form Handler for Sponsorship, Speaker, and Registration Forms
 * Handles form submissions using PHP backend
 * With improved compatibility for all devices including iOS
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
            
            // Create a hidden iframe for form submission
            let iframe = document.getElementById('hidden-iframe');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'hidden-iframe';
                iframe.name = 'hidden-iframe';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }
            
            // Create a temporary form for submission
            const tempForm = document.createElement('form');
            tempForm.method = 'POST';
            tempForm.target = 'hidden-iframe';
            
            // Set the form action based on environment
            const isProduction = window.location.hostname === 'hrdconference.com';
            tempForm.action = isProduction 
                ? 'https://hrdconference.com/store-sponsorship.php' 
                : 'http://localhost:8080/HRD-Conference/public/store-sponsorship.php';
            
            // Add form fields
            const addField = (name, value) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                tempForm.appendChild(input);
            };
            
            // Add all form fields
            addField('fullName', fullName);
            addField('email', email);
            addField('company', company);
            addField('jobTitle', jobTitle);
            addField('contactNumber', contactNumber);
            addField('interest', interest);
            addField('device_info', navigator.userAgent);
            
            // Add network information if available
            if (navigator.connection) {
                addField('network_type', navigator.connection.type || 'unknown');
                addField('network_downlink', navigator.connection.downlink || 'unknown');
                addField('network_rtt', navigator.connection.rtt || 'unknown');
            }
            
            // Add the form to the document
            document.body.appendChild(tempForm);
            
            // Set up a timeout for form submission
            const submissionTimeout = setTimeout(() => {
                // If we hit the timeout on mobile, try a direct form submission instead
                if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('Android')) {
                    // Create a new form for direct submission (not in iframe)
                    const directForm = document.createElement('form');
                    directForm.method = 'POST';
                    directForm.action = tempForm.action;
                    directForm.target = '_top'; // Submit to the main window
                    
                    // Copy all fields from the temp form
                    Array.from(tempForm.elements).forEach(function(element) {
                        directForm.appendChild(element.cloneNode(true));
                    });
                    
                    // Add a success redirect URL
                    const redirectInput = document.createElement('input');
                    redirectInput.type = 'hidden';
                    redirectInput.name = 'redirect_url';
                    redirectInput.value = window.location.href + '?success=true';
                    directForm.appendChild(redirectInput);
                    
                    // Add to document and submit
                    document.body.appendChild(directForm);
                    
                    // Show message to user
                    alert('Submitting your form directly. Please wait...');
                    
                    // Submit the form directly
                    directForm.submit();
                    
                    // Don't show error message since we're trying direct submission
                    return;
                }
                
                // For non-mobile devices or as fallback, show timeout error
                showErrorMessage(sponsorForm, 'Your request is taking longer than expected. Please try again later.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }, 45000); // Extended timeout to 45 seconds for mobile
            
            // Listen for iframe load event
            iframe.onload = function() {
                clearTimeout(submissionTimeout);
                
                try {
                    // Try to get response from iframe
                    const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
                    const responseText = iframeContent.body.textContent || iframeContent.body.innerText;
                    
                    if (responseText) {
                        try {
                            const response = JSON.parse(responseText);
                            
                            if (response.success) {
                                // Show success message
                                showSuccessMessage(sponsorForm, 'Your sponsorship inquiry has been successfully submitted and stored in our database.');
                                sponsorForm.reset();
                            } else {
                                // Show error message
                                showErrorMessage(sponsorForm, 'There was a problem submitting your inquiry. Please try again later.');
                            }
                        } catch (e) {
                            // JSON parse error
                            showErrorMessage(sponsorForm, 'There was a problem processing your submission. Please try again later.');
                        }
                    } else {
                        // Empty response
                        showErrorMessage(sponsorForm, 'There was a problem with your submission. Please try again later.');
                    }
                } catch (e) {
                    // Cross-origin error or other issue
                    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('iOS')) {
                        // Show iOS device message
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
                        showErrorMessage(sponsorForm, 'There was a problem with your submission. Please try again later.');
                    }
                }
                
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Clean up
                if (tempForm && tempForm.parentNode) {
                    tempForm.parentNode.removeChild(tempForm);
                }
            };
            
            // Handle iframe error
            iframe.onerror = function() {
                clearTimeout(submissionTimeout);
                
                // Show error message
                if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('iOS')) {
                    // Show iOS device message
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
                    showErrorMessage(sponsorForm, 'There was a problem with your submission. Please try again later.');
                }
                
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Clean up
                if (tempForm && tempForm.parentNode) {
                    tempForm.parentNode.removeChild(tempForm);
                }
            };
            
            // Submit the form
            tempForm.submit();
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
            
            // Create a hidden iframe for form submission
            let iframe = document.getElementById('hidden-iframe-speaker');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'hidden-iframe-speaker';
                iframe.name = 'hidden-iframe-speaker';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }
            
            // Create a temporary form for submission
            const tempForm = document.createElement('form');
            tempForm.method = 'POST';
            tempForm.target = 'hidden-iframe-speaker';
            
            // Set the form action based on environment
            const isProduction = window.location.hostname === 'hrdconference.com';
            tempForm.action = isProduction 
                ? 'https://hrdconference.com/store-speaker.php' 
                : 'http://localhost:8080/HRD-Conference/public/store-speaker.php';
            
            // Add form fields
            const addField = (name, value) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                tempForm.appendChild(input);
            };
            
            // Add all form fields
            addField('fullName', fullName);
            addField('email', email);
            addField('company', company);
            addField('jobTitle', jobTitle);
            addField('contactNumber', contactNumber);
            addField('device_info', navigator.userAgent);
            
            // Add network information if available
            if (navigator.connection) {
                addField('network_type', navigator.connection.type || 'unknown');
                addField('network_downlink', navigator.connection.downlink || 'unknown');
                addField('network_rtt', navigator.connection.rtt || 'unknown');
            }
            
            // Add the form to the document
            document.body.appendChild(tempForm);
            
            // Set up a timeout for form submission
            const submissionTimeout = setTimeout(() => {
                // If we hit the timeout on mobile, try a direct form submission instead
                if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('Android')) {
                    // Create a new form for direct submission (not in iframe)
                    const directForm = document.createElement('form');
                    directForm.method = 'POST';
                    directForm.action = tempForm.action;
                    directForm.target = '_top'; // Submit to the main window
                    
                    // Copy all fields from the temp form
                    Array.from(tempForm.elements).forEach(function(element) {
                        directForm.appendChild(element.cloneNode(true));
                    });
                    
                    // Add a success redirect URL
                    const redirectInput = document.createElement('input');
                    redirectInput.type = 'hidden';
                    redirectInput.name = 'redirect_url';
                    redirectInput.value = window.location.href + '?success=true';
                    directForm.appendChild(redirectInput);
                    
                    // Add to document and submit
                    document.body.appendChild(directForm);
                    
                    // Show message to user
                    alert('Submitting your form directly. Please wait...');
                    
                    // Submit the form directly
                    directForm.submit();
                    
                    // Don't show error message since we're trying direct submission
                    return;
                }
                
                // For non-mobile devices or as fallback, show timeout error
                showErrorMessage(speakingForm, 'Your request is taking longer than expected. Please try again later.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }, 45000); // Extended timeout to 45 seconds for mobile
            
            // Listen for iframe load event
            iframe.onload = function() {
                clearTimeout(submissionTimeout);
                
                try {
                    // Try to get response from iframe
                    const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
                    const responseText = iframeContent.body.textContent || iframeContent.body.innerText;
                    
                    if (responseText) {
                        try {
                            const response = JSON.parse(responseText);
                            
                            if (response.success) {
                                // Show success message
                                showSuccessMessage(speakingForm, 'Your speaker application has been successfully submitted and stored in our database.');
                                speakingForm.reset();
                            } else {
                                // Show error message
                                showErrorMessage(speakingForm, 'There was a problem submitting your application. Please try again later.');
                            }
                        } catch (e) {
                            // JSON parse error
                            showErrorMessage(speakingForm, 'There was a problem processing your submission. Please try again later.');
                        }
                    } else {
                        // Empty response
                        showErrorMessage(speakingForm, 'There was a problem with your submission. Please try again later.');
                    }
                } catch (e) {
                    // Cross-origin error or other issue
                    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('iOS')) {
                        // Show iOS device message
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
                        showErrorMessage(speakingForm, 'There was a problem with your submission. Please try again later.');
                    }
                }
                
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Clean up
                if (tempForm && tempForm.parentNode) {
                    tempForm.parentNode.removeChild(tempForm);
                }
            };
            
            // Handle iframe error
            iframe.onerror = function() {
                clearTimeout(submissionTimeout);
                
                // Show error message
                if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('iOS')) {
                    // Show iOS device message
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
                    showErrorMessage(speakingForm, 'There was a problem with your submission. Please try again later.');
                }
                
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Clean up
                if (tempForm && tempForm.parentNode) {
                    tempForm.parentNode.removeChild(tempForm);
                }
            };
            
            // Submit the form
            tempForm.submit();
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
            
            // Create a hidden iframe for form submission
            let iframe = document.getElementById('hidden-iframe-registration');
            if (!iframe) {
                iframe = document.createElement('iframe');
                iframe.id = 'hidden-iframe-registration';
                iframe.name = 'hidden-iframe-registration';
                iframe.style.display = 'none';
                document.body.appendChild(iframe);
            }
            
            // Create a temporary form for submission
            const tempForm = document.createElement('form');
            tempForm.method = 'POST';
            tempForm.target = 'hidden-iframe-registration';
            
            // Set the form action based on environment
            const isProduction = window.location.hostname === 'hrdconference.com';
            tempForm.action = isProduction 
                ? 'https://hrdconference.com/store-registration.php' 
                : 'http://localhost:8080/HRD-Conference/public/store-registration.php';
            
            // Add form fields
            const addField = (name, value) => {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = name;
                input.value = value;
                tempForm.appendChild(input);
            };
            
            // Add all form fields
            addField('fullName', fullName);
            addField('email', email);
            addField('company', company);
            addField('jobTitle', jobTitle);
            addField('contactNumber', contactNumber);
            addField('promoCode', promoCode);
            addField('device_info', navigator.userAgent);
            
            // Add network information if available
            if (navigator.connection) {
                addField('network_type', navigator.connection.type || 'unknown');
                addField('network_downlink', navigator.connection.downlink || 'unknown');
                addField('network_rtt', navigator.connection.rtt || 'unknown');
            }
            
            // Add the form to the document
            document.body.appendChild(tempForm);
            
            // Set up a timeout for form submission
            const submissionTimeout = setTimeout(() => {
                // If we hit the timeout on mobile, try a direct form submission instead
                if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('Android')) {
                    // Create a new form for direct submission (not in iframe)
                    const directForm = document.createElement('form');
                    directForm.method = 'POST';
                    directForm.action = tempForm.action;
                    directForm.target = '_top'; // Submit to the main window
                    
                    // Copy all fields from the temp form
                    Array.from(tempForm.elements).forEach(function(element) {
                        directForm.appendChild(element.cloneNode(true));
                    });
                    
                    // Add a success redirect URL
                    const redirectInput = document.createElement('input');
                    redirectInput.type = 'hidden';
                    redirectInput.name = 'redirect_url';
                    redirectInput.value = window.location.href + '?success=true';
                    directForm.appendChild(redirectInput);
                    
                    // Add to document and submit
                    document.body.appendChild(directForm);
                    
                    // Show message to user
                    alert('Submitting your form directly. Please wait...');
                    
                    // Submit the form directly
                    directForm.submit();
                    
                    // Don't show error message since we're trying direct submission
                    return;
                }
                
                // For non-mobile devices or as fallback, show timeout error
                showErrorMessage(registrationForm, 'Your request is taking longer than expected. Please try again later.');
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
            }, 45000); // Extended timeout to 45 seconds for mobile
            
            // Listen for iframe load event
            iframe.onload = function() {
                clearTimeout(submissionTimeout);
                
                try {
                    // Try to get response from iframe
                    const iframeContent = iframe.contentDocument || iframe.contentWindow.document;
                    const responseText = iframeContent.body.textContent || iframeContent.body.innerText;
                    
                    if (responseText) {
                        try {
                            const response = JSON.parse(responseText);
                            
                            if (response.success) {
                                // Show success message
                                showSuccessMessage(registrationForm, 'Your registration has been successfully submitted and stored in our database.');
                                registrationForm.reset();
                            } else {
                                // Show error message
                                showErrorMessage(registrationForm, 'There was a problem submitting your registration. Please try again later.');
                            }
                        } catch (e) {
                            // JSON parse error
                            showErrorMessage(registrationForm, 'There was a problem processing your submission. Please try again later.');
                        }
                    } else {
                        // Empty response
                        showErrorMessage(registrationForm, 'There was a problem with your submission. Please try again later.');
                    }
                } catch (e) {
                    // Cross-origin error or other issue
                    if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('iOS')) {
                        // Show iOS device message
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
                        showErrorMessage(registrationForm, 'There was a problem with your submission. Please try again later.');
                    }
                }
                
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Clean up
                if (tempForm && tempForm.parentNode) {
                    tempForm.parentNode.removeChild(tempForm);
                }
            };
            
            // Handle iframe error
            iframe.onerror = function() {
                clearTimeout(submissionTimeout);
                
                // Show error message
                if (navigator.userAgent.includes('iPhone') || navigator.userAgent.includes('iPad') || navigator.userAgent.includes('iOS')) {
                    // Show iOS device message
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
                    showErrorMessage(registrationForm, 'There was a problem with your submission. Please try again later.');
                }
                
                // Reset button state
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Clean up
                if (tempForm && tempForm.parentNode) {
                    tempForm.parentNode.removeChild(tempForm);
                }
            };
            
            // Submit the form
            tempForm.submit();
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
