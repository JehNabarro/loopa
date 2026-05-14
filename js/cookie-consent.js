class CookieConsent {
  constructor() {
    this.consentCookieName = 'loopa_cookie_consent';
    this.cookieSettingsName = 'loopa_cookie_settings';
    
    // Configurações padrão (strict por padrão)
    this.defaultSettings = {
      essential: true, // Sempre true, não pode ser alterado
      analytics: false,
      marketing: false,
      performance: false
    };

    this.settings = this.getSettings() || this.defaultSettings;
    this.hasConsented = this.getConsentStatus();

    this.init();
  }

  init() {
    this.createBanner();
    this.attachEventListeners();
    
    if (!this.hasConsented) {
      setTimeout(() => this.showBanner(), 500);
    } else {
      this.applyConsentRules();
    }
    
    // Interceptar scripts externos baseados em consentimento
    this.interceptScripts();
  }

  createBanner() {
    const bannerHTML = `
      <div id="cookie-consent-overlay" class="cookie-overlay hidden"></div>
      <div id="cookie-consent-banner" class="cookie-banner hidden" role="dialog" aria-labelledby="cookie-title" aria-describedby="cookie-desc">
        <div class="cookie-banner-content">
          <div class="cookie-header">
            <h2 id="cookie-title" class="cookie-title"><em>Aceder</em> à sua privacidade</h2>
            <p id="cookie-desc" class="cookie-desc">
              Utilizamos cookies para elevar a sua experiência no Loopa. 
              Ao continuar, concorda com a nossa <a href="politica-de-cookies.html" target="_blank">Política de Cookies</a> e <a href="politica-de-privacidade.html" target="_blank">Política de Privacidade</a>.
            </p>
          </div>
          
          <div class="cookie-actions">
            <button id="cookie-accept-all" class="cookie-btn cookie-btn-primary">Aceitar Tudo</button>
            <button id="cookie-reject-all" class="cookie-btn cookie-btn-secondary">Apenas Essenciais</button>
            <button id="cookie-customize" class="cookie-btn cookie-btn-text">Personalizar</button>
          </div>
        </div>
      </div>

      <div id="cookie-settings-panel" class="cookie-settings-panel hidden" role="dialog" aria-labelledby="cookie-settings-title">
        <div class="cookie-settings-header">
          <h2 id="cookie-settings-title" class="cookie-settings-title">Preferências de <em>Privacidade</em></h2>
          <button id="cookie-settings-close" class="cookie-settings-close" aria-label="Fechar configurações">&times;</button>
        </div>
        
        <div class="cookie-settings-body">
          <p class="cookie-settings-desc">Controle os dados que partilha connosco. Os cookies essenciais são necessários para o funcionamento básico do site.</p>
          
          <div class="cookie-category">
            <div class="cookie-category-header">
              <div>
                <h3>Essenciais</h3>
                <p>Necessários para o funcionamento da plataforma.</p>
              </div>
              <label class="toggle-switch disabled">
                <input type="checkbox" checked disabled>
                <span class="slider"></span>
              </label>
            </div>
          </div>
          
          <div class="cookie-category">
            <div class="cookie-category-header">
              <div>
                <h3>Performance</h3>
                <p>Ajudam-nos a medir e otimizar a velocidade do site.</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-performance" ${this.settings.performance ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>

          <div class="cookie-category">
            <div class="cookie-category-header">
              <div>
                <h3>Analytics</h3>
                <p>Permitem-nos entender como utiliza o site para o podermos melhorar.</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-analytics" ${this.settings.analytics ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>
          
          <div class="cookie-category">
            <div class="cookie-category-header">
              <div>
                <h3>Marketing</h3>
                <p>Utilizados para entregar campanhas relevantes.</p>
              </div>
              <label class="toggle-switch">
                <input type="checkbox" id="toggle-marketing" ${this.settings.marketing ? 'checked' : ''}>
                <span class="slider"></span>
              </label>
            </div>
          </div>
        </div>
        
        <div class="cookie-settings-footer">
          <button id="cookie-save-settings" class="cookie-btn cookie-btn-primary w-100">Guardar Preferências</button>
        </div>
      </div>
      
      <!-- Botão flutuante para reabrir configurações -->
      <button id="cookie-reopen-btn" class="cookie-reopen-btn ${!this.hasConsented ? 'hidden' : ''}" aria-label="Gerir preferências de cookies">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path>
          <path d="M8.5 8.5v.01"></path>
          <path d="M16 12.5v.01"></path>
          <path d="M12 16v.01"></path>
          <path d="M11 11v.01"></path>
          <path d="M16 9v.01"></path>
        </svg>
      </button>
    `;

    document.body.insertAdjacentHTML('beforeend', bannerHTML);

    this.elements = {
      overlay: document.getElementById('cookie-consent-overlay'),
      banner: document.getElementById('cookie-consent-banner'),
      panel: document.getElementById('cookie-settings-panel'),
      acceptAllBtn: document.getElementById('cookie-accept-all'),
      rejectAllBtn: document.getElementById('cookie-reject-all'),
      customizeBtn: document.getElementById('cookie-customize'),
      closePanelBtn: document.getElementById('cookie-settings-close'),
      saveSettingsBtn: document.getElementById('cookie-save-settings'),
      reopenBtn: document.getElementById('cookie-reopen-btn'),
      toggles: {
        performance: document.getElementById('toggle-performance'),
        analytics: document.getElementById('toggle-analytics'),
        marketing: document.getElementById('toggle-marketing')
      }
    };
  }

  attachEventListeners() {
    this.elements.acceptAllBtn.addEventListener('click', () => this.handleConsent(true));
    this.elements.rejectAllBtn.addEventListener('click', () => this.handleConsent(false));
    this.elements.customizeBtn.addEventListener('click', () => this.openPanel());
    this.elements.closePanelBtn.addEventListener('click', () => this.closePanel());
    this.elements.overlay.addEventListener('click', () => this.closePanel());
    this.elements.saveSettingsBtn.addEventListener('click', () => this.saveCustomSettings());
    this.elements.reopenBtn.addEventListener('click', () => this.openPanel());
  }

  showBanner() {
    this.elements.banner.classList.remove('hidden');
    // Animação de entrada suave
    setTimeout(() => {
      this.elements.banner.classList.add('visible');
    }, 50);
  }

  hideBanner() {
    this.elements.banner.classList.remove('visible');
    setTimeout(() => {
      this.elements.banner.classList.add('hidden');
      this.elements.reopenBtn.classList.remove('hidden');
    }, 400);
  }

  openPanel() {
    this.elements.banner.classList.remove('visible');
    this.elements.overlay.classList.remove('hidden');
    this.elements.panel.classList.remove('hidden');
    
    // Animação
    setTimeout(() => {
      this.elements.overlay.classList.add('visible');
      this.elements.panel.classList.add('visible');
    }, 10);
  }

  closePanel() {
    this.elements.overlay.classList.remove('visible');
    this.elements.panel.classList.remove('visible');
    
    setTimeout(() => {
      this.elements.overlay.classList.add('hidden');
      this.elements.panel.classList.add('hidden');
      if (!this.hasConsented) {
        this.showBanner();
      }
    }, 400);
  }

  handleConsent(acceptAll) {
    if (acceptAll) {
      this.settings = { essential: true, analytics: true, marketing: true, performance: true };
    } else {
      this.settings = { essential: true, analytics: false, marketing: false, performance: false };
    }
    
    // Atualizar toggles do painel
    this.elements.toggles.analytics.checked = this.settings.analytics;
    this.elements.toggles.marketing.checked = this.settings.marketing;
    this.elements.toggles.performance.checked = this.settings.performance;

    this.saveConsent();
  }

  saveCustomSettings() {
    this.settings = {
      essential: true,
      performance: this.elements.toggles.performance.checked,
      analytics: this.elements.toggles.analytics.checked,
      marketing: this.elements.toggles.marketing.checked
    };
    this.saveConsent();
    this.closePanel();
  }

  saveConsent() {
    this.hasConsented = true;
    
    // Guardar cookie de consentimento (válido por 1 ano)
    const expirationDate = new Date();
    expirationDate.setFullYear(expirationDate.getFullYear() + 1);
    
    document.cookie = `${this.consentCookieName}=true; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax; Secure`;
    document.cookie = `${this.cookieSettingsName}=${JSON.stringify(this.settings)}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Lax; Secure`;
    
    this.hideBanner();
    this.applyConsentRules();
  }

  getConsentStatus() {
    return document.cookie.includes(`${this.consentCookieName}=true`);
  }

  getSettings() {
    const match = document.cookie.match(new RegExp('(^| )' + this.cookieSettingsName + '=([^;]+)'));
    if (match) {
      try {
        return JSON.parse(decodeURIComponent(match[2]));
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  applyConsentRules() {
    // Aplicar regras baseadas nas definições
    
    // Google Consent Mode V2
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    
    gtag('consent', 'update', {
      'analytics_storage': this.settings.analytics ? 'granted' : 'denied',
      'ad_storage': this.settings.marketing ? 'granted' : 'denied',
      'ad_user_data': this.settings.marketing ? 'granted' : 'denied',
      'ad_personalization': this.settings.marketing ? 'granted' : 'denied',
      'personalization_storage': this.settings.performance ? 'granted' : 'denied',
      'functionality_storage': 'granted',
      'security_storage': 'granted'
    });

    // Desbloquear scripts pendentes
    this.releaseBlockedScripts();
  }

  interceptScripts() {
    // Interceptar inserção dinâmica de scripts
    const originalCreateElement = document.createElement;
    document.createElement = function(tagName) {
      const el = originalCreateElement.call(document, tagName);
      if (tagName.toLowerCase() === 'script') {
        const originalSetAttribute = el.setAttribute;
        el.setAttribute = function(name, value) {
          if (name === 'type' && value.startsWith('text/plain')) {
            // Already handled
          }
          return originalSetAttribute.call(el, name, value);
        };
      }
      return el;
    };
  }

  releaseBlockedScripts() {
    // Procurar por scripts bloqueados no HTML
    // ex: <script type="text/plain" data-cookiecategory="analytics" src="..."></script>
    const blockedScripts = document.querySelectorAll('script[type="text/plain"][data-cookiecategory]');
    
    blockedScripts.forEach(script => {
      const category = script.getAttribute('data-cookiecategory');
      
      if (this.settings[category]) {
        const newScript = document.createElement('script');
        
        // Copiar todos os atributos, exceto type e data-cookiecategory
        Array.from(script.attributes).forEach(attr => {
          if (attr.name !== 'type' && attr.name !== 'data-cookiecategory') {
            newScript.setAttribute(attr.name, attr.value);
          }
        });
        
        if (script.innerHTML) {
          newScript.innerHTML = script.innerHTML;
        }
        
        script.parentNode.replaceChild(newScript, script);
      }
    });
  }
}

// Inicializar quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.cookieConsent = new CookieConsent();
});
