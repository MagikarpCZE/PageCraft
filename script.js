(function () {
      'use strict';

      /* Navbar scroll */
      const navbar = document.getElementById('navbar');
      window.addEventListener('scroll', function () {
        navbar.classList.toggle('scrolled', window.scrollY > 40);
      }, { passive: true });

      /* Burger */
      const burger = document.getElementById('navBurger');
      const navMenu = document.getElementById('navMenu');
      burger.addEventListener('click', function () {
        const open = navMenu.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
      });
      navMenu.querySelectorAll('.navbar__link').forEach(function (l) {
        l.addEventListener('click', function () {
          navMenu.classList.remove('open');
          burger.setAttribute('aria-expanded', 'false');
        });
      });

      /* Smooth scroll */
      document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
          const id = a.getAttribute('href');
          if (id === '#') return;
          const target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          const navH = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-h')) || 72;
          window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navH, behavior: 'smooth' });
        });
      });

      /* Fade-in */
      if ('IntersectionObserver' in window) {
        const obs = new IntersectionObserver(function (entries) {
          entries.forEach(function (e) {
            if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
          });
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });
        document.querySelectorAll('.fade-section').forEach(function (el) { obs.observe(el); });
      } else {
        document.querySelectorAll('.fade-section').forEach(function (el) { el.classList.add('visible'); });
      }

      /* Form */
      document.getElementById('formSubmit').addEventListener('click', function () {
        const btn = this;
        const note = document.getElementById('formNote');
        const jmeno = document.getElementById('jmeno').value.trim();
        const prijmeni = document.getElementById('prijmeni').value.trim();
        const email = document.getElementById('email').value.trim();
        const zprava = document.getElementById('zprava').value.trim();

        if (!jmeno || !prijmeni || !email || !zprava) {
          note.textContent = (i18nData[currentLang]||i18nData.cs)['form-err-fields'];
          note.style.color = '#e05c5c';
          return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          note.textContent = (i18nData[currentLang]||i18nData.cs)['form-err-email'];
          note.style.color = '#e05c5c';
          return;
        }
        btn.textContent = (i18nData[currentLang]||i18nData.cs)['form-sending'];
        btn.disabled = true;
        note.textContent = '';

        var data = new FormData();
        data.append('jmeno', jmeno);
        data.append('prijmeni', prijmeni);
        data.append('email', email);
        data.append('zprava', zprava);

        fetch('mail.php', { method: 'POST', body: data })
          .then(function (res) { return res.json(); })
          .then(function (json) {
            if (json.ok) {
              note.textContent = json.message;
              note.style.color = '#f5a800';
              btn.textContent = (i18nData[currentLang]||i18nData.cs)['form-sent'];
              ['jmeno','prijmeni','email','zprava'].forEach(function(id){ document.getElementById(id).value=''; });
            } else {
              note.textContent = '→ ' + json.message;
              note.style.color = '#e05c5c';
              btn.innerHTML = (i18nData[currentLang]||i18nData.cs)['form-submit'];
              btn.disabled = false;
            }
          })
          .catch(function () {
            note.textContent = (i18nData[currentLang]||i18nData.cs)['form-err-conn'];
            note.style.color = '#e05c5c';
            btn.innerHTML = (i18nData[currentLang]||i18nData.cs)['form-submit'];
            btn.disabled = false;
          });
      });
      /* Cookie banner */
      (function () {
        var banner = document.getElementById('cookieBanner');
        var consent = localStorage.getItem('cookieConsent');
        if (!consent) {
          banner.hidden = false;
          setTimeout(function () { banner.classList.add('cookie-banner--visible'); }, 50);
        }
        function dismiss(value) {
          banner.classList.remove('cookie-banner--visible');
          localStorage.setItem('cookieConsent', value);
          setTimeout(function () { banner.hidden = true; }, 400);
        }
        document.getElementById('cookieAccept').addEventListener('click', function () { dismiss('accepted'); });
        document.getElementById('cookieDecline').addEventListener('click', function () { dismiss('declined'); });
      })();

      /* i18n — Language switcher */
      var currentLang = localStorage.getItem('lang') || 'cs';
      var i18nData = {
        cs: {
          'nav-about': 'O nás',
          'nav-process': 'Postup spolupráce',
          'nav-portfolio': 'Portfolio',
          'nav-contact': 'Kontakt',
          'burger-aria': 'Otevřít menu',
          'hero-title': 'Tvoříme <span class="hero__title--accent">webové stránky</span>,<br />které zlepší vaší vizáž.',
          'hero-subtitle': 'Navrhujeme precizní weby na míru.<br />Váš úspěch stavíme na čistém designu a spolehlivosti.',
          'hero-cta': 'Začněme spolupráci <span aria-hidden="true">→</span>',
          'about-title': 'O nás',
          'about-p1': 'Podívejte se na svůj web očima nového zákazníka. Je přehledný? Důvěryhodný? Našli byste na něm snadno to, co hledáte, i na mobilu?',
          'about-p2': 'Pokud váháte, nejste sami. Mnoho úspěšných malých podniků má webové stránky, které jim už dávno neslouží. Místo aby přiváděly nové zakázky, působí nedůvěryhodně a potenciální klienty spíše odradí.',
          'stat-projects': 'Projektů dokončeno',
          'stat-years': 'Let zkušeností',
          'stat-responsive': 'Responzivní weby',
          'about-change': 'My to měníme',
          'about-lead': 'Specializujeme se na revitalizaci a tvorbu webů pro živnostníky a malé firmy, které potřebují vidět výsledky bez zbytečných složitostí.',
          'feat-1-title': 'Moderní design',
          'feat-1-desc': 'Nahradíme zastaralý vzhled profesionálním designem, který buduje důvěru a zanechá trvalý dojem.',
          'feat-2-title': 'Funkčnost na mobilu',
          'feat-2-desc': 'Bezchybné zobrazení na všech zařízeních — většina zákazníků hledá právě na telefonu.',
          'feat-3-title': 'Přehledná struktura',
          'feat-3-desc': 'Zákazníci okamžitě najdou kontakt, ceník a otevírací dobu — bez zbytečného tápání.',
          'feat-4-title': 'Odevzdání i správa',
          'feat-4-desc': 'Předáme vám web, kterému rozumíte, a posléze se o něj postaráme za vás.',
          'process-title': 'Takto postupujeme',
          'proc-1-title': 'Ozveme se do 24 hodin',
          'proc-1-badge': 'Zdarma',
          'proc-1-desc': 'Po odeslání vaší poptávky se vám ozvíme a domluvme první krok.',
          'proc-2-title': 'Probráme vaši představu',
          'proc-2-badge': 'Zdarma',
          'proc-2-desc': 'Domluvme si komunikační platformu a probereme, jak by váš web měl vypadat a co by měl stát.',
          'proc-3-title': 'Navrhneme hrubou šablonu',
          'proc-3-badge': 'Zdarma',
          'proc-3-desc': 'Připravíme návrh vizuální šablony webu, který vám předložíme ke schválení.',
          'proc-4-title': 'Zahájíme realizaci',
          'proc-4-desc': 'Po schválení šablony začneme pracovat na finální verzi vašeho webu.',
          'proc-5-title': 'Odevzdání a spuštění',
          'proc-5-badge': 'Dle nabídky',
          'proc-5-desc': 'Finální web vám odprezentujeme a společně domluvme podmínky spuštění a případné správy.',
          'portfolio-title': 'Naše práce mluví za vše',
          'portfolio-desc': 'Podívejte se na ukázky webových stránek, které jsme navrhli a vytvořili. Každý projekt je výsledkem individuálního přístupu a důrazu na funkčnost, moderní design a kvalitní kód.',
          'beran-overlay': 'Firemní web',
          'beran-link': 'Zobrazit web →',
          'beran-desc': 'Web pro certifikovaného odhadce nemovitostí Bc. Davida Berana, MBA. Oceňování rezidenčních i komerčních nemovitostí – pro banky, dědictví, prodej i vypořádání spoluvlastníctví.',
          'beran-tag-1': 'Firemní web', 'beran-tag-2': 'Oceňování nemovitostí', 'beran-tag-3': 'Responzivní', 'beran-tag-4': 'Výzva k akci',
          'puresound-overlay': 'Wellness & terapie',
          'puresound-link': 'Zobrazit web →',
          'puresound-desc': 'Web pro zvukovou terapeutku Michaelu Královou. Zvuková terapie s křišťálovými zpívajícími mísami pro hlubokou relaxaci, harmonizaci mysli, těla i duše.',
          'puresound-tag-1': 'Wellness', 'puresound-tag-2': 'Zvuková terapie', 'puresound-tag-3': 'Responzivní', 'puresound-tag-4': 'Atmosférický design',
          'placeholder-title': 'Objevte se zde i vy',
          'placeholder-sub': 'Váš web by mohl být<br />součástí naší vitríny',
          'kontakt-title': 'Jsme tu pro vás',
          'kontakt-intro-1': 'Át už máte konkrétní představu, nebo jen otázku, dejte nám vědět. Ozveme se co nejdřív a společně vymyslíme, jak z vašich nápadů udělat funkční a moderní web.',
          'kontakt-intro-2': 'Ke každému projektu přistupujeme individuálně — cena se odvíjí od rozsahu a náročnosti. Napište nám a připravíme nabídku přesně na míru vašim potřebám.',
          'kontakt-free': 'První konzultace je nezávazná a zdarma.',
          'kontakt-email-html': 'Napište nám na <a href="mailto:info@pagecraft.cz" class="kontakt__email-link">info@pagecraft.cz</a> nebo vyplnte formulář níže.',
          'trust-1': '<span class="trust-item__icon">✓</span> Nezávazná konzultace zdarma',
          'trust-2': '<span class="trust-item__icon">✓</span> Odpověď do 24 hodin',
          'trust-3': '<span class="trust-item__icon">✓</span> Férové a transparentní ceny',
          'form-label-name': 'Jméno', 'form-label-surname': 'Příjmení', 'form-label-email': 'E-mail', 'form-label-message': 'Zanechte nám zprávu!',
          'form-ph-name': 'Jan', 'form-ph-surname': 'Novák', 'form-ph-email': 'např. jannovak@email.cz',
          'form-ph-message': 'Napište nám, jak byste si představovali váš web nebo jeho revitalizaci. My se vám posléze ozveme.',
          'form-submit': 'Odeslat <span aria-hidden="true">→</span>',
          'form-sending': 'Odesílám…', 'form-sent': 'Odeslanó ✓',
          'form-err-fields': '→ Prosím vyplněte všechna pole.',
          'form-err-email': '→ Zadejte platnou e-mailovou adresu.',
          'form-err-conn': '→ Chyba připojení. Zkuste to prosím znovu.',
          'footer-slogan': '<em>Tvoříme originální a kreativní weby,<br />které vám zlepší úspěch v podnikání.</em>',
          'footer-contact-title': 'Kontakt'
        },
        en: {
          'nav-about': 'About us', 'nav-process': 'How we work', 'nav-portfolio': 'Portfolio', 'nav-contact': 'Contact',
          'burger-aria': 'Open menu',
          'hero-title': 'We craft <span class="hero__title--accent">websites</span><br />that elevate your image.',
          'hero-subtitle': 'We design precise, tailor-made websites.<br />Your success is built on clean design and reliability.',
          'hero-cta': 'Let\'s start working together <span aria-hidden="true">→</span>',
          'about-title': 'About us',
          'about-p1': 'Look at your website through the eyes of a new customer. Is it clear? Trustworthy? Could you easily find what you\'re looking for, even on mobile?',
          'about-p2': 'If you hesitate, you\'re not alone. Many successful small businesses have websites that no longer serve them. Instead of attracting new clients, they appear untrustworthy and deter potential customers.',
          'stat-projects': 'Projects completed', 'stat-years': 'Years of experience', 'stat-responsive': 'Responsive websites',
          'about-change': 'We change that',
          'about-lead': 'We specialise in revitalising and building websites for freelancers and small businesses that need results without unnecessary complexity.',
          'feat-1-title': 'Modern design', 'feat-1-desc': 'We replace outdated looks with professional design that builds trust and leaves a lasting impression.',
          'feat-2-title': 'Mobile performance', 'feat-2-desc': 'Flawless display on all devices — most customers search on their phone.',
          'feat-3-title': 'Clear structure', 'feat-3-desc': 'Customers instantly find contacts, pricing and opening hours — without unnecessary hassle.',
          'feat-4-title': 'Delivery & management', 'feat-4-desc': 'We hand over a website you understand, and then take care of it for you.',
          'process-title': 'How we work',
          'proc-1-title': 'We\'ll get back to you within 24 hours', 'proc-1-badge': 'Free', 'proc-1-desc': 'After you submit your enquiry, we\'ll get in touch and arrange the first step.',
          'proc-2-title': 'We\'ll discuss your vision', 'proc-2-badge': 'Free', 'proc-2-desc': 'We\'ll agree on a communication platform and discuss what your website should look like and what it should cost.',
          'proc-3-title': 'We\'ll draft a rough template', 'proc-3-badge': 'Free', 'proc-3-desc': 'We\'ll prepare a visual website template draft for your approval.',
          'proc-4-title': 'We\'ll start the build', 'proc-4-desc': 'After approval we\'ll start working on the final version of your website.',
          'proc-5-title': 'Handover & launch', 'proc-5-badge': 'As quoted', 'proc-5-desc': 'We\'ll present the final website and agree on launch and maintenance terms together.',
          'portfolio-title': 'Our work speaks for itself',
          'portfolio-desc': 'Take a look at samples of websites we\'ve designed and built. Every project is the result of an individual approach with a focus on functionality, modern design and quality code.',
          'beran-overlay': 'Corporate website', 'beran-link': 'View website →',
          'beran-desc': 'Website for certified property appraiser Bc. David Beran, MBA. Valuation of residential and commercial properties – for banks, inheritance, sales and co-ownership settlements.',
          'beran-tag-1': 'Corporate website', 'beran-tag-2': 'Property valuation', 'beran-tag-3': 'Responsive', 'beran-tag-4': 'Call to action',
          'puresound-overlay': 'Wellness & therapy', 'puresound-link': 'View website →',
          'puresound-desc': 'Website for sound therapist Michaela Kr\u00e1lov\u00e1. Sound therapy with crystal singing bowls for deep relaxation and harmonising mind, body and soul.',
          'puresound-tag-1': 'Wellness', 'puresound-tag-2': 'Sound therapy', 'puresound-tag-3': 'Responsive', 'puresound-tag-4': 'Atmospheric design',
          'placeholder-title': 'Be featured here too', 'placeholder-sub': 'Your website could be<br />part of our showcase',
          'kontakt-title': 'We\'re here for you',
          'kontakt-intro-1': 'Whether you have a specific idea or just a question, let us know. We\'ll get back to you as soon as possible and together figure out how to turn your ideas into a functional, modern website.',
          'kontakt-intro-2': 'We approach every project individually — the price depends on scope and complexity. Write to us and we\'ll prepare a quote tailored exactly to your needs.',
          'kontakt-free': 'The first consultation is free and non-binding.',
          'kontakt-email-html': 'Write to us at <a href="mailto:info@pagecraft.cz" class="kontakt__email-link">info@pagecraft.cz</a> or fill in the form below.',
          'trust-1': '<span class="trust-item__icon">✓</span> Free non-binding consultation',
          'trust-2': '<span class="trust-item__icon">✓</span> Response within 24 hours',
          'trust-3': '<span class="trust-item__icon">✓</span> Fair and transparent prices',
          'form-label-name': 'First name', 'form-label-surname': 'Last name', 'form-label-email': 'E-mail', 'form-label-message': 'Leave us a message!',
          'form-ph-name': 'John', 'form-ph-surname': 'Smith', 'form-ph-email': 'e.g. john.smith@email.com',
          'form-ph-message': 'Tell us how you imagine your website or its revitalisation. We\'ll get back to you afterwards.',
          'form-submit': 'Send <span aria-hidden="true">→</span>',
          'form-sending': 'Sending…', 'form-sent': 'Sent ✓',
          'form-err-fields': '→ Please fill in all fields.',
          'form-err-email': '→ Please enter a valid email address.',
          'form-err-conn': '→ Connection error. Please try again.',
          'footer-slogan': '<em>We create original and creative websites<br />that improve your business success.</em>',
          'footer-contact-title': 'Contact'
        },
        de: {
          'nav-about': '\u00dcber uns', 'nav-process': 'Ablauf', 'nav-portfolio': 'Portfolio', 'nav-contact': 'Kontakt',
          'burger-aria': 'Men\u00fc \u00f6ffnen',
          'hero-title': 'Wir gestalten <span class="hero__title--accent">Webseiten</span>,<br />die Ihr Image verbessern.',
          'hero-subtitle': 'Wir entwerfen pr\u00e4zise, ma\u00dfgeschneiderte Webseiten.<br />Ihr Erfolg basiert auf klarem Design und Zuverl\u00e4ssigkeit.',
          'hero-cta': 'Starten wir zusammen <span aria-hidden="true">→</span>',
          'about-title': '\u00dcber uns',
          'about-p1': 'Betrachten Sie Ihre Website mit den Augen eines neuen Kunden. Ist sie \u00fcbersichtlich? Vertrauensw\u00fcrdig? W\u00fcrden Sie leicht finden, was Sie suchen \u2013 auch auf dem Handy?',
          'about-p2': 'Wenn Sie z\u00f6gern, sind Sie nicht allein. Viele erfolgreiche Kleinunternehmen haben Websites, die ihnen l\u00e4ngst nicht mehr dienen. Statt neue Auftr\u00e4ge zu bringen, wirken sie unglaubw\u00fcrdig und schrecken potenzielle Kunden ab.',
          'stat-projects': 'Abgeschlossene Projekte', 'stat-years': 'Jahre Erfahrung', 'stat-responsive': 'Responsive Websites',
          'about-change': 'Das \u00e4ndern wir',
          'about-lead': 'Wir spezialisieren uns auf die Revitalisierung und Erstellung von Websites f\u00fcr Selbst\u00e4ndige und kleine Unternehmen, die Ergebnisse ohne unn\u00f6tige Komplexit\u00e4t ben\u00f6tigen.',
          'feat-1-title': 'Modernes Design', 'feat-1-desc': 'Wir ersetzen veraltetes Erscheinungsbild durch professionelles Design, das Vertrauen aufbaut und einen bleibenden Eindruck hinterl\u00e4sst.',
          'feat-2-title': 'Mobile Performance', 'feat-2-desc': 'Fehlerfreie Darstellung auf allen Ger\u00e4ten \u2014 die meisten Kunden suchen auf dem Smartphone.',
          'feat-3-title': 'Klare Struktur', 'feat-3-desc': 'Kunden finden sofort Kontakt, Preisliste und \u00d6ffnungszeiten \u2013 ohne unn\u00f6tiges Suchen.',
          'feat-4-title': '\u00dcbergabe & Verwaltung', 'feat-4-desc': 'Wir \u00fcbergeben Ihnen eine Website, die Sie verstehen, und k\u00fcmmern uns anschlie\u00dfend darum.',
          'process-title': 'So gehen wir vor',
          'proc-1-title': 'Wir melden uns innerhalb von 24 Stunden', 'proc-1-badge': 'Kostenlos', 'proc-1-desc': 'Nach Eingang Ihrer Anfrage melden wir uns und vereinbaren den ersten Schritt.',
          'proc-2-title': 'Wir besprechen Ihre Vorstellung', 'proc-2-badge': 'Kostenlos', 'proc-2-desc': 'Wir einigen uns auf eine Kommunikationsplattform und besprechen, wie Ihre Website aussehen und was sie kosten soll.',
          'proc-3-title': 'Wir erstellen einen groben Entwurf', 'proc-3-badge': 'Kostenlos', 'proc-3-desc': 'Wir erstellen einen visuellen Webentwurf zur Genehmigung.',
          'proc-4-title': 'Wir beginnen mit der Umsetzung', 'proc-4-desc': 'Nach der Genehmigung beginnen wir mit der Arbeit an der finalen Version Ihrer Website.',
          'proc-5-title': '\u00dcbergabe & Launch', 'proc-5-badge': 'Nach Angebot', 'proc-5-desc': 'Wir pr\u00e4sentieren die fertige Website und vereinbaren gemeinsam die Launch- und Pflegebedingungen.',
          'portfolio-title': 'Unsere Arbeit spricht f\u00fcr sich',
          'portfolio-desc': 'Sehen Sie sich Beispiele der von uns gestalteten und erstellten Websites an. Jedes Projekt ist das Ergebnis eines individuellen Ansatzes mit Fokus auf Funktionalit\u00e4t, modernem Design und hochwertigem Code.',
          'beran-overlay': 'Unternehmenswebsite', 'beran-link': 'Website ansehen →',
          'beran-desc': 'Website f\u00fcr zertifizierten Immobiliengutachter Bc. David Beran, MBA. Bewertung von Wohn- und Gewerbeimmobilien \u2013 f\u00fcr Banken, Erbschaften, Verk\u00e4ufe und Miteigent\u00fcmerabrechnungen.',
          'beran-tag-1': 'Unternehmenswebsite', 'beran-tag-2': 'Immobilienbewertung', 'beran-tag-3': 'Responsiv', 'beran-tag-4': 'Call to Action',
          'puresound-overlay': 'Wellness & Therapie', 'puresound-link': 'Website ansehen →',
          'puresound-desc': 'Website f\u00fcr Klangtherapeutin Michaela Kr\u00e1lov\u00e1. Klangtherapie mit Kristallklangschalen f\u00fcr tiefe Entspannung und Harmonisierung von Geist, K\u00f6rper und Seele.',
          'puresound-tag-1': 'Wellness', 'puresound-tag-2': 'Klangtherapie', 'puresound-tag-3': 'Responsiv', 'puresound-tag-4': 'Atmosph\u00e4risches Design',
          'placeholder-title': 'Erscheinen Sie hier auch', 'placeholder-sub': 'Ihre Website k\u00f6nnte<br />Teil unserer Galerie sein',
          'kontakt-title': 'Wir sind f\u00fcr Sie da',
          'kontakt-intro-1': 'Ob Sie eine konkrete Vorstellung oder nur eine Frage haben \u2013 lassen Sie es uns wissen. Wir melden uns so schnell wie m\u00f6glich und \u00fcberlegen gemeinsam, wie wir Ihre Ideen umsetzen.',
          'kontakt-intro-2': 'Wir gehen auf jedes Projekt individuell ein \u2014 der Preis h\u00e4ngt vom Umfang ab. Schreiben Sie uns und wir erstellen ein Angebot, das genau auf Ihre Bed\u00fcrfnisse zugeschnitten ist.',
          'kontakt-free': 'Die erste Beratung ist unverbindlich und kostenlos.',
          'kontakt-email-html': 'Schreiben Sie uns an <a href="mailto:info@pagecraft.cz" class="kontakt__email-link">info@pagecraft.cz</a> oder f\u00fcllen Sie das Formular unten aus.',
          'trust-1': '<span class="trust-item__icon">✓</span> Kostenlose unverbindliche Beratung',
          'trust-2': '<span class="trust-item__icon">✓</span> Antwort innerhalb von 24 Stunden',
          'trust-3': '<span class="trust-item__icon">✓</span> Faire und transparente Preise',
          'form-label-name': 'Vorname', 'form-label-surname': 'Nachname', 'form-label-email': 'E-Mail', 'form-label-message': 'Hinterlassen Sie uns eine Nachricht!',
          'form-ph-name': 'Johann', 'form-ph-surname': 'M\u00fcller', 'form-ph-email': 'z.B. j.mueller@email.de',
          'form-ph-message': 'Erz\u00e4hlen Sie uns, wie Sie sich Ihre Website vorstellen. Wir melden uns dann bei Ihnen.',
          'form-submit': 'Senden <span aria-hidden="true">→</span>',
          'form-sending': 'Wird gesendet\u2026', 'form-sent': 'Gesendet \u2713',
          'form-err-fields': '→ Bitte f\u00fcllen Sie alle Felder aus.',
          'form-err-email': '→ Bitte geben Sie eine g\u00fcltige E-Mail-Adresse ein.',
          'form-err-conn': '→ Verbindungsfehler. Bitte versuchen Sie es erneut.',
          'footer-slogan': '<em>Wir erstellen originelle und kreative Websites,<br />die Ihren Gesch\u00e4ftserfolg verbessern.</em>',
          'footer-contact-title': 'Kontakt'
        }
      };

      function applyLang(lang) {
        var t = i18nData[lang] || i18nData.cs;
        currentLang = lang;
        document.documentElement.lang = lang;
        document.querySelectorAll('[data-i18n]').forEach(function(el) {
          var key = el.getAttribute('data-i18n');
          if (t[key] !== undefined) el.textContent = t[key];
        });
        document.querySelectorAll('[data-i18n-html]').forEach(function(el) {
          var key = el.getAttribute('data-i18n-html');
          if (t[key] !== undefined) el.innerHTML = t[key];
        });
        document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
          var key = el.getAttribute('data-i18n-placeholder');
          if (t[key] !== undefined) el.placeholder = t[key];
        });
        document.querySelectorAll('[data-i18n-aria]').forEach(function(el) {
          var key = el.getAttribute('data-i18n-aria');
          if (t[key] !== undefined) el.setAttribute('aria-label', t[key]);
        });
        document.querySelectorAll('.lang-btn').forEach(function(btn) {
          btn.classList.toggle('lang-btn--active', btn.getAttribute('data-lang') === lang);
        });
        localStorage.setItem('lang', lang);
      }

      document.querySelectorAll('.lang-btn').forEach(function(btn) {
        btn.addEventListener('click', function() { applyLang(btn.getAttribute('data-lang')); });
      });
      window.applyLang = applyLang;
      applyLang(currentLang);
    })();