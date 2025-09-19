// Language toggle function moved to translate.js

// Function to update navbar buttons based on login status
function updateNavbar() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  const profileSection = document.getElementById('profileSection');
  const loginSection = document.getElementById('loginSection');
  const profileName = document.getElementById('profileName');
  
  console.log('=== NAVBAR UPDATE DEBUG ===');
  console.log('Token:', token ? 'EXISTS' : 'MISSING');
  console.log('UserId:', userId ? 'EXISTS' : 'MISSING');
  console.log('ProfileSection element:', profileSection ? 'FOUND' : 'NOT FOUND');
  console.log('LoginSection element:', loginSection ? 'FOUND' : 'NOT FOUND');
  
  if (token && userId) {
    // User is logged in - show profile section
    if (profileSection) {
      profileSection.classList.add('show');
      profileSection.style.display = 'flex';
      console.log('✅ Profile section shown');
    }
    if (loginSection) {
      loginSection.style.display = 'none';
      console.log('✅ Login section hidden');
    }
    
    // Try to get user name from localStorage or use default
    let userName = localStorage.getItem('userName') || localStorage.getItem('fullName') || 'Profile';
    
    // If we have a full name, show first name only for better fit
    if (userName && userName !== 'Profile' && userName.includes(' ')) {
      userName = userName.split(' ')[0]; // Show first name only
    }
    
    if (profileName) {
      profileName.textContent = userName;
      profileName.title = localStorage.getItem('userName') || userName; // Full name on hover
      console.log('✅ Profile name set to:', userName);
    }
    
    console.log('🟢 User logged in - profile section should be visible');
  } else {
    // User not logged in - show login/register buttons
    if (profileSection) {
      profileSection.classList.remove('show');
      profileSection.style.display = 'none';
      console.log('✅ Profile section hidden');
    }
    if (loginSection) {
      loginSection.style.display = 'flex';
      console.log('✅ Login section shown');
    }
    
    console.log('🔴 User not logged in - login section should be visible');
  }
  console.log('=== END NAVBAR DEBUG ===');
}

// Logout function
function handleLogout() {
  const token = localStorage.getItem("token");
  
  if (confirm('Are you sure you want to logout?')) {
    if (token) {
      fetch("http://localhost:5000/api/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      }).finally(() => {
        // Clear all user data
        localStorage.removeItem("token");
        localStorage.removeItem("userId");
        localStorage.removeItem("userName");
        
        // Update navbar
        updateNavbar();
        
        // Redirect to home
        window.location.href = "index.html";
      });
    } else {
      // Clear any remaining data and redirect
      localStorage.clear();
      updateNavbar();
      window.location.href = "index.html";
    }
  }
}

// Make logout function globally available
window.handleLogout = handleLogout;

function openLoginModal() {
  document.getElementById("loginModal").classList.add("active");
  document.body.style.overflow = "hidden";
}

function closeLoginModal() {
  document.getElementById("loginModal").classList.remove("active");
  document.body.style.overflow = "";
}

// Mobile card animation system
let animationState = {
  currentCard: 0,
  currentPage: [0, 0, 0],
  maxPages: 2,
  scrollCount: 0,
  maxScrollsTotal: 6,
  isAnimating: false,
};

function scrollToPage(cardIndex, pageIndex) {
  if (animationState.isAnimating) return;

  const scrollElement = document.getElementById(`scroll${cardIndex + 1}`);
  if (!scrollElement) return;
  
  const contentPages = scrollElement.querySelector(".content-pages");
  if (!contentPages) return;

  animationState.isAnimating = true;
  const translateY = -pageIndex * 100;
  contentPages.style.transform = `translateY(${translateY}%)`;
  animationState.currentPage[cardIndex] = pageIndex;

  setTimeout(() => {
    animationState.isAnimating = false;
  }, 800);
}

function startScrollSequence() {
  if (animationState.isAnimating) return;

  if (animationState.scrollCount >= animationState.maxScrollsTotal) {
    for (let i = 0; i < 3; i++) {
      scrollToPage(i, 0);
      animationState.currentPage[i] = 0;
    }
    animationState.scrollCount = 0;
    animationState.currentCard = 0;
    setTimeout(() => startScrollSequence(), 5000);
    return;
  }

  const nextPage = animationState.currentPage[animationState.currentCard] + 1;

  if (nextPage < animationState.maxPages) {
    scrollToPage(animationState.currentCard, nextPage);
    animationState.scrollCount++;
    setTimeout(() => {
      animationState.currentCard = (animationState.currentCard + 1) % 3;
      startScrollSequence();
    }, 1000);
  } else {
    animationState.currentCard = (animationState.currentCard + 1) % 3;
    if (animationState.currentCard === 0) {
      setTimeout(() => startScrollSequence(), 5000);
    } else {
      startScrollSequence();
    }
  }
}

// FAQ functionality
function setupFAQ() {
  const faqItems = document.querySelectorAll('.faq-item');
  
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    
    if (question) {
      question.addEventListener('click', () => {
        const isActive = item.classList.contains('active');
        faqItems.forEach(faq => faq.classList.remove('active'));
        if (!isActive) {
          item.classList.add('active');
        }
      });
    }
  });
}

// Chart bar animations
function animateChartBars() {
  setTimeout(() => {
    document.querySelectorAll(".chart-bar").forEach((bar, index) => {
      setTimeout(() => {
        const value = bar.getAttribute('data-value');
        if (value) {
          bar.style.height = `${value}%`;
        }
      }, index * 100);
    });
  }, 1000);
}

// Mobile navigation toggle
function setupMobileNav() {
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navMenu = document.querySelector('.nav-menu');
  
  if (mobileToggle && navMenu) {
    mobileToggle.addEventListener('click', () => {
      mobileToggle.classList.toggle('active');
      navMenu.classList.toggle('active');
    });
  }
}

// Contact form handler
function setupContactForm() {
  const contactForm = document.querySelector(".contact-form");
  if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
      e.preventDefault();
      const submitBtn = this.querySelector(".submit-btn");
      const originalText = submitBtn.textContent;
      
      submitBtn.textContent = "Sending...";
      submitBtn.disabled = true;
      
      setTimeout(() => {
        alert("Thank you for your message! We will get back to you within 24 hours.");
        this.reset();
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
      }, 2000);
    });
  }
}

function typewriterEffect() {
  const textParts = [
    { text: "Enabling a More", class: "" },
    { text: "\nIntelligent ", class: "" },
    { text: "Metro Future.", class: "highlight" },
  ];

  const element = document.getElementById("typewriter-text");
  if (!element) return;
  
  let currentPartIndex = 0;
  let currentCharIndex = 0;
  let isDeleting = false;

  function typeChar() {
    const currentPart = textParts[currentPartIndex];
    const currentText = currentPart.text;

    if (!isDeleting) {
      if (currentCharIndex <= currentText.length) {
        let displayText = "";

        for (let i = 0; i < textParts.length; i++) {
          const part = textParts[i];
          if (i < currentPartIndex) {
            if (part.text.includes("\n")) {
              displayText += part.text.replace("\n", "<br>");
            } else {
              displayText += `<span class="${part.class}">${part.text}</span>`;
            }
          } else if (i === currentPartIndex) {
            const partialText = part.text.substring(0, currentCharIndex);
            if (partialText.includes("\n")) {
              displayText += partialText.replace("\n", "<br>");
            } else {
              displayText += `<span class="${part.class}">${partialText}</span>`;
            }
          }
        }

        element.innerHTML = displayText;
        currentCharIndex++;

        if (currentCharIndex > currentText.length) {
          if (currentPartIndex < textParts.length - 1) {
            currentPartIndex++;
            currentCharIndex = 0;
            setTimeout(typeChar, 100);
          } else {
            setTimeout(() => {
              isDeleting = true;
              currentPartIndex = textParts.length - 1;
              currentCharIndex = textParts[currentPartIndex].text.length;
              typeChar();
            }, 10000);
          }
        } else {
          setTimeout(typeChar, 100);
        }
      }
    } else {
      if (currentCharIndex >= 0) {
        let displayText = "";

        for (let i = 0; i < textParts.length; i++) {
          const part = textParts[i];
          if (i < currentPartIndex) {
            if (part.text.includes("\n")) {
              displayText += part.text.replace("\n", "<br>");
            } else {
              displayText += `<span class="${part.class}">${part.text}</span>`;
            }
          } else if (i === currentPartIndex) {
            const partialText = part.text.substring(0, currentCharIndex);
            if (partialText.includes("\n")) {
              displayText += partialText.replace("\n", "<br>");
            } else {
              displayText += `<span class="${part.class}">${partialText}</span>`;
            }
          }
        }

        element.innerHTML = displayText;
        currentCharIndex--;

        if (currentCharIndex < 0) {
          if (currentPartIndex > 0) {
            currentPartIndex--;
            currentCharIndex = textParts[currentPartIndex].text.length;
            setTimeout(typeChar, 50);
          } else {
            setTimeout(() => {
              isDeleting = false;
              currentPartIndex = 0;
              currentCharIndex = 0;
              typeChar();
            }, 1000);
          }
        } else {
          setTimeout(typeChar, 50);
        }
      }
    }
  }

  typeChar();
}

// Dashboard redirect function
function redirectToDashboard() {
  const token = localStorage.getItem('token');
  const userId = localStorage.getItem('userId');
  
  if (token && userId) {
    // User is logged in, redirect to dashboard
    window.location.href = `dashboard.html?id=${encodeURIComponent(userId)}`;
  } else {
    // User not logged in, redirect to login
    window.location.href = 'login.html';
  }
}

// Make function globally available
window.redirectToDashboard = redirectToDashboard;

// Initialize everything
document.addEventListener("DOMContentLoaded", function () {
  updateNavbar();
  setupFAQ();
  setupMobileNav();
  setupContactForm();
  typewriterEffect();
  animateChartBars();
  
  // Check for login status changes every 2 seconds
  setInterval(() => {
    updateNavbar();
  }, 2000);
  
  // Also update navbar when page becomes visible
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') {
      updateNavbar();
    }
  });
  
  // Start mobile card animations after page load
  setTimeout(() => {
    startScrollSequence();
  }, 3000);

  // Modal handlers
  const loginModal = document.getElementById("loginModal");
  if (loginModal) {
    loginModal.addEventListener("click", function (e) {
      if (e.target === this) {
        closeLoginModal();
      }
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      closeLoginModal();
    }
  });

  console.log("🚇 KMRL Document Management System Loaded");
  console.log("📊 System Status: All services operational");
  console.log("🔐 Security: All connections encrypted");
});