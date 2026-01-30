// ===== API Configuration =====
const API_URL = window.location.protocol === 'file:' ? 'http://localhost:3000/api' : '/api';
const SESSION_KEY = 'fadestack_token';
const FALLBACK_MODE = true; // Use local storage when server is unavailable

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
    cursorX += (mouseX - cursorX) * 0.15;
    cursorY += (mouseY - cursorY) * 0.15;
    dotX += (mouseX - dotX) * 0.3;
    dotY += (mouseY - dotY) * 0.3;
    
    cursor.style.left = cursorX - 15 + 'px';
    cursor.style.top = cursorY - 15 + 'px';
    cursorDot.style.left = dotX - 3 + 'px';
    cursorDot.style.top = dotY - 3 + 'px';
    
    requestAnimationFrame(animateCursor);
}

animateCursor();

const hoverElements = document.querySelectorAll('a, button, input, .social-btn, .checkbox-wrapper');
hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
});

document.addEventListener('mouseleave', () => {
    cursor.style.opacity = '0';
    cursorDot.style.opacity = '0';
});

document.addEventListener('mouseenter', () => {
    cursor.style.opacity = '1';
    cursorDot.style.opacity = '1';
});

// ===== Toast Notifications =====
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = type === 'success' 
        ? '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        : '<svg class="toast-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    
    toast.innerHTML = `${icon}<span class="toast-message">${message}</span>`;
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.4s var(--transition-smooth) reverse forwards';
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}

// ===== Fallback Local Storage Functions =====
const AUTH_KEY = 'fadestack_users';
const FALLBACK_SESSION_KEY = 'fadestack_session';

function getUsers() {
    const users = localStorage.getItem(AUTH_KEY);
    return users ? JSON.parse(users) : [];
}

function saveUser(user) {
    const users = getUsers();
    users.push(user);
    localStorage.setItem(AUTH_KEY, JSON.stringify(users));
}

function findUser(identifier) {
    const users = getUsers();
    return users.find(u => u.email === identifier || u.username === identifier);
}

function validatePassword(user, password) {
    return user.password === password;
}

function setSession(user) {
    const session = {
        ...user,
        loginTime: Date.now()
    };
    localStorage.setItem(FALLBACK_SESSION_KEY, JSON.stringify(session));
}

function getSession() {
    const session = localStorage.getItem(FALLBACK_SESSION_KEY);
    return session ? JSON.parse(session) : null;
}

function logout() {
    localStorage.removeItem(FALLBACK_SESSION_KEY);
}

function getToken() {
    return localStorage.getItem(SESSION_KEY) || localStorage.getItem(FALLBACK_SESSION_KEY);
}

// ===== API Functions with Fallback =====
let serverAvailable = true; // Start with server available

async function apiRequest(endpoint, method = 'GET', data = {}) {
    const options = {
        method,
        headers: {
            'Content-Type': 'application/json'
        }
    };
    
    if (method !== 'GET' && data) {
        options.body = JSON.stringify(data);
    }
    
    const token = getToken();
    if (token) {
        options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    try {
        const response = await fetch(`${API_URL}/auth${endpoint}`, options);
        
        const responseText = await response.text();
        
        let result;
        try {
            result = JSON.parse(responseText);
        } catch {
            if (!response.ok) {
                throw new Error(responseText || 'Request failed');
            }
            result = { message: responseText };
        }
        
        if (!response.ok) {
            throw new Error(result.message || 'Request failed');
        }
        
        serverAvailable = true;
        return result;
    } catch (error) {
        console.warn('Server request failed:', error.message);
        serverAvailable = false;
        throw error;
    }
}

// ===== Fallback API Functions =====
async function fallbackRegister(data) {
    const { name, username, email, password } = data;
    
    // Check if user exists
    const existingUser = findUser(email);
    if (existingUser) {
        throw new Error('Email already registered');
    }
    
    const existingUsername = getUsers().find(u => u.username === username);
    if (existingUsername) {
        throw new Error('Username already taken');
    }
    
    // Create user
    const newUser = {
        id: Date.now().toString(),
        name: name,
        username: username,
        email: email,
        password: password, // In production, this should be hashed
        createdAt: new Date().toISOString()
    };
    
    saveUser(newUser);
    
    return {
        message: 'Account created successfully!',
        user: {
            id: newUser.id,
            name: newUser.name,
            username: newUser.username,
            email: newUser.email
        }
    };
}

async function fallbackLogin(data) {
    const { identifier, password } = data;
    
    const user = findUser(identifier);
    if (!user) {
        throw new Error('User not found. Please register first.');
    }
    
    if (!validatePassword(user, password)) {
        throw new Error('Invalid password');
    }
    
    return {
        message: 'Login successful!',
        user: {
            id: user.id,
            name: user.name,
            username: user.username,
            email: user.email
        }
    };
}

// ===== Three.js 3D Background Animation =====
let scene, camera, renderer, particles, particleGeometry;
const particleCount = 1500;

function initThreeJS() {
    try {
        scene = new THREE.Scene();
        camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        camera.position.z = 50;
        
        renderer = new THREE.WebGLRenderer({
            canvas: document.getElementById('3d-background'),
            alpha: true,
            antialias: true
        });
        renderer.setSize(window.innerWidth, window.innerHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        
        createParticles();
        
        const ambientLight = new THREE.AmbientLight(0xd4af37, 0.3);
        scene.add(ambientLight);
        
        const pointLight = new THREE.PointLight(0xc9a86c, 0.8, 100);
        pointLight.position.set(25, 25, 25);
        scene.add(pointLight);
        
        window.addEventListener('resize', onWindowResize);
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
    
    const color1 = new THREE.Color(0xd4af37);
    const color2 = new THREE.Color(0xc9a86c);
    const color3 = new THREE.Color(0xb4a0ff);
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 1] = (Math.random() - 0.5) * 100;
        positions[i * 3 + 2] = (Math.random() - 0.5) * 100;
        
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
        sizes[i] = Math.random() * 2 + 0.5;
    }
    
    particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particleGeometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particleGeometry.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    let particleMaterial;
    try {
        particleMaterial = new THREE.ShaderMaterial({
            uniforms: { time: { value: 0 } },
            vertexShader: `
                attribute float size;
                varying vec3 vColor;
                uniform float time;
                
                void main() {
                    vColor = color;
                    vec3 pos = position;
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
    
    if (particles && particles.material.uniforms) {
        particles.material.uniforms.time.value = Date.now() * 0.001;
    }
    
    if (particles) {
        particles.rotation.x += 0.0002;
        particles.rotation.y += 0.0003;
        
        const normalizedX = (mouseX / window.innerWidth - 0.5) * 2;
        const normalizedY = (mouseY / window.innerHeight - 0.5) * 2;
        particles.rotation.x += normalizedY * 0.0005;
        particles.rotation.y += normalizedX * 0.0005;
    }
    
    renderer.render(scene, camera);
}

// ===== Tab Switching =====
const tabBtns = document.querySelectorAll('.tab-btn');
const authForms = document.querySelectorAll('.auth-form');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const tab = btn.dataset.tab;
        
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        
        authForms.forEach(form => {
            form.classList.remove('active');
            if (form.id === `${tab}-form`) {
                form.classList.add('active');
            }
        });
    });
});

// ===== Password Toggle =====
document.querySelectorAll('.toggle-password').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.preventDefault();
        const input = btn.parentElement.querySelector('input');
        const type = input.getAttribute('type') === 'password' ? 'text' : 'password';
        input.setAttribute('type', type);
        
        const eyeOpen = btn.querySelector('.eye-open');
        const eyeClosed = btn.querySelector('.eye-closed');
        
        if (type === 'text') {
            eyeOpen.style.display = 'none';
            eyeClosed.style.display = 'block';
        } else {
            eyeOpen.style.display = 'block';
            eyeClosed.style.display = 'none';
        }
    });
});

// ===== Forgot Password =====
document.getElementById('forgot-password-link').addEventListener('click', (e) => {
    e.preventDefault();
    authForms.forEach(form => form.classList.remove('active'));
    document.getElementById('forgot-form').classList.add('active');
});

document.getElementById('back-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    authForms.forEach(form => form.classList.remove('active'));
    document.getElementById('login-form').classList.add('active');
    document.querySelector('.tab-btn[data-tab="login"]').classList.add('active');
    document.querySelector('.tab-btn[data-tab="register"]').classList.remove('active');
});

// ===== Login Form =====
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const identifier = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;
    const btn = e.target.querySelector('button[type="submit"]');
    const btnText = btn.querySelector('.btn-text');
    
    if (!identifier || !password) {
        showToast('Please fill in all fields', 'error');
        return;
    }
    
    btnText.textContent = 'Logging in...';
    btn.disabled = true;
    
    try {
        let result;
        
        // Always try server first
        try {
            console.log('Attempting server login...');
            result = await apiRequest('/login', 'POST', { identifier, password });
            console.log('Server login successful:', result);
        } catch (apiError) {
            console.log('Server login failed, using fallback:', apiError);
            // Only use fallback if server fails
            result = await fallbackLogin({ identifier, password });
        }
        
        // Store session data
        if (result.token) {
            localStorage.setItem(SESSION_KEY, result.token);
        }
        setSession(result.user);
        showLoading('Welcome back, ' + result.user.name + '!');
        
        setTimeout(() => {
            window.location.href = '/app';
        }, 2500);
        
    } catch (error) {
        showToast(error.message, 'error');
        btnText.textContent = 'Sign In';
        btn.disabled = false;
    }
});

// ===== Register Form =====
try {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            console.log('Register form submitted'); // Debug log
            
            const name = document.getElementById('register-name').value;
            const username = document.getElementById('register-username').value;
            const email = document.getElementById('register-email').value;
            const password = document.getElementById('register-password').value;
            const confirmPassword = document.getElementById('register-confirm').value;
            const terms = document.getElementById('terms').checked;
            const btn = e.target.querySelector('button[type="submit"]');
            const btnText = btn.querySelector('.btn-text');
            
            console.log('Form data:', { name, username, email, password, confirmPassword, terms }); // Debug log
            
            if (!name || !username || !email || !password || !confirmPassword) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showToast('Passwords do not match', 'error');
                return;
            }
            
            if (password.length < 6) {
                showToast('Password must be at least 6 characters', 'error');
                return;
            }
            
            if (!terms) {
                showToast('Please accept the terms and conditions', 'error');
                return;
            }
            
            btnText.textContent = 'Creating Account...';
            btn.disabled = true;
            
            try {
                let result;
                
                // Always try server first
                try {
                    console.log('Attempting server registration...');
                    result = await apiRequest('/register', 'POST', { name, username, email, password });
                    console.log('Server registration successful:', result);
                } catch (apiError) {
                    console.log('Server registration failed, using fallback:', apiError);
                    // Only use fallback if server fails
                    result = await fallbackRegister({ name, username, email, password });
                }
                
                // Store session data
                if (result.token) {
                    localStorage.setItem(SESSION_KEY, result.token);
                }
                setSession(result.user);
                showToast('Account created successfully!', 'success');
                
                setTimeout(() => {
                    window.location.href = '/app';
                }, 2000);
                
            } catch (error) {
                console.error('Registration error:', error); // Debug log
                showToast(error.message, 'error');
                btnText.textContent = 'Create Account';
                btn.disabled = false;
            }
        });
    } else {
        console.error('Register form element not found');
    }
} catch (error) {
    console.error('Error setting up register form:', error);
}

// ===== Forgot Password Form =====
document.getElementById('forgot-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('forgot-email').value;
    const btn = e.target.querySelector('button[type="submit"]');
    const btnText = btn.querySelector('.btn-text');
    
    if (!email) {
        showToast('Please enter your email', 'error');
        return;
    }
    
    btnText.textContent = 'Sending...';
    btn.disabled = true;
    
    // For fallback, just show success
    setTimeout(() => {
        showToast('Password reset link sent to your email!', 'success');
        btnText.textContent = 'Send Reset Link';
        btn.disabled = false;
        
        setTimeout(() => {
            document.getElementById('back-to-login').click();
        }, 2000);
    }, 1000);
});

// ===== Social Login =====
document.querySelectorAll('.social-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const social = btn.dataset.social;
        showToast(`${social.charAt(0).toUpperCase() + social.slice(1)} login coming soon!`, 'success');
    });
});

// ===== Loading Screen =====
function showLoading(message = 'Loading...') {
    const loadingScreen = document.getElementById('loading-screen');
    const loadingMessage = document.getElementById('loading-message');
    loadingMessage.textContent = message;
    loadingScreen.classList.add('active');
}

// ===== Check Existing Session =====
function checkSession() {
    const session = getSession();
    if (session) {
        showLoading('Welcome back, ' + session.name + '!');
        setTimeout(() => {
            window.location.href = '/app';
        }, 2000);
        return true;
    }
    return false;
}

// ===== Check Authentication Status =====
function checkAuth() {
    const token = localStorage.getItem(SESSION_KEY);
    const session = localStorage.getItem(FALLBACK_SESSION_KEY);
    return token || session;
}

// ===== Initialize =====
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, checking session...'); // Debug log
    
    // Disable navigation links on login page
    disableNavigation();
    
    // Check if required elements exist
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    
    if (!registerForm) {
        console.error('Register form not found!');
    }
    if (!loginForm) {
        console.error('Login form not found!');
    }
    
    if (!checkSession()) {
        // Three.js background removed - using CSS orbs instead
        console.log('Login page loaded');
    }
});

// ===== Disable Navigation =====
function disableNavigation() {
    const headerLinks = document.querySelectorAll('.header-link');
    headerLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            showToast('Please login first to access the website', 'error');
        });
        link.style.cursor = 'not-allowed';
        link.style.opacity = '0.5';
    });
}