/**
 * Form Handler for Sponsorship, Speaker, and Registration Forms
 * Handles form submissions using EmailJS
 */

// Function to check if EmailJS is loaded
function isEmailJSLoaded() {
    return typeof window.emailjs !== 'undefined';
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
                
            fetch(scriptUrl, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                mode: 'cors'
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
                showErrorMessage(sponsorForm, 'There was a problem submitting your form. Please try again.');
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
                
            fetch(scriptUrl, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                mode: 'cors'
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
                console.error('Error:', error);
                showErrorMessage(speakingForm, 'There was a problem submitting your form. Please try again.');
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
                
            fetch(scriptUrl, {
                method: 'POST',
                body: formData,
                credentials: 'include',
                mode: 'cors'
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
                console.error('Error:', error);
                showErrorMessage(registrationForm, 'There was a problem submitting your form. Please try again.');
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

// Wait for the document to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Check if EmailJS is already loaded
    if (isEmailJSLoaded()) {
        initFormHandlers();
    } else {
        // If not loaded, wait for it to load
        
        // Check every 100ms for EmailJS to be loaded (up to 5 seconds)
        let attempts = 0;
        const maxAttempts = 50; // 5 seconds
        
        const checkInterval = setInterval(function() {
            attempts++;
            
            if (isEmailJSLoaded()) {
                clearInterval(checkInterval);
                initFormHandlers();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkInterval);
                
                // Add error message to forms
                const sponsorForm = document.getElementById('sponsor-form');
                if (sponsorForm) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'form-message error-message';
                    errorMessage.innerHTML = '<i class="lni-warning"></i> Email service is not available. Please try again later or contact us directly.';
                    sponsorForm.parentNode.insertBefore(errorMessage, sponsorForm.nextSibling);
                }
                
                const speakingForm = document.getElementById('speaking-form');
                if (speakingForm) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'form-message error-message';
                    errorMessage.innerHTML = '<i class="lni-warning"></i> Email service is not available. Please try again later or contact us directly.';
                    speakingForm.parentNode.insertBefore(errorMessage, speakingForm.nextSibling);
                }
                
                const registrationForm = document.getElementById('pricing-form');
                if (registrationForm) {
                    const errorMessage = document.createElement('div');
                    errorMessage.className = 'form-message error-message';
                    errorMessage.innerHTML = '<i class="lni-warning"></i> Email service is not available. Please try again later or contact us directly.';
                    registrationForm.parentNode.insertBefore(errorMessage, registrationForm.nextSibling);
                }
            }
        }, 100);
    }
});
