/**
 * Gallery Module
 * Handles the gallery display, filtering, and interactions
 */

export class Gallery {
    constructor(containerId, metadataProcessor) {
        this.container = document.getElementById(containerId);
        this.metadata = metadataProcessor;
        this.currentArtworks = [];
        this.collections = new Map();
        this.collectionScrollPositions = new Map();
        this.lightbox = null;
        
        this.initializeLightbox();
        this.bindEvents();
    }

    /**
     * Initialize the gallery with artworks and collections
     */
    async initialize() {
        try {
            console.log('🎨 Initializing gallery...');
            const data = await this.metadata.initialize();
            this.currentArtworks = data.artworks || data; // Handle both old and new format
            this.collections = data.collections || new Map();
            console.log(`🖼️ Gallery received ${this.currentArtworks.length} artworks and ${this.collections.size} collections`);
            this.renderCollections();
            console.log('✅ Gallery initialization complete');
        } catch (error) {
            console.error('❌ Error initializing gallery:', error);
            this.renderError();
        }
    }

    /**
     * Render the gallery grid
     */
    render(artworks = this.currentArtworks) {
        if (!this.container) {
            console.error('Gallery container not found');
            return;
        }

        // Clear existing content
        this.container.innerHTML = '';

        if (artworks.length === 0) {
            this.renderEmptyState();
            return;
        }

        // Create gallery grid
        const grid = document.createElement('div');
        grid.className = 'gallery-grid';

        artworks.forEach(artwork => {
            const item = this.createGalleryItem(artwork);
            grid.appendChild(item);
        });

        this.container.appendChild(grid);
    }

    /**
     * Render collections as Netflix-style rows
     */
    renderCollections() {
        if (!this.container) {
            console.error('Gallery container not found');
            return;
        }

        // Clear existing content
        this.container.innerHTML = '';

        if (!this.collections || this.collections.size === 0) {
            this.renderEmptyState();
            return;
        }

        // Create collections container
        const collectionsContainer = document.createElement('div');
        collectionsContainer.className = 'collections-container';

        // Render each collection as a row
        this.collections.forEach((collection, id) => {
            if (collection.artworks && collection.artworks.length > 0) {
                const collectionRow = this.createCollectionRow(collection);
                collectionsContainer.appendChild(collectionRow);
            }
        });

        this.container.appendChild(collectionsContainer);
    }

    /**
     * Render a single collection view
     */
    renderSingleCollection(collectionId) {
        if (!this.container) {
            console.error('Gallery container not found');
            return;
        }

        // Clear existing content
        this.container.innerHTML = '';

        // Find the collection by ID
        const collection = this.collections.get(collectionId);
        
        if (!collection || !collection.artworks || collection.artworks.length === 0) {
            this.renderEmptyState();
            return;
        }

        // Create single collection container
        const singleCollectionContainer = document.createElement('div');
        singleCollectionContainer.className = 'single-collection-container';

        // Add collection header
        const header = document.createElement('div');
        header.className = 'single-collection-header';
        
        const title = document.createElement('h1');
        title.className = 'single-collection-title';
        title.textContent = collection.name;
        header.appendChild(title);

        if (collection.description) {
            const description = document.createElement('p');
            description.className = 'single-collection-description';
            description.textContent = collection.description;
            header.appendChild(description);
        }

        singleCollectionContainer.appendChild(header);

        // Create grid layout for single collection
        const artworksGrid = document.createElement('div');
        artworksGrid.className = 'single-collection-grid';

        collection.artworks.forEach(artwork => {
            // Use the same rich metadata element as collection rows
            const artworkElement = this.createSingleCollectionArtwork(artwork);
            artworksGrid.appendChild(artworkElement);
        });

        singleCollectionContainer.appendChild(artworksGrid);
        this.container.appendChild(singleCollectionContainer);
    }

    /**
     * Create an artwork element for single collection grid view with rich metadata
     */
    createSingleCollectionArtwork(artwork) {
        const artworkElement = document.createElement('div');
        artworkElement.className = 'single-collection-artwork';
        artworkElement.dataset.artworkId = artwork.id;

        // Image
        const image = document.createElement('img');
        image.src = artwork.imageUrl;
        image.alt = artwork.title || 'Artwork';
        image.loading = 'lazy';

        // Handle image load errors
        image.onerror = () => {
            image.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
        };

        // Overlay with rich metadata (same as collection view)
        const overlay = document.createElement('div');
        overlay.className = 'single-collection-artwork-overlay';

        // Title
        if (artwork.title) {
            const title = document.createElement('h4');
            title.className = 'single-collection-artwork-title';
            title.textContent = artwork.title;
            overlay.appendChild(title);
        }

        // Medium
        if (artwork.medium) {
            const medium = document.createElement('p');
            medium.className = 'single-collection-artwork-medium';
            medium.textContent = artwork.medium;
            overlay.appendChild(medium);
        }

        // Dimensions with proper units
        if (artwork.dimensions) {
            const dimensions = document.createElement('p');
            dimensions.className = 'single-collection-artwork-dimensions';
            dimensions.textContent = this.formatDimensions(artwork.dimensions);
            overlay.appendChild(dimensions);
        }

        // Year if available
        if (artwork.year) {
            const year = document.createElement('p');
            year.className = 'single-collection-artwork-year';
            year.textContent = artwork.year;
            overlay.appendChild(year);
        }

        // Price
        if (artwork.price) {
            const price = document.createElement('p');
            price.className = 'single-collection-artwork-price';
            price.textContent = artwork.price;
            overlay.appendChild(price);
        }

        // Availability status
        const status = document.createElement('span');
        status.className = 'single-collection-artwork-status';
        if (artwork.available === false || artwork.available === 'false') {
            status.textContent = 'Sold';
            status.classList.add('sold');
        } else {
            status.textContent = 'Available';
            status.classList.add('available');
        }
        overlay.appendChild(status);

        artworkElement.appendChild(image);
        artworkElement.appendChild(overlay);

        // Click and touch handlers for artwork details
        this.addArtworkInteraction(artworkElement, artwork);

        return artworkElement;
    }

    /**
     * Normalize collection name to match the stored IDs
     */
    normalizeCollectionName(collectionName) {
        if (!collectionName) return 'uncategorized';
        return collectionName.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/--+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Create a collection row with horizontal scroll
     */
    createCollectionRow(collection) {
        const row = document.createElement('div');
        row.className = 'collection-row';
        row.dataset.collectionId = collection.id;

        // Collection header
        const header = document.createElement('div');
        header.className = 'collection-header';

        const headerInfo = document.createElement('div');
        
        const title = document.createElement('h2');
        title.className = 'collection-title';
        title.textContent = collection.name;
        headerInfo.appendChild(title);

        if (collection.description) {
            const description = document.createElement('p');
            description.className = 'collection-description';
            description.textContent = collection.description;
            headerInfo.appendChild(description);
        }

        header.appendChild(headerInfo);

        // Navigation buttons
        const nav = document.createElement('div');
        nav.className = 'collection-nav';

        const prevBtn = document.createElement('button');
        prevBtn.className = 'collection-nav-btn prev-btn';
        prevBtn.innerHTML = '‹';
        prevBtn.setAttribute('aria-label', 'Previous artworks');

        const nextBtn = document.createElement('button');
        nextBtn.className = 'collection-nav-btn next-btn';
        nextBtn.innerHTML = '›';
        nextBtn.setAttribute('aria-label', 'Next artworks');

        nav.appendChild(prevBtn);
        nav.appendChild(nextBtn);
        header.appendChild(nav);

        // Scrollable container
        const scrollContainer = document.createElement('div');
        scrollContainer.className = 'collection-scroll-container';

        const artworksContainer = document.createElement('div');
        artworksContainer.className = 'collection-artworks';

        // Create artwork elements and collect image loading promises
        const imageLoadPromises = [];
        
        collection.artworks.forEach(artwork => {
            const { element, promise } = this.createCollectionArtworkWithPromise(artwork);
            artworksContainer.appendChild(element);
            imageLoadPromises.push(promise);
        });

        scrollContainer.appendChild(artworksContainer);

        // Assemble the row
        row.appendChild(header);
        row.appendChild(scrollContainer);

        // Wait for all images to load, then set proper heights
        Promise.all(imageLoadPromises).then(imageDimensions => {
            this.setCollectionRowHeight(row, imageDimensions);
        }).catch(error => {
            console.error('Error loading images for collection:', collection.name, error);
            // Set fallback height
            row.style.setProperty('--collection-height', '200px');
        });

        // Set up navigation
        this.setupCollectionNavigation(row, artworksContainer, prevBtn, nextBtn);

        return row;
    }

    /**
     * Create an artwork element for collection display
     */
    createCollectionArtwork(artwork, maxHeight = 300) {
        const artworkElement = document.createElement('div');
        artworkElement.className = 'collection-artwork';
        artworkElement.dataset.artworkId = artwork.id;

        // Image
        const image = document.createElement('img');
        image.src = artwork.imageUrl;
        image.alt = artwork.title || 'Artwork';
        image.loading = 'lazy';

        // Calculate artwork dimensions if available
        if (artwork.dimensions) {
            this.setArtworkDimensions(artworkElement, artwork.dimensions, maxHeight);
        }

        // Handle image load to get natural dimensions and set proper size
        image.onload = () => {
            this.adjustArtworkDimensions(artworkElement, image, maxHeight);
        };

        // Handle image load errors
        image.onerror = () => {
            image.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
            // Set fallback dimensions
            artworkElement.style.width = '250px';
            artworkElement.style.height = '200px';
        };

        // Enhanced Overlay
        const overlay = document.createElement('div');
        overlay.className = 'collection-artwork-overlay';

        if (artwork.title) {
            const title = document.createElement('h4');
            title.className = 'collection-artwork-title';
            title.textContent = artwork.title;
            overlay.appendChild(title);
        }

        // Artist
        const artist = document.createElement('p');
        artist.className = 'collection-artwork-artist';
        artist.textContent = 'Tamara Grand';
        overlay.appendChild(artist);

        // Simplified metadata for basic overlay
        if (artwork.medium && artwork.year) {
            const metadata = document.createElement('div');
            metadata.className = 'collection-artwork-metadata';
            
            const mediumItem = document.createElement('div');
            mediumItem.className = 'collection-artwork-meta-item';
            mediumItem.innerHTML = `
                <span class="collection-artwork-meta-label">MEDIUM</span>
                <span class="collection-artwork-meta-value">${artwork.medium}</span>
            `;
            metadata.appendChild(mediumItem);

            const yearItem = document.createElement('div');
            yearItem.className = 'collection-artwork-meta-item';
            yearItem.innerHTML = `
                <span class="collection-artwork-meta-label">YEAR</span>
                <span class="collection-artwork-meta-value">${artwork.year}</span>
            `;
            metadata.appendChild(yearItem);

            overlay.appendChild(metadata);
        }

        if (artwork.price) {
            const pricing = document.createElement('div');
            pricing.className = 'collection-artwork-pricing';

            const price = document.createElement('span');
            price.className = 'collection-artwork-price';
            price.textContent = artwork.price;
            pricing.appendChild(price);

            // Availability status
            const status = document.createElement('span');
            status.className = 'collection-artwork-status';
            const isAvailable = artwork.available !== false && artwork.available !== 'false';
            status.textContent = isAvailable ? 'AVAILABLE' : 'SOLD';
            status.classList.add(isAvailable ? 'available' : 'sold');
            pricing.appendChild(status);

            overlay.appendChild(pricing);
        }

        artworkElement.appendChild(image);
        artworkElement.appendChild(overlay);

        // Click and touch handlers for artwork details
        this.addArtworkInteraction(artworkElement, artwork);

        return artworkElement;
    }

    /**
     * Create collection artwork with image loading promise
     */
    createCollectionArtworkWithPromise(artwork) {
        const artworkElement = document.createElement('div');
        artworkElement.className = 'collection-artwork';
        artworkElement.dataset.artworkId = artwork.id;

        // Image
        const image = document.createElement('img');
        image.src = artwork.imageUrl;
        image.alt = artwork.title || 'Artwork';
        image.loading = 'lazy';

        // Create promise that resolves when image loads with its dimensions
        const imageLoadPromise = new Promise((resolve) => {
            image.onload = () => {
                const naturalWidth = image.naturalWidth;
                const naturalHeight = image.naturalHeight;
                resolve({
                    width: naturalWidth,
                    height: naturalHeight,
                    aspectRatio: naturalWidth / naturalHeight,
                    element: artworkElement
                });
            };
            
            image.onerror = () => {
                // Fallback dimensions for broken images
                resolve({
                    width: 300,
                    height: 200,
                    aspectRatio: 1.5,
                    element: artworkElement
                });
            };
        });

        // Handle image load errors with fallback
        image.onerror = () => {
            image.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzUwIiBoZWlnaHQ9IjI1MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
        };

        // Enhanced Overlay with structured metadata
        const overlay = document.createElement('div');
        overlay.className = 'collection-artwork-overlay';

        // Title
        if (artwork.title) {
            const title = document.createElement('h4');
            title.className = 'collection-artwork-title';
            title.textContent = artwork.title;
            overlay.appendChild(title);
        }

        // Artist
        const artist = document.createElement('p');
        artist.className = 'collection-artwork-artist';
        artist.textContent = 'Tamara Grand';
        overlay.appendChild(artist);

        // Metadata grid
        const metadata = document.createElement('div');
        metadata.className = 'collection-artwork-metadata';

        // Medium
        if (artwork.medium) {
            const mediumItem = document.createElement('div');
            mediumItem.className = 'collection-artwork-meta-item';
            mediumItem.innerHTML = `
                <span class="collection-artwork-meta-label">MEDIUM</span>
                <span class="collection-artwork-meta-value">${artwork.medium}</span>
            `;
            metadata.appendChild(mediumItem);
        }

        // Dimensions
        if (artwork.dimensions) {
            const dimensionsItem = document.createElement('div');
            dimensionsItem.className = 'collection-artwork-meta-item';
            dimensionsItem.innerHTML = `
                <span class="collection-artwork-meta-label">DIMENSIONS</span>
                <span class="collection-artwork-meta-value">${this.formatDimensions(artwork.dimensions)}</span>
            `;
            metadata.appendChild(dimensionsItem);
        }

        // Year
        if (artwork.year) {
            const yearItem = document.createElement('div');
            yearItem.className = 'collection-artwork-meta-item';
            yearItem.innerHTML = `
                <span class="collection-artwork-meta-label">YEAR</span>
                <span class="collection-artwork-meta-value">${artwork.year}</span>
            `;
            metadata.appendChild(yearItem);
        }

        // Collection
        if (artwork.collection) {
            const collectionItem = document.createElement('div');
            collectionItem.className = 'collection-artwork-meta-item';
            collectionItem.innerHTML = `
                <span class="collection-artwork-meta-label">COLLECTION</span>
                <span class="collection-artwork-meta-value">${artwork.collection}</span>
            `;
            metadata.appendChild(collectionItem);
        }

        overlay.appendChild(metadata);

        // Pricing section
        if (artwork.price) {
            const pricing = document.createElement('div');
            pricing.className = 'collection-artwork-pricing';

            const price = document.createElement('span');
            price.className = 'collection-artwork-price';
            price.textContent = artwork.price;
            pricing.appendChild(price);

            // Availability status
            const status = document.createElement('span');
            status.className = 'collection-artwork-status';
            const isAvailable = artwork.available !== false && artwork.available !== 'false';
            status.textContent = isAvailable ? 'AVAILABLE' : 'SOLD';
            status.classList.add(isAvailable ? 'available' : 'sold');
            pricing.appendChild(status);

            overlay.appendChild(pricing);
        }

        artworkElement.appendChild(image);
        artworkElement.appendChild(overlay);

        // Click handler to view artwork details
        artworkElement.addEventListener('click', () => {
            this.openArtworkDetail(artwork);
        });

        return { element: artworkElement, promise: imageLoadPromise };
    }

    /**
     * Set collection row height based on loaded image dimensions
     */
    setCollectionRowHeight(row, imageDimensions) {
        // Calculate the optimal height for this collection
        // Use a standard width (like 250px) and calculate heights based on aspect ratios
        const standardWidth = 250;
        const heights = imageDimensions.map(dim => standardWidth / dim.aspectRatio);
        const maxHeight = Math.max(...heights);
        
        // Clamp height between reasonable bounds
        const clampedHeight = Math.min(Math.max(maxHeight, 150), 400);
        
        console.log(`Setting collection "${row.dataset.collectionId}" height to ${clampedHeight}px`);
        
        // Set the height on the row
        row.style.setProperty('--collection-height', `${clampedHeight}px`);
        
        // Apply the height to all artwork elements in this row
        const artworkElements = row.querySelectorAll('.collection-artwork');
        artworkElements.forEach((element, index) => {
            const dimensions = imageDimensions[index];
            const calculatedWidth = clampedHeight * dimensions.aspectRatio;
            
            element.style.width = `${calculatedWidth}px`;
            element.style.height = `${clampedHeight}px`;
        });
    }

    /**
     * Set artwork dimensions based on metadata
     */
    setArtworkDimensions(element, dimensions, maxHeight) {
        try {
            // Parse dimensions (e.g., "71.1*101.6" or "30x24")
            const dimStr = dimensions.toString().replace(/[^\d.*x]/g, '');
            const parts = dimStr.split(/[*x]/);
            
            if (parts.length >= 2) {
                const width = parseFloat(parts[0]);
                const height = parseFloat(parts[1]);
                
                if (width && height) {
                    const aspectRatio = width / height;
                    const displayHeight = Math.min(maxHeight, height * 2); // Scale up for better visibility
                    const displayWidth = displayHeight * aspectRatio;
                    
                    element.style.width = `${displayWidth}px`;
                    element.style.height = `${displayHeight}px`;
                    return;
                }
            }
        } catch (error) {
            console.warn('Error parsing dimensions:', dimensions, error);
        }
        
        // Fallback dimensions
        element.style.width = '250px';
        element.style.height = '200px';
    }

    /**
     * Adjust artwork dimensions after image loads
     */
    adjustArtworkDimensions(element, image, maxHeight) {
        if (element.style.width && element.style.height) {
            // Already set from metadata, skip
            return;
        }
        
        const naturalWidth = image.naturalWidth;
        const naturalHeight = image.naturalHeight;
        
        if (naturalWidth && naturalHeight) {
            const aspectRatio = naturalWidth / naturalHeight;
            const displayHeight = Math.min(maxHeight, naturalHeight > 400 ? 300 : naturalHeight);
            const displayWidth = displayHeight * aspectRatio;
            
            element.style.width = `${displayWidth}px`;
            element.style.height = `${displayHeight}px`;
        }
    }

    /**
     * Calculate optimal height for a collection based on artwork dimensions
     */
    calculateCollectionHeight(artworks) {
        let maxHeight = 250; // Default height
        
        artworks.forEach(artwork => {
            if (artwork.dimensions) {
                try {
                    const dimStr = artwork.dimensions.toString().replace(/[^\d.*x]/g, '');
                    const parts = dimStr.split(/[*x]/);
                    
                    if (parts.length >= 2) {
                        const height = parseFloat(parts[1]);
                        if (height) {
                            // Scale up for better visibility, but cap at reasonable max
                            const scaledHeight = Math.min(350, height * 2);
                            maxHeight = Math.max(maxHeight, scaledHeight);
                        }
                    }
                } catch (error) {
                    console.warn('Error parsing dimensions for collection height:', artwork.dimensions);
                }
            }
        });

        // Ensure height is within reasonable bounds
        return Math.min(Math.max(maxHeight, 200), 400);
    }

    /**
     * Set up navigation for a collection row
     */
    setupCollectionNavigation(row, artworksContainer, prevBtn, nextBtn) {
        const collectionId = row.dataset.collectionId;
        let scrollPosition = this.collectionScrollPositions.get(collectionId) || 0;

        const updateButtons = () => {
            const container = row.querySelector('.collection-scroll-container');
            const maxScroll = artworksContainer.scrollWidth - container.clientWidth;
            
            prevBtn.disabled = scrollPosition <= 0;
            nextBtn.disabled = scrollPosition >= maxScroll;
            
            // Update fade indicators
            row.classList.toggle('show-left-fade', scrollPosition > 0);
            row.classList.toggle('show-right-fade', scrollPosition < maxScroll);
        };

        const scrollToPosition = (newPosition) => {
            const container = row.querySelector('.collection-scroll-container');
            const maxScroll = artworksContainer.scrollWidth - container.clientWidth;
            
            scrollPosition = Math.max(0, Math.min(newPosition, maxScroll));
            artworksContainer.style.transform = `translateX(-${scrollPosition}px)`;
            
            this.collectionScrollPositions.set(collectionId, scrollPosition);
            updateButtons();
        };

        // Navigation button handlers
        prevBtn.addEventListener('click', () => {
            const scrollAmount = 250; // Scroll by one artwork width approximately
            scrollToPosition(scrollPosition - scrollAmount);
        });

        nextBtn.addEventListener('click', () => {
            const scrollAmount = 250;
            scrollToPosition(scrollPosition + scrollAmount);
        });

        // Touch/swipe support for mobile
        let startX = 0;
        let currentX = 0;
        let isDragging = false;

        artworksContainer.addEventListener('touchstart', (e) => {
            startX = e.touches[0].clientX;
            isDragging = true;
        });

        artworksContainer.addEventListener('touchmove', (e) => {
            if (!isDragging) return;
            
            currentX = e.touches[0].clientX;
            const diffX = startX - currentX;
            
            // Prevent scrolling if we're swiping horizontally
            if (Math.abs(diffX) > 10) {
                e.preventDefault();
            }
        });

        artworksContainer.addEventListener('touchend', (e) => {
            if (!isDragging) return;
            
            const diffX = startX - currentX;
            const threshold = 50; // Minimum swipe distance
            
            if (Math.abs(diffX) > threshold) {
                if (diffX > 0) {
                    // Swipe left - show next
                    nextBtn.click();
                } else {
                    // Swipe right - show previous
                    prevBtn.click();
                }
            }
            
            isDragging = false;
        });

        // Initialize button states
        setTimeout(updateButtons, 100); // Delay to ensure DOM is rendered

        // Update on window resize
        window.addEventListener('resize', updateButtons);
    }

    /**
     * Create a single gallery item
     */
    createGalleryItem(artwork) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        item.dataset.artworkId = artwork.id;

        // Image container
        const imageContainer = document.createElement('div');
        imageContainer.className = 'image-container';

        const image = document.createElement('img');
        image.src = artwork.imageUrl;
        image.alt = artwork.title || 'Artwork';
        image.loading = 'lazy';

        // Handle image load errors
        image.onerror = () => {
            image.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjBmMGYwIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCwgc2Fucy1zZXJpZiIgZm9udC1zaXplPSIxNHB4IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgTm90IEZvdW5kPC90ZXh0Pjwvc3ZnPg==';
        };

        imageContainer.appendChild(image);

        // Overlay with artwork details
        const overlay = document.createElement('div');
        overlay.className = 'artwork-overlay';

        const details = document.createElement('div');
        details.className = 'artwork-details';

        if (artwork.title) {
            const title = document.createElement('h3');
            title.className = 'artwork-title';
            title.textContent = artwork.title;
            details.appendChild(title);
        }

        if (artwork.medium) {
            const medium = document.createElement('p');
            medium.className = 'artwork-medium';
            medium.textContent = artwork.medium;
            details.appendChild(medium);
        }

        if (artwork.dimensions) {
            const dimensions = document.createElement('p');
            dimensions.className = 'artwork-dimensions';
            dimensions.textContent = artwork.dimensions;
            details.appendChild(dimensions);
        }

        if (artwork.price) {
            const price = document.createElement('p');
            price.className = 'artwork-price';
            price.textContent = artwork.price;
            details.appendChild(price);
        }

        // Availability status
        if (artwork.available !== undefined) {
            const status = document.createElement('span');
            status.className = `availability-status ${artwork.available ? 'available' : 'sold'}`;
            status.textContent = artwork.available ? 'Available' : 'Sold';
            details.appendChild(status);
        }

        overlay.appendChild(details);
        item.appendChild(imageContainer);
        item.appendChild(overlay);

        // Add click handler for detail view
        item.addEventListener('click', () => {
            this.showArtworkDetail(artwork);
        });

        return item;
    }

    /**
     * Search functionality (simplified - no filtering)
     */
    search(query) {
        if (!query.trim()) {
            this.renderCollections();
            return;
        }
        // For now, just re-render collections on search
        // TODO: Implement search within collections
        this.renderCollections();
    }

    /**
     * Show artwork detail view
     */
    showArtworkDetail(artwork) {
        // For now, we'll open a modal or navigate to detail page
        // This could be enhanced to use a router for SPA behavior
        
        const url = new URL(window.location);
        url.pathname = '/artwork.html';
        url.searchParams.set('id', artwork.id);
        
        // Open in new tab or same window based on preference
        window.open(url.toString(), '_blank');
    }

    /**
     * Initialize lightbox functionality
     */
    initializeLightbox() {
        // Create lightbox container
        this.lightbox = document.createElement('div');
        this.lightbox.className = 'lightbox';
        this.lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close">&times;</button>
                <img class="lightbox-image" src="" alt="">
                <div class="lightbox-details">
                    <h3 class="lightbox-title"></h3>
                    <p class="lightbox-info"></p>
                </div>
            </div>
        `;
        
        document.body.appendChild(this.lightbox);
        
        // Close lightbox events
        this.lightbox.querySelector('.lightbox-close').addEventListener('click', () => {
            this.closeLightbox();
        });
        
        this.lightbox.addEventListener('click', (e) => {
            if (e.target === this.lightbox) {
                this.closeLightbox();
            }
        });
        
        // Keyboard navigation
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.lightbox.classList.contains('active')) {
                this.closeLightbox();
            }
        });
    }

    /**
     * Open lightbox with artwork
     */
    openLightbox(artwork) {
        const image = this.lightbox.querySelector('.lightbox-image');
        const title = this.lightbox.querySelector('.lightbox-title');
        const info = this.lightbox.querySelector('.lightbox-info');
        
        image.src = artwork.imageUrl;
        image.alt = artwork.title || 'Artwork';
        title.textContent = artwork.title || 'Untitled';
        
        const infoText = [
            artwork.medium,
            artwork.dimensions,
            artwork.year,
            artwork.price
        ].filter(Boolean).join(' • ');
        
        info.textContent = infoText;
        
        this.lightbox.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    /**
     * Close lightbox
     */
    closeLightbox() {
        this.lightbox.classList.remove('active');
        document.body.style.overflow = '';
    }

    /**
     * Bind event handlers
     */
    bindEvents() {
        // Search functionality
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            let searchTimeout;
            searchInput.addEventListener('input', (e) => {
                clearTimeout(searchTimeout);
                searchTimeout = setTimeout(() => {
                    this.search(e.target.value);
                }, 300);
            });
        }

        // Responsive grid adjustments
        window.addEventListener('resize', () => {
            this.adjustGridLayout();
        });
    }

    /**
     * Adjust grid layout based on screen size
     */
    adjustGridLayout() {
        const grid = this.container.querySelector('.gallery-grid');
        if (!grid) return;

        const containerWidth = this.container.offsetWidth;
        const itemMinWidth = 300; // Minimum width for gallery items
        const gap = 20; // Gap between items
        
        const columns = Math.floor((containerWidth + gap) / (itemMinWidth + gap));
        grid.style.gridTemplateColumns = `repeat(${Math.max(1, columns)}, 1fr)`;
    }

    /**
     * Render empty state
     */
    renderEmptyState() {
        this.container.innerHTML = `
            <div class="empty-state">
                <h3>No artworks found</h3>
                <p>Add some artwork images and metadata to get started.</p>
            </div>
        `;
    }

    /**
     * Render error state
     */
    renderError() {
        this.container.innerHTML = `
            <div class="error-state">
                <h3>Error loading gallery</h3>
                <p>Please check the console for more details.</p>
            </div>
        `;
    }

    /**
     * Format dimensions with proper units
     */
    formatDimensions(dimensions) {
        if (!dimensions) return '';
        
        // Handle different dimension formats
        // e.g., "71.1*101.6", "30x24", "30 x 24 x 2 in", "76.2*50.8 cm"
        let formattedDims = dimensions.toString();
        
        // Replace * with ×
        formattedDims = formattedDims.replace(/\*/g, ' × ');
        
        // Add proper spacing around x
        formattedDims = formattedDims.replace(/\s*x\s*/gi, ' × ');
        
        // If no units are specified, assume cm for metric values
        if (!/\b(in|inch|inches|cm|mm|ft|feet)\b/i.test(formattedDims)) {
            // Check if dimensions look metric (decimals) or imperial (whole numbers)
            const hasDecimals = /\d+\.\d+/.test(formattedDims);
            if (hasDecimals) {
                formattedDims += ' cm';
            } else {
                formattedDims += ' in';
            }
        }
        
        return formattedDims;
    }

    /**
     * Open artwork detail page
     */
    openArtworkDetail(artwork) {
        // Navigate to the artwork detail page
        const detailUrl = `artwork.html?id=${encodeURIComponent(artwork.id)}`;
        window.location.href = detailUrl;
    }

    /**
     * Add interactive handlers for both mouse and touch
     */
    addArtworkInteraction(artworkElement, artwork) {
        // Click handler for navigation
        artworkElement.addEventListener('click', () => {
            this.openArtworkDetail(artwork);
        });

        // Touch interaction for mobile overlay enhancement
        if (window.matchMedia('(hover: none) and (pointer: coarse)').matches) {
            let touchTimeout;

            artworkElement.addEventListener('touchstart', (e) => {
                // Add touched class for enhanced overlay visibility
                artworkElement.classList.add('touched');
                
                // Clear any existing timeout
                if (touchTimeout) {
                    clearTimeout(touchTimeout);
                }
            });

            artworkElement.addEventListener('touchend', () => {
                // Remove touched class after a delay
                touchTimeout = setTimeout(() => {
                    artworkElement.classList.remove('touched');
                }, 2000);
            });

            // Handle touch cancel
            artworkElement.addEventListener('touchcancel', () => {
                artworkElement.classList.remove('touched');
                if (touchTimeout) {
                    clearTimeout(touchTimeout);
                }
            });
        }
    }
}