# Image Management Strategy

## Overview

This portfolio uses a **hybrid image strategy** to avoid Git storage costs while maintaining high quality:

- **Web-optimized images** (200-500KB) → Stored in Git
- **Original high-resolution files** → Stored locally/externally
- **Automatic optimization** → Script converts originals to web versions

## Storage Breakdown

### ✅ **What's in Git (Free):**
- Web-optimized JPEGs (max 1200px, 85% quality)
- Thumbnails (400px, 80% quality)
- Total size: ~50-200MB for 100 artworks

### 🏠 **What's Local Only:**
- Original high-resolution files (artworks-originals/)
- Raw formats (PSD, AI, TIFF, etc.)
- Backup copies

## Workflow

### 1. **Initial Setup:**
```bash
# Install ImageMagick (one-time)
brew install imagemagick  # macOS
# or
sudo apt-get install imagemagick  # Linux
```

### 2. **Add New Artwork:**
```bash
# 1. Place high-res image in artworks-originals/
cp my-artwork.jpg artworks-originals/

# 2. Run optimization
npm run optimize-images

# 3. Add to git
git add artworks/
git commit -m "Add new artwork: my-artwork"
```

### 3. **Batch Processing:**
```bash
# Place all originals in artworks-originals/
# Then run:
npm run optimize-images
```

## File Structure

```
galorio-static/
├── artworks-originals/     # HIGH-RES (not in git)
│   ├── artwork-1.jpg       # 5-15MB originals
│   └── artwork-2.tiff      # Raw files
├── artworks/               # WEB-OPTIMIZED (in git)
│   ├── artwork-1.jpg       # 200-500KB web versions
│   ├── artwork-2.jpg       
│   └── thumbnails/         # 50-100KB thumbnails
│       ├── artwork-1.jpg   
│       └── artwork-2.jpg   
```

## Benefits

### 💰 **Cost-Free:**
- No Git LFS fees
- No external CDN costs
- Regular GitHub storage (generous limits)

### 🚀 **Performance:**
- Fast loading web-optimized images
- Progressive enhancement with thumbnails
- Good SEO and mobile experience

### 🔒 **Control:**
- Keep originals private locally
- Version control for web images
- Easy backup strategies

## Alternative: External Storage

If you want to store originals online:

### Option A: **Separate Git Repository**
```bash
# Create private repo for originals
git remote add originals git@github.com:jurra/galorio-originals.git
```

### Option B: **Cloud Storage + Public URLs**
- Upload to Google Drive/Dropbox with public sharing
- Use direct links in your artwork metadata
- Free up to several GB on most platforms

### Option C: **GitHub Releases**
- Attach original images as release assets
- Free storage, version controlled
- Access via GitHub API

## Current Limits

### **GitHub Standard:**
- Repository size: Soft limit ~1GB, hard limit ~100GB
- File size: Max 100MB per file
- Our optimized images: ~200-500KB each = thousands of artworks possible

### **Bandwidth:**
- Unlimited for public repositories
- Fast global CDN (GitHub Pages)

## Recommendation

**Start with the hybrid approach** - it's free, fast, and handles 99% of art portfolio needs without any costs or complexity!