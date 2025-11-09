// Smooth scroll behavior
document.documentElement.style.scrollBehavior = 'smooth';

let lastScrollY = window.scrollY;
let scrollDirection = 'down';

function trackScrollDirection() {
    const currentScrollY = window.scrollY;

    if (currentScrollY > lastScrollY) {
        scrollDirection = 'down';
    } else if (currentScrollY < lastScrollY) {
        scrollDirection = 'up';
    }

    lastScrollY = currentScrollY;
}

window.addEventListener('scroll', trackScrollDirection, { passive: true });

// Intersection Observer for fade-in animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const directionClass = scrollDirection === 'up' ? 'from-right' : 'from-left';
            entry.target.classList.remove('from-left', 'from-right');
            entry.target.classList.add(directionClass);
            entry.target.classList.add('visible');
        } else {
            entry.target.classList.remove('visible');
        }
    });
}, observerOptions);

// Scroll spy for active navigation
function updateActiveNav() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const scrollPos = window.scrollY + 100;

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.offsetHeight;
        const sectionId = section.getAttribute('id');

        if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
            navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${sectionId}`) {
                    link.classList.add('active');
                }
            });
        }
    });
}

// Project filtering functionality
function initProjectFilter() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const projectCards = document.querySelectorAll('.project-card');
    const searchInput = document.getElementById('searchInput');

    // Filter by tag
    filterButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            filterButtons.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            filterProjects(filter, searchInput.value);
        });
    });

    // Search functionality
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', function() {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                const activeFilter = document.querySelector('.filter-btn.active');
                const filter = activeFilter ? activeFilter.getAttribute('data-filter') : 'all';
                filterProjects(filter, this.value);
            }, 300);
        });
    }
}

function filterProjects(tagFilter, searchQuery) {
    const projectCards = document.querySelectorAll('.project-card');
    const query = searchQuery.toLowerCase().trim();

    projectCards.forEach(card => {
        const tags = card.getAttribute('data-tags') || '';
        const title = card.querySelector('h3').textContent.toLowerCase();
        const description = card.querySelector('p').textContent.toLowerCase();
        const cardText = title + ' ' + description;

        const matchesTag = tagFilter === 'all' || tags.includes(tagFilter);
        const matchesSearch = !query || cardText.includes(query);

        if (matchesTag && matchesSearch) {
            card.classList.remove('hidden');
        } else {
            card.classList.add('hidden');
        }
    });
}

// Contact form validation and submission
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formSuccess = document.getElementById('formSuccess');

    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const name = document.getElementById('name');
        const email = document.getElementById('email');
        const message = document.getElementById('message');
        
        let isValid = true;

        // Validate name
        if (!name.value.trim()) {
            name.closest('.form-group').classList.add('error');
            isValid = false;
        } else {
            name.closest('.form-group').classList.remove('error');
        }

        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email.value.trim() || !emailRegex.test(email.value)) {
            email.closest('.form-group').classList.add('error');
            isValid = false;
        } else {
            email.closest('.form-group').classList.remove('error');
        }

        // Validate message
        if (!message.value.trim()) {
            message.closest('.form-group').classList.add('error');
            isValid = false;
        } else {
            message.closest('.form-group').classList.remove('error');
        }

        if (isValid) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Sending...';

            // Simulate form submission (replace with actual API call)
            setTimeout(() => {
                formSuccess.classList.add('visible');
                form.reset();
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
                
                // Scroll to success message
                formSuccess.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                
                // Hide success message after 5 seconds
                setTimeout(() => {
                    formSuccess.classList.remove('visible');
                }, 5000);
            }, 1000);
        }
    });

    // Real-time validation
    const inputs = form.querySelectorAll('input, textarea');
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        input.addEventListener('input', function() {
            if (this.closest('.form-group').classList.contains('error')) {
                validateField(this);
            }
        });
    });
}

function validateField(field) {
    const formGroup = field.closest('.form-group');
    
    if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!field.value.trim() || !emailRegex.test(field.value)) {
            formGroup.classList.add('error');
        } else {
            formGroup.classList.remove('error');
        }
    } else {
        if (!field.value.trim()) {
            formGroup.classList.add('error');
        } else {
            formGroup.classList.remove('error');
        }
    }
}

// Enhanced mobile menu
function initMobileMenu() {
    const mobileMenuToggle = document.getElementById('mobileMenuToggle');
    const navLinks = document.getElementById('navLinks');
    
    if (mobileMenuToggle && navLinks) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinks.classList.toggle('active');
            this.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const links = navLinks.querySelectorAll('a');
        links.forEach(link => {
            link.addEventListener('click', function() {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', function(event) {
            if (!navLinks.contains(event.target) && !mobileMenuToggle.contains(event.target)) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });

        // Close menu on escape key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && navLinks.classList.contains('active')) {
                navLinks.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
    }
}

// Theme toggle functionality
function initThemeToggle() {
    const themeToggle = document.getElementById('themeToggle');
    const html = document.documentElement;
    
    // Get saved theme or default to light
    const savedTheme = localStorage.getItem('theme') || 'light';
    html.setAttribute('data-theme', savedTheme);
    
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            const currentTheme = html.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            html.setAttribute('data-theme', newTheme);
            localStorage.setItem('theme', newTheme);
        });
    }
}

// Initialize everything
document.addEventListener('DOMContentLoaded', function() {
    // Initialize theme first
    initThemeToggle();
    
    // Observe fade-in elements
    document.querySelectorAll('.fade-in').forEach(el => observer.observe(el));
    
    // Handle profile picture loading error
    const profilePicture = document.getElementById('profilePicture');
    if (profilePicture) {
        profilePicture.addEventListener('error', function() {
            this.style.display = 'none';
        });
    }

    // Initialize features
    initMobileMenu();
    initProjectFilter();
    initContactForm();

    // Scroll spy
    window.addEventListener('scroll', updateActiveNav);
    updateActiveNav(); // Initial call

    // Smooth scrolling for anchor links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                e.preventDefault();
                const target = document.querySelector(href);
                if (target) {
                    const offset = 80; // Account for sticky nav
                    const targetPosition = target.offsetTop - offset;
                    window.scrollTo({
                        top: targetPosition,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});

