/**
 * Metadata Processing Module
 * Handles loading and processing of artwork metadata from JSON files and CSV configurations
 */

export class MetadataProcessor {
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
            await this.loadCollectionsConfig(); // This loads fallback collections if needed
            await this.loadArtworkMetadata(); // This now loads collections with nested artworks
            // No need to call processCollections as data is already structured
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
                
                // Process the new CSV structure: Title, ID, Description, Notes
                this.collectionsConfig.forEach(row => {
                    if (row.ID && row.Title) { // Only process rows with both ID and Title
                        this.collections.set(row.ID, {
                            id: row.ID,
                            name: row.Title,
                            description: row.Description || '',
                            notes: row.Notes || '',
                            artworks: []
                        });
                        console.log(`📁 Loaded collection: ${row.ID} - "${row.Title}" - Description: "${row.Description}"`);
                    } else {
                        console.log(`⚠️ Skipping invalid collection row:`, row);
                    }
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
     * Load artwork metadata from portfolio.json
     */
    async loadArtworkMetadata() {
        try {
            console.log('🖼️ Loading artwork metadata...');
            const response = await fetch('./data/portfolio.json');
            if (!response.ok) {
                throw new Error(`Failed to load portfolio data: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Handle the new nested structure where collections contain artworks
            if (data.collections) {
                console.log('📁 Loading collections with nested artworks...');
                
                // Extract collections and their artworks
                Object.values(data.collections).forEach(collection => {
                    if (collection.artworks && collection.artworks.length > 0) {
                        // Store collection metadata
                        this.collections.set(collection.id, {
                            id: collection.id,
                            name: collection.name,
                            description: collection.description || '',
                            notes: collection.notes || '',
                            artworks: collection.artworks
                        });
                        
                        // Also add artworks to the main artworks array for backward compatibility
                        this.artworks.push(...collection.artworks);
                        
                        console.log(`📚 Loaded collection "${collection.name}" with ${collection.artworks.length} artworks`);
                    }
                });
                
                console.log(`✅ Loaded ${this.artworks.length} total artworks from ${this.collections.size} collections`);
            } else {
                // Fallback for old structure
                this.artworks = data.artworks || data;
                
                // Ensure each artwork has required properties
                this.artworks = this.artworks.map(artwork => ({
                    id: artwork.id,
                    title: artwork.title || 'Untitled',
                    collection: artwork.collection || 'uncategorized',
                    imageUrl: artwork.imageUrl || `./artworks/${artwork.filename || artwork.id}.jpg`,
                    description: artwork.description || '',
                    dimensions: artwork.dimensions || '',
                    medium: artwork.medium || '',
                    pricing: artwork.pricing || '',
                    notes: artwork.notes || '',
                    featured: artwork.featured || false,
                    available: artwork.available !== false,
                    tags: artwork.tags || [],
                    filename: artwork.filename || `${artwork.id}.jpg`,
                    price: artwork.price || artwork.pricing || '',
                    size: artwork.size || ''
                }));
                
                console.log(`✅ Loaded ${this.artworks.length} artworks from legacy structure`);
            }
            
        } catch (error) {
            console.error('❌ Error loading artwork metadata:', error);
            this.artworks = [];
        }
    }

    /**
     * Parse CSV text into array of objects
     */
    parseCSV(csvText) {
        const lines = [];
        let currentLine = '';
        let inQuotes = false;
        let i = 0;
        
        while (i < csvText.length) {
            const char = csvText[i];
            const nextChar = csvText[i + 1];
            
            if (char === '"' && !inQuotes) {
                inQuotes = true;
            } else if (char === '"' && inQuotes) {
                if (nextChar === '"') {
                    currentLine += '"';
                    i++; // Skip the next quote
                } else {
                    inQuotes = false;
                }
            } else if (char === '\n' && !inQuotes) {
                if (currentLine.trim()) {
                    lines.push(currentLine.trim());
                }
                currentLine = '';
            } else if (char === '\r' && nextChar === '\n' && !inQuotes) {
                if (currentLine.trim()) {
                    lines.push(currentLine.trim());
                }
                currentLine = '';
                i++; // Skip the \n
            } else {
                currentLine += char;
            }
            i++;
        }
        
        // Add the last line if it exists
        if (currentLine.trim()) {
            lines.push(currentLine.trim());
        }
        
        if (lines.length === 0) return [];
        
        const headers = this.parseCSVLine(lines[0]);
        const result = [];
        
        for (let i = 1; i < lines.length; i++) {
            const values = this.parseCSVLine(lines[i]);
            const row = {};
            
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            
            result.push(row);
        }
        
        return result;
    }

    /**
     * Parse a single CSV line, handling quoted fields
     */
    parseCSVLine(line) {
        const fields = [];
        let currentField = '';
        let inQuotes = false;
        let i = 0;
        
        while (i < line.length) {
            const char = line[i];
            const nextChar = line[i + 1];
            
            if (char === '"' && !inQuotes) {
                inQuotes = true;
            } else if (char === '"' && inQuotes) {
                if (nextChar === '"') {
                    currentField += '"';
                    i++; // Skip the next quote
                } else {
                    inQuotes = false;
                }
            } else if (char === ',' && !inQuotes) {
                fields.push(currentField);
                currentField = '';
            } else {
                currentField += char;
            }
            i++;
        }
        
        // Add the last field
        fields.push(currentField);
        
        return fields;
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
            const collectionId = artwork.collection; // Use collection ID directly (COLL-0001, etc.)
            
            console.log(`🎨 Processing artwork "${artwork.title}" with collection ID: ${collectionId}`);
            
            // Add to specific collection if it exists
            if (collectionId && this.collections.has(collectionId)) {
                this.collections.get(collectionId).artworks.push(artwork);
                console.log(`✅ Added artwork "${artwork.title}" to collection ${collectionId} (${this.collections.get(collectionId).name})`);
            } else if (collectionId) {
                // Create collection if it doesn't exist (fallback)
                console.log(`🆕 Creating new collection for unknown ID: ${collectionId}`);
                this.collections.set(collectionId, {
                    id: collectionId,
                    name: collectionId, // This is the fallback that's causing the issue
                    description: `Collection ${collectionId}`,
                    artworks: [artwork]
                });
            } else {
                console.log(`⚠️ Artwork "${artwork.title}" has no collection ID`);
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

        console.log(`✅ Organized ${this.artworks.length} artworks into ${this.collections.size} collections`);
        this.collections.forEach((collection, id) => {
            console.log(`  📁 ${id}: "${collection.name}" (${collection.artworks.length} artworks)`);
            console.log(`     Description: ${collection.description ? collection.description.substring(0, 100) + '...' : 'No description'}`);
            if (collection.artworks.length > 0) {
                console.log(`     Sample artwork: "${collection.artworks[0].title}"`);
            }
        });
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
     * Get collection names for navigation
     */
    getCollectionNames() {
        return Array.from(this.collections.keys());
    }

    /**
     * Get featured artworks
     */
    getFeaturedArtworks() {
        return this.artworks.filter(artwork => artwork.featured);
    }

    /**
     * Get artwork by ID
     */
    getArtworkById(id) {
        return this.artworks.find(artwork => artwork.id === id);
    }

    /**
     * Search artworks by query
     */
    searchArtworks(query) {
        const lowercaseQuery = query.toLowerCase();
        return this.artworks.filter(artwork => 
            artwork.title.toLowerCase().includes(lowercaseQuery) ||
            artwork.description.toLowerCase().includes(lowercaseQuery) ||
            artwork.tags.some(tag => tag.toLowerCase().includes(lowercaseQuery))
        );
    }
}