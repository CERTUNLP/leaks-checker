document.addEventListener("DOMContentLoaded", async () => {
  try {
    // 1. Load configuration first
    const configResponse = await fetch('./config.json');
    const config = await configResponse.json();

    // 2. Determine the language
    // If forced_lang has a value ("es", "en"), use it.
    // If it is empty, null, or missing, use the browser language.
    let lang = config.forced_lang;
    if (!lang) {
      lang = navigator.language.startsWith('en') ? 'en' : 'es';
    }

    // 3. Load texts based on the chosen language as PLAIN TEXT
    const textsResponse = await fetch(`./locales/${lang}.json`);
    let textsRaw = await textsResponse.text();

    // 4. VARIABLE REPLACEMENT ENGINE
    // Dynamically find variables in config.vars and replace them across the whole JSON
    if (config.vars) {
      for (const [key, value] of Object.entries(config.vars)) {
        // Regular expression to find {{VARIABLENAME}} across the entire file
        const regex = new RegExp(`{{${key}}}`, 'g');
        textsRaw = textsRaw.replace(regex, value);
      }
    }

    // Convert already replaced text into a usable JSON object
    const texts = JSON.parse(textsRaw);
    
    // Save globally so script.js can use them
    window.APP_CONFIG = config;
    window.APP_TEXTS = texts;

    // 5. Inject Texts (translations already processed with variables)
    document.getElementById('t-meta-title').textContent = texts.meta.title;
    document.getElementById('t-meta-desc').setAttribute('content', texts.meta.description);
    
    document.getElementById('t-title-main').textContent = texts.header.titleMain;
    document.getElementById('t-title-sub').textContent = texts.header.titleSub;
    document.getElementById('t-title-desc').textContent = texts.header.titleDesc;
    
    document.getElementById('t-whatis-title').textContent = texts.info.whatIsTitle;
    document.getElementById('t-whatis-text').innerHTML = texts.info.whatIsText;
    document.getElementById('t-faq-title').textContent = texts.info.faqTitle;

    document.getElementById('t-form-title').textContent = texts.form.title;
    document.getElementById('query').setAttribute('placeholder', texts.form.placeholder);
    document.getElementById('t-form-btn').textContent = texts.form.button;

    document.getElementById('user-help-popup').innerHTML = texts.form.userHelp;

    // 6. Render FAQ
    const faqContainer = document.getElementById('faq-container');
    faqContainer.innerHTML = texts.faq.map(item => `
      <details class="faq-item"${item.key === "user-in-leak" ? ' id="faq-filtracion"' : ''}>
        <summary><strong>${item.q}</strong></summary>
        <div>${item.a}</div>
      </details>
    `).join('');

    // Restore FAQ logic
    document.querySelectorAll('.faq-item').forEach(item => {
      item.addEventListener('click', () => {
        if (!item.open) {
          document.querySelectorAll('.faq-item').forEach(otherItem => {
            if (otherItem !== item) otherItem.open = false;
          });
        }
      });
    });

    // 7. Inject Configuration (Logos and Links)
    
    // Favicon (if present, update it)
    if (config.logos.favicon) {
      document.getElementById('c-favicon-32').setAttribute('href', config.logos.favicon);
      document.getElementById('c-favicon-lg').setAttribute('href', config.logos.favicon);
    }

    // Helper function to inject or remove images when values are empty
    const handleImage = (elementId, srcValue) => {
      const imgElement = document.getElementById(elementId);
      if (imgElement) {
        if (srcValue && srcValue.trim() !== "") {
          imgElement.setAttribute('src', srcValue);
        } else {
          imgElement.remove(); // Remove the <img> tag when no path is configured
        }
      }
    };

    handleImage('c-logo-header', config.logos.header_logo);
    handleImage('c-logo-left', config.logos.bottom_left_logo);
    handleImage('c-logo-right', config.logos.bottom_right_logo);

    // Links
    const leftLink = document.getElementById('c-link-left');
    if (leftLink) leftLink.setAttribute('href', config.links.bottom_left || "#");
    
    const centerLeftLink = document.getElementById('c-link-center-left');
    if (centerLeftLink && config.links.bottom_center_left) {
      centerLeftLink.setAttribute('href', config.links.bottom_center_left);
      centerLeftLink.textContent = config.links.bottom_center_left.replace(/^(https?:\/\/|mailto:)/, '');
    }

    const centerRightLink = document.getElementById('c-link-center-right');
    if (centerRightLink && config.links.bottom_center_right) {
      centerRightLink.setAttribute('href', config.links.bottom_center_right);
      centerRightLink.textContent = config.links.bottom_center_right.replace(/^(https?:\/\/|mailto:)/, '');
    }

    const rightLink = document.getElementById('c-link-right');
    if (rightLink) rightLink.setAttribute('href', config.links.bottom_right || "#");
    
    // 8. Inject and load reCAPTCHA dynamically
    const recaptchaDiv = document.getElementById('g-recaptcha-div');
    if (recaptchaDiv && config.recaptchaSiteKey) {
      recaptchaDiv.setAttribute('data-sitekey', config.recaptchaSiteKey);

      const scriptRecaptcha = document.createElement('script');
      scriptRecaptcha.src = "https://www.google.com/recaptcha/api.js";
      scriptRecaptcha.async = true;
      scriptRecaptcha.defer = true;
      document.head.appendChild(scriptRecaptcha);
    }

    const helpIcon = document.getElementById('user-help-icon');
    const helpPopup = document.getElementById('user-help-popup');

    helpIcon.addEventListener('click', function(e) {
      e.stopPropagation(); 
      if (helpPopup.style.display === 'block') {
        helpPopup.style.display = 'none';
      } else {
        helpPopup.style.display = 'block';
      }
    });

    // Closes the popup if you click outside of it
    document.addEventListener('click', function(e) {
      if (helpPopup.style.display === 'block' && !helpIcon.contains(e.target)) {
        helpPopup.style.display = 'none';
      }
    });

  } catch (error) {
    console.error("Error loading application parameters:", error);
    document.body.innerHTML = "<h2>Error loading the application. Please check the configuration files.</h2>";
  }
});
