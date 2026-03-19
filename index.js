/* -----------------------------------------
  Have focus outline only for keyboard users 
 ---------------------------------------- */

const handleFirstTab = (e) => {
  if (e.key === 'Tab') {
    document.body.classList.add('user-is-tabbing');
    window.removeEventListener('keydown', handleFirstTab);
    window.addEventListener('mousedown', handleMouseDownOnce);
  }
};

const handleMouseDownOnce = () => {
  document.body.classList.remove('user-is-tabbing');
  window.removeEventListener('mousedown', handleMouseDownOnce);
  window.addEventListener('keydown', handleFirstTab);
};

window.addEventListener('keydown', handleFirstTab);

/* -----------------------------------------
  Back To Top Button
 ---------------------------------------- */

const backToTopButton = document.querySelector('.back-to-top');
let isBackToTopRendered = false;

const alterStyles = (visible) => {
  if (!backToTopButton) return;
  backToTopButton.style.visibility = visible ? 'visible' : 'hidden';
  backToTopButton.style.opacity   = visible ? 1 : 0;
  backToTopButton.style.transform = visible ? 'scale(1)' : 'scale(0)';
};

window.addEventListener('scroll', () => {
  const shouldShow = window.scrollY > 700;
  if (shouldShow !== isBackToTopRendered) {
    isBackToTopRendered = shouldShow;
    alterStyles(isBackToTopRendered);
  }
});

/* -----------------------------------------
  Project Image Carousels
  كيف تستخدمها:
  - ضع مسارات الصور في data-images كـ JSON array
  - مثال: data-images='["./images/img1.png","./images/img2.png","./images/img3.png"]'
  - السهام تظهر تلقائياً إذا كان في أكثر من صورة
 ---------------------------------------- */

function initCarousels() {
  document.querySelectorAll('.project-carousel').forEach(carousel => {
    const track    = carousel.querySelector('.project-carousel__track');
    const dotsWrap = carousel.querySelector('.project-carousel__dots');
    const btnPrev  = carousel.querySelector('.project-carousel__btn--prev');
    const btnNext  = carousel.querySelector('.project-carousel__btn--next');

    if (!track) return;

    // Parse image list from data-images attribute
    const imagesAttr = carousel.getAttribute('data-images') || '[]';
    const interval   = parseInt(carousel.getAttribute('data-interval') || '3000', 10);
    let images = [];

    try { images = JSON.parse(imagesAttr); } catch (e) { images = []; }

    // Build extra slides (first slide already exists in HTML)
    if (images.length > 1) {
      images.forEach((src, i) => {
        if (i === 0) return; // first slide already in HTML
        const img     = document.createElement('img');
        img.src       = src;
        img.alt       = `Project image ${i + 1}`;
        img.className = 'project-carousel__slide';
        track.appendChild(img);
      });
    }

    const slides = Array.from(track.querySelectorAll('.project-carousel__slide'));
    let current  = 0;
    let timer    = null;

    // Hide nav buttons if only one image
    if (slides.length <= 1) {
      if (btnPrev) btnPrev.style.display = 'none';
      if (btnNext) btnNext.style.display = 'none';
      return; // nothing more to set up for single-image carousels
    }

    // Build dots
    slides.forEach((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'project-carousel__dot' + (i === 0 ? ' is-active' : '');
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => { stopTimer(); goTo(i); startTimer(); });
      dotsWrap.appendChild(dot);
    });

    function goTo(index) {
      slides[current].classList.remove('is-active');
      const dots = dotsWrap.querySelectorAll('.project-carousel__dot');
      if (dots[current]) dots[current].classList.remove('is-active');

      current = ((index % slides.length) + slides.length) % slides.length;

      slides[current].classList.add('is-active');
      if (dots[current]) dots[current].classList.add('is-active');
    }

    function startTimer() {
      stopTimer();
      timer = setInterval(() => goTo(current + 1), interval);
    }

    function stopTimer() {
      if (timer) { clearInterval(timer); timer = null; }
    }

    if (btnNext) {
      btnNext.addEventListener('click', () => { stopTimer(); goTo(current + 1); startTimer(); });
    }
    if (btnPrev) {
      btnPrev.addEventListener('click', () => { stopTimer(); goTo(current - 1); startTimer(); });
    }

    // Pause auto-play on hover
    carousel.addEventListener('mouseenter', stopTimer);
    carousel.addEventListener('mouseleave', startTimer);

    // Touch / swipe support for mobile
    let touchStartX = 0;
    carousel.addEventListener('touchstart', (e) => {
      touchStartX = e.changedTouches[0].clientX;
      stopTimer();
    }, { passive: true });

    carousel.addEventListener('touchend', (e) => {
      const deltaX = e.changedTouches[0].clientX - touchStartX;
      if (Math.abs(deltaX) > 40) {
        goTo(deltaX < 0 ? current + 1 : current - 1);
      }
      startTimer();
    }, { passive: true });

    // Keyboard arrow support
    carousel.setAttribute('tabindex', '0');
    carousel.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { stopTimer(); goTo(current + 1); startTimer(); }
      if (e.key === 'ArrowLeft')  { stopTimer(); goTo(current - 1); startTimer(); }
    });

    startTimer();
  });
}

document.addEventListener('DOMContentLoaded', initCarousels);

/* -----------------------------------------
  Simple Smooth Scrolling Fix
 ---------------------------------------- */

document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function (e) {
    e.preventDefault();

    const targetId = this.getAttribute('href');
    if (targetId === '#') return;

    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const offset = 80;
      const targetPosition = targetElement.offsetTop - offset;
      window.scrollTo({ top: targetPosition, behavior: 'smooth' });
    }
  });
});
