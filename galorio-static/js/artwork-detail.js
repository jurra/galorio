/**
 * Enhanced Artwork Detail Page Script
 * Handles zoom, carousel, mobile overlay, and interactions
 */

import { MetadataProcessor } from './metadata.js';

// Global variables
let currentArtwork = null;
let metadataProcessor = null;
let currentImages = [];
let currentImageIndex = 0;
let zoomLevel = 1;
let isDragging = false;
let dragStart = { x: 0, y: 0 };
let imageOffset = { x: 0, y: 0 };

// Initialize the artwork detail page
document.addEventListener('DOMContentLoaded', async function() {
    try {
        // Initialize metadata processor
        metadataProcessor = new MetadataProcessor();
        
        // Get artwork ID from URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const artworkId = urlParams.get('id');
        
        if (!artworkId) {
            showErrorState('No artwork ID provided');
            return;
        }
        
        // Load artwork data
        await loadArtworkData(artworkId);
        
    } catch (error) {
        console.error('Error initializing artwork detail page:', error);
        showErrorState('Failed to load artwork data');
    }
});

/**
 * Load artwork data and display it
 */
async function loadArtworkData(artworkId) {
    try {
        // Initialize metadata and get all artworks
        const allArtworks = await metadataProcessor.initialize();
        
        // Find the specific artwork and related images
        currentArtwork = metadataProcessor.getArtworkById(artworkId);
        
        if (!currentArtwork) {
            showErrorState('Artwork not found');
            return;
        }

        // Find all images for this artwork (support for multiple images)
        await findArtworkImages(artworkId);
        
        // Display the artwork
        displayArtwork(currentArtwork);
        
        // Setup all interactions
        setupInteractions();
        
        // Update SEO metadata
        updateSEOMetadata(currentArtwork);
        
        // Hide loading state
        hideLoadingState();
        
    } catch (error) {
        console.error('Error loading artwork data:', error);
        showErrorState('Failed to load artwork');
    }
}

/**
 * Find all images for an artwork (supports numbered versions)
 */
async function findArtworkImages(artworkId) {
    currentImages = [currentArtwork.imageUrl];
    
    // Check for additional numbered images
    const baseImageUrl = currentArtwork.imageUrl;
    const baseName = baseImageUrl.split('.')[0]; // Remove extension
    const extension = baseImageUrl.split('.').pop();
    
    // Try to find numbered versions (artwork_001.jpg, artwork_002.jpg, etc.)
    for (let i = 1; i <= 10; i++) {
        const numberedUrl = `${baseName}_${i.toString().padStart(3, '0')}.${extension}`;
        try {
            const response = await fetch(numberedUrl, { method: 'HEAD' });
            if (response.ok) {
                currentImages.push(numberedUrl);
            }
        } catch (error) {
            // Image doesn't exist, continue
            break;
        }
    }
    
    currentImageIndex = 0;
}

/**
 * Display artwork information with enhanced features
 */
function displayArtwork(artwork) {
    hideLoadingState();
    
    // Update page title
    document.getElementById('page-title').textContent = `${artwork.title || 'Artwork'} | Art Portfolio`;
    
    // Main image
    const artworkImage = document.getElementById('artwork-image');
    if (artworkImage) {
        artworkImage.src = currentImages[currentImageIndex];
        artworkImage.alt = artwork.title || 'Artwork';
    }
    
    // Artwork details
    updateTextContent('artwork-title', artwork.title || 'Untitled');
    updateTextContent('artwork-medium', artwork.medium || '-');
    updateTextContent('artwork-dimensions', artwork.dimensions || '-');
    updateTextContent('artwork-year', artwork.year || '-');
    updateTextContent('artwork-collection', artwork.collection || '-');
    updateTextContent('artwork-description-text', artwork.description || 'No description available.');
    updateTextContent('artwork-price', artwork.price || 'Price on request');
    
    // Availability badge
    const badgeElement = document.getElementById('availability-badge');
    if (badgeElement) {
        const isAvailable = artwork.available !== false && artwork.available !== 'false';
        badgeElement.textContent = isAvailable ? 'AVAILABLE' : 'SOLD';
        badgeElement.className = `availability-badge ${isAvailable ? 'available' : 'sold'}`;
        if (!isAvailable) {
            badgeElement.style.backgroundColor = '#ffebee';
            badgeElement.style.color = '#c62828';
        }
    }
    
    // Show carousel navigation if multiple images
    if (currentImages.length > 1) {
        setupImageCarousel();
    }
    
    // Setup mobile overlay
    setupMobileOverlay(artwork);
    
    // Show the content
    document.getElementById('artwork-content').style.display = 'block';
}

/**
 * Setup image carousel for multiple images
 */
function setupImageCarousel() {
    const imageNav = document.getElementById('image-nav');
    const thumbnailsContainer = document.getElementById('thumbnails-container');
    
    if (currentImages.length > 1) {
        // Show navigation
        if (imageNav) {
            imageNav.style.display = 'flex';
        }
        
        // Create thumbnails
        if (thumbnailsContainer) {
            thumbnailsContainer.style.display = 'block';
            const thumbnailsScroll = thumbnailsContainer.querySelector('.thumbnails-scroll');
            thumbnailsScroll.innerHTML = '';
            
            currentImages.forEach((imageUrl, index) => {
                const thumbnail = document.createElement('div');
                thumbnail.className = `thumbnail ${index === 0 ? 'active' : ''}`;
                thumbnail.innerHTML = `<img src="${imageUrl}" alt="View ${index + 1}">`;
                thumbnail.addEventListener('click', () => switchToImage(index));
                thumbnailsScroll.appendChild(thumbnail);
            });
        }
    }
}

/**
 * Switch to a specific image in the carousel
 */
function switchToImage(index) {
    if (index >= 0 && index < currentImages.length) {
        currentImageIndex = index;
        const artworkImage = document.getElementById('artwork-image');
        if (artworkImage) {
            artworkImage.src = currentImages[index];
            
            // Reset zoom when switching images
            resetZoom();
        }
        
        // Update thumbnails
        const thumbnails = document.querySelectorAll('.thumbnail');
        thumbnails.forEach((thumb, i) => {
            thumb.classList.toggle('active', i === index);
        });
    }
}

/**
 * Setup mobile details overlay
 */
function setupMobileOverlay(artwork) {
    const mobileOverlay = document.getElementById('mobile-overlay');
    if (mobileOverlay && window.innerWidth <= 768) {
        mobileOverlay.innerHTML = `
            <h1 class="artwork-title">${artwork.title || 'Untitled'}</h1>
            <p class="artwork-artist">Tamara Grand</p>
            <div class="mobile-metadata">
                <div class="mobile-metadata-item">
                    <label>Medium</label>
                    <span>${artwork.medium || '-'}</span>
                </div>
                <div class="mobile-metadata-item">
                    <label>Year</label>
                    <span>${artwork.year || '-'}</span>
                </div>
                <div class="mobile-metadata-item">
                    <label>Dimensions</label>
                    <span>${artwork.dimensions || '-'}</span>
                </div>
                <div class="mobile-metadata-item">
                    <label>Price</label>
                    <span class="mobile-price">${artwork.price || 'Price on request'}</span>
                </div>
            </div>
        `;
        mobileOverlay.style.display = 'block';
    }
}

/**
 * Setup all interactions including zoom, pan, and navigation
 */
function setupInteractions() {
    // Zoom controls
    setupZoomControls();
    
    // Image navigation
    setupImageNavigation();
    
    // Action buttons
    setupActionButtons();
    
    // Fullscreen
    setupFullscreen();
    
    // Pan and drag
    setupImagePanning();
}

/**
 * Setup zoom controls
 */
function setupZoomControls() {
    const zoomInBtn = document.getElementById('zoom-in');
    const zoomOutBtn = document.getElementById('zoom-out');
    const zoomResetBtn = document.getElementById('zoom-reset');
    
    if (zoomInBtn) {
        zoomInBtn.addEventListener('click', () => {
            zoomLevel = Math.min(zoomLevel * 1.3, 5);
            applyZoom();
        });
    }
    
    if (zoomOutBtn) {
        zoomOutBtn.addEventListener('click', () => {
            zoomLevel = Math.max(zoomLevel / 1.3, 0.5);
            applyZoom();
        });
    }
    
    if (zoomResetBtn) {
        zoomResetBtn.addEventListener('click', resetZoom);
    }
    
    // Mouse wheel zoom
    const imageViewport = document.querySelector('.image-viewport');
    if (imageViewport) {
        imageViewport.addEventListener('wheel', (e) => {
            e.preventDefault();
            const delta = e.deltaY < 0 ? 1.1 : 0.9;
            zoomLevel = Math.max(0.5, Math.min(5, zoomLevel * delta));
            applyZoom();
        });
    }
}

/**
 * Apply zoom transformation
 */
function applyZoom() {
    const artworkImage = document.getElementById('artwork-image');
    if (artworkImage) {
        artworkImage.style.transform = `scale(${zoomLevel}) translate(${imageOffset.x}px, ${imageOffset.y}px)`;
    }
}

/**
 * Reset zoom to default
 */
function resetZoom() {
    zoomLevel = 1;
    imageOffset = { x: 0, y: 0 };
    applyZoom();
}

/**
 * Setup image panning/dragging
 */
function setupImagePanning() {
    const imageViewport = document.querySelector('.image-viewport');
    const artworkImage = document.getElementById('artwork-image');
    
    if (!imageViewport || !artworkImage) return;
    
    // Mouse events
    artworkImage.addEventListener('mousedown', startDrag);
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    
    // Touch events for mobile
    artworkImage.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const touch = e.touches[0];
        startDrag({ clientX: touch.clientX, clientY: touch.clientY });
    });
    
    document.addEventListener('touchmove', (e) => {
        if (isDragging) {
            e.preventDefault();
            const touch = e.touches[0];
            drag({ clientX: touch.clientX, clientY: touch.clientY });
        }
    });
    
    document.addEventListener('touchend', endDrag);
}

function startDrag(e) {
    if (zoomLevel > 1) {
        isDragging = true;
        dragStart = { x: e.clientX - imageOffset.x, y: e.clientY - imageOffset.y };
        document.querySelector('.image-viewport').classList.add('dragging');
    }
}

function drag(e) {
    if (isDragging && zoomLevel > 1) {
        imageOffset.x = e.clientX - dragStart.x;
        imageOffset.y = e.clientY - dragStart.y;
        applyZoom();
    }
}

function endDrag() {
    isDragging = false;
    document.querySelector('.image-viewport')?.classList.remove('dragging');
}

/**
 * Setup image navigation
 */
function setupImageNavigation() {
    const prevBtn = document.getElementById('prev-image');
    const nextBtn = document.getElementById('next-image');
    
    if (prevBtn) {
        prevBtn.addEventListener('click', () => {
            const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : currentImages.length - 1;
            switchToImage(newIndex);
        });
    }
    
    if (nextBtn) {
        nextBtn.addEventListener('click', () => {
            const newIndex = currentImageIndex < currentImages.length - 1 ? currentImageIndex + 1 : 0;
            switchToImage(newIndex);
        });
    }
    
    // Keyboard navigation
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowLeft' && currentImages.length > 1) {
            const newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : currentImages.length - 1;
            switchToImage(newIndex);
        } else if (e.key === 'ArrowRight' && currentImages.length > 1) {
            const newIndex = currentImageIndex < currentImages.length - 1 ? currentImageIndex + 1 : 0;
            switchToImage(newIndex);
        }
    });
}

/**
 * Setup action buttons
 */
function setupActionButtons() {
    const inquireBtn = document.getElementById('inquire-btn');
    const purchaseBtn = document.getElementById('purchase-btn');
    const shareBtn = document.getElementById('share-btn');
    
    if (inquireBtn) {
        inquireBtn.addEventListener('click', () => {
            // Open contact modal or redirect to contact
            window.open(`mailto:contact@tamaragrand.com?subject=Inquiry about ${currentArtwork.title}&body=Hi, I'm interested in learning more about "${currentArtwork.title}".`, '_blank');
        });
    }
    
    if (purchaseBtn) {
        purchaseBtn.addEventListener('click', () => {
            // Open purchase inquiry
            window.open(`mailto:contact@tamaragrand.com?subject=Purchase Inquiry: ${currentArtwork.title}&body=Hi, I would like to purchase "${currentArtwork.title}". Please provide payment and shipping details.`, '_blank');
        });
    }
    
    if (shareBtn) {
        shareBtn.addEventListener('click', () => {
            if (navigator.share) {
                navigator.share({
                    title: currentArtwork.title,
                    text: `Check out "${currentArtwork.title}" by Tamara Grand`,
                    url: window.location.href
                });
            } else {
                // Fallback: copy to clipboard
                navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            }
        });
    }
}

/**
 * Setup fullscreen functionality
 */
function setupFullscreen() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const fullscreenModal = document.getElementById('fullscreen-modal');
    const closeFullscreen = document.getElementById('close-fullscreen');
    const fullscreenImage = document.getElementById('fullscreen-image');
    
    if (fullscreenBtn && fullscreenModal) {
        fullscreenBtn.addEventListener('click', () => {
            if (fullscreenImage) {
                fullscreenImage.src = currentImages[currentImageIndex];
            }
            fullscreenModal.classList.add('active');
        });
    }
    
    if (closeFullscreen && fullscreenModal) {
        closeFullscreen.addEventListener('click', () => {
            fullscreenModal.classList.remove('active');
        });
        
        // Close on backdrop click
        fullscreenModal.addEventListener('click', (e) => {
            if (e.target === fullscreenModal) {
                fullscreenModal.classList.remove('active');
            }
        });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && fullscreenModal?.classList.contains('active')) {
            fullscreenModal.classList.remove('active');
        }
    });
}

/**
 * Update text content of an element
 */
function updateTextContent(elementId, text) {
    const element = document.getElementById(elementId);
    if (element) {
        element.textContent = text;
    }
}

/**
 * Update SEO metadata
 */
function updateSEOMetadata(artwork) {
    // Update Open Graph tags
    const ogTitle = document.getElementById('og-title');
    const ogDescription = document.getElementById('og-description');
    const ogImage = document.getElementById('og-image');
    const ogUrl = document.getElementById('og-url');
    
    if (ogTitle) ogTitle.content = artwork.title || 'Artwork';
    if (ogDescription) ogDescription.content = artwork.description || 'View this artwork by Tamara Grand';
    if (ogImage) ogImage.content = artwork.imageUrl;
    if (ogUrl) ogUrl.content = window.location.href;
    
    // Update structured data
    const schemaScript = document.getElementById('artwork-schema');
    if (schemaScript) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "VisualArtwork",
            "name": artwork.title,
            "creator": {
                "@type": "Person",
                "name": "Tamara Grand"
            },
            "image": artwork.imageUrl,
            "description": artwork.description,
            "medium": artwork.medium,
            "dateCreated": artwork.year,
            "offers": {
                "@type": "Offer",
                "price": artwork.price,
                "availability": artwork.available ? "InStock" : "OutOfStock"
            }
        };
        schemaScript.textContent = JSON.stringify(schema);
    }
}

/**
 * Show loading state
 */
function showLoadingState() {
    const loadingState = document.getElementById('loading-state');
    const artworkContent = document.getElementById('artwork-content');
    
    if (loadingState) loadingState.style.display = 'flex';
    if (artworkContent) artworkContent.style.display = 'none';
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) loadingState.style.display = 'none';
}

/**
 * Show error state
 */
function showErrorState(message) {
    const loadingState = document.getElementById('loading-state');
    const artworkContent = document.getElementById('artwork-content');
    
    if (loadingState) loadingState.style.display = 'none';
    if (artworkContent) artworkContent.style.display = 'none';
    
    // Create error display
    const container = document.querySelector('.container');
    if (container) {
        container.innerHTML += `
            <div class="error-state">
                <h2>Unable to Load Artwork</h2>
                <p>${message}</p>
                <a href="./index.html" class="btn btn-primary">Return to Gallery</a>
            </div>
        `;
    }
}

// Handle responsive behavior
window.addEventListener('resize', () => {
    if (currentArtwork) {
        setupMobileOverlay(currentArtwork);
    }
});