/**
 * Artwork Detail Page Script
 * Handles individual artwork display, interactions, and contact forms
 */

// Global variables
let currentArtwork = null;
let metadataProcessor = null;
let relatedArtworks = [];

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
        
        // Find the specific artwork
        currentArtwork = metadataProcessor.getArtworkById(artworkId);
        
        if (!currentArtwork) {
            showErrorState('Artwork not found');
            return;
        }
        
        // Display the artwork
        displayArtwork(currentArtwork);
        
        // Load related artworks
        loadRelatedArtworks(currentArtwork, allArtworks);
        
        // Setup interactions
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
 * Display artwork information
 */
function displayArtwork(artwork) {
    // Update page title
    document.getElementById('page-title').textContent = `${artwork.title || 'Artwork'} | Art Portfolio`;
    
    // Breadcrumb
    const breadcrumbCollection = document.getElementById('breadcrumb-collection');
    const breadcrumbTitle = document.getElementById('breadcrumb-title');
    
    if (breadcrumbCollection) {
        breadcrumbCollection.textContent = artwork.collection || 'Portfolio';
    }
    
    if (breadcrumbTitle) {
        breadcrumbTitle.textContent = artwork.title || 'Untitled';
    }
    
    // Main image
    const artworkImage = document.getElementById('artwork-image');
    if (artworkImage) {
        artworkImage.src = artwork.imageUrl;
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
    
    // Availability status
    const statusElement = document.getElementById('availability-status');
    if (statusElement) {
        const isAvailable = artwork.available !== false && artwork.available !== 'false';
        statusElement.textContent = isAvailable ? 'Available' : 'Sold';
        statusElement.className = `availability-status ${isAvailable ? 'available' : 'sold'}`;
    }
    
    // Handle purchase button visibility
    const purchaseBtn = document.getElementById('purchase-btn');
    if (purchaseBtn) {
        const isAvailable = artwork.available !== false && artwork.available !== 'false';
        if (!isAvailable) {
            purchaseBtn.style.display = 'none';
        }
    }
    
    // Tags
    if (artwork.tags && artwork.tags.length > 0) {
        displayTags(artwork.tags);
    }
    
    // Show the content
    document.getElementById('artwork-content').style.display = 'block';
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
 * Display artwork tags
 */
function displayTags(tags) {
    const tagsContainer = document.getElementById('artwork-tags');
    if (!tagsContainer) return;
    
    tagsContainer.innerHTML = '';
    tags.forEach(tag => {
        const tagElement = document.createElement('span');
        tagElement.className = 'tag';
        tagElement.textContent = tag;
        tagsContainer.appendChild(tagElement);
    });
    
    tagsContainer.style.display = 'flex';
}

/**
 * Load and display related artworks
 */
function loadRelatedArtworks(artwork, allArtworks) {
    const collection = artwork.collection;
    const artworkId = artwork.id;
    
    // Find artworks from the same collection
    relatedArtworks = allArtworks
        .filter(item => item.collection === collection && item.id !== artworkId)
        .slice(0, 6); // Limit to 6 related items
    
    if (relatedArtworks.length > 0) {
        displayRelatedArtworks(relatedArtworks);
    }
}

/**
 * Display related artworks
 */
function displayRelatedArtworks(artworks) {
    const relatedSection = document.getElementById('related-section');
    const relatedGrid = document.getElementById('related-grid');
    
    if (!relatedSection || !relatedGrid) return;
    
    relatedGrid.innerHTML = '';
    
    artworks.forEach(artwork => {
        const relatedItem = createRelatedArtworkItem(artwork);
        relatedGrid.appendChild(relatedItem);
    });
    
    relatedSection.style.display = 'block';
}

/**
 * Create a related artwork item
 */
function createRelatedArtworkItem(artwork) {
    const item = document.createElement('a');
    item.className = 'related-item';
    item.href = `./artwork.html?id=${artwork.id}`;
    
    const image = document.createElement('img');
    image.src = artwork.imageUrl;
    image.alt = artwork.title || 'Artwork';
    image.loading = 'lazy';
    
    const title = document.createElement('h4');
    title.textContent = artwork.title || 'Untitled';
    
    const info = document.createElement('p');
    const infoText = [artwork.medium, artwork.year].filter(Boolean).join(' • ');
    info.textContent = infoText;
    
    item.appendChild(image);
    item.appendChild(title);
    item.appendChild(info);
    
    return item;
}

/**
 * Setup all interactions
 */
function setupInteractions() {
    setupFullscreenModal();
    setupContactModal();
    setupShareFunctionality();
    setupKeyboardNavigation();
}

/**
 * Setup fullscreen modal
 */
function setupFullscreenModal() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    const fullscreenModal = document.getElementById('fullscreen-modal');
    const fullscreenImage = document.getElementById('fullscreen-image');
    const closeFullscreen = document.getElementById('close-fullscreen');
    
    if (fullscreenBtn && fullscreenModal && fullscreenImage && closeFullscreen) {
        fullscreenBtn.addEventListener('click', () => {
            fullscreenImage.src = currentArtwork.imageUrl;
            fullscreenImage.alt = currentArtwork.title || 'Artwork';
            fullscreenModal.classList.add('active');
            document.body.style.overflow = 'hidden';
        });
        
        closeFullscreen.addEventListener('click', closeFullscreenModal);
        
        fullscreenModal.addEventListener('click', (e) => {
            if (e.target === fullscreenModal) {
                closeFullscreenModal();
            }
        });
    }
}

/**
 * Close fullscreen modal
 */
function closeFullscreenModal() {
    const fullscreenModal = document.getElementById('fullscreen-modal');
    if (fullscreenModal) {
        fullscreenModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Setup contact modal
 */
function setupContactModal() {
    const inquireBtn = document.getElementById('inquire-btn');
    const purchaseBtn = document.getElementById('purchase-btn');
    const contactModal = document.getElementById('contact-modal');
    const closeModal = document.getElementById('close-modal');
    const cancelContact = document.getElementById('cancel-contact');
    const contactForm = document.getElementById('contact-form');
    const modalTitle = document.getElementById('modal-title');
    const inquiryType = document.getElementById('inquiry-type');
    
    if (inquireBtn) {
        inquireBtn.addEventListener('click', () => {
            modalTitle.textContent = 'Inquire About Artwork';
            inquiryType.value = 'general';
            openContactModal();
        });
    }
    
    if (purchaseBtn) {
        purchaseBtn.addEventListener('click', () => {
            modalTitle.textContent = 'Purchase Artwork';
            inquiryType.value = 'purchase';
            openContactModal();
        });
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeContactModal);
    }
    
    if (cancelContact) {
        cancelContact.addEventListener('click', closeContactModal);
    }
    
    if (contactModal) {
        contactModal.addEventListener('click', (e) => {
            if (e.target === contactModal) {
                closeContactModal();
            }
        });
    }
    
    if (contactForm) {
        contactForm.addEventListener('submit', handleContactSubmission);
    }
}

/**
 * Open contact modal
 */
function openContactModal() {
    const contactModal = document.getElementById('contact-modal');
    const messageField = document.getElementById('contact-message');
    
    if (contactModal) {
        contactModal.classList.add('active');
        document.body.style.overflow = 'hidden';
        
        // Pre-fill message with artwork info
        if (messageField && currentArtwork) {
            const artworkInfo = `I'm interested in "${currentArtwork.title || 'this artwork'}"`;
            if (!messageField.value || messageField.value.includes("I'm interested in")) {
                messageField.value = artworkInfo + '\n\n';
            }
        }
    }
}

/**
 * Close contact modal
 */
function closeContactModal() {
    const contactModal = document.getElementById('contact-modal');
    if (contactModal) {
        contactModal.classList.remove('active');
        document.body.style.overflow = '';
    }
}

/**
 * Handle contact form submission
 */
function handleContactSubmission(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = Object.fromEntries(formData);
    
    // Add artwork information
    data.artworkTitle = currentArtwork?.title || 'Unknown';
    data.artworkId = currentArtwork?.id || 'Unknown';
    
    // Here you would typically send the data to your backend
    // For now, we'll show a success message and generate an email
    console.log('Contact form submission:', data);
    
    // Generate mailto link as fallback
    const subject = encodeURIComponent(`Inquiry about ${data.artworkTitle}`);
    const body = encodeURIComponent(
        `Name: ${data.name}\n` +
        `Email: ${data.email}\n` +
        `Phone: ${data.phone || 'Not provided'}\n` +
        `Inquiry Type: ${data.inquiryType}\n` +
        `Artwork: ${data.artworkTitle}\n\n` +
        `Message:\n${data.message}`
    );
    
    const mailtoLink = `mailto:artist@example.com?subject=${subject}&body=${body}`;
    
    // Show success message
    showSuccessMessage();
    
    // Close modal
    closeContactModal();
    
    // Open email client
    window.open(mailtoLink);
}

/**
 * Show success message
 */
function showSuccessMessage() {
    const message = document.createElement('div');
    message.className = 'success-message';
    message.innerHTML = `
        <div class="success-content">
            <h4>Thank you for your inquiry!</h4>
            <p>Your email client should open with a pre-filled message. If not, please contact us directly.</p>
        </div>
    `;
    message.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d4edda;
        color: #155724;
        padding: 1rem;
        border-radius: 6px;
        border: 1px solid #c3e6cb;
        z-index: 1002;
        max-width: 300px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    `;
    
    document.body.appendChild(message);
    
    setTimeout(() => {
        message.remove();
    }, 5000);
}

/**
 * Setup share functionality
 */
function setupShareFunctionality() {
    const shareBtn = document.getElementById('share-btn');
    
    if (shareBtn) {
        shareBtn.addEventListener('click', async () => {
            const shareData = {
                title: currentArtwork?.title || 'Artwork',
                text: `Check out this artwork: ${currentArtwork?.title || 'Untitled'}`,
                url: window.location.href
            };
            
            if (navigator.share) {
                try {
                    await navigator.share(shareData);
                } catch (error) {
                    console.log('Error sharing:', error);
                    fallbackShare();
                }
            } else {
                fallbackShare();
            }
        });
    }
}

/**
 * Fallback share functionality
 */
function fallbackShare() {
    const url = window.location.href;
    const title = currentArtwork?.title || 'Artwork';
    
    if (navigator.clipboard) {
        navigator.clipboard.writeText(url).then(() => {
            showToast('Link copied to clipboard!');
        });
    } else {
        // Create temporary input to copy URL
        const input = document.createElement('input');
        input.value = url;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
        showToast('Link copied to clipboard!');
    }
}

/**
 * Show toast message
 */
function showToast(message) {
    const toast = document.createElement('div');
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: #333;
        color: white;
        padding: 12px 24px;
        border-radius: 6px;
        z-index: 1002;
        font-size: 0.9rem;
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

/**
 * Setup keyboard navigation
 */
function setupKeyboardNavigation() {
    document.addEventListener('keydown', (e) => {
        // Escape key closes modals
        if (e.key === 'Escape') {
            const fullscreenModal = document.getElementById('fullscreen-modal');
            const contactModal = document.getElementById('contact-modal');
            
            if (fullscreenModal && fullscreenModal.classList.contains('active')) {
                closeFullscreenModal();
            } else if (contactModal && contactModal.classList.contains('active')) {
                closeContactModal();
            }
        }
        
        // Space bar or Enter for fullscreen
        if ((e.key === ' ' || e.key === 'Enter') && !e.target.matches('input, textarea, button')) {
            e.preventDefault();
            const fullscreenBtn = document.getElementById('fullscreen-btn');
            if (fullscreenBtn) {
                fullscreenBtn.click();
            }
        }
    });
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
    if (ogDescription) ogDescription.content = artwork.description || 'View this beautiful artwork';
    if (ogImage) ogImage.content = new URL(artwork.imageUrl, window.location.origin).href;
    if (ogUrl) ogUrl.content = window.location.href;
    
    // Update schema.org structured data
    const schemaScript = document.getElementById('artwork-schema');
    if (schemaScript) {
        const schema = {
            "@context": "https://schema.org",
            "@type": "VisualArtwork",
            "name": artwork.title || 'Untitled',
            "creator": {
                "@type": "Person",
                "name": "Tamara Grand"
            },
            "description": artwork.description || '',
            "image": new URL(artwork.imageUrl, window.location.origin).href,
            "url": window.location.href,
            "artMedium": artwork.medium || '',
            "width": artwork.dimensions || '',
            "dateCreated": artwork.year || ''
        };
        
        if (artwork.price && artwork.available !== false) {
            schema.offers = {
                "@type": "Offer",
                "price": artwork.price,
                "availability": "https://schema.org/InStock"
            };
        }
        
        schemaScript.textContent = JSON.stringify(schema);
    }
}

/**
 * Hide loading state
 */
function hideLoadingState() {
    const loadingState = document.getElementById('loading-state');
    if (loadingState) {
        loadingState.style.display = 'none';
    }
}

/**
 * Show error state
 */
function showErrorState(message) {
    const loadingState = document.getElementById('loading-state');
    const errorState = document.getElementById('error-state');
    
    if (loadingState) {
        loadingState.style.display = 'none';
    }
    
    if (errorState) {
        errorState.style.display = 'block';
        const errorMessage = errorState.querySelector('p');
        if (errorMessage) {
            errorMessage.textContent = message || 'An error occurred while loading the artwork.';
        }
    }
}

// Export for debugging
window.artworkDetailApp = {
    currentArtwork,
    metadataProcessor,
    relatedArtworks
};