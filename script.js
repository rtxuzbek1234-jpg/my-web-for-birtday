/**
 * ==================================================
 * INTERACTIVE BIRTHDAY SURPRISE WEBSITE FOR MOTHER
 * Pure Vanilla JavaScript (ES6+)
 * High-performance, Accessible, Zero Dependencies
 * ==================================================
 */

/* ==================================================
   1. DOM SELECTORS
   ================================================== */
const DOM = {
  // Canvases & Header
  canvas: document.getElementById('particles-canvas'),
  cursorCanvas: document.getElementById('cursor-trail-canvas'),
  header: document.getElementById('app-header'),
  headerBirthdayBanner: document.getElementById('header-birthday-banner'),
  headerBirthdayBadge: document.getElementById('header-birthday-badge'),
  stepIndicator: document.getElementById('step-indicator'),
  stepDots: document.querySelectorAll('.step-dot'),
  musicBtn: document.getElementById('music-toggle-btn'),
  musicIcon: document.getElementById('music-icon'),
  bgAudio: document.getElementById('bg-audio'),

  // Scenes
  scenePassword: document.getElementById('scene-password'),
  sceneGifts: document.getElementById('scene-gifts'),
  sceneMessage: document.getElementById('scene-message'),
  sceneCelebration: document.getElementById('scene-celebration'),

  // Scene 1: Password
  passwordCard: document.getElementById('password-card'),
  lockWrapper: document.getElementById('lock-wrapper'),
  lockShackle: document.getElementById('lock-shackle'),
  passwordForm: document.getElementById('password-form'),
  passwordInput: document.getElementById('password-input'),
  togglePasswordBtn: document.getElementById('toggle-password-btn'),
  eyeOpenIcon: document.getElementById('eye-open-icon'),
  eyeClosedIcon: document.getElementById('eye-closed-icon'),
  submitPasswordBtn: document.getElementById('submit-password-btn'),
  passwordFeedback: document.getElementById('password-feedback'),
  hintToggleBtn: document.getElementById('hint-toggle-btn'),
  hintBox: document.getElementById('hint-box'),
  hintText: document.getElementById('hint-text'),

  // Scene 2: Gifts
  giftsGrid: document.getElementById('gifts-grid'),
  giftCards: document.querySelectorAll('.gift-card'),
  gift1: document.getElementById('gift-1'),
  gift2: document.getElementById('gift-2'), // WINNING MIDDLE GIFT
  gift3: document.getElementById('gift-3'),
  wrongGiftModal: document.getElementById('wrong-gift-modal'),

  // Scene 3: Message
  messageCard: document.getElementById('message-card'),
  typedHeading: document.getElementById('typed-heading'),
  typedBody: document.getElementById('typed-body'),
  messageActions: document.getElementById('message-actions'),
  finalSurpriseBtn: document.getElementById('final-surprise-btn'),

  // Scene 4: Celebration
  cakeArea: document.getElementById('cake-area'),
  candleFlame: document.getElementById('candle-flame'),
  openGalleryBtn: document.getElementById('open-gallery-btn'),
  replayFireworksBtn: document.getElementById('replay-fireworks-btn'),
  restartJourneyBtn: document.getElementById('restart-journey-btn'),

  // Memory Gallery & Lightbox
  galleryModal: document.getElementById('memory-gallery-modal'),
  galleryBackdrop: document.getElementById('gallery-backdrop'),
  galleryDrawer: document.getElementById('gallery-drawer'),
  galleryLiveAnnouncer: document.getElementById('gallery-live-announcer'),
  galleryGrid: document.getElementById('gallery-grid'),
  closeGalleryBtn: document.getElementById('close-gallery-btn'),
  galleryCards: document.querySelectorAll('.gallery-card'),
  galleryLiveRegions: document.querySelectorAll('.gallery-item-live-region'),
  galleryLikeBtns: document.querySelectorAll('.gallery-like-btn'),
  galleryLightbox: document.getElementById('gallery-lightbox'),
  lightboxBackdrop: document.getElementById('lightbox-backdrop'),
  lightboxCloseBtn: document.getElementById('lightbox-close-btn'),
  lightboxImg: document.getElementById('lightbox-img'),
  lightboxTitle: document.getElementById('lightbox-title'),
  lightboxDesc: document.getElementById('lightbox-desc'),
  lightboxTag: document.getElementById('lightbox-tag'),
};

/* ==================================================
   2. STATE MANAGEMENT
   ================================================== */
const STATE = {
  currentScene: 1,
  targetPassword: '1986',
  passwordAttempts: 0,
  isPasswordUnlocked: false,
  openedWrongGifts: new Set(),
  giftFound: false,
  isTransitioning: false,
  isTypingMessage: false,
  isGalleryOpen: false,
  isLightboxOpen: false,
  activeGalleryCard: null,
  lastAnnouncedCardIndex: -1,
  musicEnabled: false,
  musicInitialized: false,
  prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,

  // Mother's Birthday detection configuration
  // Month: 1-12, Day: 1-31. Set to 8-Sentabr (September 8th)
  motherBirthday: {
    month: 9, // September
    day: 8,   // 8th
  },
  isTodayMotherBirthday: false,
};

/* ==================================================
   2.1. MOTHER'S BIRTHDAY DETECTION SCRIPT
   ================================================== */
const BirthdayDetector = (function () {
  /**
   * Determine target birthday date (month 1-12, day 1-31).
   * Supports:
   * 1. URL query parameters (e.g. ?bday=09-02 or ?bday=2026-09-02)
   * 2. localStorage ('mother_birthday')
   * 3. Configured default in STATE.motherBirthday
   */
  function resolveTargetBirthday() {
    // Check URL parameters for live testing or custom sharing
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const bdayParam = urlParams.get('bday') || urlParams.get('birthday');
      if (bdayParam) {
        const parts = bdayParam.split('-').map((p) => parseInt(p.trim(), 10));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
          const month = parts.length === 3 ? parts[1] : parts[0];
          const day = parts.length === 3 ? parts[2] : parts[1];
          if (month >= 1 && month <= 12 && day >= 1 && day <= 31) {
            return { month, day };
          }
        }
      }
    } catch (_) {}

    // Check localStorage
    try {
      const saved = localStorage.getItem('mother_birthday');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.month && parsed.day) {
          return { month: parseInt(parsed.month, 10), day: parseInt(parsed.day, 10) };
        }
      }
    } catch (_) {}

    return STATE.motherBirthday;
  }

  /**
   * Detect current date and evaluate if today matches mother's birthday
   */
  function evaluateBirthday() {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1 = January, ..., 9 = September
    const currentDay = today.getDate(); // Day of month (1-31)

    const target = resolveTargetBirthday();
    const isMatch = currentMonth === target.month && currentDay === target.day;
    STATE.isTodayMotherBirthday = isMatch;

    if (isMatch) {
      revealBirthdayHeaderGreeting();
    } else {
      hideBirthdayHeaderGreeting();
    }

    return isMatch;
  }

  /**
   * Displays the personalized 'Bugun sizning kuningiz!' message in the header
   */
  function revealBirthdayHeaderGreeting() {
    if (DOM.headerBirthdayBanner) {
      DOM.headerBirthdayBanner.classList.remove('hidden');
      DOM.headerBirthdayBanner.setAttribute('aria-hidden', 'false');
    }
    if (DOM.headerBirthdayBadge) {
      DOM.headerBirthdayBadge.classList.remove('hidden');
      DOM.headerBirthdayBadge.setAttribute('aria-hidden', 'false');
    }

    // Gentle particle celebration around the header badge after render
    setTimeout(() => {
      if (!STATE.prefersReducedMotion && DOM.headerBirthdayBadge) {
        const rect = DOM.headerBirthdayBadge.getBoundingClientRect();
        if (rect.width > 0) {
          ParticleEngine.createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);
          CursorHeartTrail.spawn(rect.left + rect.width / 2, rect.top + rect.height / 2, 3);
        }
      }
    }, 700);
  }

  /**
   * Hides the message if today is not the mother's birthday
   */
  function hideBirthdayHeaderGreeting() {
    if (DOM.headerBirthdayBanner) {
      DOM.headerBirthdayBanner.classList.add('hidden');
      DOM.headerBirthdayBanner.setAttribute('aria-hidden', 'true');
    }
    if (DOM.headerBirthdayBadge) {
      DOM.headerBirthdayBadge.classList.add('hidden');
      DOM.headerBirthdayBadge.setAttribute('aria-hidden', 'true');
    }
  }

  return {
    init() {
      evaluateBirthday();

      // Click or tap interactions for celebratory feedback
      if (DOM.headerBirthdayBadge) {
        DOM.headerBirthdayBadge.addEventListener('click', () => {
          const rect = DOM.headerBirthdayBadge.getBoundingClientRect();
          CursorHeartTrail.spawn(rect.left + rect.width / 2, rect.top + rect.height / 2, 5);
          ParticleEngine.createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 16);
        });
      }
      if (DOM.headerBirthdayBanner) {
        DOM.headerBirthdayBanner.addEventListener('click', () => {
          const rect = DOM.headerBirthdayBanner.getBoundingClientRect();
          CursorHeartTrail.spawn(rect.left + rect.width / 2, rect.top + rect.height / 2, 4);
          ParticleEngine.createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 14);
        });
      }

      // Periodically check (every minute) in case user keeps page open past midnight
      setInterval(evaluateBirthday, 60000);
    },
    check: evaluateBirthday,
    getTargetBirthday: resolveTargetBirthday,
  };
})();

/* ==================================================
   3. PASSWORD MINI-GAME LOGIC (SCENE 1)
   ================================================== */

/**
 * Handle password submission
 */
function handlePasswordSubmit() {
  if (STATE.isPasswordUnlocked || STATE.isTransitioning) return;

  const enteredValue = DOM.passwordInput.value.trim();

  if (!enteredValue) {
    showPasswordFeedback('Iltimos, avval maxfiy kodni kiriting.', 'error');
    shakePasswordCard();
    return;
  }

  // Check correct code (1986)
  if (enteredValue === STATE.targetPassword) {
    handlePasswordSuccess();
  } else {
    handlePasswordError();
  }
}

/**
 * Triggered on wrong password
 */
function handlePasswordError() {
  STATE.passwordAttempts++;

  // Error message
  showPasswordFeedback('Bu kod noto‘g‘ri 😄 Yana bir bor urinib ko‘ring.', 'error');
  shakePasswordCard();

  // If multiple attempts, provide adaptive assistance
  if (STATE.passwordAttempts >= 2 && DOM.hintBox.classList.contains('hidden')) {
    DOM.hintBox.classList.remove('hidden');
    DOM.hintText.textContent = 'To‘rt xonali yilni eslashga harakat qiling ❤️';
  }

  // Clear input and focus
  DOM.passwordInput.select();
}

/**
 * Triggered when password is correct (1986)
 */
function handlePasswordSuccess() {
  STATE.isPasswordUnlocked = true;
  DOM.passwordInput.disabled = true;
  DOM.submitPasswordBtn.disabled = true;

  // 1. Lock icon unlocks
  DOM.lockWrapper.classList.add('lock-unlocked');

  // 2. Success text
  showPasswordFeedback('Topdingiz! ❤️', 'success');

  // 3. Sparkle particles burst at the lock position
  const lockRect = DOM.lockWrapper.getBoundingClientRect();
  ParticleEngine.createSparkleBurst(
    lockRect.left + lockRect.width / 2,
    lockRect.top + lockRect.height / 2,
    40
  );

  // 4. Start background music if not yet started
  attemptStartMusic();

  // 5. Cinematic transition to Scene 2 after ~1.2s
  setTimeout(() => {
    switchScene(2);
  }, 1250);
}

/**
 * Shake password card on error
 */
function shakePasswordCard() {
  DOM.passwordCard.classList.remove('card-shake');
  // Trigger reflow to restart CSS animation
  void DOM.passwordCard.offsetWidth;
  DOM.passwordCard.classList.add('card-shake');

  setTimeout(() => {
    DOM.passwordCard.classList.remove('card-shake');
  }, 600);
}

/**
 * Display toast feedback under password field
 */
function showPasswordFeedback(text, type) {
  DOM.passwordFeedback.className = `feedback-msg ${type}`;
  DOM.passwordFeedback.textContent = text;
}

/**
 * Toggle password visibility (eye button)
 */
function togglePasswordVisibility() {
  const isPassword = DOM.passwordInput.type === 'password';
  DOM.passwordInput.type = isPassword ? 'text' : 'password';

  if (isPassword) {
    DOM.eyeOpenIcon.classList.add('hidden');
    DOM.eyeClosedIcon.classList.remove('hidden');
    DOM.togglePasswordBtn.title = 'Kodni yashirish';
  } else {
    DOM.eyeOpenIcon.classList.remove('hidden');
    DOM.eyeClosedIcon.classList.add('hidden');
    DOM.togglePasswordBtn.title = 'Kodni ko‘rsatish';
  }
}

/**
 * Toggle hint reveal
 */
function toggleHint() {
  const isHidden = DOM.hintBox.classList.contains('hidden');

  if (isHidden) {
    DOM.hintBox.classList.remove('hidden');
    if (STATE.passwordAttempts >= 2) {
      DOM.hintText.textContent = 'To‘rt xonali yilni eslashga harakat qiling ❤️';
    } else {
      DOM.hintText.textContent = 'Bu raqam siz uchun juda muhim bo‘lgan bir yil bilan bog‘liq...';
    }
  } else {
    DOM.hintBox.classList.add('hidden');
  }
}

/* ==================================================
   4. THEATRICAL CURTAIN & SCENE TRANSITIONS
   ================================================== */

/**
 * Theatrical Velvet Curtains Animation Module
 * Creates a dramatic stage unveiling transition when moving from Scene 1 to Scene 2
 */
const TheatricalCurtain = (function () {
  const curtainEl = document.getElementById('theatrical-curtain');
  const curtainLeft = document.getElementById('curtain-panel-left');
  const curtainRight = document.getElementById('curtain-panel-right');
  const partingFlare = document.getElementById('curtain-center-flare');

  let isActive = false;
  let animTimer = null;

  function openCurtains(onMidpoint, onComplete) {
    if (!curtainEl) {
      if (onMidpoint) onMidpoint();
      if (onComplete) onComplete();
      return;
    }

    isActive = true;

    // Reset any previous state
    curtainEl.classList.remove('hidden', 'curtains-drawing-open');
    curtainEl.classList.add('curtain-active');

    // Force browser reflow so initial closed position is committed
    void curtainEl.offsetWidth;

    // Step 1: Curtains are closed over Scene 1
    // After 220ms, execute midpoint callback to swap underlying scenes safely
    setTimeout(() => {
      if (onMidpoint) onMidpoint();

      // Step 2: Draw the curtains open majestically
      curtainEl.classList.add('curtains-drawing-open');

      // Sparkle particles along center parting seam
      const cx = window.innerWidth / 2;
      const cy = window.innerHeight / 2;
      ParticleEngine.createSparkleBurst(cx, cy, 35);
      ParticleEngine.createSparkleBurst(cx, cy - 140, 20);
      ParticleEngine.createSparkleBurst(cx, cy + 140, 20);

      // Play theatrical opening chime/fanfare
      if (window.SoundController && typeof window.SoundController.playCurtainChime === 'function') {
        window.SoundController.playCurtainChime();
      }
    }, 240);

    // Step 3: Complete opening sweep and hide curtain overlay
    if (animTimer) clearTimeout(animTimer);
    animTimer = setTimeout(() => {
      curtainEl.classList.remove('curtain-active', 'curtains-drawing-open');
      curtainEl.classList.add('hidden');
      isActive = false;
      if (onComplete) onComplete();
    }, 2050);
  }

  function reset() {
    if (!curtainEl) return;
    if (animTimer) clearTimeout(animTimer);
    curtainEl.classList.add('hidden');
    curtainEl.classList.remove('curtain-active', 'curtains-drawing-open');
    isActive = false;
  }

  return {
    open: openCurtains,
    reset: reset,
    isActive: () => isActive,
  };
})();

/**
 * Seamlessly switch scenes with cinematic transitions
 * Includes theatrical velvet curtain unveiling between Scene 1 and Scene 2
 * @param {number} nextSceneId - 1, 2, 3, or 4
 * @param {boolean} forceTheatrical - optional flag to force curtain transition
 */
function switchScene(nextSceneId, forceTheatrical = false) {
  if (STATE.isTransitioning) return;
  STATE.isTransitioning = true;

  const sceneMap = {
    1: DOM.scenePassword,
    2: DOM.sceneGifts,
    3: DOM.sceneMessage,
    4: DOM.sceneCelebration,
  };

  const currentEl = sceneMap[STATE.currentScene];
  const nextEl = sceneMap[nextSceneId];

  // Theatrical velvet curtain transition between Scene 1 (password) and Scene 2 (gifts)
  if ((STATE.currentScene === 1 && nextSceneId === 2) || forceTheatrical) {
    TheatricalCurtain.open(
      // onMidpoint (under curtain coverage)
      () => {
        // Update step dots
        DOM.stepDots.forEach((dot, index) => {
          const stepNum = index + 1;
          dot.classList.remove('active');
          if (stepNum === 2) {
            dot.classList.add('active');
          }
          if (stepNum < 2) {
            dot.classList.add('completed');
          }
        });

        // Atmospheric theme
        document.body.setAttribute('data-scene', '2');
        if (DOM.canvas) {
          DOM.canvas.classList.remove('canvas-scene-1', 'canvas-scene-3', 'canvas-scene-4');
          DOM.canvas.classList.add('canvas-scene-2');
        }

        // Hide Scene 1
        if (currentEl) {
          currentEl.hidden = true;
          currentEl.classList.remove('scene-active', 'scene-exit');
        }

        // Reveal Scene 2 with glowing theatrical bloom
        if (nextEl) {
          nextEl.hidden = false;
          void nextEl.offsetWidth;
          nextEl.classList.add('scene-active', 'unveiling-theatrical');
        }

        STATE.currentScene = 2;
      },
      // onComplete
      () => {
        if (nextEl) {
          nextEl.classList.remove('unveiling-theatrical');
        }
        STATE.isTransitioning = false;
      }
    );
    return;
  }

  // Standard cinematic fade transition for other scenes
  // Update step indicators
  DOM.stepDots.forEach((dot, index) => {
    const stepNum = index + 1;
    dot.classList.remove('active');
    if (stepNum === nextSceneId) {
      dot.classList.add('active');
    }
    if (stepNum < nextSceneId) {
      dot.classList.add('completed');
    }
  });

  // Update canvas & background atmospheric theme (smooth CSS filter transition)
  document.body.setAttribute('data-scene', String(nextSceneId));
  if (DOM.canvas) {
    DOM.canvas.classList.remove('canvas-scene-1', 'canvas-scene-2', 'canvas-scene-3', 'canvas-scene-4');
    DOM.canvas.classList.add(`canvas-scene-${nextSceneId}`);
  }

  // 1. Fade out current scene
  if (currentEl) {
    currentEl.classList.add('scene-exit');
    currentEl.classList.remove('scene-active');
  }

  // 2. Prepare & fade in next scene
  setTimeout(() => {
    if (currentEl) {
      currentEl.hidden = true;
      currentEl.classList.remove('scene-exit');
    }

    if (nextEl) {
      nextEl.hidden = false;
      // Reflow
      void nextEl.offsetWidth;
      nextEl.classList.add('scene-active');
    }

    STATE.currentScene = nextSceneId;
    STATE.isTransitioning = false;

    // Trigger scene-specific initializers
    if (nextSceneId === 3) {
      startMessageRevelation();
    } else if (nextSceneId === 4) {
      startCelebrationClimax();
    }
  }, 600);
}

/* ==================================================
   5. THREE MYSTERY GIFTS LOGIC (SCENE 2)
   ================================================== */

/**
 * Handle gift selection
 * Box 1 = Wrong, Box 2 = Correct (Middle), Box 3 = Wrong
 * @param {number} giftId - 1, 2, or 3
 */
function handleGiftClick(giftId) {
  if (STATE.giftFound || STATE.isTransitioning) return;

  const clickedBox = document.getElementById(`gift-${giftId}`);

  // If already opened and wrong, ignore
  if (STATE.openedWrongGifts.has(giftId)) {
    return;
  }

  // WRONG GIFTS: 1 or 3
  if (giftId === 1 || giftId === 3) {
    handleWrongGift(giftId, clickedBox);
  }
  // WINNING MIDDLE GIFT: 2
  else if (giftId === 2) {
    handleWinningGift(clickedBox);
  }
}

/**
 * Wrong gift interaction
 */
function handleWrongGift(giftId, element) {
  STATE.openedWrongGifts.add(giftId);

  // 1. Shake animation
  element.classList.add('gift-wrong-animate');

  // 2. Sparkle burst
  const rect = element.getBoundingClientRect();
  ParticleEngine.createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);

  // 3. Show wrong gift floating modal
  DOM.wrongGiftModal.classList.remove('hidden');

  // 4. Dim the wrong gift
  setTimeout(() => {
    element.classList.remove('gift-wrong-animate');
    element.classList.add('gift-opened-wrong');
  }, 600);

  // 5. Hide modal after 1.8s
  setTimeout(() => {
    DOM.wrongGiftModal.classList.add('hidden');
  }, 1800);
}

/**
 * Winning gift interaction (MIDDLE GIFT)
 */
function handleWinningGift(element) {
  STATE.giftFound = true;

  // 1. Gift vibrates gently
  element.classList.add('gift-winning-vibrate');

  // 2. Playful sound chime or audio cue
  attemptStartMusic();

  setTimeout(() => {
    // 3. Lid opens & glowing beam bursts out
    element.classList.remove('gift-winning-vibrate');
    element.classList.add('gift-winning-open');

    // 4. Burst upward hearts & golden sparkles
    const rect = element.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + 40;

    ParticleEngine.createHeartFountain(centerX, centerY, 35);
    ParticleEngine.createSparkleBurst(centerX, centerY, 45);

    // 5. Transition into the emotional message card
    setTimeout(() => {
      switchScene(3);
    }, 1800);
  }, 800);
}

/* ==================================================
   6. EMOTIONAL BIRTHDAY MESSAGE LOGIC (SCENE 3)
   ================================================== */

const BIRTHDAY_TEXT = {
  heading: 'Tugʻilgan kuningiz muborak boʻlsin, mehribon Onajonim!',
  body: `Siz bizning oilamizning yuragi va tayanchisiz. Bergan mehringiz, qoʻllab-quvvatlovingiz va koʻrsatgan toʻgʻri yoʻlingiz uchun sizdan cheksiz minnatdormiz.

Dunyodagi barcha baxt, soʻnmas tabassum va mustahkam sogʻliq sizga hamroh boʻlsin.

Sizni juda ham yaxshi koʻramiz! ❤️`,
};

/**
 * Reveal the birthday message with a smooth, elegant typewriter effect
 */
function startMessageRevelation() {
  if (STATE.isTypingMessage) return;
  STATE.isTypingMessage = true;

  DOM.typedHeading.innerHTML = '';
  DOM.typedBody.innerHTML = '';
  DOM.messageActions.classList.remove('revealed');

  // 1. Type heading first
  typewriter(DOM.typedHeading, BIRTHDAY_TEXT.heading, 35, () => {
    // 2. Then type body text
    setTimeout(() => {
      typewriter(DOM.typedBody, BIRTHDAY_TEXT.body, 22, () => {
        // 3. Reveal final button
        STATE.isTypingMessage = false;
        DOM.messageActions.classList.add('revealed');

        // Gentle sparkle burst on complete
        const rect = DOM.finalSurpriseBtn.getBoundingClientRect();
        ParticleEngine.createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 25);
      });
    }, 300);
  });
}

/**
 * Typewriter helper function
 */
function typewriter(targetElement, fullText, speed = 25, onComplete) {
  let charIndex = 0;
  const cursor = document.createElement('span');
  cursor.className = 'typing-cursor';
  targetElement.appendChild(cursor);

  function typeNext() {
    if (charIndex < fullText.length) {
      const char = fullText.charAt(charIndex);
      if (char === '\n') {
        cursor.insertAdjacentHTML('beforebegin', '<br>');
      } else {
        const textNode = document.createTextNode(char);
        cursor.parentNode.insertBefore(textNode, cursor);
      }
      charIndex++;

      // If user wants to speed up, handle next tick
      setTimeout(typeNext, speed);
    } else {
      // Finished typing: remove cursor and trigger callback
      if (cursor.parentNode) {
        cursor.parentNode.removeChild(cursor);
      }
      if (typeof onComplete === 'function') {
        onComplete();
      }
    }
  }

  typeNext();
}

/* ==================================================
   7. GRAND CELEBRATION CLIMAX (SCENE 4)
   ================================================== */

/**
 * Start grand celebration scene with central heart confetti explosion
 */
function startCelebrationClimax() {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight * 0.44;

  // Visual pop pulse on the celebration stage
  if (DOM.sceneCelebration) {
    DOM.sceneCelebration.classList.remove('celebration-pop-pulse');
    void DOM.sceneCelebration.offsetWidth;
    DOM.sceneCelebration.classList.add('celebration-pop-pulse');
  }

  // 1. Immediate primary explosion of heart-shaped confetti launching from the screen center
  ParticleEngine.createHeartConfettiExplosion(centerX, centerY, 85);

  // 2. Secondary elevated heart burst wave (+260ms)
  setTimeout(() => {
    ParticleEngine.createHeartConfettiExplosion(centerX, centerY - 30, 60);
  }, 260);

  // 3. Dual side cannon bursts launching across the screen (+580ms)
  setTimeout(() => {
    ParticleEngine.createHeartConfettiExplosion(window.innerWidth * 0.22, window.innerHeight * 0.52, 35);
    ParticleEngine.createHeartConfettiExplosion(window.innerWidth * 0.78, window.innerHeight * 0.52, 35);
  }, 580);

  // 4. Staggered celebration fireworks across the sky
  launchCelebrationFireworks();
}

/**
 * Launch multiple staggered fireworks
 */
function launchCelebrationFireworks() {
  const width = window.innerWidth;
  const height = window.innerHeight;

  for (let i = 0; i < 6; i++) {
    setTimeout(() => {
      const x = width * 0.15 + Math.random() * (width * 0.7);
      const y = height * 0.15 + Math.random() * (height * 0.45);
      ParticleEngine.createFirework(x, y);
    }, i * 350);
  }
}

/**
 * Interactive Birthday Cake: Click to blow out / relight candle
 */
function handleCakeInteraction() {
  const isBlownOut = DOM.candleFlame.classList.contains('blown-out');

  if (!isBlownOut) {
    // Blow out candle: small smoke/sparkle puff
    DOM.candleFlame.classList.add('blown-out');
    const rect = DOM.candleFlame.getBoundingClientRect();
    ParticleEngine.createSparkleBurst(rect.left + rect.width / 2, rect.top, 20);

    // Relight automatically after 2.5 seconds with celebratory sparkles and mini heart burst
    setTimeout(() => {
      DOM.candleFlame.classList.remove('blown-out');
      ParticleEngine.createFirework(rect.left + rect.width / 2, rect.top);
      ParticleEngine.createHeartConfettiExplosion(rect.left + rect.width / 2, rect.top, 30);
    }, 2500);
  } else {
    // Relight immediately
    DOM.candleFlame.classList.remove('blown-out');
  }
}

/**
 * Restart journey back to Scene 1
 */
function restartJourney() {
  // Clear celebration confetti
  ParticleEngine.clearCelebration();

  // Reset states
  STATE.passwordAttempts = 0;
  STATE.isPasswordUnlocked = false;
  STATE.openedWrongGifts.clear();
  STATE.giftFound = false;
  STATE.isTypingMessage = false;

  // Reset inputs & locks
  DOM.passwordInput.disabled = false;
  DOM.passwordInput.value = '';
  DOM.submitPasswordBtn.disabled = false;
  DOM.lockWrapper.classList.remove('lock-unlocked');
  DOM.passwordFeedback.textContent = '';
  DOM.hintBox.classList.add('hidden');

  // Reset gifts
  DOM.giftCards.forEach((gift) => {
    gift.classList.remove(
      'gift-opened-wrong',
      'gift-wrong-animate',
      'gift-winning-vibrate',
      'gift-winning-open'
    );
  });

  // Reset step indicator dots
  DOM.stepDots.forEach((dot, idx) => {
    dot.classList.remove('active', 'completed');
    if (idx === 0) dot.classList.add('active');
  });

  // Switch to Scene 1
  TheatricalCurtain.reset();
  closeLightbox();
  closeMemoryGallery();
  switchScene(1);
}

/* ==================================================
   7.1. MEMORY GALLERY & LIGHTBOX HANDLERS (WITH ACCESSIBLE ARIA LIVE REGIONS)
   ================================================== */
let galleryLiveAnnounceTimer = null;

/**
 * Dynamically calculate the number of columns in the memory gallery grid
 */
function getGalleryColumnCount() {
  const cards = Array.from(DOM.galleryCards);
  if (cards.length < 2) return 1;
  let cols = 1;
  const firstTop = cards[0].offsetTop;
  for (let i = 1; i < cards.length; i++) {
    if (Math.abs(cards[i].offsetTop - firstTop) < 15) {
      cols++;
    } else {
      break;
    }
  }
  return Math.max(1, cols);
}

/**
 * Announce active gallery item photo description via ARIA live regions
 * Ensures screen readers announce the photo description clearly when a user navigates using keyboard arrows.
 */
function announceGalleryCard(card, updateAnnouncer = true) {
  if (!card) return;
  const cards = Array.from(DOM.galleryCards);
  const index = cards.indexOf(card);
  if (index === -1) return;

  STATE.lastAnnouncedCardIndex = index;

  const titleEl = card.querySelector('.gallery-card-title');
  const descEl = card.querySelector('.gallery-card-desc');
  const tagEl = card.querySelector('.gallery-card-tag');
  const dateEl = card.querySelector('.gallery-date');

  const title = titleEl ? titleEl.textContent.trim() : '';
  const desc = descEl ? descEl.textContent.trim() : '';
  const tag = tagEl ? tagEl.textContent.trim() : '';
  const date = dateEl ? dateEl.textContent.trim() : '';
  const total = cards.length;

  const announcement = `${index + 1}-xotira (${index + 1} dan ${total}): ${title}. Rasm tavsifi: ${desc}. ${tag ? 'Mavzu: ' + tag + '.' : ''} ${date ? 'Izoh: ' + date + '.' : ''}`;

  // 1. Update the item's own specific ARIA live region
  const itemLive = card.querySelector('.gallery-item-live-region');
  if (itemLive) {
    itemLive.textContent = announcement;
  }

  // 2. Announce through the dedicated main gallery live region
  if (updateAnnouncer && DOM.galleryLiveAnnouncer) {
    clearTimeout(galleryLiveAnnounceTimer);
    DOM.galleryLiveAnnouncer.textContent = '';
    galleryLiveAnnounceTimer = setTimeout(() => {
      if (DOM.galleryLiveAnnouncer) {
        DOM.galleryLiveAnnouncer.textContent = announcement;
      }
    }, 60);
  }
}

/**
 * Keyboard arrow navigation across Memory Gallery cards
 * Supports ArrowRight, ArrowLeft, ArrowDown, ArrowUp, Home, End
 */
function handleGalleryCardKeyDown(e, currentCard) {
  const cards = Array.from(DOM.galleryCards);
  if (!cards.length) return;

  const currentIndex = cards.indexOf(currentCard);
  if (currentIndex === -1) return;

  const cols = getGalleryColumnCount();
  let nextIndex = -1;

  switch (e.key) {
    case 'ArrowRight':
      nextIndex = (currentIndex + 1) % cards.length;
      break;
    case 'ArrowLeft':
      nextIndex = (currentIndex - 1 + cards.length) % cards.length;
      break;
    case 'ArrowDown':
      nextIndex = (currentIndex + cols) % cards.length;
      break;
    case 'ArrowUp':
      nextIndex = (currentIndex - cols + cards.length) % cards.length;
      break;
    case 'Home':
      nextIndex = 0;
      break;
    case 'End':
      nextIndex = cards.length - 1;
      break;
    default:
      return;
  }

  e.preventDefault();

  const targetCard = cards[nextIndex];
  if (targetCard) {
    cards.forEach((c) => c.classList.remove('keyboard-focused'));
    targetCard.classList.add('keyboard-focused');
    targetCard.focus();
    targetCard.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    announceGalleryCard(targetCard, true);
  }
}

/**
 * Open Memory Gallery Slide-in Modal
 */
function openMemoryGallery() {
  if (!DOM.galleryModal) return;
  DOM.galleryModal.classList.remove('hidden');
  DOM.galleryModal.setAttribute('aria-hidden', 'false');
  STATE.isGalleryOpen = true;

  // Gentle particle celebration when gallery is opened
  if (DOM.openGalleryBtn) {
    const rect = DOM.openGalleryBtn.getBoundingClientRect();
    ParticleEngine.createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 18);
  }

  // Clear live announcer then announce opening instructions to assistive technologies
  if (DOM.galleryLiveAnnouncer) {
    DOM.galleryLiveAnnouncer.textContent = '';
    setTimeout(() => {
      if (DOM.galleryLiveAnnouncer) {
        DOM.galleryLiveAnnouncer.textContent = "Xotiralar albomi ochildi. 6 ta xotira mavjud. Klaviaturadagi o‘q (strelka) tugmalari orqali rasmlar tavsiflarini eshitishingiz mumkin.";
      }
    }, 120);
  }

  // Focus close button initially
  setTimeout(() => {
    if (DOM.closeGalleryBtn) {
      DOM.closeGalleryBtn.focus();
    }
  }, 100);
}

/**
 * Close Memory Gallery Slide-in Modal
 */
function closeMemoryGallery() {
  if (!DOM.galleryModal) return;
  DOM.galleryModal.classList.add('hidden');
  DOM.galleryModal.setAttribute('aria-hidden', 'true');
  STATE.isGalleryOpen = false;

  // Remove active keyboard focus styles
  DOM.galleryCards.forEach((c) => c.classList.remove('keyboard-focused'));

  if (DOM.galleryLiveAnnouncer) {
    DOM.galleryLiveAnnouncer.textContent = '';
  }

  if (DOM.openGalleryBtn) {
    DOM.openGalleryBtn.focus();
  }
}

/**
 * Open Lightbox zoom for specific memory card
 */
function openLightbox(card) {
  if (!DOM.galleryLightbox || !card) return;
  STATE.activeGalleryCard = card;

  const img = card.querySelector('.gallery-img');
  const title = card.querySelector('.gallery-card-title');
  const desc = card.querySelector('.gallery-card-desc');
  const tag = card.querySelector('.gallery-card-tag');

  if (DOM.lightboxImg && img) {
    DOM.lightboxImg.src = img.src;
    DOM.lightboxImg.alt = img.alt;
  }
  if (DOM.lightboxTitle && title) {
    DOM.lightboxTitle.textContent = title.textContent;
  }
  if (DOM.lightboxDesc && desc) {
    DOM.lightboxDesc.textContent = desc.textContent;
  }
  if (DOM.lightboxTag && tag) {
    DOM.lightboxTag.textContent = tag.textContent;
  }

  DOM.galleryLightbox.classList.remove('hidden');
  DOM.galleryLightbox.setAttribute('aria-hidden', 'false');
  STATE.isLightboxOpen = true;

  setTimeout(() => {
    if (DOM.lightboxCloseBtn) {
      DOM.lightboxCloseBtn.focus();
    }
  }, 50);
}

/**
 * Close Lightbox zoom modal
 */
function closeLightbox() {
  if (!DOM.galleryLightbox) return;
  DOM.galleryLightbox.classList.add('hidden');
  DOM.galleryLightbox.setAttribute('aria-hidden', 'true');
  STATE.isLightboxOpen = false;

  // Restore focus to previously viewed memory card
  if (STATE.activeGalleryCard) {
    STATE.activeGalleryCard.focus();
    announceGalleryCard(STATE.activeGalleryCard, true);
  }
}

/**
 * Handle Like button interaction with micro heart burst
 */
function handleGalleryLike(btn, e) {
  e.stopPropagation();
  const countSpan = btn.querySelector('.like-count');
  const currentCount = parseInt(countSpan.textContent, 10) || 0;
  const isLiked = btn.classList.contains('liked');

  if (!isLiked) {
    btn.classList.add('liked');
    countSpan.textContent = currentCount + 1;
    const rect = btn.getBoundingClientRect();
    CursorHeartTrail.spawn(rect.left + rect.width / 2, rect.top + rect.height / 2, 4);
    ParticleEngine.createSparkleBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 10);
  } else {
    btn.classList.remove('liked');
    countSpan.textContent = Math.max(1, currentCount - 1);
  }
}

/* ==================================================
   8. LIGHTWEIGHT REUSABLE PARTICLE SYSTEM
   ================================================== */
const ParticleEngine = (function () {
  let ctx = null;
  let particles = [];
  let fireworks = [];
  let heartConfetti = [];
  let shockwaves = [];
  let width = window.innerWidth;
  let height = window.innerHeight;
  let animationFrameId = null;

  // Colors - Synchronized with Neon Pink & Obsidian theme
  const COLORS = {
    rose: '#ff2d75',
    roseBright: '#ff5c93',
    neonPink: '#ff2d75',
    neonPinkBright: '#ff5c93',
    neonMagenta: '#e91e63',
    gold: '#ffd27d',
    goldLight: '#fff2d1',
    wine: '#880e4f',
    white: '#ffffff',
  };

  /**
   * Ambient particle constructor (3D glossy ruby hearts, bokeh hearts, glow dots, golden stars)
   * Matches reference image background heart aesthetic
   */
  class AmbientParticle {
    constructor() {
      this.reset(true);
    }

    reset(initial = false) {
      this.x = Math.random() * width;
      this.y = initial ? Math.random() * height : height + 15;
      this.speedY = 0.35 + Math.random() * 0.85;
      this.speedX = (Math.random() - 0.5) * 0.5;
      this.swayPhase = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.018 + Math.random() * 0.024;
      this.angle = Math.random() * Math.PI * 2;
      this.spinSpeed = (Math.random() - 0.5) * 0.014;

      const rand = Math.random();
      if (rand > 0.46) {
        // 3D Plump Glossy Ruby Heart with specular glint
        this.type = 'heart3d';
        this.size = 5 + Math.random() * 11;
        this.opacity = 0.45 + Math.random() * 0.52;
        this.color = Math.random() > 0.35 ? COLORS.neonPink : COLORS.roseBright;
      } else if (rand > 0.22) {
        // Soft glowing translucent bokeh background heart
        this.type = 'bokehHeart';
        this.size = 14 + Math.random() * 24;
        this.opacity = 0.12 + Math.random() * 0.24;
        this.color = COLORS.neonPink;
      } else if (rand > 0.08) {
        // Twinkling golden stardust star
        this.type = 'sparkle';
        this.size = 2.4 + Math.random() * 4.2;
        this.opacity = 0.35 + Math.random() * 0.6;
        this.color = Math.random() > 0.4 ? COLORS.gold : COLORS.goldLight;
      } else {
        // Tiny stardust dust speck
        this.type = 'dust';
        this.size = 1.2 + Math.random() * 2.2;
        this.opacity = 0.25 + Math.random() * 0.5;
        this.color = COLORS.goldLight;
      }
    }

    update() {
      this.y -= this.speedY;
      this.swayPhase += this.swaySpeed;
      this.x += this.speedX + Math.sin(this.swayPhase) * 0.55;
      this.angle += this.spinSpeed;

      if (this.y < -35 || this.x < -35 || this.x > width + 35) {
        this.reset(false);
      }
    }

    draw() {
      ctx.save();
      ctx.globalAlpha = this.opacity;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);

      if (this.type === 'heart3d') {
        draw3DGlossyHeart(ctx, 0, 0, this.size, this.color);
      } else if (this.type === 'bokehHeart') {
        drawBokehHeart(ctx, 0, 0, this.size, this.color);
      } else if (this.type === 'sparkle') {
        drawStar(ctx, 0, 0, this.size * 0.8, this.color);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 6;
        ctx.shadowColor = this.color;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Dynamic burst particle (fireworks, confetti, bursts)
   */
  class BurstParticle {
    constructor(x, y, color, type = 'dot') {
      this.x = x;
      this.y = y;
      this.color = color;
      this.type = type;
      this.radius = 2 + Math.random() * 4;
      const angle = Math.random() * Math.PI * 2;
      const speed = 2 + Math.random() * 7;
      this.vx = Math.cos(angle) * speed;
      this.vy = Math.sin(angle) * speed;
      this.gravity = 0.12;
      this.friction = 0.96;
      this.alpha = 1;
      this.decay = 0.014 + Math.random() * 0.02;
    }

    update() {
      this.vx *= this.friction;
      this.vy *= this.friction;
      this.vy += this.gravity;
      this.x += this.vx;
      this.y += this.vy;
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);

      if (this.type === 'heart') {
        drawHeart(ctx, 0, 0, this.radius * 1.6, this.color);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 8;
        ctx.shadowColor = this.color;
        ctx.fill();
      }

      ctx.restore();
    }
  }

  /**
   * Helper: Draw a shaded 3D glossy ruby heart with specular sheen (matching reference image)
   */
  function draw3DGlossyHeart(c, x, y, size, baseColor) {
    const topDipY = -size * 0.28;
    c.beginPath();
    c.moveTo(x, y + topDipY);
    c.bezierCurveTo(
      x - size * 0.55,
      y - size * 0.85,
      x - size * 1.05,
      y - size * 0.15,
      x,
      y + size * 0.95
    );
    c.bezierCurveTo(
      x + size * 1.05,
      y - size * 0.15,
      x + size * 0.55,
      y - size * 0.85,
      x,
      y + topDipY
    );
    c.closePath();

    // 3D Spherical Radial Gradient
    const grad = c.createRadialGradient(
      x - size * 0.25,
      y - size * 0.35,
      size * 0.1,
      x,
      y,
      size * 1.05
    );
    grad.addColorStop(0, '#ff99be');
    grad.addColorStop(0.35, baseColor || '#ff2d75');
    grad.addColorStop(0.75, '#a30835');
    grad.addColorStop(1, '#380212');

    c.fillStyle = grad;
    c.shadowBlur = 12;
    c.shadowColor = baseColor || '#ff2d75';
    c.fill();

    // Specular Highlight Glint Arc on upper-left lobe
    c.beginPath();
    c.ellipse(
      x - size * 0.32,
      y - size * 0.32,
      size * 0.24,
      size * 0.14,
      -Math.PI / 4,
      0,
      Math.PI * 2
    );
    c.fillStyle = 'rgba(255, 255, 255, 0.65)';
    c.shadowBlur = 4;
    c.shadowColor = '#ffffff';
    c.fill();
  }

  /**
   * Helper: Draw a soft translucent out-of-focus bokeh heart
   */
  function drawBokehHeart(c, x, y, size, color) {
    const topDipY = -size * 0.28;
    c.beginPath();
    c.moveTo(x, y + topDipY);
    c.bezierCurveTo(
      x - size * 0.55,
      y - size * 0.85,
      x - size * 1.05,
      y - size * 0.15,
      x,
      y + size * 0.95
    );
    c.bezierCurveTo(
      x + size * 1.05,
      y - size * 0.15,
      x + size * 0.55,
      y - size * 0.85,
      x,
      y + topDipY
    );
    c.closePath();

    c.fillStyle = color;
    c.shadowBlur = 18;
    c.shadowColor = color;
    c.fill();
  }

  /**
   * Helper: draw a soft vector heart
   */
  function drawHeart(c, x, y, size, color) {
    c.beginPath();
    const topCurveHeight = size * 0.3;
    c.moveTo(x, y + topCurveHeight);
    c.bezierCurveTo(x, y, x - size / 2, y, x - size / 2, y + topCurveHeight);
    c.bezierCurveTo(x - size / 2, y + (size + topCurveHeight) / 2, x, y + size, x, y + size * 1.3);
    c.bezierCurveTo(x, y + size, x + size / 2, y + (size + topCurveHeight) / 2, x + size / 2, y + topCurveHeight);
    c.bezierCurveTo(x + size / 2, y, x, y, x, y + topCurveHeight);
    c.fillStyle = color;
    c.fill();
  }

  /**
   * Helper: draw a symmetrical vector heart perfectly centered around (x, y)
   * Enables clean 3D perspective scaling, flipping, and tumbling rotations
   */
  function drawCenteredHeart(c, x, y, size, color) {
    c.beginPath();
    const topDipY = -size * 0.28;
    c.moveTo(x, y + topDipY);
    c.bezierCurveTo(
      x - size * 0.55,
      y - size * 0.85,
      x - size * 1.05,
      y - size * 0.15,
      x,
      y + size * 0.95
    );
    c.bezierCurveTo(
      x + size * 1.05,
      y - size * 0.15,
      x + size * 0.55,
      y - size * 0.85,
      x,
      y + topDipY
    );
    c.fillStyle = color;
    c.fill();
  }

  /**
   * 3D Tumbling Heart-Shaped Confetti Particle
   * Features dynamic radial blast physics, upward fountain boost, air friction,
   * 3D tumbling rotation around multiple axes, and sinusoidal fluttering drift.
   */
  class HeartConfettiParticle {
    constructor(originX, originY, options = {}) {
      // Launch jitter around center epicenter
      this.x = originX + (Math.random() - 0.5) * 26;
      this.y = originY + (Math.random() - 0.5) * 26;

      const CONFETTI_PALETTE = [
        '#ff2d75', // Neon hot pink
        '#ff5c93', // Glowing radiant pink
        '#e91e63', // Neon magenta
        '#ff85a2', // Soft pastel rose
        '#ffd27d', // Champagne gold
        '#fff2d1', // Warm shimmer gold
        '#ffffff', // Diamond sparkle white
        '#ff1744', // Ruby blossom
      ];
      this.color = options.color || CONFETTI_PALETTE[Math.floor(Math.random() * CONFETTI_PALETTE.length)];

      // 360-degree radial blast with strong upward fountain impulse
      const angle = Math.random() * Math.PI * 2;
      const basePower = options.speed || (10 + Math.random() * 16);

      this.vx = Math.cos(angle) * basePower * (0.8 + Math.random() * 0.6);
      // Upward bias: blast particles into the air so they cascade down over the stage
      this.vy = Math.sin(angle) * basePower * 0.85 - (5 + Math.random() * 8.5);

      // Realistic aerodynamics
      this.gravity = 0.15 + Math.random() * 0.08;
      this.friction = 0.945; // Smooth air braking from explosion to fluttering
      this.terminalVelocity = 2.1 + Math.random() * 2.3; // Gentle floaty falling speed

      // 3D Rotations & Tumbling Flutter
      this.rotation = Math.random() * Math.PI * 2;
      this.rotationSpeed = (Math.random() - 0.5) * 0.09;

      this.wobble = Math.random() * Math.PI * 2;
      this.wobbleSpeed = 0.06 + Math.random() * 0.08;

      this.tilt = Math.random() * Math.PI * 2;
      this.tiltSpeed = 0.04 + Math.random() * 0.06;

      // Sinusoidal air sway (fluttering paper / foil effect)
      this.swayPhase = Math.random() * Math.PI * 2;
      this.swaySpeed = 0.025 + Math.random() * 0.035;
      this.swayAmount = 1.2 + Math.random() * 2.2;

      // Size variation: small cute hearts to large flutter petals (8.5px - 22px)
      this.size = 8.5 + Math.random() * 13.5;
      this.isGlowing = Math.random() > 0.45;

      // Lifespan & smooth fading
      this.alpha = 1;
      this.age = 0;
      this.maxAge = 250 + Math.random() * 140; // ~4.5 to 6.5 seconds of joyful celebration
      this.fadeThreshold = this.maxAge * 0.72;
    }

    update() {
      this.age++;

      // Drag slows down initial explosive velocity
      this.vx *= this.friction;
      this.vy *= this.friction;

      // Gravity pulls down
      this.vy += this.gravity;
      if (this.vy > this.terminalVelocity) {
        this.vy = this.terminalVelocity;
      }

      // Air fluttering sway
      this.swayPhase += this.swaySpeed;
      const swayX = Math.sin(this.swayPhase) * this.swayAmount;

      this.x += this.vx + swayX;
      this.y += this.vy;

      // 3D rotations
      this.rotation += this.rotationSpeed;
      this.wobble += this.wobbleSpeed;
      this.tilt += this.tiltSpeed;

      // Gradual fade out toward end of life
      if (this.age >= this.fadeThreshold) {
        this.alpha = Math.max(0, 1 - (this.age - this.fadeThreshold) / (this.maxAge - this.fadeThreshold));
      }

      // If fallen below viewport, fade quickly
      if (this.y > height + 40) {
        this.alpha = 0;
      }
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.translate(this.x, this.y);
      ctx.rotate(this.rotation);

      // 3D perspective flip (tumbling around horizontal & vertical planes)
      const scaleX = Math.cos(this.wobble);
      const scaleY = Math.sin(this.tilt) * 0.35 + 0.65;
      ctx.scale(scaleX, scaleY);

      if (this.isGlowing) {
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
      }

      drawCenteredHeart(ctx, 0, 0, this.size, this.color);
      ctx.restore();
    }
  }

  /**
   * Radial shockwave ring expanding from the blast epicenter
   */
  class ShockwaveRing {
    constructor(x, y, maxRadius = 260, color = '#ff2d75') {
      this.x = x;
      this.y = y;
      this.radius = 6;
      this.maxRadius = maxRadius;
      this.color = color;
      this.alpha = 0.85;
      this.speed = 13;
    }

    update() {
      this.radius += this.speed;
      this.speed *= 0.94;
      this.alpha = Math.max(0, 0.85 * (1 - this.radius / this.maxRadius));
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = this.alpha;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
      ctx.strokeStyle = this.color;
      ctx.lineWidth = 3;
      ctx.shadowBlur = 18;
      ctx.shadowColor = this.color;
      ctx.stroke();
      ctx.restore();
    }
  }

  /**
   * Helper: draw a 4-point sparkle star
   */
  function drawStar(c, x, y, size, color) {
    c.beginPath();
    c.moveTo(x, y - size * 2);
    c.quadraticCurveTo(x, y, x + size * 2, y);
    c.quadraticCurveTo(x, y, x, y + size * 2);
    c.quadraticCurveTo(x, y, x - size * 2, y);
    c.quadraticCurveTo(x, y, x, y - size * 2);
    c.fillStyle = color;
    c.fill();
  }

  /**
   * Main render loop
   */
  function loop() {
    ctx.clearRect(0, 0, width, height);

    // 1. Update & draw ambient particles
    for (let i = 0; i < particles.length; i++) {
      particles[i].update();
      particles[i].draw();
    }

    // 2. Update & draw burst/firework particles
    for (let i = fireworks.length - 1; i >= 0; i--) {
      fireworks[i].update();
      fireworks[i].draw();
      if (fireworks[i].alpha <= 0) {
        fireworks.splice(i, 1);
      }
    }

    // 3. Update & draw shockwave rings
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      shockwaves[i].update();
      shockwaves[i].draw();
      if (shockwaves[i].alpha <= 0) {
        shockwaves.splice(i, 1);
      }
    }

    // 4. Update & draw heart-shaped confetti particles
    for (let i = heartConfetti.length - 1; i >= 0; i--) {
      heartConfetti[i].update();
      heartConfetti[i].draw();
      if (heartConfetti[i].alpha <= 0) {
        heartConfetti.splice(i, 1);
      }
    }

    animationFrameId = requestAnimationFrame(loop);
  }

  /**
   * Handle resize
   */
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (DOM.canvas) {
      DOM.canvas.width = width;
      DOM.canvas.height = height;
    }
  }

  return {
    init() {
      if (!DOM.canvas) return;
      ctx = DOM.canvas.getContext('2d');
      resize();
      window.addEventListener('resize', resize, { passive: true });

      // Ambient particle count adjusted for performance
      const particleCount = STATE.prefersReducedMotion ? 12 : Math.min(42, Math.floor(width / 30));
      particles = [];
      for (let i = 0; i < particleCount; i++) {
        particles.push(new AmbientParticle());
      }

      loop();
    },

    createSparkleBurst(x, y, count = 25) {
      if (STATE.prefersReducedMotion) return;
      const colors = [COLORS.neonPinkBright, COLORS.neonPink, COLORS.gold, COLORS.goldLight, COLORS.white];
      for (let i = 0; i < count; i++) {
        const col = colors[Math.floor(Math.random() * colors.length)];
        fireworks.push(new BurstParticle(x, y, col, 'sparkle'));
      }
    },

    createHeartFountain(x, y, count = 30) {
      if (STATE.prefersReducedMotion) return;
      const colors = [COLORS.neonPink, COLORS.neonPinkBright, COLORS.neonMagenta, COLORS.gold, COLORS.white];
      for (let i = 0; i < count; i++) {
        const col = colors[Math.floor(Math.random() * colors.length)];
        const p = new BurstParticle(x, y, col, 'heart');
        p.vy = -3 - Math.random() * 6; // Force initial upward velocity
        fireworks.push(p);
      }
    },

    createFirework(x, y) {
      if (STATE.prefersReducedMotion) return;
      const colors = [COLORS.neonPink, COLORS.neonPinkBright, COLORS.neonMagenta, COLORS.gold, COLORS.white];
      for (let i = 0; i < 45; i++) {
        const col = colors[Math.floor(Math.random() * colors.length)];
        fireworks.push(new BurstParticle(x, y, col, 'dot'));
      }
    },

    /**
     * Explosion of Heart-Shaped Confetti Particles
     * Radiates outward in 360 degrees from screen center with shockwave glow rings,
     * central sparkling firecrackers, and cascading 3D fluttering hearts.
     */
    createHeartConfettiExplosion(x, y, count = 85, options = {}) {
      if (STATE.prefersReducedMotion) return;

      // 1. Dual Shockwave Rings expanding from blast origin
      const maxR = Math.min(width, height) * 0.45;
      shockwaves.push(new ShockwaveRing(x, y, maxR, '#ff2d75'));
      shockwaves.push(new ShockwaveRing(x, y, maxR * 0.72, '#ffd27d'));

      // 2. Central firecracker flash sparkles
      for (let i = 0; i < 28; i++) {
        const p = new BurstParticle(x, y, Math.random() > 0.4 ? COLORS.gold : COLORS.neonPinkBright, 'sparkle');
        p.radius = 2.5 + Math.random() * 3.5;
        fireworks.push(p);
      }

      // 3. 3D Tumbling Heart-Shaped Confetti Particles
      for (let i = 0; i < count; i++) {
        heartConfetti.push(new HeartConfettiParticle(x, y, options));
      }
    },

    clearCelebration() {
      heartConfetti = [];
      shockwaves = [];
    },
  };
})();

/* ==================================================
   8.1. MOUSE-TRACKING CURSOR HEART TRAIL (DESKTOP)
   ================================================== */
const CursorHeartTrail = (function () {
  let canvas = null;
  let ctx = null;
  let hearts = [];
  let width = window.innerWidth;
  let height = window.innerHeight;
  let animId = null;
  let isRunning = false;
  let lastX = -1000;
  let lastY = -1000;
  let lastTime = 0;

  // Harmonious palette matching Neon Pink & Obsidian theme
  const HEART_COLORS = [
    '#ff2d75', // Neon hot pink
    '#ff5c93', // Luminous glow pink
    '#e91e63', // Neon magenta
    '#ffd27d', // Champagne gold
    '#ff85a2', // Soft pastel pink
    '#ffffff', // Sparkle white
  ];

  class TrailHeart {
    constructor(x, y) {
      // Tiny randomized offset around cursor for organic spray
      this.x = x + (Math.random() - 0.5) * 6;
      this.y = y + (Math.random() - 0.5) * 6;
      this.size = 5 + Math.random() * 5.5; // Small, delicate hearts (5px - 10.5px)
      this.color = HEART_COLORS[Math.floor(Math.random() * HEART_COLORS.length)];
      this.alpha = 0.95;
      this.decay = 0.022 + Math.random() * 0.012; // Lifespan approx 30-45 frames (~0.5 - 0.75s)
      this.vx = (Math.random() - 0.5) * 0.7;
      this.vy = -0.5 - Math.random() * 0.8; // Gentle upward drift
      this.angle = (Math.random() - 0.5) * 0.4; // Subtle tilt
      this.spin = (Math.random() - 0.5) * 0.025;
      this.scale = 0.5;
    }

    update() {
      this.x += this.vx;
      this.y += this.vy;
      this.angle += this.spin;
      if (this.scale < 1) {
        this.scale += 0.2;
        if (this.scale > 1) this.scale = 1;
      }
      this.alpha -= this.decay;
    }

    draw() {
      if (this.alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, this.alpha);
      ctx.translate(this.x, this.y);
      ctx.rotate(this.angle);
      ctx.scale(this.scale, this.scale);

      // Symmetrical smooth bezier heart centered on origin
      ctx.beginPath();
      const s = this.size;
      const topH = s * 0.28;
      ctx.moveTo(0, topH);
      ctx.bezierCurveTo(0, 0, -s * 0.55, 0, -s * 0.55, topH);
      ctx.bezierCurveTo(-s * 0.55, (s + topH) * 0.55, 0, s, 0, s * 1.25);
      ctx.bezierCurveTo(0, s, s * 0.55, (s + topH) * 0.55, s * 0.55, topH);
      ctx.bezierCurveTo(s * 0.55, 0, 0, 0, 0, topH);
      ctx.fillStyle = this.color;
      ctx.shadowBlur = 6;
      ctx.shadowColor = this.color;
      ctx.fill();

      ctx.restore();
    }
  }

  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    if (canvas) {
      canvas.width = width;
      canvas.height = height;
    }
  }

  function loop() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    for (let i = hearts.length - 1; i >= 0; i--) {
      const h = hearts[i];
      h.update();
      h.draw();
      if (h.alpha <= 0) {
        hearts.splice(i, 1);
      }
    }

    if (hearts.length > 0) {
      animId = requestAnimationFrame(loop);
    } else {
      isRunning = false;
      animId = null;
    }
  }

  function startLoop() {
    if (!isRunning) {
      isRunning = true;
      animId = requestAnimationFrame(loop);
    }
  }

  function spawn(x, y, count = 1) {
    if (STATE.prefersReducedMotion) return;
    for (let i = 0; i < count; i++) {
      if (hearts.length < 60) {
        hearts.push(new TrailHeart(x, y));
      }
    }
    startLoop();
  }

  function onPointerMove(e) {
    // Only desktop screens with fine pointer (mouse / trackpad)
    if (e.pointerType && e.pointerType !== 'mouse') return;
    if (window.innerWidth < 768) return;

    const now = performance.now();
    const dx = e.clientX - lastX;
    const dy = e.clientY - lastY;
    const dist = Math.hypot(dx, dy);

    // Spawn when cursor moves enough distance (> 10px) or timed interval
    if (dist > 10 || (now - lastTime > 40 && dist > 3)) {
      lastX = e.clientX;
      lastY = e.clientY;
      lastTime = now;
      spawn(e.clientX, e.clientY, 1);
    }
  }

  function onPointerDown(e) {
    if (e.pointerType && e.pointerType !== 'mouse') return;
    if (window.innerWidth < 768) return;
    // Extra micro-burst of 3 small fading hearts on click for delightful tactile feedback
    spawn(e.clientX, e.clientY, 3);
  }

  return {
    init() {
      canvas = DOM.cursorCanvas || document.getElementById('cursor-trail-canvas');
      if (!canvas) return;

      const isFinePointer = window.matchMedia('(pointer: fine)').matches;
      if (!isFinePointer || STATE.prefersReducedMotion) return;

      ctx = canvas.getContext('2d');
      resize();

      window.addEventListener('resize', resize, { passive: true });
      window.addEventListener('pointermove', onPointerMove, { passive: true });
      window.addEventListener('pointerdown', onPointerDown, { passive: true });
    },
    spawn,
  };
})();

/* ==================================================
   9. OPTIONAL BACKGROUND MUSIC SYSTEM (WITH SYNTH FALLBACK)
   ================================================== */
const MusicSystem = (function () {
  let audioCtx = null;
  let synthTimer = null;
  let isSynthPlaying = false;

  // Lullaby melody note frequencies for soft music box (C Major / A Minor emotional progression)
  const MELODY_FREQS = [
    523.25, 659.25, 783.99, 1046.5, // C5, E5, G5, C6
    587.33, 698.46, 880.0, 1174.66, // D5, F5, A5, D6
    440.0, 523.25, 659.25, 880.0,   // A4, C5, E5, A5
    392.0, 493.88, 587.33, 783.99,  // G4, B4, D5, G5
  ];

  /**
   * Play a single music box chime using Web Audio API
   */
  function playChime(freq, timeOffset = 0) {
    if (!audioCtx || audioCtx.state === 'suspended') return;

    const now = audioCtx.currentTime + timeOffset;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, now);

    // Warm envelope with fast attack and gentle bell-like decay
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.08, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 1.6);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start(now);
    osc.stop(now + 1.7);
  }

  /**
   * Start soft music box lullaby loop
   */
  function startSynthLoop() {
    if (isSynthPlaying) return;
    isSynthPlaying = true;

    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) {
        audioCtx = new AudioContextClass();
      }
    }

    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    let noteIdx = 0;
    function playNextNote() {
      if (!isSynthPlaying || !audioCtx) return;
      const freq = MELODY_FREQS[noteIdx % MELODY_FREQS.length];
      playChime(freq, 0);
      noteIdx++;
      synthTimer = setTimeout(playNextNote, 420);
    }

    playNextNote();
  }

  /**
   * Stop music box loop
   */
  function stopSynthLoop() {
    isSynthPlaying = false;
    if (synthTimer) {
      clearTimeout(synthTimer);
      synthTimer = null;
    }
  }

  return {
    toggle() {
      if (STATE.musicEnabled) {
        this.stop();
      } else {
        this.play();
      }
    },

    play() {
      STATE.musicEnabled = true;
      STATE.musicInitialized = true;
      DOM.musicBtn.classList.add('playing');
      DOM.musicIcon.textContent = '🔊';

      // 1. Try to play standard audio element
      DOM.bgAudio.volume = 0.28;
      const playPromise = DOM.bgAudio.play();

      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // If file does not exist (404 placeholder) or blocked, fallback to gentle synth
          startSynthLoop();
        });
      }
    },

    stop() {
      STATE.musicEnabled = false;
      DOM.musicBtn.classList.remove('playing');
      DOM.musicIcon.textContent = '🔇';
      DOM.bgAudio.pause();
      stopSynthLoop();
    },

    playCurtainChime() {
      if (!audioCtx) {
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
          audioCtx = new AudioContextClass();
        }
      }
      if (!audioCtx) return;
      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      // Majestic ascending chime arpeggio: C5, E5, G5, C6, E6
      const fanfare = [523.25, 659.25, 783.99, 1046.50, 1318.51];
      fanfare.forEach((freq, idx) => {
        playChime(freq, idx * 0.11);
      });
    },
  };
})();

// Global alias for sound effects
window.SoundController = MusicSystem;

/**
 * Automatically attempt starting music after the first user action
 */
function attemptStartMusic() {
  if (!STATE.musicInitialized && !STATE.musicEnabled) {
    MusicSystem.play();
  }
}

/* ==================================================
   10. ACCESSIBILITY & EVENT LISTENERS
   ================================================== */
function setupEventListeners() {
  // 1. Password Mini-Game Events
  DOM.passwordForm.addEventListener('submit', (e) => {
    e.preventDefault();
    handlePasswordSubmit();
  });

  DOM.submitPasswordBtn.addEventListener('click', handlePasswordSubmit);

  DOM.passwordInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handlePasswordSubmit();
    }
  });

  DOM.togglePasswordBtn.addEventListener('click', togglePasswordVisibility);
  DOM.hintToggleBtn.addEventListener('click', toggleHint);

  // Filter input to accept only numbers
  DOM.passwordInput.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/[^0-9]/g, '');
  });

  // 2. Gift Selection Events
  DOM.giftCards.forEach((card) => {
    card.addEventListener('click', () => {
      const giftId = parseInt(card.dataset.giftId, 10);
      handleGiftClick(giftId);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const giftId = parseInt(card.dataset.giftId, 10);
        handleGiftClick(giftId);
      }
    });
  });

  // 3. Message Scene Action
  DOM.finalSurpriseBtn.addEventListener('click', () => {
    switchScene(4);
  });

  // 4. Grand Celebration Actions
  DOM.cakeArea.addEventListener('click', handleCakeInteraction);
  DOM.cakeArea.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      handleCakeInteraction();
    }
  });

  DOM.replayFireworksBtn.addEventListener('click', startCelebrationClimax);
  DOM.restartJourneyBtn.addEventListener('click', restartJourney);

  // 5. Memory Gallery & Lightbox Actions
  if (DOM.openGalleryBtn) {
    DOM.openGalleryBtn.addEventListener('click', openMemoryGallery);
  }
  if (DOM.closeGalleryBtn) {
    DOM.closeGalleryBtn.addEventListener('click', closeMemoryGallery);
  }
  if (DOM.galleryBackdrop) {
    DOM.galleryBackdrop.addEventListener('click', closeMemoryGallery);
  }
  if (DOM.lightboxCloseBtn) {
    DOM.lightboxCloseBtn.addEventListener('click', closeLightbox);
  }
  if (DOM.lightboxBackdrop) {
    DOM.lightboxBackdrop.addEventListener('click', closeLightbox);
  }

  // Gallery cards click & keyboard navigation (with arrow keys and focus announcements)
  DOM.galleryCards.forEach((card) => {
    card.addEventListener('click', (e) => {
      // Don't open lightbox if user clicked the like button
      const target = e.target;
      if (target && target.closest && target.closest('.gallery-like-btn')) return;
      openLightbox(card);
    });

    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(card);
        return;
      }
      handleGalleryCardKeyDown(e, card);
    });

    card.addEventListener('focus', () => {
      DOM.galleryCards.forEach((c) => c.classList.remove('keyboard-focused'));
      card.classList.add('keyboard-focused');
      announceGalleryCard(card, true);
    });

    card.addEventListener('blur', () => {
      card.classList.remove('keyboard-focused');
    });
  });

  // Gallery card like button interaction
  DOM.galleryLikeBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      handleGalleryLike(btn, e);
    });
  });

  // Global Escape key dismiss
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (STATE.isLightboxOpen) {
        closeLightbox();
      } else if (STATE.isGalleryOpen) {
        closeMemoryGallery();
      }
    }
  });

  // 6. Music Button Control
  DOM.musicBtn.addEventListener('click', () => {
    MusicSystem.toggle();
  });

  // Optional: Global gentle click to resume audio context if paused
  document.addEventListener(
    'pointerdown',
    () => {
      if (!STATE.musicInitialized) {
        // Prepare audio on user interaction
        attemptStartMusic();
      }
    },
    { once: true }
  );
}

/* ==================================================
   INITIALIZATION ON DOM LOAD
   ================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize atmospheric scene 1 theme on body & particles canvas
  document.body.setAttribute('data-scene', '1');
  if (DOM.canvas) {
    DOM.canvas.classList.remove('canvas-scene-1', 'canvas-scene-2', 'canvas-scene-3', 'canvas-scene-4');
    DOM.canvas.classList.add('canvas-scene-1');
  }

  // Initialize lightweight particle engine
  ParticleEngine.init();

  // Initialize desktop mouse-tracking cursor heart trail
  CursorHeartTrail.init();

  // Detect current date & display personalized 'Bugun sizning kuningiz!' header message if birthday matches
  BirthdayDetector.init();

  // Setup all event listeners & keyboard bindings
  setupEventListeners();

  // Focus password input for immediate interaction
  setTimeout(() => {
    if (DOM.passwordInput) {
      DOM.passwordInput.focus();
    }
  }, 400);
});
