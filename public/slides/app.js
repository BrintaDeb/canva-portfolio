/**
 * BRINTA DEB PORTFOLIO — APPLICATION SCRIPT
 * Complete interactive controls, slide presentation engine, workable widgets, and modals.
 */

document.addEventListener('DOMContentLoaded', () => {
  // --- DOM Elements ---
  const body = document.body;
  const slides = Array.from(document.querySelectorAll('.portfolio-slide'));
  const currentSlideNum = document.getElementById('currentSlideNum');
  const totalSlidesNum = document.getElementById('totalSlidesNum');
  const prevSlideBtn = document.getElementById('prevSlideBtn');
  const nextSlideBtn = document.getElementById('nextSlideBtn');
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const viewModeToggleBtn = document.getElementById('viewModeToggleBtn');
  const fullscreenBtn = document.getElementById('fullscreenBtn');
  const thumbsMenuBtn = document.getElementById('thumbsMenuBtn');
  const slideIndicator = document.getElementById('slideIndicator');
  const thumbnailsModal = document.getElementById('thumbnailsModal');
  const thumbnailsGrid = document.getElementById('thumbnailsGrid');
  const imageLightbox = document.getElementById('imageLightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const toastNotification = document.getElementById('toastNotification');
  const toastMessage = document.getElementById('toastMessage');
  const dayNightSwitch = document.getElementById('interactiveDayNightToggle');

  let currentSlideIndex = 1;
  const totalSlides = slides.length;
  totalSlidesNum.textContent = String(totalSlides).padStart(2, '0');

  // Slide Metadata for Overview
  const slideMetadata = [
    { title: "Portfolio Cover", desc: "Brinta Deb Cover & Title" },
    { title: "A Little About Me", desc: "Bio & Background" },
    { title: "Work Experience", desc: "Agency & Freelance Work" },
    { title: "Skills & Expertise", desc: "Design, Video & Web" },
    { title: "My Projects", desc: "Anti-Ragging & Holi" },
    { title: "Websites & Day/Night", desc: "Netflix & Webflow" },
    { title: "Created to Create", desc: "Artistic Statement" },
    { title: "Other Projects", desc: "Posters, Cards & Embeds" },
    { title: "Creative Designs", desc: "Branding & Bali Reel" },
    { title: "Social Media Motion", desc: "Food Posts & Reels" },
    { title: "Anime Sketching", desc: "Procreate Artworks" },
    { title: "Tech Skills", desc: "Software & Design Tools" },
    { title: "Work With Me", desc: "Contact & Inquiries" }
  ];

  // --- 1. Toast Notification Helper ---
  let toastTimeout = null;
  function showToast(msg) {
    if (toastTimeout) clearTimeout(toastTimeout);
    toastMessage.textContent = msg;
    toastNotification.classList.remove('hidden');
    toastTimeout = setTimeout(() => {
      toastNotification.classList.add('hidden');
    }, 2500);
  }

  // --- 2. Slide Navigation Engine ---
  function goToSlide(index) {
    if (index < 1) index = 1;
    if (index > totalSlides) index = totalSlides;

    currentSlideIndex = index;
    currentSlideNum.textContent = String(currentSlideIndex).padStart(2, '0');

    const targetSlide = slides[currentSlideIndex - 1];
    if (targetSlide) {
      // Highlight active slide
      slides.forEach(s => s.classList.remove('active-slide'));
      targetSlide.classList.add('active-slide');

      // Scroll into view
      targetSlide.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Update URL hash without breaking history
      history.replaceState(null, '', `#slide-${String(currentSlideIndex).padStart(2, '0')}`);
    }
  }

  function nextSlide() {
    if (currentSlideIndex < totalSlides) {
      goToSlide(currentSlideIndex + 1);
    }
  }

  function prevSlide() {
    if (currentSlideIndex > 1) {
      goToSlide(currentSlideIndex - 1);
    }
  }

  prevSlideBtn.addEventListener('click', prevSlide);
  nextSlideBtn.addEventListener('click', nextSlide);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    // Ignore keyboard events if user is typing in form inputs
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(document.activeElement.tagName)) {
      return;
    }

    if (e.key === 'ArrowDown' || e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') {
      e.preventDefault();
      nextSlide();
    } else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft' || e.key === 'PageUp') {
      e.preventDefault();
      prevSlide();
    } else if (e.key === 'Home') {
      e.preventDefault();
      goToSlide(1);
    } else if (e.key === 'End') {
      e.preventDefault();
      goToSlide(totalSlides);
    } else if (e.key === 'Escape') {
      closeAllModals();
      closeLightbox();
    }
  });

  // IntersectionObserver to sync slide number as user scrolls freely
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.55
  };

  const slideObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.getAttribute('data-slide-index'), 10);
        if (idx && idx !== currentSlideIndex) {
          currentSlideIndex = idx;
          currentSlideNum.textContent = String(currentSlideIndex).padStart(2, '0');
          slides.forEach(s => s.classList.remove('active-slide'));
          entry.target.classList.add('active-slide');
        }
      }
    });
  }, observerOptions);

  slides.forEach(slide => slideObserver.observe(slide));

  const presHomeBtn = document.querySelector('.js-presentation-home');
  if (presHomeBtn) {
    presHomeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      goToSlide(1);
    });
  }

  // --- 3. Workable Day & Night Switch (Slide 6) ---
  if (dayNightSwitch) {
    dayNightSwitch.addEventListener('click', () => {
      const isNight = dayNightSwitch.classList.toggle('state-night');
      if (isNight) {
        setTheme('dark');
        showToast("🌙 Switched to Night Mode!");
      } else {
        setTheme('light');
        showToast("☀️ Switched to Day Mode!");
      }
    });
  }

  // --- 4. Theme Toggle (Header & Synced) ---
  function setTheme(theme) {
    if (theme === 'dark') {
      body.classList.remove('theme-light');
      body.classList.add('theme-dark');
      themeToggleBtn.querySelector('.theme-icon').textContent = '☀️';
      themeToggleBtn.querySelector('.btn-text').textContent = 'Light Mode';
      if (dayNightSwitch) dayNightSwitch.classList.add('state-night');
      localStorage.setItem('portfolio-theme', 'dark');
    } else {
      body.classList.remove('theme-dark');
      body.classList.add('theme-light');
      themeToggleBtn.querySelector('.theme-icon').textContent = '🌙';
      themeToggleBtn.querySelector('.btn-text').textContent = 'Dark Mode';
      if (dayNightSwitch) dayNightSwitch.classList.remove('state-night');
      localStorage.setItem('portfolio-theme', 'light');
    }
  }

  themeToggleBtn.addEventListener('click', () => {
    const isDark = body.classList.contains('theme-dark');
    setTheme(isDark ? 'light' : 'dark');
  });

  // Restore saved theme
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme) {
    setTheme(savedTheme);
  }

  // --- 5. View Mode Toggle (Slide Deck vs Continuous Scroll) ---
  viewModeToggleBtn.addEventListener('click', () => {
    const isPresentation = body.classList.contains('mode-presentation');
    if (isPresentation) {
      body.classList.remove('mode-presentation');
      body.classList.add('mode-scroll');
      viewModeToggleBtn.querySelector('.view-icon').textContent = '📑';
      viewModeToggleBtn.querySelector('.btn-text').textContent = 'Presentation Mode';
      showToast("Switched to Continuous Scroll Mode");
    } else {
      body.classList.remove('mode-scroll');
      body.classList.add('mode-presentation');
      viewModeToggleBtn.querySelector('.view-icon').textContent = '🖥️';
      viewModeToggleBtn.querySelector('.btn-text').textContent = 'Scroll Mode';
      showToast("Switched to Presentation Deck Mode");
      goToSlide(currentSlideIndex);
    }
  });

  // --- 6. Fullscreen API ---
  fullscreenBtn.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.warn(`Error attempting to enable fullscreen: ${err.message}`);
      });
      fullscreenBtn.textContent = '⤦';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
        fullscreenBtn.textContent = '⛶';
      }
    }
  });

  // --- 7. Slide Overview Thumbnails Grid ---
  function populateThumbnails() {
    thumbnailsGrid.innerHTML = '';
    slides.forEach((slide, i) => {
      const card = document.createElement('div');
      card.className = `thumbnail-card ${i + 1 === currentSlideIndex ? 'active' : ''}`;
      const meta = slideMetadata[i] || { title: `Slide ${i + 1}`, desc: "" };

      card.innerHTML = `
        <div class="thumbnail-preview-frame">
          <span>Slide ${String(i + 1).padStart(2, '0')}</span>
        </div>
        <div class="thumbnail-title">${meta.title}</div>
      `;

      card.addEventListener('click', () => {
        goToSlide(i + 1);
        closeAllModals();
      });

      thumbnailsGrid.appendChild(card);
    });
  }

  function openThumbnailsModal() {
    populateThumbnails();
    thumbnailsModal.classList.remove('hidden');
  }

  thumbsMenuBtn.addEventListener('click', openThumbnailsModal);
  slideIndicator.addEventListener('click', openThumbnailsModal);

  // --- 8. Modals Management ---
  function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('hidden');
    }
  }

  function closeAllModals() {
    document.querySelectorAll('.modal-backdrop').forEach(m => m.classList.add('hidden'));
  }

  // Clickable projects open their modal
  document.querySelectorAll('[data-modal]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const modalId = el.getAttribute('data-modal');
      openModal(modalId);
    });
  });

  // Close buttons
  document.querySelectorAll('[data-close]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const modalId = btn.getAttribute('data-close');
      const target = document.getElementById(modalId);
      if (target) target.classList.add('hidden');
    });
  });

  // Close modal when clicking outside dialog
  document.querySelectorAll('.modal-backdrop').forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        modal.classList.add('hidden');
      }
    });
  });

  // --- 9. Lightbox for Images and Artworks ---
  function openLightbox(imgSrc) {
    lightboxImg.src = imgSrc;
    imageLightbox.classList.remove('hidden');
  }

  function closeLightbox() {
    imageLightbox.classList.add('hidden');
    lightboxImg.src = '';
  }

  document.querySelectorAll('[data-lightbox]').forEach(el => {
    el.addEventListener('click', (e) => {
      e.stopPropagation();
      const src = el.getAttribute('data-lightbox');
      if (src) openLightbox(src);
    });
  });

  lightboxCloseBtn.addEventListener('click', closeLightbox);
  imageLightbox.addEventListener('click', (e) => {
    if (e.target === imageLightbox) closeLightbox();
  });

  // --- 10. Interactive Instagram Carousel Slider ---
  const carouselTrack = document.getElementById('instaCarouselTrack');
  const carouselDots = document.querySelectorAll('#carouselDots .dot');
  const carouselPrevBtn = document.getElementById('carouselPrevBtn');
  const carouselNextBtn = document.getElementById('carouselNextBtn');
  let currentCarouselSlide = 0;
  const totalCarouselSlides = 4;

  function updateCarousel(index) {
    if (index < 0) index = 0;
    if (index >= totalCarouselSlides) index = totalCarouselSlides - 1;
    currentCarouselSlide = index;

    if (carouselTrack) {
      carouselTrack.style.transform = `translateX(-${currentCarouselSlide * 100}%)`;
    }

    carouselDots.forEach((dot, idx) => {
      dot.classList.toggle('active', idx === currentCarouselSlide);
    });
  }

  if (carouselPrevBtn) {
    carouselPrevBtn.addEventListener('click', () => updateCarousel(currentCarouselSlide - 1));
  }
  if (carouselNextBtn) {
    carouselNextBtn.addEventListener('click', () => updateCarousel(currentCarouselSlide + 1));
  }
  carouselDots.forEach((dot, idx) => {
    dot.addEventListener('click', () => updateCarousel(idx));
  });

  // --- 11. Video Reels Interactive Play & Audio ---
  document.querySelectorAll('.video-card-wrapper').forEach(wrapper => {
    const video = wrapper.querySelector('video');
    const soundBtn = wrapper.querySelector('.sound-toggle-btn');
    const badge = wrapper.querySelector('.video-play-badge');

    if (video) {
      wrapper.addEventListener('click', (e) => {
        if (e.target === soundBtn) return;
        if (video.paused) {
          video.play().catch(() => {});
          if (badge) badge.textContent = '⏸ Pause';
        } else {
          video.pause();
          if (badge) badge.textContent = '▶ Play';
        }
      });

      if (soundBtn) {
        soundBtn.addEventListener('click', (e) => {
          e.stopPropagation();
          video.muted = !video.muted;
          soundBtn.textContent = video.muted ? '🔇' : '🔊';
          showToast(video.muted ? "Video Audio Muted" : "Video Audio Unmuted");
        });
      }
    }
  });

  // --- 12. Direct Contact Form Modal & Clipboard Actions ---
  const openContactModalBtn = document.getElementById('openContactModalBtn');
  if (openContactModalBtn) {
    openContactModalBtn.addEventListener('click', () => openModal('modalContact'));
  }

  // Copy buttons
  document.querySelectorAll('.copy-small-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const textToCopy = btn.getAttribute('data-copy');
      if (textToCopy) {
        navigator.clipboard.writeText(textToCopy).then(() => {
          showToast(`Copied "${textToCopy}" to clipboard!`);
        }).catch(() => {
          showToast(`Copied!`);
        });
      }
    });
  });

  // Contact Form Submission
  const contactForm = document.getElementById('contactInquiryForm');
  const copyMessageBtn = document.getElementById('copyMessageBtn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('senderName').value.trim();
      const email = document.getElementById('senderEmail').value.trim();
      const service = document.getElementById('projectType').value;
      const message = document.getElementById('senderMessage').value.trim();

      const mailSubject = encodeURIComponent(`Project Inquiry: ${service} from ${name}`);
      const mailBody = encodeURIComponent(`Hi Brinta,\n\nName: ${name}\nEmail: ${email}\nService: ${service}\n\nMessage:\n${message}\n\nBest regards,\n${name}`);

      window.location.href = `mailto:brintadeb15@gmail.com?subject=${mailSubject}&body=${mailBody}`;
      showToast("Drafting email in your mail client...");
      setTimeout(() => closeAllModals(), 1200);
    });
  }

  if (copyMessageBtn) {
    copyMessageBtn.addEventListener('click', () => {
      const name = document.getElementById('senderName').value.trim() || 'Client';
      const email = document.getElementById('senderEmail').value.trim() || 'email';
      const service = document.getElementById('projectType').value;
      const message = document.getElementById('senderMessage').value.trim();

      if (!message) {
        showToast("Please write a message first!");
        return;
      }

      const formatted = `Name: ${name}\nEmail: ${email}\nService: ${service}\nMessage: ${message}`;
      navigator.clipboard.writeText(formatted).then(() => {
        showToast("Message copied to clipboard!");
      });
    });
  }

  // Live play simulation trigger for Believer 2
  document.querySelectorAll('.live-demo-trigger').forEach(btn => {
    btn.addEventListener('click', () => {
      showToast("🎬 Launching Believer 2 Movie Player...");
      setTimeout(() => {
        window.open('https://www.netflix.com', '_blank');
      }, 1000);
    });
  });

  // --- 13. WhatsApp Floating Chatbot Engine ---
  const waToggleBtn = document.getElementById('waToggleBtnPresentation');
  const waChatWindow = document.getElementById('waChatWindowPresentation');
  const waGreetingBubble = document.getElementById('waGreetingBubblePresentation');
  const waGreetingClose = document.getElementById('waGreetingClosePresentation');
  const waHeaderClose = document.getElementById('waHeaderClosePresentation');
  const waChatForm = document.getElementById('waChatFormPresentation');
  const waInputMessage = document.getElementById('waInputMessagePresentation');
  const waPrompts = document.querySelectorAll('.js-wa-presentation-prompt');
  const waBubbleTime = document.getElementById('waBubbleTimePresentation');
  const waPhoneNumber = '917005581453';

  if (waBubbleTime) {
    const now = new Date();
    waBubbleTime.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  function openWaChat() {
    if (waChatWindow) {
      waChatWindow.classList.add('is-active');
      waChatWindow.setAttribute('aria-hidden', 'false');
    }
    if (waToggleBtn) waToggleBtn.classList.add('is-active');
    if (waGreetingBubble) {
      waGreetingBubble.classList.remove('is-visible');
      waGreetingBubble.classList.add('is-dismissed');
    }
    const badge = document.querySelector('#waChatbotPresentation .wa-unread-badge');
    if (badge) badge.style.display = 'none';

    setTimeout(() => {
      if (waInputMessage) waInputMessage.focus();
    }, 250);
  }

  function closeWaChat() {
    if (waChatWindow) {
      waChatWindow.classList.remove('is-active');
      waChatWindow.setAttribute('aria-hidden', 'true');
    }
    if (waToggleBtn) waToggleBtn.classList.remove('is-active');
  }

  function sendWhatsAppDirect(msg) {
    const text = encodeURIComponent(msg || "Hi Brinta! I'd like to get in touch regarding a design and development project.");
    const url = `https://wa.me/${waPhoneNumber}?text=${text}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    if (waInputMessage) waInputMessage.value = '';
    closeWaChat();
    showToast("Opening WhatsApp Chat...");
  }

  if (waToggleBtn) {
    waToggleBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      if (waChatWindow && waChatWindow.classList.contains('is-active')) {
        closeWaChat();
      } else {
        openWaChat();
      }
    });
  }

  if (waHeaderClose) {
    waHeaderClose.addEventListener('click', (e) => {
      e.stopPropagation();
      closeWaChat();
    });
  }

  if (waGreetingClose) {
    waGreetingClose.addEventListener('click', (e) => {
      e.stopPropagation();
      if (waGreetingBubble) waGreetingBubble.classList.add('is-dismissed');
    });
  }

  waPrompts.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const txt = btn.getAttribute('data-text') || '';
      sendWhatsAppDirect(txt);
    });
  });

  if (waChatForm) {
    waChatForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const msg = waInputMessage ? waInputMessage.value.trim() : '';
      sendWhatsAppDirect(msg);
    });
  }

  // Show greeting bubble after delay
  setTimeout(() => {
    if (waGreetingBubble && (!waChatWindow || !waChatWindow.classList.contains('is-active'))) {
      waGreetingBubble.classList.add('is-visible');
    }
  }, 3500);

  // Initial check for hash in URL (e.g., #slide-03)
  const hash = window.location.hash;
  if (hash && hash.startsWith('#slide-')) {
    const initialSlide = parseInt(hash.replace('#slide-', ''), 10);
    if (initialSlide >= 1 && initialSlide <= totalSlides) {
      setTimeout(() => goToSlide(initialSlide), 300);
    }
  }
});
