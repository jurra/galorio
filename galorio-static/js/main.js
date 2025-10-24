/**
 * Main Application Script
 * Initializes the gallery and handles global functionality
 */

import { MetadataProcessor } from './metadata.js';
import { Gallery } from './gallery.js';

// Global variables
let metadataProcessor;
let gallery;

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialize metadata processor
        metadataProcessor = new MetadataProcessor();
        
        // Initialize gallery
        gallery = new Gallery('gallery-container', metadataProcessor);
        
        // Load and display the gallery
        await gallery.initialize();
        
        // Hide loading state
        hideLoadingState();
        
        console.log('Art portfolio initialized successfully');
    } catch (error) {
        console.error('Error initializing art portfolio:', error);
        showErrorState();
    }
});

/**
 * Hide the loading state
 */
function hideLoadingState() {
    const loadingState = document.querySelector('.loading-state');
    if (loadingState) {
        loadingState.style.display = 'none';
    }
}

/**
 * Show error state
 */
function showErrorState() {
    const container = document.getElementById('gallery-container');
    if (container) {
        container.innerHTML = `
            <div class="error-state">
                <h3>Unable to load portfolio</h3>
                <p>Please check that your artwork files and metadata are properly configured.</p>
                <button onclick="location.reload()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

/**
 * Handle responsive navigation
 */
function setupResponsiveNav() {
    const nav = document.querySelector('.nav');
    const searchContainer = document.querySelector('.search-container');
    
    // Toggle search visibility on mobile
    if (window.innerWidth <= 768) {
        searchContainer.classList.add('mobile-hidden');
        
        // Add search toggle button
        const searchToggle = document.createElement('button');
        searchToggle.className = 'search-toggle';
        searchToggle.innerHTML = `
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.35-4.35"></path>
            </svg>
        `;
        searchToggle.addEventListener('click', () => {
            searchContainer.classList.toggle('mobile-hidden');
        });
        
        nav.insertBefore(searchToggle, searchContainer);
    }
}

/**
 * Handle keyboard shortcuts
 */
function setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
        // Focus search on '/' key
        if (e.key === '/' && !e.target.matches('input, textarea')) {
            e.preventDefault();
            const searchInput = document.getElementById('search-input');
            if (searchInput) {
                searchInput.focus();
            }
        }
        
        // Clear search on 'Escape' key
        if (e.key === 'Escape') {
            const searchInput = document.getElementById('search-input');
            if (searchInput && searchInput === document.activeElement) {
                searchInput.value = '';
                searchInput.blur();
                if (gallery) {
                    gallery.search('');
                }
            }
        }
    });
}

/**
 * Setup intersection observer for lazy loading
 */
function setupLazyLoading() {
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                if (img.dataset.src) {
                    img.src = img.dataset.src;
                    img.removeAttribute('data-src');
                    observer.unobserve(img);
                }
            }
        });
    });

    // Observe all images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
    });
}

/**
 * Setup smooth scrolling for anchor links
 */
function setupSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
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
}

/**
 * Analytics and tracking (optional)
 */
function setupAnalytics() {
    // Add Google Analytics or other tracking code here
    // Example:
    /*
    if (typeof gtag !== 'undefined') {
        gtag('config', 'GA_MEASUREMENT_ID');
    }
    */
}

/**
 * Performance monitoring
 */
function setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    if ('web-vital' in window) {
        // Import and use web-vitals library if available
    }
    
    // Log performance metrics
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('Page load time:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
        }, 0);
    });
}

/**
 * Initialize all features
 */
function initializeFeatures() {
    setupResponsiveNav();
    setupKeyboardShortcuts();
    setupSmoothScrolling();
    setupAnalytics();
    setupPerformanceMonitoring();
}

// Initialize features when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeFeatures);
} else {
    initializeFeatures();
}

// Handle window resize
window.addEventListener('resize', () => {
    if (gallery) {
        gallery.adjustGridLayout();
    }
});

// Export for debugging
window.portfolioApp = {
    metadataProcessor,
    gallery,
    reload: () => location.reload()
};