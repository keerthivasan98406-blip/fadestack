// ===== Authentication Configuration =====
const SESSION_KEY = 'fadestack_token';
const FALLBACK_SESSION_KEY = 'fadestack_session';

// Check authentication status
function checkAuth() {
    const token = localStorage.getItem(SESSION_KEY);
    const session = localStorage.getItem(FALLBACK_SESSION_KEY);
    return token || session;
}

// Get user data from session
function getUserData() {
    const session = localStorage.getItem(FALLBACK_SESSION_KEY);
    if (session) {
        try {
            return JSON.parse(session);
        } catch (e) {
            return null;
        }
    }
    return null;
}

// Redirect to login if not authenticated
function requireAuth() {
    if (!checkAuth()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// Logout function
function logout() {
    localStorage.removeItem(SESSION_KEY);
    localStorage.removeItem(FALLBACK_SESSION_KEY);
    window.location.href = 'login.html';
}

// ===== Custom Cursor =====
const cursor = document.querySelector('.cursor');
const cursorDot = document.querySelector('.cursor-dot');

let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;
let dotX = 0;
let dotY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
});

function animateCursor() {
    // Smooth cursor movement
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    dotX += (mouseX - dotX) * 0.3;
    dotY += (mouseY - dotY) * 0.3;
    
    cursor.style.left = cursorX - 10 + 'px';
    cursor.style.top = cursorY - 10 + 'px';
    cursorDot.style.left = dotX - 2 + 'px';
    cursorDot.style.top = dotY - 2 + 'px';
    
    requestAnimationFrame(animateCursor);
}

animateCursor();

// Cursor hover effect
const hoverElements = document.querySelectorAll('a, button, .service-card, .skill-category');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

// Hide cursor on mouse leave
document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorDot.style.opacity = '1';
});

// ===== Three.js 3D Background Animation =====
let scene, camera, renderer, particles, particleGeometry;
const particleCount = 2000;

function initThreeJS() {
    try {
        // Scene setup
        scene = new THREE.Scene();
        
        // Camera setup
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;
        
        // Renderer setup
        renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('3d-background'),
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        // Create particles
        createParticles();
        
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xd4af37, 0.3);
        scene.add(ambientLight);
        
        // Add point light
        const pointLight = new THREE.PointLight(0xc9a86c, 0.8, 100);
        pointLight.position.set(25, 25, 25);
        scene.add(pointLight);
        
        // Handle window resize
        window.addEventListener('resize', onWindowResize);
        
        // Start animation
        animate();
    } catch (error) {
        console.warn('Three.js initialization failed:', error);
        // Hide the canvas if Three.js fails
        const canvas = document.getElementById('3d-background');
        if (canvas) canvas.style.display = 'none';
    }
}

function createParticles() {
    particleGeometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color1 = new THREE.Color(0xd4af37); // Gold
    const color2 = new THREE.Color(0xc9a86c); // Copper
    const color3 = new THREE.Color(0xb4a0ff); // Lavender
    
    for (let i = 0; i < particleCount; i++) {
        // Position
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
        // Color - mix between colors
        const mixedColor = color1.clone();
        const ratio = Math.random();
        if (ratio < 0.33) {
            mixedColor.lerp(color2, Math.random());
        } else {
            mixedColor.lerp(color3, Math.random());
        }
        
        colors[i * 3] = mixedColor.r;
        colors[i * 3 + 1] = mixedColor.g;
        colors[i * 3 + 2] = mixedColor.b;
        
        // Size
        sizes[i] = Math.random() * 2 + 0.5;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    // Shader material for particles
    let particleMaterial;
    try {
        particleMaterial = new THREE.ShaderMaterial({
            uniforms: {
                time: { value: 0 }
            },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec3 pos = position;
                    
                    // Add wave effect
                    pos.x += sin(time * 0.5 + pos.y * 0.1) * 0.5;
                    pos.y += cos(time * 0.3 + pos.x * 0.1) * 0.5;
                    
                    vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
                    gl_PointSize = size * (300.0 / -mvPosition.z);
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                varying vec3 vColor;
                
                void main() {
                    float dist = length(gl_PointCoord - vec2(0.5));
                    if (dist > 0.5) discard;
                    
                    float alpha = 1.0 - smoothstep(0.3, 0.5, dist);
                    gl_FragColor = vec4(vColor, alpha * 0.8);
                }
            `,
            transparent: true,
            vertexColors: true,
            blending: THREE.AdditiveBlending
        });
    } catch (error) {
        console.warn('Shader compilation failed, using fallback material:', error);
        // Fallback to basic point material
        particleMaterial = new THREE.PointsMaterial({
            size: 2,
            vertexColors: true,
            transparent: true,
            opacity: 0.8,
            blending: THREE.AdditiveBlending
        });
    }
    
    particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
    requestAnimationFrame(animate);
    
    // Update time uniform
    if (particles && particles.material.uniforms) {
        particles.material.uniforms.time.value = Date.now() * 0.001;
    }
    
    // Rotate particles slowly
    if (particles) {
        particles.rotation.x += 0.0002;
        particles.rotation.y += 0.0003;
    }
    
    // Mouse interaction with particles
    if (particles) {
        const normalizedX = (mouseX / window.innerWidth - 0.5) * 2;
        const normalizedY = (mouseY / window.innerHeight - 0.5) * 2;
        particles.rotation.x += normalizedY * 0.0005;
        particles.rotation.y += normalizedX * 0.0005;
    }
    
    renderer.render(scene, camera);
}

// ===== Navigation =====
function setupNavigation() {
    const navbar = document.querySelector('.navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const mobileMenu = document.querySelector('.mobile-menu');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-links a');
    
    // Scroll effect for navbar
    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        // Update active nav link based on scroll position
        updateActiveNavLink();
    });
    
    // Nav link click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                targetSection.scrollIntoView({ behavior: 'smooth' });
            }
            
            // Close mobile menu if open
            mobileMenu.classList.remove('active');
        });
    });
    
    // Mobile nav link click handlers
    mobileNavLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
        });
    });
    
    // Mobile menu toggle
    const navToggle = document.querySelector('.nav-toggle');
    navToggle.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navToggle.classList.toggle('active');
    });
}

function updateActiveNavLink() {
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    let currentSection = '';
    
    sections.forEach(section => {
        const sectionTop = section.offsetTop - 100;
        const sectionHeight = section.offsetHeight;
        
        if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
            currentSection = section.getAttribute('id');
        }
    });
    
    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href') === `#${currentSection}`) {
            link.classList.add('active');
        }
    });
}

// ===== Counter Animation =====
function setupCounters() {
    const counters = document.querySelectorAll('.stat-number');
    
    const observerOptions = {
        threshold: 0.5,
        rootMargin: '0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = parseInt(counter.getAttribute('data-count'));
                animateCounter(counter, target);
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
}

function animateCounter(element, target) {
    const duration = 2000;
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // Easing function
        const easeOutQuart = 1 - Math.pow(1 - progress, 4);
        
        const current = Math.floor(start + (target - start) * easeOutQuart);
        element.textContent = current;
        
        if (progress < 1) {
            requestAnimationFrame(update);
        } else {
            element.textContent = target;
        }
    }
    
    requestAnimationFrame(update);
}

// ===== Scroll Animations =====
function setupScrollAnimations() {
    const fadeElements = document.querySelectorAll('.service-card, .skill-category, .contact-item');
    
    fadeElements.forEach(el => el.classList.add('fade-in'));
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });
    
    fadeElements.forEach(el => observer.observe(el));
}

// ===== Form Handling =====
function setupForm() {
    const form = document.getElementById('contact-form');
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Get form data
        const formData = new FormData(form);
        const data = Object.fromEntries(formData);
        
        // Simulate form submission
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        submitBtn.innerHTML = `
            <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                <circle cx="12" cy="12" r="10" stroke-dasharray="60" stroke-dashoffset="20"/>
            </svg>
            Sending...
        `;
        
        // Add spin animation
        const style = document.createElement('style');
        style.textContent = '@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }';
        document.head.appendChild(style);
        
        setTimeout(() => {
            submitBtn.innerHTML = `
                <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 6L9 17l-5-5"/>
                </svg>
                Message Sent!
            `;
            submitBtn.style.background = 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)';
            
            // Reset form
            form.reset();
            
            // Reset button after 3 seconds
            setTimeout(() => {
                submitBtn.innerHTML = originalText;
                submitBtn.style.background = '';
            }, 3000);
        }, 1500);
    });
}

// ===== Smooth Scroll for Anchor Links =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// ===== Initialize Everything =====
document.addEventListener('DOMContentLoaded', () => {
    // Check authentication first
    if (!requireAuth()) {
        return; // Stop initialization if not authenticated
    }
    
    // Initialize page components only if authenticated
    setupNavigation();
    setupCounters();
    setupScrollAnimations();
    setupForm();
    setupUserSession();
});

// ===== Parallax Effect for Hero =====
window.addEventListener('scroll', () => {
    const scrolled = window.pageYOffset;
    const heroVisual = document.querySelector('.hero-visual');
    
    if (heroVisual && scrolled < window.innerHeight) {
        heroVisual.style.transform = `translateY(${scrolled * 0.3}px)`;
        heroVisual.style.opacity = 1 - scrolled / window.innerHeight;
    }
});

// ===== User Session Management =====
function setupUserSession() {
    const session = getUserData();
    const navUser = document.getElementById('nav-user');
    
    if (session && navUser) {
        // User is logged in - show user menu
        const userInitials = document.getElementById('user-initials');
        const userName = document.getElementById('user-name');
        const userEmail = document.getElementById('user-email');
        const userAvatar = document.getElementById('user-avatar');
        const userDropdown = document.getElementById('user-dropdown');
        
        // Set user info
        userInitials.textContent = getInitials(session.name);
        userName.textContent = session.name;
        userEmail.textContent = session.email;
        
        // Show user menu
        navUser.style.display = 'flex';
        
        // Toggle dropdown
        userAvatar.addEventListener('click', () => {
            userDropdown.classList.toggle('active');
        });
        
        // Close dropdown when clicking outside
        document.addEventListener('click', (e) => {
            if (!userAvatar.contains(e.target) && !userDropdown.contains(e.target)) {
                userDropdown.classList.remove('active');
            }
        });
        
        // Logout functionality
        document.getElementById('logout-btn').addEventListener('click', logout);
    }
}

function getInitials(name) {
    return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
}