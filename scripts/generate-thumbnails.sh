#!/bin/bash

# Collection Thumbnail Generation Script
# Generates small thumbnails specifically for collection preview display
# Keeps original LFS images untouched for individual artwork viewing

ARTWORKS_DIR="artworks"
THUMBNAILS_DIR="artworks/thumbnails"
THUMBNAIL_SIZE=300  # Smaller for collection previews
THUMBNAIL_QUALITY=80

echo "🖼️  Collection Thumbnail Generator"
echo "================================="
echo "🎯 Purpose: Fast collection previews (originals preserved)"

# Check if ImageMagick is installed
if ! command -v magick &> /dev/null; then
    echo "❌ ImageMagick not found. Install with:"
    echo "   macOS: brew install imagemagick"
    echo "   Ubuntu: sudo apt-get install imagemagick"
    exit 1
fi

# Create thumbnails directory
mkdir -p "$THUMBNAILS_DIR"

echo "🔄 Generating collection preview thumbnails..."

# Count images to process
image_count=$(find "$ARTWORKS_DIR" -maxdepth 1 -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" | wc -l)
processed=0

# Process each image in artworks directory (excluding thumbnails subdirectory)
for artwork in "$ARTWORKS_DIR"/*.{jpg,jpeg,png}; do
    if [[ -f "$artwork" ]]; then
        filename=$(basename "$artwork")
        name="${filename%.*}"
        
        # Skip if it's already a thumbnail
        if [[ "$filename" == *"-thumb"* ]] || [[ "$filename" == *"thumbnail"* ]]; then
            continue
        fi
        
        # Thumbnail output
        thumb_output="$THUMBNAILS_DIR/${name}-thumb.jpg"
        
        # Skip if thumbnail already exists and is newer than source
        if [[ -f "$thumb_output" && "$thumb_output" -nt "$artwork" ]]; then
            echo "  ⏭️  Skipping: $filename (thumbnail up to date)"
            continue
        fi
        
        ((processed++))
        echo "  🖼️  Processing [$processed/$image_count]: $filename"
        
        # Create thumbnail (square crop from center, 400px, quality 80%)
        magick "$artwork" \
            -resize "${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE}^" \
            -gravity center \
            -extent "${THUMBNAIL_SIZE}x${THUMBNAIL_SIZE}" \
            -quality $THUMBNAIL_QUALITY \
            -strip \
            "$thumb_output"
        
        # Show file sizes
        if [[ -f "$thumb_output" ]]; then
            original_size=$(du -h "$artwork" | cut -f1)
            thumb_size=$(du -h "$thumb_output" | cut -f1)
            echo "    📊 $original_size → $thumb_size (thumbnail)"
        else
            echo "    ❌ Failed to create thumbnail"
        fi
    fi
done

echo ""
echo "✅ Thumbnail generation complete!"
echo "📁 Thumbnails: ./$THUMBNAILS_DIR/"
echo "📊 Generated: $processed thumbnails"

# Show total directory sizes
if [[ -d "$THUMBNAILS_DIR" ]]; then
    thumb_total=$(du -sh "$THUMBNAILS_DIR" | cut -f1)
    echo "📏 Total thumbnail size: $thumb_total"
fi

echo ""
echo "📋 Usage in your app:"
echo "   - Use thumbnails for gallery/collection previews"
echo "   - Load original LFS images in the background"
echo "   - Swap to originals when user interacts with image"
echo ""
echo "🔧 To regenerate all thumbnails:"
echo "   rm -rf $THUMBNAILS_DIR && npm run generate-thumbnails"