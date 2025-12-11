/**
 * Smile House Cleaning - Main JavaScript
 * Handles navigation, animations, testimonial slider, and form submission
 */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all modules
    initNavigation();
    initStickyHeader();
    initSmoothScroll();
    initTestimonialSlider();
    initContactForm();
    initScrollAnimations();
});

/**
 * Mobile Navigation
 */
function initNavigation() {
    const navToggle = document.getElementById('nav-toggle');
    const navClose = document.getElementById('nav-close');
    const navMenu = document.getElementById('nav-menu');
    const navLinks = document.querySelectorAll('.nav__link');

    // Create overlay element
    const overlay = document.createElement('div');
    overlay.className = 'nav-overlay';
    document.body.appendChild(overlay);

    function openMenu() {
        navMenu.classList.add('active');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeMenu() {
        navMenu.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    if (navToggle) {
        navToggle.addEventListener('click', openMenu);
    }

    if (navClose) {
        navClose.addEventListener('click', closeMenu);
    }

    overlay.addEventListener('click', closeMenu);

    // Close menu when clicking nav links
    navLinks.forEach(link => {
        link.addEventListener('click', closeMenu);
    });

    // Close menu on escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeMenu();
        }
    });
}

/**
 * Sticky Header with Background
 */
function initStickyHeader() {
    const header = document.getElementById('header');
    const scrollThreshold = 100;

    function handleScroll() {
        if (window.scrollY > scrollThreshold) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Check initial state
}

/**
 * Smooth Scroll for Navigation Links
 */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');

    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');

            if (href === '#') return;

            const target = document.querySelector(href);

            if (target) {
                e.preventDefault();

                const headerHeight = document.getElementById('header').offsetHeight;
                const targetPosition = target.getBoundingClientRect().top + window.pageYOffset - headerHeight;

                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Testimonial Slider
 */
function initTestimonialSlider() {
    const track = document.getElementById('testimonials-track');
    const prevBtn = document.getElementById('testimonial-prev');
    const nextBtn = document.getElementById('testimonial-next');
    const dotsContainer = document.getElementById('testimonial-dots');

    if (!track) return;

    const slides = track.querySelectorAll('.testimonial-card');
    const dots = dotsContainer.querySelectorAll('.testimonials__dot');
    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoplayInterval;

    function goToSlide(index) {
        if (index < 0) index = totalSlides - 1;
        if (index >= totalSlides) index = 0;

        currentIndex = index;
        track.style.transform = `translateX(-${currentIndex * 100}%)`;

        // Update dots
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === currentIndex);
        });
    }

    function nextSlide() {
        goToSlide(currentIndex + 1);
    }

    function prevSlide() {
        goToSlide(currentIndex - 1);
    }

    function startAutoplay() {
        autoplayInterval = setInterval(nextSlide, 5000);
    }

    function stopAutoplay() {
        clearInterval(autoplayInterval);
    }

    // Event listeners
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            prevSlide();
            stopAutoplay();
            startAutoplay();
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            nextSlide();
            stopAutoplay();
            startAutoplay();
        });
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            goToSlide(index);
            stopAutoplay();
            startAutoplay();
        });
    });

    // Touch support for mobile
    let touchStartX = 0;
    let touchEndX = 0;

    track.addEventListener('touchstart', (e) => {
        touchStartX = e.changedTouches[0].screenX;
        stopAutoplay();
    }, { passive: true });

    track.addEventListener('touchend', (e) => {
        touchEndX = e.changedTouches[0].screenX;
        handleSwipe();
        startAutoplay();
    }, { passive: true });

    function handleSwipe() {
        const swipeThreshold = 50;
        const diff = touchStartX - touchEndX;

        if (Math.abs(diff) > swipeThreshold) {
            if (diff > 0) {
                nextSlide();
            } else {
                prevSlide();
            }
        }
    }

    // Start autoplay
    startAutoplay();

    // Pause on hover
    track.addEventListener('mouseenter', stopAutoplay);
    track.addEventListener('mouseleave', startAutoplay);
}

/**
 * Contact Form Handler with Resend Integration
 */
function initContactForm() {
    const form = document.getElementById('contact-form');
    const messageDiv = document.getElementById('form-message');

    if (!form) return;

    form.addEventListener('submit', async function(e) {
        e.preventDefault();

        // Check honeypot (spam protection)
        const honeypot = form.querySelector('input[name="_honeypot"]');
        if (honeypot && honeypot.value) {
            return; // Bot detected
        }

        const submitBtn = form.querySelector('.contact-form__submit');
        const originalBtnText = submitBtn.innerHTML;

        // Get form data
        const formData = new FormData(form);
        const data = {
            name: formData.get('name'),
            email: formData.get('email'),
            phone: formData.get('phone'),
            service: formData.get('service'),
            address: formData.get('address'),
            message: formData.get('message')
        };

        // Validate required fields
        if (!data.name || !data.phone) {
            showMessage('error', 'Please fill in all required fields.');
            return;
        }

        // Validate email if provided
        if (data.email && !isValidEmail(data.email)) {
            showMessage('error', 'Please enter a valid email address.');
            return;
        }

        // Show loading state
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // Send to Resend API endpoint
            // Note: You'll need to create a serverless function or API endpoint
            // to handle the Resend API call securely (API key shouldn't be exposed in frontend)
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    from: 'noreply@mail.acksites.com',
                    subject: `New Quote Request from ${data.name}`,
                    replyTo: data.email || null,
                    html: generateEmailHTML(data)
                })
            });

            if (response.ok) {
                showMessage('success', 'Thank you! Your quote request has been sent. We\'ll get back to you within 24 hours.');
                form.reset();
            } else {
                throw new Error('Failed to send message');
            }
        } catch (error) {
            console.error('Form submission error:', error);
            showMessage('error', 'Sorry, there was an error sending your message. Please try calling us directly or try again later.');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
            submitBtn.innerHTML = originalBtnText;
        }
    });

    function showMessage(type, text) {
        messageDiv.className = `contact-form__message ${type}`;
        messageDiv.textContent = text;
        messageDiv.style.display = 'block';

        // Scroll to message
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

        // Hide after 10 seconds for success messages
        if (type === 'success') {
            setTimeout(() => {
                messageDiv.style.display = 'none';
            }, 10000);
        }
    }

    function isValidEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    function generateEmailHTML(data) {
        return `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <div style="background-color: #6AAFC7; padding: 20px; text-align: center;">
                    <h1 style="color: white; margin: 0;">New Quote Request</h1>
                    <p style="color: white; margin: 10px 0 0; opacity: 0.9;">Lima Cleaning Service</p>
                </div>
                <div style="padding: 30px; background-color: #f7f4ef;">
                    <h2 style="color: #1A365D; margin-top: 0;">Contact Information</h2>
                    <table style="width: 100%; border-collapse: collapse;">
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Name:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${escapeHtml(data.name)}</td>
                        </tr>
                        ${data.email ? `<tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Email:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><a href="mailto:${escapeHtml(data.email)}">${escapeHtml(data.email)}</a></td>
                        </tr>` : ''}
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Phone:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><a href="tel:${escapeHtml(data.phone)}">${escapeHtml(data.phone)}</a></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Service Type:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${escapeHtml(data.service || 'Not specified')}</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;"><strong>Property Address:</strong></td>
                            <td style="padding: 10px 0; border-bottom: 1px solid #e5e7eb;">${escapeHtml(data.address || 'Not provided')}</td>
                        </tr>
                    </table>

                    ${data.message ? `
                        <h2 style="color: #1A365D; margin-top: 30px;">Message</h2>
                        <div style="background-color: white; padding: 20px; border-radius: 8px;">
                            <p style="margin: 0; white-space: pre-wrap;">${escapeHtml(data.message)}</p>
                        </div>
                    ` : ''}
                </div>
                <div style="background-color: #2D3748; padding: 20px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.7); margin: 0; font-size: 14px;">
                        This message was sent from the Lima Cleaning Service website.
                    </p>
                </div>
            </div>
        `;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

/**
 * Scroll Animations (Intersection Observer)
 */
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.service-card, .why-us__card, .about__content, .about__image');

    // Add fade-in class to elements
    animatedElements.forEach(el => {
        el.classList.add('fade-in');
    });

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

/**
 * Utility: Debounce function for scroll events
 */
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}
