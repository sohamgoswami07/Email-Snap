(function main() {
  // Configuration constants
  const SELECTORS = {
    EMAIL_CONTENT: '.a3s.aiL',
    EMAIL_SUBJECT: '.hP',
    EMAIL_OPEN_INDICATOR: '.h7', // Email thread indicator present when email is open
    GMAIL_RIGHT_SIDEBAR: '.brC-brG' // Right sidebar in Gmail
  };
  
  const BUTTON_ID = 'gmail-export-floating-btn';
  
  // Store state for tracking
  let isButtonVisible = false;
  
  // Initialize
  init();

  // Sets up all event listeners and initial state
  function init() {
    // Create the floating button element once
    createFloatingButton();
    
    // Set up DOM observer
    setupDomObserver();
    
    // Initial check
    setTimeout(checkEmailView, 1000);
    
    // Regular check for email view (Gmail's dynamic loading)
    setInterval(checkEmailView, 1000);
    
    // Style fix for Gmail's z-index stacking
    fixGmailZIndexing();
  }

  // Creates the floating button element and adds it to the DOM
  function createFloatingButton() {
    // Check if button already exists
    if (document.getElementById(BUTTON_ID)) return;
    
    const button = document.createElement('div');
    button.id = BUTTON_ID;
    
    // Style the button
    Object.assign(button.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: '#1a73e8', // Gmail blue
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: '9999',
      transition: 'transform 0.2s, opacity 0.3s',
      opacity: '0', // Start hidden
      transform: 'scale(0.8)',
      color: 'white'
    });
    
    // Add export icon
    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" 
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    `;
    
    // Add tooltip
    const tooltip = document.createElement('div');
    Object.assign(tooltip.style, {
      position: 'absolute',
      top: '-40px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      opacity: '0',
      transition: 'opacity 0.2s',
      pointerEvents: 'none',
      whiteSpace: 'nowrap'
    });
    tooltip.textContent = 'Save as HTML template';
    button.appendChild(tooltip);
    
    // Add hover effects
    button.addEventListener('mouseover', () => {
      button.style.transform = 'scale(1.1)';
      tooltip.style.opacity = '1';
    });
    
    button.addEventListener('mouseout', () => {
      button.style.transform = 'scale(1)';
      tooltip.style.opacity = '0';
    });
    
    // Add click handler
    button.addEventListener('click', handleExportClick);
    
    // Add to document
    document.body.appendChild(button);
  }
  
  // Fix Gmail's z-index stacking to ensure our button is always visible
  function fixGmailZIndexing() {
    // Gmail uses high z-indexes that might hide our button
    // This function adjusts them if needed
    const stylesheet = document.createElement('style');
    stylesheet.textContent = `
      /* Ensure our button stays on top */
      #${BUTTON_ID} {
        z-index: 9999 !important;
      }
      
      /* Adjust Gmail's fullscreen overlay if it conflicts */
      .a8C {
        z-index: 9998 !important;
      }
    `;
    document.head.appendChild(stylesheet);
  }

  // Sets up mutation observer on Gmail's container
  function setupDomObserver() {
    const observer = new MutationObserver(() => {
      // Check if email view has changed whenever DOM changes
      checkEmailView();
    });
    
    // Observe the whole Gmail app container
    observer.observe(document.body, { 
      childList: true, 
      subtree: true
    });
  }
  
  // Checks if we're in email view and shows/hides button accordingly
  function checkEmailView() {
    const button = document.getElementById(BUTTON_ID);
    if (!button) return;
    
    // Check for email content and thread indicator
    const hasEmailContent = !!document.querySelector(SELECTORS.EMAIL_CONTENT);
    const hasEmailThreadIndicator = !!document.querySelector(SELECTORS.EMAIL_OPEN_INDICATOR);
    
    // Show button if we're in email view
    if (hasEmailContent || hasEmailThreadIndicator) {
      if (!isButtonVisible) {
        button.style.opacity = '1';
        button.style.transform = 'scale(1)';
        isButtonVisible = true;
      }
    } else {
      // Hide button if we're not in email view
      if (isButtonVisible) {
        button.style.opacity = '0';
        button.style.transform = 'scale(0.8)';
        isButtonVisible = false;
      }
    }
    
    // Check if we need to adjust button position based on Gmail's layout
    adjustButtonPosition();
  }
  
  // Adjusts button position based on Gmail's current layout
  function adjustButtonPosition() {
    const button = document.getElementById(BUTTON_ID);
    if (!button) return;
    
    // Check if right sidebar is present
    const rightSidebar = document.querySelector(SELECTORS.GMAIL_RIGHT_SIDEBAR);
    
    if (rightSidebar && window.getComputedStyle(rightSidebar).display !== 'none') {
      // Move button to avoid sidebar
      button.style.right = '270px';
    } else {
      // Default position
      button.style.right = '20px';
    }
  }

  // Handles click event for export button
  function handleExportClick() {
    try {
      const emailContent = processEmailContent();
      const htmlDocument = createHTMLDocument(emailContent);
      triggerDownload(htmlDocument);
    } catch (error) {
      handleExportError(error);
    }
  }

  // Extracts and processes email content from DOM
  function processEmailContent() {
    const emailContainer = document.querySelector(SELECTORS.EMAIL_CONTENT);
    if (!emailContainer) throw new Error('Email content not found');

    const cleanedContent = cleanEmailContent(emailContainer.cloneNode(true));
    return {
      content: cleanedContent.innerHTML,
      styles: captureInlineStyles(),
      subject: getEmailSubject()
    };
  }

  // Removes unnecessary elements from email content
  function cleanEmailContent(contentClone) {
    const elementsToRemove = contentClone.querySelectorAll(
      '.gmail_extra, .gmail_signature, .aeJ'
    );
    elementsToRemove.forEach(el => el.remove());
    return contentClone;
  }

  // Captures all inline styles from the document
  function captureInlineStyles() {
    return Array.from(document.querySelectorAll('style'))
      .map(style => style.textContent)
      .join('\n');
  }

  // Extracts email subject from the page
  function getEmailSubject() {
    const subjectElement = document.querySelector(SELECTORS.EMAIL_SUBJECT);
    return subjectElement?.textContent.trim() || 'email-template';
  }

  // Creates full HTML document structure
  function createHTMLDocument({ content, styles, subject }) {
    const sanitizedSubject = subject
      .replace(/[^a-z0-9]/gi, '-')
      .toLowerCase();

    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${sanitizedSubject}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 0; 
            padding: 0px; 
            overflow: scroll; 
          }
          .email-container { 
            max-width: 600px; 
            margin: 0 auto; 
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          ${content}
        </div>
      </body>
      </html>
    `;
  }

  // Triggers file download through Chrome API
  function triggerDownload(htmlContent) {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `${getEmailSubject()}-${timestamp}.html`;

    chrome.runtime.sendMessage({
      action: 'download',
      url: URL.createObjectURL(blob),
      filename: filename
    });
  }

  // Handles errors during export process
  function handleExportError(error) {
    console.error('Email export failed:', error);
    alert('Failed to export email template. Please try again.');
  }
})();