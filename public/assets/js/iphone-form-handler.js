/**
 * Form Handler specifically for iPhone SE and older iPhones
 * Uses direct form submission instead of AJAX
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
            
            // Create a hidden iframe for the response
            const iframeId = 'hidden-iframe-' + Math.random().toString(36).substring(2, 15);
            const iframe = document.createElement('iframe');
            iframe.setAttribute('id', iframeId);
            iframe.setAttribute('name', iframeId);
            iframe.setAttribute('style', 'display:none');
            document.body.appendChild(iframe);
            
            // Create a temporary form
            const tempForm = document.createElement('form');
            tempForm.setAttribute('method', 'POST');
            tempForm.setAttribute('action', 'iphone-fallback.php');
            tempForm.setAttribute('target', iframeId);
            
            // Add form type identifier
            const formTypeInput = document.createElement('input');
            formTypeInput.setAttribute('type', 'hidden');
            formTypeInput.setAttribute('name', 'form_type');
            formTypeInput.setAttribute('value', 'sponsor');
            tempForm.appendChild(formTypeInput);
            
            // Add form data as hidden inputs
            const addHiddenInput = (name, value) => {
                const input = document.createElement('input');
                input.setAttribute('type', 'hidden');
                input.setAttribute('name', name);
                input.setAttribute('value', value);
                tempForm.appendChild(input);
            };
            
            addHiddenInput('fullName', fullName);
            addHiddenInput('email', email);
            addHiddenInput('company', company);
            addHiddenInput('jobTitle', jobTitle);
            addHiddenInput('contactNumber', contactNumber);
            addHiddenInput('interest', interest);
            addHiddenInput('device_info', navigator.userAgent);
            
            // Add the form to the document
            document.body.appendChild(tempForm);
            
            // Submit the form
            tempForm.submit();
            
            // Show success message after a short delay
            setTimeout(() => {
                showSuccessMessage(sponsorForm, 'Your sponsorship inquiry has been submitted. Thank you!');
                sponsorForm.reset();
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Clean up
                document.body.removeChild(tempForm);
                document.body.removeChild(iframe);
            }, 3000);
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
            
            // Create a hidden iframe for the response
            const iframeId = 'hidden-iframe-' + Math.random().toString(36).substring(2, 15);
            const iframe = document.createElement('iframe');
            iframe.setAttribute('id', iframeId);
            iframe.setAttribute('name', iframeId);
            iframe.setAttribute('style', 'display:none');
            document.body.appendChild(iframe);
            
            // Create a temporary form
            const tempForm = document.createElement('form');
            tempForm.setAttribute('method', 'POST');
            tempForm.setAttribute('action', 'iphone-fallback.php');
            tempForm.setAttribute('target', iframeId);
            
            // Add form type identifier
            const formTypeInput = document.createElement('input');
            formTypeInput.setAttribute('type', 'hidden');
            formTypeInput.setAttribute('name', 'form_type');
            formTypeInput.setAttribute('value', 'speaker');
            tempForm.appendChild(formTypeInput);
            
            // Add form data as hidden inputs
            const addHiddenInput = (name, value) => {
                const input = document.createElement('input');
                input.setAttribute('type', 'hidden');
                input.setAttribute('name', name);
                input.setAttribute('value', value);
                tempForm.appendChild(input);
            };
            
            addHiddenInput('fullName', fullName);
            addHiddenInput('email', email);
            addHiddenInput('company', company);
            addHiddenInput('jobTitle', jobTitle);
            addHiddenInput('contactNumber', contactNumber);
            addHiddenInput('device_info', navigator.userAgent);
            
            // Add the form to the document
            document.body.appendChild(tempForm);
            
            // Submit the form
            tempForm.submit();
            
            // Show success message after a short delay
            setTimeout(() => {
                showSuccessMessage(speakingForm, 'Your speaker application has been submitted. Thank you!');
                speakingForm.reset();
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Clean up
                document.body.removeChild(tempForm);
                document.body.removeChild(iframe);
            }, 3000);
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
            
            // Create a hidden iframe for the response
            const iframeId = 'hidden-iframe-' + Math.random().toString(36).substring(2, 15);
            const iframe = document.createElement('iframe');
            iframe.setAttribute('id', iframeId);
            iframe.setAttribute('name', iframeId);
            iframe.setAttribute('style', 'display:none');
            document.body.appendChild(iframe);
            
            // Create a temporary form
            const tempForm = document.createElement('form');
            tempForm.setAttribute('method', 'POST');
            tempForm.setAttribute('action', 'iphone-fallback.php');
            tempForm.setAttribute('target', iframeId);
            
            // Add form type identifier
            const formTypeInput = document.createElement('input');
            formTypeInput.setAttribute('type', 'hidden');
            formTypeInput.setAttribute('name', 'form_type');
            formTypeInput.setAttribute('value', 'registration');
            tempForm.appendChild(formTypeInput);
            
            // Add form data as hidden inputs
            const addHiddenInput = (name, value) => {
                const input = document.createElement('input');
                input.setAttribute('type', 'hidden');
                input.setAttribute('name', name);
                input.setAttribute('value', value);
                tempForm.appendChild(input);
            };
            
            addHiddenInput('fullName', fullName);
            addHiddenInput('email', email);
            addHiddenInput('company', company);
            addHiddenInput('jobTitle', jobTitle);
            addHiddenInput('contactNumber', contactNumber);
            addHiddenInput('promoCode', promoCode);
            addHiddenInput('device_info', navigator.userAgent);
            
            // Add the form to the document
            document.body.appendChild(tempForm);
            
            // Submit the form
            tempForm.submit();
            
            // Show success message after a short delay
            setTimeout(() => {
                showSuccessMessage(registrationForm, 'Your registration has been submitted. Thank you!');
                registrationForm.reset();
                submitBtn.innerHTML = originalBtnText;
                submitBtn.disabled = false;
                
                // Clean up
                document.body.removeChild(tempForm);
                document.body.removeChild(iframe);
            }, 3000);
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
