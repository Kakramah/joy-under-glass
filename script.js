(() => {
  'use strict';
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const progress = document.querySelector('.reading-progress span');
  let ticking = false;
  let updateStoryMotion = () => {};
  function updateProgress() {
    const max = document.documentElement.scrollHeight - innerHeight;
    progress.style.transform = `scaleX(${max > 0 ? Math.min(1, Math.max(0, scrollY / max)) : 0})`;
    updateStoryMotion();
    ticking = false;
  }
  addEventListener('scroll', () => {
    if (!ticking) { requestAnimationFrame(updateProgress); ticking = true; }
  }, { passive: true });
  addEventListener('resize', updateProgress);
  addEventListener('load', updateProgress);
  document.fonts.ready.then(updateProgress);
  updateProgress();
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          if (!reducedMotion.matches) entry.target.classList.add('is-revealing');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(element => {
      if (!element.matches('.reading-art, .well-art, .light-art, .rueya-study, .boundary-columns > .prose')) observer.observe(element);
    });
  }
  const rueyaStudy = document.querySelector('.rueya-study');
  const phaseControls = Array.from(document.querySelectorAll('[data-phase][type="button"]'));
  const phaseStates = window.RUEYA_STATES;
  if (rueyaStudy && phaseStates) {
    document.querySelector('.rueya-controls').hidden = false;
    function setPhase(phase) {
      const state = phaseStates[phase];
      rueyaStudy.dataset.phase = phase;
      phaseControls.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.phase === phase)));
      document.querySelector('#rueya-state-title').textContent = state.title;
      document.querySelector('#rueya-state-verse').textContent = state.text;
      const source = document.querySelector('#rueya-state-source');
      source.href = state.source;
      source.firstChild.textContent = state.reference + ' ';
      const a = phase === 'plot' ? 125 : phase === 'fulfilled' ? 224 : 286;
      const b = phase === 'plot' ? 43 : phase === 'fulfilled' ? 224 : 137;
      const centerY = phase === 'plot' ? 402 : 323;
      const tilt = -Math.PI / 12;
      document.querySelectorAll('[data-planet]').forEach((planet, i) => {
        const theta = i * Math.PI * 2 / 11;
        const x = 360 + a * Math.cos(theta) * Math.cos(tilt) - b * Math.sin(theta) * Math.sin(tilt);
        const y = centerY + a * Math.cos(theta) * Math.sin(tilt) + b * Math.sin(theta) * Math.cos(tilt);
        planet.style.transform = `translate(${x.toFixed(2)}px, ${y.toFixed(2)}px)`;
      });
    }
    phaseControls.forEach((button, index) => {
      button.addEventListener('click', () => setPhase(button.dataset.phase));
      button.addEventListener('keydown', event => {
        if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
        event.preventDefault();
        const next = (index + (event.key === 'ArrowLeft' ? 1 : -1) + phaseControls.length) % phaseControls.length;
        phaseControls[next].focus();
        setPhase(phaseControls[next].dataset.phase);
      });
    });
  }
  const root = document.documentElement;
  const desktopMotion = matchMedia('(min-width: 768px)');
  const heroSection = document.querySelector('.hero');
  const heroArt = document.querySelector('.hero-art');
  const gazeSection = document.querySelector('#gaze');
  const wellSection = document.querySelector('#well');
  const wellArt = document.querySelector('.well-art');
  const lightSection = document.querySelector('#light');
  const gazeVerse = document.querySelector('#gaze blockquote');
  let readingTone = '';
  const clamp = value => Math.max(0, Math.min(1, value));
  function measureVerse() {
    const lineHeight = parseFloat(getComputedStyle(gazeVerse).lineHeight);
    const lines = Math.max(1, Math.round(gazeVerse.getBoundingClientRect().height / lineHeight));
    gazeVerse.style.setProperty('--verse-lines', lines);
    gazeVerse.style.setProperty('--verse-duration', `${Math.min(1.6, lines * .28)}s`);
  }
  updateStoryMotion = () => {
    const heroRect = heroSection.getBoundingClientRect();
    const gazeRect = gazeSection.getBoundingClientRect();
    const wellRect = wellSection.getBoundingClientRect();
    const wellPhotoRect = wellArt.getBoundingClientRect();
    const lightRect = lightSection.getBoundingClientRect();
    const readingLine = innerHeight * .42;
    const tone = lightRect.top <= readingLine ? 'warm' : gazeRect.top <= readingLine ? 'caution' : 'neutral';
    if (tone !== readingTone) {
      root.style.setProperty('--paper', `var(--paper-${tone})`);
      root.dataset.readingTone = tone;
      readingTone = tone;
    }
    if (reducedMotion.matches) {
      heroArt.style.setProperty('--floor-shift', '0px');
      wellArt.style.setProperty('--well-radius', '115%');
      lightSection.style.setProperty('--door-brightness', '1.08');
      return;
    }
    const heroRead = clamp(-heroRect.top / Math.max(1, heroRect.height));
    heroArt.style.setProperty('--floor-shift', desktopMotion.matches ? `${(heroRead * 84).toFixed(1)}px` : '0px');
    const wellTop = desktopMotion.matches ? wellRect.top : wellPhotoRect.top;
    const wellRead = clamp((innerHeight * .85 - wellTop) / (innerHeight * .65));
    wellArt.style.setProperty('--well-radius', `${(22 + wellRead * 93).toFixed(2)}%`);
    const lightRead = clamp((innerHeight * .85 - lightRect.top) / (innerHeight * .65));
    lightSection.style.setProperty('--door-brightness', (1 + lightRead * .08).toFixed(3));
  };
  document.fonts.ready.then(() => {
    measureVerse();
    document.querySelectorAll('[data-planet]').forEach((planet, index) => {
      planet.style.setProperty('--planet-delay', `${(index * .105).toFixed(3)}s`);
    });
    document.querySelectorAll('.boundary-columns > .prose').forEach((column, index) => {
      column.style.setProperty('--boundary-delay', index ? '.32s' : '0s');
    });
    if ('IntersectionObserver' in window) {
      const readingEntries = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          const element = entry.target;
          if (!reducedMotion.matches) {
            if (element === rueyaStudy) element.classList.add('planets-entered');
            else if (element === gazeVerse) element.classList.add('verse-entered');
            else if (element === heroArt) element.classList.add('floor-entered');
            else if (element.matches('.boundary-columns > .prose')) element.classList.add('boundary-entered');
            else if (element.matches('.afterword')) element.classList.add('share-entered');
            else if (element.matches('.social-links')) element.classList.add('contacts-entered');
          }
          readingEntries.unobserve(element);
        });
      }, { threshold: .12 });
      [heroArt, rueyaStudy, gazeVerse, ...document.querySelectorAll('.boundary-columns > .prose'),
        document.querySelector('.afterword'), document.querySelector('.social-links')]
        .forEach(element => readingEntries.observe(element));
    }
    updateProgress();
  });
  addEventListener('resize', measureVerse);
  reducedMotion.addEventListener('change', updateProgress);
  desktopMotion.addEventListener('change', updateProgress);
  const imageDialog = document.querySelector('#image-dialog');
  const imageLinks = Array.from(document.querySelectorAll('[data-view]'));
  let currentImage = 0;
  let imageTrigger = null;
  let shareTrigger = null;
  function showImage(index) {
    currentImage = (index + imageLinks.length) % imageLinks.length;
    const link = imageLinks[currentImage];
    const img = link.querySelector('img');
    const enlarged = document.querySelector('#enlarged-image');
    enlarged.src = link.href;
    imageDialog.style.setProperty("--avatar-alpha", link.dataset.avatarAlpha);
    enlarged.alt = img.alt;
    document.querySelector('#image-title').textContent = link.dataset.title;
    document.querySelector('#image-description').textContent = link.dataset.desc;
  }
  function openDialog(dialog) {
    dialog.showModal();
    document.body.classList.add('has-dialog');
  }
  if (typeof imageDialog.showModal === 'function') {
    imageLinks.forEach((link, index) => link.addEventListener('click', event => {
      event.preventDefault(); imageTrigger = link; showImage(index); openDialog(imageDialog);
    }));
    document.querySelector('#previous-image').addEventListener('click', () => showImage(currentImage - 1));
    document.querySelector('#next-image').addEventListener('click', () => showImage(currentImage + 1));
    imageDialog.addEventListener('keydown', event => {
      if (event.key === 'ArrowLeft') { event.preventDefault(); showImage(currentImage + 1); }
      if (event.key === 'ArrowRight') { event.preventDefault(); showImage(currentImage - 1); }
    });
  }
  const shareDialog = document.querySelector('#share-dialog');
  [imageDialog, shareDialog].forEach(dialog => {
    dialog.querySelector('.dialog-close').addEventListener('click', () => dialog.close());
    dialog.addEventListener('click', event => { if (event.target === dialog) {
      const rect = dialog.getBoundingClientRect();
      if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) dialog.close();
    }});
    dialog.addEventListener('close', () => {
      document.body.classList.remove('has-dialog');
      (dialog === imageDialog ? imageTrigger : shareTrigger)?.focus({ preventScroll: true });
    });
  });
  const shareButton = document.querySelector('#share-button');
  const shareInput = document.querySelector('#share-url');
  const shareStatus = document.querySelector('.share-status');
  const localPreview = ['localhost', '127.0.0.1', ''].includes(location.hostname);
  const shareUrl = location.href.split('#')[0];
  const shareTitle = 'حين يُراقَب الضوء';
  const shareText = 'من وصية يعقوب إلى عفو يوسف: تأمل في الفرح والحسد وصيانة النعمة.';
  shareInput.value = shareUrl;
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedText = encodeURIComponent(`${shareTitle}\n${shareText}\n${shareUrl}`);
  const shareHrefs = {
    whatsapp: `https://wa.me/?text=${encodedText}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(shareTitle)}`,
    x: `https://x.com/intent/post?text=${encodedText}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`
  };
  document.querySelectorAll('[data-share]').forEach(link => { link.href = shareHrefs[link.dataset.share]; });
  if (typeof shareDialog.showModal === 'function') {
    shareButton.hidden = false;
    shareButton.addEventListener('click', async () => {
      shareTrigger = shareButton;
      if (navigator.share && !localPreview) {
        try { await navigator.share({ title: shareTitle, text: shareText, url: shareUrl }); return; }
        catch (error) { if (error.name === 'AbortError') return; }
      }
      shareStatus.textContent = localPreview ? 'هذا رابط معاينة على هذا الجهاز. تتاح مشاركته للآخرين بعد نشر الموقع.' : '';
      openDialog(shareDialog);
    });
  }
  document.querySelector('#copy-link').addEventListener('click', async () => {
    try {
      if (!navigator.clipboard) throw new Error('clipboard-unavailable');
      await navigator.clipboard.writeText(shareInput.value);
      shareStatus.textContent = localPreview ? 'نُسخ رابط المعاينة على هذا الجهاز.' : 'نُسخ الرابط. أرسله لمن تحب.';
    } catch {
      shareInput.focus(); shareInput.select();
      shareStatus.textContent = 'حُدّد الرابط. انسخه من القائمة أو باستخدام لوحة المفاتيح.';
    }
  });
})();
