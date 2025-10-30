#!/usr/bin/env node

/**
 * Build Script for Art Portfolio Static
 * Generates portfolio.json from artwork files and CSV configuration
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.dirname(__dirname);

console.log('🎨 Building Art Portfolio Static...\n');

/**
 * Parse CSV file with proper handling of quoted fields and multiline content
 */
function parseCSV(csvText) {
    const lines = csvText.trim().split('\n');
    const headers = parseCSVLine(lines[0]);
    const data = [];
    
    let i = 1;
    while (i < lines.length) {
        const { values, nextLineIndex } = parseCSVRecord(lines, i);
        if (values && values.length > 0 && values.some(v => v.trim())) {
            const row = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || '';
            });
            data.push(row);
        }
        i = nextLineIndex;
    }

    return data;
}

/**
 * Parse a single CSV line, handling quoted fields
 */
function parseCSVLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;
    let i = 0;
    
    while (i < line.length) {
        const char = line[i];
        
        if (char === '"') {
            if (inQuotes && line[i + 1] === '"') {
                // Escaped quote
                current += '"';
                i += 2;
            } else {
                // Toggle quote state
                inQuotes = !inQuotes;
                i++;
            }
        } else if (char === ',' && !inQuotes) {
            result.push(current.trim());
            current = '';
            i++;
        } else {
            current += char;
            i++;
        }
    }
    
    result.push(current.trim());
    return result;
}

/**
 * Parse a CSV record that might span multiple lines
 */
function parseCSVRecord(lines, startIndex) {
    let record = lines[startIndex];
    let currentIndex = startIndex;
    
    // Count quotes to determine if record is complete
    let quoteCount = (record.match(/"/g) || []).length;
    
    // If odd number of quotes, the record continues on next lines
    while (quoteCount % 2 !== 0 && currentIndex + 1 < lines.length) {
        currentIndex++;
        record += '\n' + lines[currentIndex];
        quoteCount += (lines[currentIndex].match(/"/g) || []).length;
    }
    
    const values = parseCSVLine(record);
    return {
        values,
        nextLineIndex: currentIndex + 1
    };
}

/**
 * Load CSV configuration
 */
function loadCSVConfig() {
    // Try the new inventory CSV first
    let csvPath = path.join(projectRoot, 'config', 'artwork-inventory.csv');
    
    try {
        const csvText = fs.readFileSync(csvPath, 'utf8');
        return parseCSV(csvText);
    } catch (error) {
        // Fallback to old collections.csv
        csvPath = path.join(projectRoot, 'config', 'collections.csv');
        try {
            const csvText = fs.readFileSync(csvPath, 'utf8');
            return parseCSV(csvText);
        } catch (error2) {
            console.log('⚠️  No CSV configuration found, using default order');
            return null;
        }
    }
}

/**
 * Get all image files in artworks directory
 */
function getImageFiles() {
    const artworksDir = path.join(projectRoot, 'artworks');
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
    
    try {
        const files = fs.readdirSync(artworksDir);
        return files.filter(file => {
            const ext = path.extname(file).toLowerCase();
            return imageExtensions.includes(ext);
        });
    } catch (error) {
        console.error('❌ Error reading artworks directory:', error.message);
        return [];
    }
}

/**
 * Load metadata for an artwork from CSV (not used in CSV-only mode)
 */
function loadArtworkMetadata(filename) {
    // This function is not needed in CSV-only mode
    // All metadata comes from the CSV file
    return null;
}

/**
 * Process CSV row into artwork object
 */
function processCSVRow(row) {
    return {
        filename: row.filename,
        imageUrl: `./artworks/${row.filename}`,
        id: generateId(row.filename),
        title: row.title || generateTitleFromFilename(row.filename),
        medium: row.medium || '',
        dimensions: row.dimensions || '',
        year: row.year || '',
        price: row.price || 'Price on request',
        description: row.description || '',
        available: parseBoolean(row.available),
        collection: row.collection || 'All',
        order: row.order ? parseInt(row.order) : 999,
        featured: parseBoolean(row.featured),
        tags: parseTags(row.tags)
    };
}

/**
 * Parse boolean values from CSV
 */
function parseBoolean(value) {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
        const lower = value.toLowerCase().trim();
        return lower === 'true' || lower === 'yes' || lower === '1';
    }
    return false;
}

/**
 * Parse tags from CSV
 */
function parseTags(tagsString) {
    if (!tagsString) return [];
    
    return tagsString
        .split(',')
        .map(tag => tag.trim())
        .filter(tag => tag.length > 0);
}

/**
 * Generate title from filename
 */
function generateTitleFromFilename(filename) {
    const baseName = path.parse(filename).name;
    return baseName.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Generate unique ID for artwork
 */
function generateId(input) {
    if (!input) return 'artwork-' + Date.now();
    return input.toLowerCase().replace(/[^a-z0-9]/g, '-');
}

/**
 * Generate image filename from ID and title
 */
function generateImageFilename(id, title) {
    // First try to use ID as filename (preserve case)
    if (id) {
        return `${id}.jpg`;
    }
    // Fallback to title (convert to lowercase)
    return `${generateId(title)}.jpg`;
}

/**
 * Extract price from pricing column
 */
function extractPrice(pricingText) {
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
function generateTags(title, description) {
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
 * Build portfolio data
 */
function buildPortfolio() {
    console.log('� Loading CSV configuration...');
    const csvConfig = loadCSVConfig();
    
    if (!csvConfig || csvConfig.length === 0) {
        console.log('❌ No CSV configuration found or CSV is empty');
        return { 
            artworks: [], 
            collections: {},
            meta: {
                generatedAt: new Date().toISOString(),
                totalArtworks: 0,
                collectionsCount: 0,
                featuredCount: 0
            }
        };
    }
    
    console.log(`Found ${csvConfig.length} entries in CSV`);
    
    console.log('🖼️  Processing artwork metadata from CSV...');
    const artworks = [];
    
    csvConfig.forEach(row => {
        if (row.Title) { // Check for Title instead of filename
            console.log(`  Processing: ${row.Title}`);
            
            // Map CSV columns to artwork object (using your exact column structure)
            const artwork = {
                id: row.ID || generateId(row.Title),
                title: row.Title,
                collection: row.Collection,
                pricing: row.Pricing,
                dimensions: row.Dimensions || row['Dimensions'], // Handle both dimension columns
                size: row.Size,
                notes: row.Notes,
                description: row['Extended description'] || '',
                
                // Generate image filename from ID
                filename: generateImageFilename(row.ID, row.Title),
                imageUrl: `./artworks/${generateImageFilename(row.ID, row.Title)}`,
                
                // Set availability based on pricing or status
                available: !!(row.Pricing && row.Pricing !== 'sold'),
                
                // Extract price from pricing column
                price: extractPrice(row.Pricing),
                
                // Set featured status
                featured: row.x === 'x',
                
                // Generate tags
                tags: generateTags(row.Title, row['Extended description'])
            };
            
            artworks.push(artwork);
        }
    });
    
    // Sort artworks by order if specified, otherwise by title
    artworks.sort((a, b) => {
        if (a.order && b.order) {
            return parseInt(a.order) - parseInt(b.order);
        }
        return (a.title || '').localeCompare(b.title || '');
    });
    
    console.log(`✅ Processed ${artworks.length} artworks from CSV`);
    
    // Generate collections info
    const collections = {};
    artworks.forEach(artwork => {
        const collection = artwork.collection || 'All';
        if (!collections[collection]) {
            collections[collection] = [];
        }
        collections[collection].push(artwork.id);
    });
    
    const portfolioData = {
        artworks,
        collections,
        meta: {
            generatedAt: new Date().toISOString(),
            totalArtworks: artworks.length,
            collectionsCount: Object.keys(collections).length,
            featuredCount: artworks.filter(a => a.featured === true).length,
            missingImages: artworks.filter(a => a.missingImage).length
        }
    };
    
    return portfolioData;
}

/**
 * Write portfolio data to file
 */
function writePortfolioData(portfolioData) {
    const dataDir = path.join(projectRoot, 'data');
    const outputPath = path.join(dataDir, 'portfolio.json');
    
    // Ensure data directory exists
    if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
    }
    
    const jsonString = JSON.stringify(portfolioData, null, 2);
    fs.writeFileSync(outputPath, jsonString, 'utf8');
    
    console.log(`💾 Portfolio data written to: ${outputPath}`);
    
    if (portfolioData.meta) {
        console.log(`📊 Data summary:`);
        console.log(`   - ${portfolioData.meta.totalArtworks} artworks`);
        console.log(`   - ${portfolioData.meta.collectionsCount} collections`);
        console.log(`   - ${portfolioData.meta.featuredCount} featured artworks`);
    }
}

/**
 * Generate sitemap
 */
function generateSitemap(portfolioData) {
    const baseUrl = 'https://your-domain.com'; // Update with your actual domain
    const currentDate = new Date().toISOString().split('T')[0];
    
    let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>1.0</priority>
  </url>`;
    
    portfolioData.artworks.forEach(artwork => {
        sitemap += `
  <url>
    <loc>${baseUrl}/artwork.html?id=${artwork.id}</loc>
    <lastmod>${currentDate}</lastmod>
    <priority>0.8</priority>
  </url>`;
    });
    
    sitemap += '\n</urlset>';
    
    const sitemapPath = path.join(projectRoot, 'sitemap.xml');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    
    console.log(`🗺️  Sitemap generated: ${sitemapPath}`);
}

/**
 * Main build function
 */
function main() {
    try {
        const portfolioData = buildPortfolio();
        writePortfolioData(portfolioData);
        generateSitemap(portfolioData);
        
        console.log('\n✨ Build completed successfully!');
        console.log('\n📋 Next steps:');
        console.log('   1. Add your artwork images to the artworks/ folder');
        console.log('   2. Create corresponding .json metadata files');
        console.log('   3. Update config/collections.csv for custom ordering');
        console.log('   4. Run: npm run dev');
        console.log('   5. Open: http://localhost:8080');
        
    } catch (error) {
        console.error('\n❌ Build failed:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the build
main();