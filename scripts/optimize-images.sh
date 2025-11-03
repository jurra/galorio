#!/bin/bash

# Image Optimization Script for Art Portfolio
# Converts high-resolution artwork to web-optimized versions

ARTWORKS_DIR="artworks"
ORIGINALS_DIR="artworks-originals"
WEB_QUALITY=85
WEB_MAX_WIDTH=1200
THUMBNAIL_SIZE=400

echo "🎨 Art Portfolio Image Optimizer"
echo "================================"

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick not found. Install with:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# Create directories
mkdir -p "$ARTWORKS_DIR"
mkdir -p "$ARTWORKS_DIR/thumbnails"

if [ ! -d "$ORIGINALS_DIR" ]; then
    echo "📁 Creating $ORIGINALS_DIR directory for your high-res images"
    mkdir -p "$ORIGINALS_DIR"
    echo "📋 Place your original high-resolution artwork files in: ./$ORIGINALS_DIR/"
    echo "   Supported formats: JPG, PNG, TIFF, etc."
    exit 0
fi

echo "🔄 Processing images from $ORIGINALS_DIR..."

# Process each image in originals directory
for original in "$ORIGINALS_DIR"/*; do
    if [[ -f "$original" ]]; then
        filename=$(basename "$original")
        name="${filename%.*}"
        
        # Web-optimized version
        web_output="$ARTWORKS_DIR/${name}.jpg"
        
        # Thumbnail version
        thumb_output="$ARTWORKS_DIR/thumbnails/${name}.jpg"
        
        echo "  📸 Processing: $filename"
        
        # Create web-optimized version (max 1200px width, quality 85%)
        magick "$original" \
            -resize "${WEB_MAX_WIDTH}x${WEB_MAX_WIDTH}>" \
            -quality $WEB_QUALITY \
            -strip \
            "$web_output"
        
        # Create thumbnail (400px max, quality 80%)
        magick "$original" \
            -resize "${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE}>" \
            -quality 80 \
            -strip \
            "$thumb_output"
        
        # Show file sizes
        original_size=$(du -h "$original" | cut -f1)
        web_size=$(du -h "$web_output" | cut -f1)
        thumb_size=$(du -h "$thumb_output" | cut -f1)
        
        echo "    📊 Original: $original_size → Web: $web_size, Thumbnail: $thumb_size"
    fi
done

echo ""
echo "✅ Image optimization complete!"
echo "📁 Web images: ./$ARTWORKS_DIR/"
echo "📁 Thumbnails: ./$ARTWORKS_DIR/thumbnails/"
echo ""
echo "📋 Next steps:"
echo "   1. Add optimized images to git: git add $ARTWORKS_DIR"
echo "   2. Keep originals in $ORIGINALS_DIR (not tracked by git)"
echo "   3. Update your CSV with the new filenames"