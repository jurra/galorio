# Art Portfolio - Development Setup

## Overview
This project uses a build system that processes CSV files and artwork images to generate the gallery. The actual data files (CSVs and images) are excluded from version control and only used during the build process.

## Required Files (Not in Git)

### 1. Artwork Data
Copy and customize the example file:
```bash
cp config/artwork-inventory.example.csv config/artwork-inventory.csv
```

The CSV should contain your artwork data with columns:
- `Title` - Artwork title
- `ID` - Unique identifier (e.g., ABS-0001)
- `Collection` - Collection ID (e.g., COLL-0001)
- `Medium` - Art medium
- `Pricing` - Price information
- `Dimensions` - Size information
- `Size` - Category (Small/Medium/Large)
- `x` - Mark with 'x' for featured artworks
- `Notes` - Additional notes
- `Extended description` - Detailed description

### 2. Collection Metadata
Copy and customize the example file:
```bash
cp config/collections.example.csv config/collections.csv
```

The CSV should contain collection information:
- `Title` - Collection name
- `ID` - Collection identifier (e.g., COLL-0001)
- `Description` - Collection description
- `Notes` - Additional notes

### 3. Artwork Images
Place your artwork images in the `artworks/` folder:
```
artworks/
├── ABS-0001.jpg
├── ABS-0002.jpg
└── ...
```

Supported formats: `.jpg`, `.jpeg`, `.png`, `.gif`, `.webp`, `.tiff`, `.bmp`

## Build Configuration

Customize the ordering in `build.config.json`:

```json
{
  "collectionOrder": "csv_order",
  "artworkOrder": "csv_order"
}
```

### Collection Order Options:
- `"csv_order"` - Use the order from the CSV file (default)
- `"alphabetical"` - Sort collections A-Z by name
- `"random"` - Random order on each build

### Artwork Order Options:
- `"csv_order"` - Use the order from the CSV file (default)
- `"alphabetical"` - Sort artworks A-Z by title
- `"random"` - Random order on each build

## Development Workflow

1. **Setup Data Files**:
   ```bash
   # Copy example files
   cp config/artwork-inventory.example.csv config/artwork-inventory.csv
   cp config/collections.example.csv config/collections.csv
   
   # Edit the files with your actual data
   # Add your artwork images to artworks/ folder
   ```

2. **Build Portfolio Data**:
   ```bash
   npm run build:metadata
   ```

3. **Build JavaScript**:
   ```bash
   npm run build
   ```

4. **Start Development Server**:
   ```bash
   npm run dev
   ```

## What's Ignored by Git

The following files are excluded from version control:
- `config/artwork-inventory.csv` - Your actual artwork data
- `config/collections.csv` - Your actual collection data
- `artworks/*.jpg`, `*.png`, etc. - Your artwork images
- `data/portfolio.json` - Generated during build
- `sitemap.xml` - Generated during build

## What's Included in Git

- Example/template files (`.example.csv`)
- Build scripts and configuration
- Frontend JavaScript and CSS
- Documentation
- Small placeholder images (if any)

This approach keeps sensitive artwork data and large image files out of the repository while maintaining a complete development setup.