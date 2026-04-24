const isLocalhost = ['localhost', '127.0.0.1', '::1'].includes(window.location.hostname);

if (isLocalhost) {
  const container = document.getElementById('recaptcha-container');
  if (container) container.style.display = 'none';
}

document.getElementById('leakForm').addEventListener('submit', async function(e) {
  e.preventDefault();
  
  // Get the texts and configuration injected by i18n.js
  const texts = window.APP_TEXTS.results;
  const config = window.APP_CONFIG;

  const query = document.getElementById('query').value;
  const resultsDiv = document.getElementById('results');
  
  resultsDiv.innerHTML = `
    <div style="text-align:center; padding:24px 0;">
      <span class="spinner" style="display:inline-block; width:32px; height:32px; border:4px solid #3f72af; border-top:4px solid #e3eafc; border-radius:50%; animation: spin 1s linear infinite;"></span>
      <div style="margin-top:12px; font-size:1.15em; color:#3f72af; font-weight:500; letter-spacing:0.5px;">${texts.loading}</div>
    </div>
  `;

  // Get the reCAPTCHA token
  let recaptchaResponse = '';
  if (!isLocalhost) {
    recaptchaResponse = grecaptcha.getResponse();
    if (!recaptchaResponse) {
      resultsDiv.innerHTML = `
        <div style="text-align:center; padding:24px 0;">
          <span style="font-size:2em; color:#e67e22;">⚠️</span>
          <div style="margin-top:10px; font-size:1.1em; color:#b85c00; font-weight:500;">${texts.captchaRequired}</div>
        </div>
      `;
      return;
    }
  }

  try {
    // Use the URLs from the configuration
    const baseUrl = isLocalhost ? config.api.localUrl : config.api.prodUrl;
    const url = baseUrl + '/api/leaks?query=' + encodeURIComponent(query) + (recaptchaResponse ? '&recaptcha=' + encodeURIComponent(recaptchaResponse) : '');
    const res = await fetch(url);

    if (!res.ok) throw new Error('Error on querying leaks API');
    const leaks = await res.json();
    
    if (leaks.length === 0) {
      resultsDiv.innerHTML = `
        <div style="text-align:center; padding:32px 0;">
          <span style="font-size:2.5em; color:#4BB543;">✔️</span>
          <div style="margin-top:12px; font-size:1.2em; color:#222; font-weight:500;">${texts.noLeaks}</div>
        </div>
      `;
    } else {
        resultsDiv.innerHTML = `
          ${leaks.map(leak => {
            const n = leak.site_count || 0;
            const siteText = n === 1 ? texts.site : texts.sites;
            return `
            <div class="leak">
              <span class="leak-icon">🔒</span>
              <div class="leak-details">
                <div><strong>${texts.user}</strong> ${leak.username || texts.unknown}</div>
                <div><strong>${texts.password}</strong> <span>${leak.password_masked || '**'}</span></div>
                <div><strong>${texts.detectedIn} ${n} ${siteText}</strong></div>
              </div>
            </div>
            `;
          }).join('')}
          <div class="leak-warning" style="background:#fff3cd; color:#856404; border-radius:8px; padding:14px 18px; margin-bottom:18px; border:1px solid #ffeeba; font-size:1.08em;">
            ${texts.warningHTML}
          </div>
        `;
      }
    if (!isLocalhost) grecaptcha.reset();
  } catch (err) {
    resultsDiv.innerHTML = `
      <div style="text-align:center; padding:24px 0;">
        <span style="font-size:2em; color:#e74c3c;">❌</span>
        <div style="margin-top:10px; font-size:1.1em; color:#c0392b; font-weight:500;">${texts.errorBackend}</div>
      </div>
    `;
  }
});

document.addEventListener('click', function(e) {
  if (e.target.matches('a[href="#faq-filtracion"]')) {
    const details = document.getElementById('faq-filtracion');
    if (details) details.open = true;
  }
});
