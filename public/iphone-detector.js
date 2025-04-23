/**
 * iPhone Detector Script
 * Detects if the user is on an iPhone SE or older iPhone
 * and loads the appropriate form handler
 */

// Detect if this is an iPhone SE or older iPhone
const isOlderIPhone = navigator.userAgent.includes('iPhone') && 
    (navigator.userAgent.includes('iPhone OS 9') || 
     navigator.userAgent.includes('iPhone OS 10') || 
     navigator.userAgent.includes('iPhone OS 11') || 
     navigator.userAgent.includes('iPhone OS 12') || 
     navigator.userAgent.includes('iPhone OS 13') ||
     navigator.userAgent.includes('iPhone SE'));

// Function to run when DOM is fully loaded
function setupIPhoneCompatibility() {
    if (isOlderIPhone) {
        console.log('Detected iPhone SE or older iPhone, loading special form handler');
        
        // Prevent the regular form handler from loading
        window.isIPhoneCompatibilityMode = true;
        
        // Load the iPhone-specific form handler
        const script = document.createElement('script');
        script.src = 'assets/js/iphone-form-handler.js';
        document.head.appendChild(script);
        
        // Add a notification for iPhone users
        setTimeout(() => {
            const notification = document.createElement('div');
            notification.style.position = 'fixed';
            notification.style.bottom = '20px';
            notification.style.left = '20px';
            notification.style.right = '20px';
            notification.style.backgroundColor = '#f8f9fa';
            notification.style.border = '1px solid #ddd';
            notification.style.borderRadius = '5px';
            notification.style.padding = '10px';
            notification.style.boxShadow = '0 2px 5px rgba(0,0,0,0.1)';
            notification.style.zIndex = '9999';
            notification.style.fontSize = '14px';
            notification.innerHTML = '<strong>iPhone Compatibility Mode:</strong> We detected you\'re using an iPhone SE or older model. We\'ve enabled a special compatibility mode for better form submission.';
            
            // Add close button
            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '×';
            closeBtn.style.position = 'absolute';
            closeBtn.style.top = '5px';
            closeBtn.style.right = '5px';
            closeBtn.style.border = 'none';
            closeBtn.style.background = 'none';
            closeBtn.style.fontSize = '20px';
            closeBtn.style.cursor = 'pointer';
            closeBtn.onclick = function() {
                document.body.removeChild(notification);
            };
            notification.appendChild(closeBtn);
            
            document.body.appendChild(notification);
        }, 2000);
    }
}

// Set up event listener for DOM content loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupIPhoneCompatibility);
} else {
    // DOM already loaded, run setup immediately
    setupIPhoneCompatibility();
}

// Export the iPhone detection flag for other scripts
window.isOlderIPhone = isOlderIPhone;
