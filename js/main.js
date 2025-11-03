/**
 * Main Application Script
 * Initializes the gallery and handles global functionality
 */

import { MetadataProcessor } from './metadata.js';
import { Gallery } from './gallery.js';

// Global variables
let metadataProcessor;
let gallery;

/**
 * Initialize mobile navigation functionality
 */
function initMobileNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');
    const navItems = document.querySelectorAll('.nav-item');
    
    if (!navToggle || !navMenu) {
        console.log('Mobile navigation elements not found');
        return;
    }
    
    // Toggle mobile menu
    navToggle.addEventListener('click', () => {
        const isActive = navToggle.classList.contains('active');
        
        if (isActive) {
            // Close menu
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        } else {
            // Open menu
            navToggle.classList.add('active');
            navMenu.classList.add('active');
            navToggle.setAttribute('aria-expanded', 'true');
        }
    });
    
    // Close menu when clicking on nav items
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        });
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
        if (!navToggle.contains(e.target) && !navMenu.contains(e.target)) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Close menu on window resize to larger screen
    window.addEventListener('resize', () => {
        if (window.innerWidth > 768) {
            navToggle.classList.remove('active');
            navMenu.classList.remove('active');
            navToggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    console.log('✅ Mobile navigation initialized');
}

/**
 * Log complete rendering state for debugging
 */
function logRenderingState() {
    console.log('🔍 COMPLETE RENDERING STATE DIAGNOSTIC:');
    console.log('=====================================');
    
    const container = document.getElementById('gallery-container');
    const collectionsContainer = document.querySelector('.collections-container');
    const allImages = document.querySelectorAll('img');
    
    console.log('📦 Container State:', {
        containerExists: !!container,
        containerDimensions: container ? { width: container.offsetWidth, height: container.offsetHeight } : null,
        collectionsContainerExists: !!collectionsContainer,
        collectionsContainerDimensions: collectionsContainer ? { width: collectionsContainer.offsetWidth, height: collectionsContainer.offsetHeight } : null
    });
    
    console.log('🖼️ Image Analysis:', {
        totalImages: allImages.length,
        imageDetails: Array.from(allImages).map((img, index) => ({
            index,
            src: img.src.split('/').pop(),
            dimensions: {
                natural: { width: img.naturalWidth, height: img.naturalHeight },
                display: { width: img.offsetWidth, height: img.offsetHeight },
                computed: { width: getComputedStyle(img).width, height: getComputedStyle(img).height }
            },
            styles: {
                transform: img.style.transform || getComputedStyle(img).transform,
                scale: img.style.scale || getComputedStyle(img).scale,
                objectFit: getComputedStyle(img).objectFit,
                maxWidth: getComputedStyle(img).maxWidth,
                maxHeight: getComputedStyle(img).maxHeight
            },
            parent: img.parentElement?.className || 'unknown',
            loaded: img.complete && img.naturalHeight !== 0
        }))
    });
    
    console.log('🎭 Collection Rows:', Array.from(document.querySelectorAll('.collection-row')).map(row => ({
        id: row.dataset.collectionId,
        height: row.style.getPropertyValue('--collection-height'),
        actualHeight: row.offsetHeight,
        artworkCount: row.querySelectorAll('.collection-artwork').length
    })));
    
    // Check for any suspicious styling
    const suspiciousImages = Array.from(allImages).filter(img => {
        const computedStyle = getComputedStyle(img);
        return computedStyle.transform !== 'none' || 
               img.offsetWidth > img.parentElement?.offsetWidth ||
               img.offsetHeight > 500; // Arbitrary large height threshold
    });
    
    if (suspiciousImages.length > 0) {
        console.warn('⚠️ SUSPICIOUS IMAGES DETECTED:', suspiciousImages.map(img => ({
            src: img.src.split('/').pop(),
            transform: getComputedStyle(img).transform,
            dimensions: { width: img.offsetWidth, height: img.offsetHeight },
            parentDimensions: { width: img.parentElement?.offsetWidth, height: img.parentElement?.offsetHeight }
        })));
    } else {
        console.log('✅ All images appear normal');
    }
}

/**
 * Aggressive image state reset - run immediately on page load
 * Only targets gallery images, NEVER touches artwork detail images
 */
function forceResetAllImages() {
    // Only target images that are specifically in gallery containers
    const galleryImages = document.querySelectorAll(
        '.collections-container .collection-artwork img, .collections-container .single-collection-artwork img, .collections-container .gallery-item img'
    );
    
    // Explicitly exclude artwork detail images
    const artworkDetailImages = document.querySelectorAll(
        '.artwork-detail img, .image-viewport img, #artwork-image, .artwork-image'
    );
    
    console.log(`🎯 Target: ${galleryImages.length} gallery images, Protecting: ${artworkDetailImages.length} artwork detail images`);
    
    galleryImages.forEach((img, index) => {
        // Only reset if it's NOT an artwork detail image
        let isArtworkDetail = false;
        artworkDetailImages.forEach(detailImg => {
            if (detailImg === img) isArtworkDetail = true;
        });
        
        if (isArtworkDetail) {
            console.log(`🛡️ Skipping artwork detail image: ${img.src.split('/').pop()}`);
            return;
        }
        
        // Remove all transform-related styles aggressively for gallery images only
        img.style.cssText = '';
        img.removeAttribute('style');
        
        // Force specific properties that prevent blown up images
        img.style.setProperty('transform', 'none', 'important');
        img.style.setProperty('transition', 'none', 'important');
        img.style.setProperty('will-change', 'auto', 'important');
        img.style.setProperty('scale', 'none', 'important');
        img.style.setProperty('zoom', 'normal', 'important');
        img.style.setProperty('width', '100%', 'important');
        img.style.setProperty('height', '100%', 'important');
        img.style.setProperty('object-fit', 'contain', 'important');
        img.style.setProperty('object-position', 'center', 'important');
        img.style.setProperty('max-width', '100%', 'important');
        img.style.setProperty('max-height', '100%', 'important');
        img.style.setProperty('min-width', 'auto', 'important');
        img.style.setProperty('min-height', 'auto', 'important');
        
        // Force reflow
        img.offsetHeight;
        
        console.log(`🔧 Reset gallery image ${index + 1}: ${img.src.split('/').pop()}`);
    });
    
    // Also reset parent containers but only gallery ones
    const galleryContainers = document.querySelectorAll('.collections-container .collection-artwork');
    galleryContainers.forEach((container, index) => {
        // Reset any potential sizing issues on containers
        if (container.offsetWidth > 400) { // If suspiciously wide
            container.style.setProperty('width', 'auto', 'important');
            container.style.setProperty('max-width', '300px', 'important');
            container.style.setProperty('min-width', '150px', 'important');
            console.log(`🔧 Reset container ${index + 1} width from ${container.offsetWidth}px`);
        }
    });
    
    // Remove any persisting viewport classes but only from gallery (not artwork detail)
    document.querySelectorAll('.collections-container .image-viewport').forEach(viewport => {
        viewport.classList.remove('dragging');
        viewport.removeAttribute('data-zoom');
        viewport.style.cssText = '';
    });
    
    console.log(`🔄 Selective reset completed: ${galleryImages.length} gallery images, ${artworkDetailImages.length} artwork detail images protected`);
}

// Run image reset as early as possible
document.addEventListener('DOMContentLoaded', forceResetAllImages);
window.addEventListener('load', forceResetAllImages);
window.addEventListener('pageshow', forceResetAllImages);

// Set up mutation observer to reset any newly added gallery images only
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === 1) { // Element node
                // Only reset gallery images, not artwork detail images
                const galleryImages = [];
                
                // Check if the node is inside a gallery container
                if (node.tagName === 'IMG' && node.closest('.collections-container')) {
                    // Ensure it's not an artwork detail image
                    if (!node.closest('.artwork-detail, .image-viewport') && !node.id.includes('artwork-image')) {
                        galleryImages.push(node);
                    }
                } else if (node.querySelectorAll) {
                    const foundImages = node.querySelectorAll('.collections-container .collection-artwork img, .collections-container .single-collection-artwork img, .collections-container .gallery-item img');
                    // Filter out any artwork detail images
                    foundImages.forEach(img => {
                        if (!img.closest('.artwork-detail, .image-viewport') && !img.id.includes('artwork-image')) {
                            galleryImages.push(img);
                        }
                    });
                }
                
                galleryImages.forEach(img => {
                    img.style.cssText = '';
                    img.style.transform = 'none';
                    img.style.transition = 'none';
                    img.style.willChange = 'auto';
                    img.style.scale = 'none';
                    img.style.zoom = 'normal';
                    console.log(`🔄 Reset newly added gallery image: ${img.src.split('/').pop()}`);
                });
            }
        });
    });
});

// Start observing
if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
} else {
    document.addEventListener('DOMContentLoaded', () => {
        observer.observe(document.body, { childList: true, subtree: true });
    });
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialize mobile navigation
        initMobileNavigation();
        
        // Initialize metadata processor
        metadataProcessor = new MetadataProcessor();
        
        // Initialize gallery
        gallery = new Gallery('gallery-container', metadataProcessor);
        
        // Load and display the gallery
        await gallery.initialize();
        
        // Hide loading state
        hideLoadingState();
        
        // Add diagnostic function to check rendering state
        setTimeout(() => {
            logRenderingState();
            // Run an additional aggressive reset after rendering
            forceResetAllImages();
        }, 1000);
        
        // Additional safety reset after a longer delay
        setTimeout(() => {
            console.log('🛡️ Running final safety reset...');
            forceResetAllImages();
        }, 2000);
        
        console.log('Art portfolio initialized successfully');
    } catch (error) {
        console.error('Error initializing art portfolio:', error);
        showErrorState();
    }
});

// Handle page visibility changes (browser back/forward navigation)
document.addEventListener('visibilitychange', function() {
    if (!document.hidden && gallery) {
        // Reset any cached image states when page becomes visible
        setTimeout(() => {
            gallery.resetImageStates();
        }, 100);
    }
});

// Handle page focus (when user returns to tab)
window.addEventListener('focus', function() {
    if (gallery) {
        setTimeout(() => {
            gallery.resetImageStates();
        }, 100);
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