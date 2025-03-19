(function main() {
  const SELECTORS = {
    EMAIL_CONTENT: '.a3s.aiL',
    EMAIL_SUBJECT: '.hP',
    EMAIL_OPEN_INDICATOR: '.h7',
    GMAIL_RIGHT_SIDEBAR: '.brC-brG'
  };

  const BUTTON_ID = 'gmail-export-floating-btn';
  const MENU_ID = 'gmail-export-format-menu';
  let isButtonVisible = false;
  let isMenuOpen = false;

  init();

  function init() {
    createFloatingButton();
    createFormatMenu();
    setupDomObserver();
    setTimeout(checkEmailView, 1000);
    setInterval(checkEmailView, 1000);
    fixGmailZIndexing();
    document.addEventListener('click', handleOutsideClick);
  }

  function createFloatingButton() {
    if (document.getElementById(BUTTON_ID)) return;
    const button = document.createElement('div');
    button.id = BUTTON_ID;

    Object.assign(button.style, {
      position: 'fixed',
      bottom: '50px',
      right: '0px',
      width: '50px',
      height: '50px',
      borderRadius: '50%',
      backgroundColor: '#000000',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      cursor: 'pointer',
      zIndex: '9999',
      transition: 'transform 0.2s, opacity 0.3s',
      opacity: '0',
      color: 'white'
    });

    button.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24"
           fill="none" stroke="currentColor" stroke-width="2" 
           stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="7 10 12 15 17 10"></polyline>
        <line x1="12" y1="15" x2="12" y2="3"></line>
      </svg>
    `;

    const tooltip = document.createElement('div');
    Object.assign(tooltip.style, {
      position: 'absolute',
      top: '-30px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: '99',
      backgroundColor: 'rgba(0,0,0,0.8)',
      backdropFilter: 'blur(5px)',
      webkitBackdropFilter: 'blur(5px)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      color: 'white',
      padding: '5px 10px',
      borderRadius: '4px',
      fontSize: '12px',
      opacity: '0',
      transition: 'opacity 0.2s',
      pointerEvents: 'none',
      whiteSpace: 'nowrap'
    });
    tooltip.textContent = 'Save email';
    button.appendChild(tooltip);

    button.addEventListener('mouseover', () => {
      tooltip.style.opacity = '1';
    });

    button.addEventListener('mouseout', () => {
      tooltip.style.opacity = '0';
    });

    button.addEventListener('click', toggleFormatMenu);
    document.body.appendChild(button);
  }

  function createFormatMenu() {
    if (document.getElementById(MENU_ID)) return;
    const menu = document.createElement('div');
    menu.id = MENU_ID;

    Object.assign(menu.style, {
      position: 'fixed',
      bottom: '110px',
      right: '0px',
      width: '180px',
      background: 'rgba(255, 255, 255, 0.5)',
      backdropFilter: 'blur(5px)',
      webkitBackdropFilter: 'blur(5px)',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
      borderRadius: '8px',
      overflow: 'hidden',
      zIndex: '999',
      transition: 'transform 0.2s, opacity 0.3s',
      opacity: '0',
      transform: 'scale(0.9) translateY(10px)',
      pointerEvents: 'none'
    });

    const formats = [
      { id: 'html', label: 'Save as HTML' },
      { id: 'png', label: 'Save as PNG' },
      { id: 'jpg', label: 'Save as JPG' }
    ];

    formats.forEach(format => {
      const option = document.createElement('div');
      Object.assign(option.style, {
        padding: '10px 16px',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        transition: 'background-color 0.2s'
      });

      option.innerHTML = `
        <span style="font-size: 14px;">${format.label}</span>
      `;

      option.addEventListener('mouseover', () => {
        option.style.backgroundColor = '#f1f3f4';
      });
      option.addEventListener('mouseout', () => {
        option.style.backgroundColor = 'transparent';
      });

      option.addEventListener('click', (e) => {
        e.stopPropagation();
        handleExportClick(format.id);
        toggleFormatMenu();
      });

      menu.appendChild(option);
    });

    document.body.appendChild(menu);
  }

  function toggleFormatMenu(e) {
    if (e) e.stopPropagation();
    const menu = document.getElementById(MENU_ID);
    if (!menu) return;
    isMenuOpen = !isMenuOpen;

    if (isMenuOpen) {
      menu.style.opacity = '1';
      menu.style.transform = 'scale(1) translateY(0)';
      menu.style.pointerEvents = 'all';
    } else {
      menu.style.opacity = '0';
      menu.style.transform = 'scale(0.9) translateY(10px)';
      menu.style.pointerEvents = 'none';
    }
  }

  function handleOutsideClick(e) {
    if (isMenuOpen && !e.target.closest(`#${BUTTON_ID}`) && !e.target.closest(`#${MENU_ID}`)) {
      toggleFormatMenu();
    }
  }

  function fixGmailZIndexing() {
    const stylesheet = document.createElement('style');
    stylesheet.textContent = `
      #${BUTTON_ID} { z-index: 9999 !important; }
      #${MENU_ID} { z-index: 9998 !important; }
      .a8C { z-index: 9997 !important; }
    `;
    document.head.appendChild(stylesheet);
  }

  function setupDomObserver() {
    const observer = new MutationObserver(checkEmailView);
    observer.observe(document.body, { childList: true, subtree: true });
  }

  function checkEmailView() {
    const button = document.getElementById(BUTTON_ID);
    if (!button) return;

    const hasEmailContent = !!document.querySelector(SELECTORS.EMAIL_CONTENT);
    const hasEmailThreadIndicator = !!document.querySelector(SELECTORS.EMAIL_OPEN_INDICATOR);

    if (hasEmailContent || hasEmailThreadIndicator) {
      if (!isButtonVisible) {
        button.style.opacity = '1';
        button.style.transform = 'scale(1)';
        isButtonVisible = true;
      }
    } else {
      if (isButtonVisible) {
        button.style.opacity = '0';
        button.style.transform = 'scale(0.8)';
        isButtonVisible = false;
        if (isMenuOpen) toggleFormatMenu();
      }
    }
    adjustButtonPosition();
  }

  function adjustButtonPosition() {
    const button = document.getElementById(BUTTON_ID);
    const menu = document.getElementById(MENU_ID);
    if (!button || !menu) return;
    const rightSidebar = document.querySelector(SELECTORS.GMAIL_RIGHT_SIDEBAR);

    if (rightSidebar && window.getComputedStyle(rightSidebar).display !== 'none') {
      button.style.right = '270px';
      menu.style.right = '270px';
    } else {
      button.style.right = '20px';
      menu.style.right = '20px';
    }
  }

  function handleExportClick(format = 'html') {
    try {
      const emailContent = processEmailContent();
      if (format === 'html') {
        const htmlDocument = createHTMLDocument(emailContent);
        triggerDownload(htmlDocument, 'text/html', 'html');
      } else {
        convertToImage(emailContent, format);
      }
    } catch (error) {
      handleExportError(error);
    }
  }

  function processEmailContent() {
    const emailContainer = document.querySelector(SELECTORS.EMAIL_CONTENT);
    if (!emailContainer) throw new Error('Email content not found');
    const contentClone = emailContainer.cloneNode(true);
    return {
      content: contentClone,
      styles: captureInlineStyles(),
      subject: getEmailSubject()
    };
  }

  function captureInlineStyles() {
    return Array.from(document.querySelectorAll('style'))
      .map(style => style.textContent)
      .join('\n');
  }

  function getEmailSubject() {
    const subjectElement = document.querySelector(SELECTORS.EMAIL_SUBJECT);
    return subjectElement?.textContent.trim().replace(/[^\w\s]/gi, '-').toLowerCase() || 'email-template';
  }

  function createHTMLDocument({ content, styles, subject }) {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${subject}</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 0; padding: 0; overflow: scroll; }
          .email-container { max-width: 600px; max-height: auto; margin: 0 auto; }
        </style>
      </head>
      <body>
        <div class="email-container">${content.innerHTML}</div>
      </body>
      </html>
    `;
  }

  function convertToImage({ content, subject }, format) {
    const tempContainer = document.createElement('div');
    Object.assign(tempContainer.style, {
      position: 'fixed',
      top: '-9999px',
      left: '-9999px',
      width: '600px',
      backgroundColor: 'white',
      zIndex: '-9999',
      padding: '20px'
    });
    tempContainer.appendChild(content);
    document.body.appendChild(tempContainer);

    html2canvas(tempContainer, { useCORS: true, scale: 2 }).then(canvas => {
      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const imageData = canvas.toDataURL(mimeType, 0.9);
      const filename = `${subject}-${new Date().toISOString().replace(/[:.]/g, '-')}.${format}`;

      chrome.runtime.sendMessage({
        action: 'download',
        url: imageData,
        filename: filename
      });

      document.body.removeChild(tempContainer);
    }).catch(error => {
      document.body.removeChild(tempContainer);
      handleExportError(error);
    });
  }

  function triggerDownload(content, mimeType, extension) {
    const blob = new Blob([content], { type: mimeType });
    const filename = `${getEmailSubject()}-${new Date().toISOString().replace(/[:.]/g, '-')}.${extension}`;
    chrome.runtime.sendMessage({
      action: 'download',
      url: URL.createObjectURL(blob),
      filename: filename
    });
  }

  function handleExportError(error) {
    console.error('Email export failed:', error);
    alert(`Failed to export email: ${error.message || 'Unknown error'}`);
  }
})();
