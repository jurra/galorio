/**
 * Metadata Processing Module
 * Handles loading and processing of artwork metadata from JSON files and CSV configurations
 */

class MetadataProcessor {
    constructor() {
        this.artworks = [];
        this.collections = new Map();
        this.csvConfig = null;
        this.collectionsConfig = null;
    }

    /**
     * Initialize the metadata processor by loading all data
     */
    async initialize() {
        try {
            console.log('🎨 Initializing metadata processor...');
            await this.loadCSVConfig();
            await this.loadCollectionsConfig();
            await this.loadArtworkMetadata();
            this.processCollections();
            console.log(`✅ Metadata processor initialized with ${this.artworks.length} artworks and ${this.collections.size} collections`);
            return { artworks: this.artworks, collections: this.collections };
        } catch (error) {
            console.error('❌ Error initializing metadata processor:', error);
            return { artworks: [], collections: new Map() };
        }
    }

    /**
     * Load CSV configuration if it exists
     */
    async loadCSVConfig() {
        try {
            // Try the new inventory CSV first
            let response = await fetch('./config/artwork-inventory.csv');
            if (response.ok) {
                const csvText = await response.text();
                this.csvConfig = this.parseCSV(csvText);
                return;
            }
            
            // Fallback to old collections.csv
            response = await fetch('./config/collections.csv');
            if (response.ok) {
                const csvText = await response.text();
                this.csvConfig = this.parseCSV(csvText);
            }
        } catch (error) {
            console.log('No CSV configuration found, using default order');
        }
    }

    /**
     * Load collections configuration from CSV
     */
    async loadCollectionsConfig() {
        try {
            console.log('📚 Loading collections configuration...');
            const response = await fetch('./config/collections.csv');
            if (response.ok) {
                const csvText = await response.text();
                this.collectionsConfig = this.parseCSV(csvText);
                console.log(`✅ Loaded ${this.collectionsConfig.length} collections from CSV`);
                
                // Convert to Map for easy lookup
                this.collectionsConfig.forEach(row => {
                    this.collections.set(row.id, {
                        id: row.id,
                        name: row.collection_name,
                        description: row.description,
                        artworks: []
                    });
                });
            } else {
                console.log('❌ Collections CSV not found, creating default collections');
                this.createDefaultCollections();
            }
        } catch (error) {
            console.log('❌ Error loading collections CSV, creating defaults:', error);
            this.createDefaultCollections();
        }
    }

    /**
     * Create default collections if CSV is not available
     */
    createDefaultCollections() {
        const defaultCollections = [
            { id: 'featured', name: 'Featured Works', description: 'Highlighted artworks from various collections' },
            { id: 'recent', name: 'Recent Works', description: 'Latest additions to the portfolio' },
            { id: 'all', name: 'All Works', description: 'Complete collection of artworks' }
        ];
        
        defaultCollections.forEach(col => {
            this.collections.set(col.id, { ...col, artworks: [] });
        });
    }

    /**
     * Parse CSV text into structured data
     */
    parseCSV(csvText) {
        const lines = csvText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        const data = [];

        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }

        return data;
    }

    /**
     * Load all artwork metadata from CSV data or pre-generated JSON
     */
    async loadArtworkMetadata() {
        console.log('📁 Loading artwork metadata...');
        
        // First, try to load pre-generated portfolio data
        try {
            console.log('🔍 Trying to load pre-generated portfolio.json...');
            const response = await fetch('./data/portfolio.json');
            if (response.ok) {
                const portfolioData = await response.json();
                this.artworks = portfolioData.artworks || [];
                console.log(`✅ Loaded ${this.artworks.length} artworks from pre-generated data`);
                console.log('📋 First artwork:', this.artworks[0]);
                return;
            } else {
                console.log(`❌ Failed to load portfolio.json: ${response.status} ${response.statusText}`);
            }
        } catch (error) {
            console.log('❌ Error loading pre-generated portfolio data:', error);
            console.log('🔄 Falling back to CSV processing...');
        }

        // Fallback to CSV processing
        if (!this.csvConfig || this.csvConfig.length === 0) {
            console.log('❌ No CSV data found');
            return;
        }

        console.log(`📊 Processing ${this.csvConfig.length} rows from CSV...`);

        // Process each row from CSV
        this.csvConfig.forEach(row => {
            // Map your CSV columns to artwork object
            const artwork = {
                id: row.ID || this.generateId(row.Title),
                title: row.Title,
                collection: row.Collection,
                medium: row.Medium || '', // Add medium field
                year: row.Year || '', // Add year field
                pricing: row.Pricing,
                dimensions: row.Dimensions || row['Dimensions'], // Handle both dimension columns
                size: row.Size,
                notes: row.Notes,
                description: row['Extended description'] || '',
                
                // Generate image filename from ID if not provided
                filename: this.generateImageFilename(row.ID, row.Title),
                imageUrl: `./artworks/${this.generateImageFilename(row.ID, row.Title)}`,
                
                // Set availability based on presence of pricing or notes
                available: !!(row.Pricing && row.x !== 'sold'),
                
                // Extract price from pricing column
                price: this.extractPrice(row.Pricing),
                
                // Set featured status (you can customize this logic)
                featured: row.x === 'x' || row.featured === 'true',
                
                // Generate tags from title and description
                tags: this.generateTags(row.Title, row['Extended description']),
                
                // Initialize samples array (can be populated later)
                samples: []
            };

            this.artworks.push(artwork);
        });
        
        console.log(`✅ Loaded ${this.artworks.length} artworks from CSV`);
    }

    /**
     * Process a CSV row into a complete artwork object
     */
    processCSVRow(row) {
        // Convert CSV row to artwork object
        const artwork = {
            filename: row.filename,
            imageUrl: `./artworks/${row.filename}`,
            id: this.generateId(row.filename),
            title: row.title || this.filenameToTitle(row.filename),
            medium: row.medium || '',
            dimensions: row.dimensions || '',
            year: row.year || '',
            price: row.price || 'Price on request',
            description: row.description || '',
            available: this.parseBoolean(row.available),
            collection: row.collection || 'All',
            order: row.order ? parseInt(row.order) : 999,
            featured: this.parseBoolean(row.featured),
            tags: this.parseTags(row.tags)
        };

        return artwork;
    }

    /**
     * Parse boolean values from CSV (handles various formats)
     */
    parseBoolean(value) {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'string') {
            const lower = value.toLowerCase().trim();
            return lower === 'true' || lower === 'yes' || lower === '1';
        }
        return false;
    }

    /**
     * Parse tags from CSV (comma-separated values)
     */
    parseTags(tagsString) {
        if (!tagsString) return [];
        
        return tagsString
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0);
    }

    /**
     * Generate a unique ID for an artwork
     */
    generateId(title) {
        return title?.toLowerCase().replace(/[^a-z0-9]/g, '-') || 'artwork-' + Date.now();
    }

    /**
     * Generate image filename from ID and title with sample support
     */
    generateImageFilename(id, title, sampleNumber = 1) {
        // First try to use ID as filename
        if (id && typeof id === 'string') {
            // For sample numbers > 1, add the sample suffix
            if (sampleNumber > 1) {
                return `${id}-${sampleNumber.toString().padStart(2, '0')}.jpg`;
            }
            // For first sample, try both formats: ABS-0012.jpg and ABS-0012-01.jpg
            return `${id}.jpg`; // Primary filename
        }
        // Fallback to title
        if (title && typeof title === 'string') {
            const baseId = this.generateId(title);
            if (sampleNumber > 1) {
                return `${baseId}-${sampleNumber.toString().padStart(2, '0')}.jpg`;
            }
            return `${baseId}.jpg`;
        }
        // Final fallback
        return 'artwork-default.jpg';
    }

    /**
     * Discover all available image samples for an artwork
     */
    async discoverImageSamples(artwork) {
        const samples = [];
        const baseId = artwork.id;
        
        // Always add the primary image
        const primaryFilename = this.generateImageFilename(baseId, artwork.title, 1);
        const primaryUrl = `./artworks/${primaryFilename}`;
        
        // Test if primary image exists
        try {
            const response = await fetch(primaryUrl, { method: 'HEAD' });
            if (response.ok) {
                samples.push({
                    filename: primaryFilename,
                    url: primaryUrl,
                    sampleNumber: 1,
                    isPrimary: true
                });
            } else {
                // Try the -01 format if the primary doesn't exist
                const altFilename = this.generateImageFilename(baseId, artwork.title, 1).replace('.jpg', '-01.jpg');
                const altUrl = `./artworks/${altFilename}`;
                const altResponse = await fetch(altUrl, { method: 'HEAD' });
                if (altResponse.ok) {
                    samples.push({
                        filename: altFilename,
                        url: altUrl,
                        sampleNumber: 1,
                        isPrimary: true
                    });
                }
            }
        } catch (error) {
            console.log(`Could not verify primary image for ${baseId}:`, error);
        }
        
        // Look for additional samples (02, 03, etc.)
        for (let i = 2; i <= 5; i++) { // Check up to 5 samples
            const filename = this.generateImageFilename(baseId, artwork.title, i);
            const url = `./artworks/${filename}`;
            
            try {
                const response = await fetch(url, { method: 'HEAD' });
                if (response.ok) {
                    samples.push({
                        filename,
                        url,
                        sampleNumber: i,
                        isPrimary: false
                    });
                } else {
                    break; // Stop looking if we don't find a consecutive sample
                }
            } catch (error) {
                break; // Stop on error
            }
        }
        
        return samples;
    }

    /**
     * Extract price from pricing column
     */
    extractPrice(pricingText) {
        if (!pricingText) return '';
        
        // Look for dollar amounts
        const priceMatch = pricingText.match(/\$[\d,]+/);
        if (priceMatch) {
            return priceMatch[0];
        }
        
        // Return as-is if no dollar sign found
        return pricingText;
    }

    /**
     * Generate tags from title and description
     */
    generateTags(title, description) {
        const tags = [];
        
        // Extract meaningful words from title
        if (title) {
            const titleWords = title.toLowerCase()
                .split(/\s+/)
                .filter(word => word.length > 3 && !['the', 'and', 'for', 'with'].includes(word));
            tags.push(...titleWords);
        }
        
        // Extract key concepts from description
        if (description) {
            const keywords = ['spiritual', 'awakening', 'freedom', 'power', 'energy', 'movement', 'transition', 'patterns'];
            keywords.forEach(keyword => {
                if (description.toLowerCase().includes(keyword)) {
                    tags.push(keyword);
                }
            });
        }
        
        return [...new Set(tags)]; // Remove duplicates
    }

    /**
     * Convert filename to a readable title
     */
    filenameToTitle(filename) {
        return filename
            .replace(/[-_]/g, ' ')
            .replace(/\b\w/g, l => l.toUpperCase());
    }

    /**
     * Process and organize artworks into collections
     */
    processCollections() {
        console.log('🗂️ Processing collections and organizing artworks...');
        
        // Clear existing artwork arrays in collections but keep collection metadata
        this.collections.forEach(collection => {
            collection.artworks = [];
        });

        // Organize artworks by collection
        this.artworks.forEach(artwork => {
            const collectionId = this.normalizeCollectionName(artwork.collection);
            
            // Add to specific collection if it exists
            if (this.collections.has(collectionId)) {
                this.collections.get(collectionId).artworks.push(artwork);
            } else {
                // Create collection if it doesn't exist
                console.log(`🆕 Creating new collection: ${artwork.collection} (${collectionId})`);
                this.collections.set(collectionId, {
                    id: collectionId,
                    name: artwork.collection || 'Untitled Collection',
                    description: `Collection of works in ${artwork.collection}`,
                    artworks: [artwork]
                });
            }
            
            // Always add to 'all' collection if it exists
            if (this.collections.has('all')) {
                this.collections.get('all').artworks.push(artwork);
            }
            
            // Add featured works to featured collection
            if (artwork.featured && this.collections.has('featured')) {
                this.collections.get('featured').artworks.push(artwork);
            }
        });

        // Sort artworks within each collection
        this.collections.forEach(collection => {
            collection.artworks.sort((a, b) => {
                // Sort by order if specified, otherwise by title
                if (a.order && b.order) {
                    return parseInt(a.order) - parseInt(b.order);
                }
                return (a.title || '').localeCompare(b.title || '');
            });
        });

        // Remove empty collections
        const collectionsToRemove = [];
        this.collections.forEach((collection, id) => {
            if (collection.artworks.length === 0) {
                collectionsToRemove.push(id);
            }
        });
        collectionsToRemove.forEach(id => this.collections.delete(id));

        // Sort main artworks array
        this.artworks.sort((a, b) => {
            if (a.order && b.order) {
                return parseInt(a.order) - parseInt(b.order);
            }
            return (a.title || '').localeCompare(b.title || '');
        });

        console.log(`✅ Organized ${this.artworks.length} artworks into ${this.collections.size} collections`);
    }

    /**
     * Normalize collection name to ID format
     */
    normalizeCollectionName(collectionName) {
        if (!collectionName) return 'uncategorized';
        return collectionName.toLowerCase()
            .replace(/[^a-z0-9]/g, '-')
            .replace(/--+/g, '-')
            .replace(/^-|-$/g, '');
    }

    /**
     * Get all artworks
     */
    getArtworks() {
        return this.artworks;
    }

    /**
     * Get artworks by collection
     */
    getCollection(collectionId) {
        const collection = this.collections.get(collectionId);
        return collection ? collection.artworks : [];
    }

    /**
     * Get collection metadata by ID
     */
    getCollectionInfo(collectionId) {
        return this.collections.get(collectionId) || null;
    }

    /**
     * Get all collections (Map of collection objects)
     */
    getAllCollections() {
        return this.collections;
    }

    /**
     * Get all collection names
     */
    getCollectionNames() {
        return Array.from(this.collections.keys());
    }

    /**
     * Get featured artworks
     */
    getFeaturedArtworks() {
        return this.artworks.filter(artwork => artwork.featured === 'true' || artwork.featured === true);
    }

    /**
     * Get artwork by ID
     */
    getArtworkById(id) {
        return this.artworks.find(artwork => artwork.id === id);
    }

    /**
     * Search artworks by title, description, or tags
     */
    searchArtworks(query) {
        const searchTerm = query.toLowerCase();
        
        return this.artworks.filter(artwork => {
            const searchableText = [
                artwork.title,
                artwork.description,
                artwork.medium,
                artwork.collection,
                ...(artwork.tags || [])
            ].join(' ').toLowerCase();
            
            return searchableText.includes(searchTerm);
        });
    }
}

// Export for use in other modules
window.MetadataProcessor = MetadataProcessor;