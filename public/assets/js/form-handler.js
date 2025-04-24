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
    
    document.addEventListener('DOMContentLoaded', function() {
        initFormHandlers();
    });
}

// Function to handle form submissions
function initFormHandlers() {
    // Submission flags to prevent double submissions
    let sponsorSubmitting = false;
    let speakerSubmitting = false;
    let registrationSubmitting = false;
    
    // Sponsorship Form Handler
    const sponsorForm = document.getElementById('sponsor-form');
    if (sponsorForm) {
        sponsorForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Prevent double submissions
            if (sponsorSubmitting) {
                console.log('Sponsorship form already submitting');
                return;
            }
            
            // Set submission flag
            sponsorSubmitting = true;
            
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
                mode: 'cors',
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'X-Requested-With': 'XMLHttpRequest'
                }
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
                console.error('Form submission error:', error);
                showErrorMessage(sponsorForm, 'Submission failed. Please try again or use a different device (e.g., laptop or Android). You can also contact us at admin@hrdconference.com.');
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
            
            // Prevent double submissions
            if (speakerSubmitting) {
                console.log('Speaker form already submitting');
                return;
            }
            
            // Set submission flag
            speakerSubmitting = true;
            
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
                mode: 'cors',
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'X-Requested-With': 'XMLHttpRequest'
                }
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
                console.error('Form submission error:', error);
                showErrorMessage(speakingForm, 'Submission failed. Please try again or use a different device (e.g., laptop or Android). You can also contact us at admin@hrdconference.com.');
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
            
            // Prevent double submissions
            if (registrationSubmitting) {
                console.log('Registration form already submitting');
                return;
            }
            
            // Set submission flag
            registrationSubmitting = true;
            
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
                mode: 'cors',
                cache: 'no-store',
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'X-Requested-With': 'XMLHttpRequest'
                }
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Show success message
                    showSuccessMessage(registrationForm, 'Thank you for registering! We’ll be in touch with you soon.');
                    
                    // Reset form
                    registrationForm.reset();
                } else {
                    // Show error message
                    showErrorMessage(registrationForm, 'There was a problem with your registration: ' + data.message);
                }
            })
            .catch(error => {
                console.error('Registration submission error:', error);
                showErrorMessage(registrationForm, 'Submission failed. Please try again or use a different device (e.g., laptop or Android). You can also contact us at admin@hrdconference.com.');
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
