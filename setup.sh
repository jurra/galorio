#!/bin/bash

echo "🎨 Art Portfolio Setup"
echo "====================="
echo ""

# Check if example files exist
if [ ! -f "config/artwork-inventory.example.csv" ]; then
    echo "❌ Example files not found. Are you in the correct directory?"
    exit 1
fi

# Copy example files if they don't exist
if [ ! -f "config/artwork-inventory.csv" ]; then
    echo "📋 Copying artwork inventory example..."
    cp config/artwork-inventory.example.csv config/artwork-inventory.csv
else
    echo "📋 artwork-inventory.csv already exists"
fi

if [ ! -f "config/collections.csv" ]; then
    echo "📚 Copying collections example..."
    cp config/collections.example.csv config/collections.csv
else
    echo "📚 collections.csv already exists"
fi

echo ""
echo "✅ Setup complete!"
echo ""
echo "📝 Next steps:"
echo "   1. Edit config/artwork-inventory.csv with your artwork data"
echo "   2. Edit config/collections.csv with your collection info"
echo "   3. Add your artwork images to the artworks/ folder"
echo "   4. Run: npm run build:all"
echo "   5. Run: npm run dev"
echo ""
echo "📖 See DEVELOPMENT.md for detailed instructions"