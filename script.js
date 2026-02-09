(function () {
  'use strict';

  // ========== CONFIG: EDIT THESE TO MATCH YOUR SETUP ==========
  // CONTACT FORM (FormEasy): Web App URL — form submissions are sent here and emailed to fruitworldcebu@outlook.com.
  // To change the submit endpoint, edit the URL below (this is the FormEasy / Google Apps Script Web App URL).
  var CONTACT_FORM_ENDPOINT = 'https://script.google.com/macros/s/AKfycbywtiwwWhr9SpKu3RjVLUAjrBOftkE1mNCERJAfM6WG8ofOnb-o9U_JINA3Eq5kgvWJXQ/exec';
  // Products: number of products per page (3 full rows = 9)
  var PRODUCTS_PER_PAGE = 9;
  // ============================================================

  // ——— Mobile navigation toggle ———
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');
  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', navLinks.classList.contains('is-open'));
    });
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // ——— Header scroll effect ———
  var header = document.getElementById('header');
  if (header) {
    function updateHeader() {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }
    window.addEventListener('scroll', updateHeader, { passive: true });
    updateHeader();
  }

  // ——— Scroll reveal (about section, product cards, and all .section-reveal sections) ———
  var revealEls = document.querySelectorAll('.reveal, .product-card');
  if (revealEls.length && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          var el = entry.target;
          var idx = Array.prototype.indexOf.call(revealEls, el);
          if (el.classList.contains('product-card') && idx >= 0) {
            el.style.transitionDelay = (idx % 9) * 0.06 + 's';
          }
          el.classList.add('visible');
        });
      },
      { rootMargin: '0px 0px -40px 0px', threshold: 0.1 }
    );
    revealEls.forEach(function (el) {
      observer.observe(el);
    });
  }

  // ——— Section reveal: fade-in + slide-up for .section-reveal ———
  var sectionRevealEls = document.querySelectorAll('.section-reveal');
  if (sectionRevealEls.length && 'IntersectionObserver' in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { rootMargin: '0px 0px -60px 0px', threshold: 0.05 }
    );
    sectionRevealEls.forEach(function (el) {
      sectionObserver.observe(el);
    });
  }

  // ——— FAQ accordion ———
  var faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.closest('.faq-item');
      var isOpen = item.classList.contains('is-open');
      document.querySelectorAll('.faq-item').forEach(function (other) {
        other.classList.remove('is-open');
        var otherBtn = other.querySelector('.faq-question');
        if (otherBtn) {
          otherBtn.setAttribute('aria-expanded', 'false');
        }
      });
      if (!isOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ——— Product search, sort (global across all pages), and pagination ———
  var productSearch = document.getElementById('productSearch');
  var productsGrid = document.getElementById('productsGrid');
  var productsNoResults = document.getElementById('productsNoResults');
  var productSort = document.getElementById('productSort');
  var productsPagination = document.getElementById('productsPagination');
  var productsPrev = document.getElementById('productsPrev');
  var productsNext = document.getElementById('productsNext');
  var productsPageInfo = document.getElementById('productsPageInfo');
  if (productsGrid) {
    var productCards = productsGrid.querySelectorAll('.product-card');
    var currentPage = 1;
    var productsPerPage = typeof PRODUCTS_PER_PAGE !== 'undefined' ? PRODUCTS_PER_PAGE : 9;

    productCards.forEach(function (card, i) {
      card.setAttribute('data-initial-order', String(i));
    });

    function getSortedCards() {
      var cards = Array.prototype.slice.call(productCards);
      var sortValue = productSort ? productSort.value : 'default';
      if (sortValue === 'price-asc') {
        cards.sort(function (a, b) {
          var pa = parseInt(a.getAttribute('data-price'), 10) || 0;
          var pb = parseInt(b.getAttribute('data-price'), 10) || 0;
          return pa - pb;
        });
      } else if (sortValue === 'price-desc') {
        cards.sort(function (a, b) {
          var pa = parseInt(a.getAttribute('data-price'), 10) || 0;
          var pb = parseInt(b.getAttribute('data-price'), 10) || 0;
          return pb - pa;
        });
      } else {
        cards.sort(function (a, b) {
          var ia = parseInt(a.getAttribute('data-initial-order'), 10) || 0;
          var ib = parseInt(b.getAttribute('data-initial-order'), 10) || 0;
          return ia - ib;
        });
      }
      return cards;
    }

    function assignPageNumbers() {
      var children = productsGrid.children;
      for (var i = 0; i < children.length; i++) {
        var pageNum = Math.floor(i / productsPerPage) + 1;
        children[i].setAttribute('data-page', String(pageNum));
      }
    }

    function getTotalPages() {
      var total = productsGrid.querySelectorAll('.product-card').length;
      return Math.max(1, Math.ceil(total / productsPerPage));
    }

    function showPage(page) {
      currentPage = page;
      var cards = productsGrid.querySelectorAll('.product-card');
      cards.forEach(function (card) {
        var onThisPage = card.getAttribute('data-page') === String(currentPage);
        card.classList.toggle('is-page-hidden', !onThisPage);
      });
      if (productsPageInfo) {
        productsPageInfo.textContent = 'Page ' + currentPage + ' of ' + getTotalPages();
      }
      if (productsPrev) {
        productsPrev.disabled = currentPage <= 1;
        productsPrev.setAttribute('aria-disabled', currentPage <= 1);
      }
      if (productsNext) {
        var totalPages = getTotalPages();
        productsNext.disabled = currentPage >= totalPages;
        productsNext.setAttribute('aria-disabled', currentPage >= totalPages);
      }
    }

    function reorderGrid() {
      var sorted = getSortedCards();
      for (var i = sorted.length - 1; i >= 0; i--) {
        productsGrid.insertBefore(sorted[i], productsGrid.firstChild);
      }
      assignPageNumbers();
      currentPage = 1;
      showPage(1);
    }

    if (productSort) {
      productSort.addEventListener('change', reorderGrid);
    }

    if (productsPrev) {
      productsPrev.addEventListener('click', function () {
        if (currentPage > 1) {
          showPage(currentPage - 1);
        }
      });
    }
    if (productsNext) {
      productsNext.addEventListener('click', function () {
        var totalPages = getTotalPages();
        if (currentPage < totalPages) {
          showPage(currentPage + 1);
        }
      });
    }

    assignPageNumbers();
    showPage(1);

    if (productSearch && productsGrid) {
      productSearch.addEventListener('input', function () {
        var q = this.value.trim().toLowerCase();
        var cards = productsGrid.querySelectorAll('.product-card');
        var visibleCount = 0;
        cards.forEach(function (card) {
          var name = (card.getAttribute('data-product-name') || (card.querySelector('h3') && card.querySelector('h3').textContent) || '').toLowerCase();
          var match = !q || name.indexOf(q) !== -1;
          card.classList.toggle('is-hidden', !match);
          if (match) visibleCount++;
        });
        if (productsNoResults) {
          productsNoResults.hidden = visibleCount > 0 || !q;
        }
        currentPage = 1;
        showPage(1);
      });
    }
  }

  // ——— Contact form: pre-fill message from enquiry param ———
  var contactForm = document.getElementById('contactForm');
  var messageField = document.getElementById('message');
  if (messageField && window.location.search) {
    var params = new URLSearchParams(window.location.search);
    var enquiry = params.get('enquiry');
    if (enquiry) {
      messageField.value = 'Enquiry about: ' + decodeURIComponent(enquiry.replace(/\+/g, ' ')) + '\n\n';
    }
  }

  // ——— Contact form submit: sends via FormEasy (Web App URL above) to fruitworldcebu@outlook.com ———
  // Uses fetch with application/x-www-form-urlencoded so Google Apps Script e.parameter is populated.
  // If fetch fails (e.g. CORS), falls back to form POST in hidden iframe so submission still works.
  // Button: 'Sending…' → 'Message sent!' or 'Try again' → revert to 'Submit' after 3 seconds.
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var btn = contactForm.querySelector('button[type="submit"]');
      var originalText = btn ? btn.textContent : 'Submit';
      if (btn) {
        btn.textContent = 'Sending…';
        btn.disabled = true;
      }
      var formData = new FormData(contactForm);
      var data = {};
      formData.forEach(function (value, key) {
        data[key] = value;
      });
      function showSuccess() {
        if (btn) {
          btn.textContent = 'Message sent!';
          btn.disabled = false;
        }
        contactForm.reset();
        setTimeout(function () {
          if (btn) btn.textContent = originalText;
        }, 3000);
      }
      function showTryAgain() {
        if (btn) {
          btn.textContent = 'Try again';
          btn.disabled = false;
          setTimeout(function () {
            if (btn) btn.textContent = originalText;
          }, 3000);
        }
      }
      function submitViaIframe() {
        var iframe = document.createElement('iframe');
        iframe.name = 'formEasyIframe';
        iframe.style.display = 'none';
        document.body.appendChild(iframe);
        var form = document.createElement('form');
        form.method = 'POST';
        form.action = CONTACT_FORM_ENDPOINT;
        form.target = 'formEasyIframe';
        form.style.display = 'none';
        formData.forEach(function (value, key) {
          var input = document.createElement('input');
          input.name = key;
          input.value = value;
          form.appendChild(input);
        });
        document.body.appendChild(form);
        form.submit();
        setTimeout(function () {
          document.body.removeChild(form);
          document.body.removeChild(iframe);
        }, 1000);
        showSuccess();
      }
      fetch(CONTACT_FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
        .then(async function (response) {
          const text = await response.text();
          console.log("Status:", response.status, "Body:", text);

          if (response.ok) {
            showSuccess();
          } else {
            showTryAgain();
          }
        })
        .catch(function () {
          console.error("Fetch failed:", err);
          // submitViaIframe();
        });
    });
  }
})();
