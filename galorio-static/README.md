# Art Portfolio - Static

A customizable static art portfolio website that automatically populates from image folders with metadata.

## Features

- 🎨 **Automatic Image Discovery** - Scans image folders and loads metadata
- 📋 **CSV Configuration** - Control artwork order and create collections
- 📱 **Responsive Design** - Works on all devices
- ✨ **Hover Effects** - Reveal artwork details on hover
- 🔗 **Individual Pages** - Detailed view for each artwork
- 🏷️ **Collections Support** - Organize artworks into groups
- 🚀 **Static Hosting Ready** - Deploy to GitHub Pages, Netlify, Vercel

## Quick Start

1. Add your artwork images to the `artworks/` folder
2. Create metadata files (JSON) for each image
3. Optionally configure collections in `config/collections.csv`
4. Open `index.html` in your browser

## Folder Structure

```
├── index.html              # Main gallery page
├── artwork.html            # Individual artwork template
├── css/
│   ├── main.css           # Main styles
│   ├── gallery.css        # Gallery grid styles
│   └── artwork.css        # Individual artwork styles
├── js/
│   ├── main.js           # Main application logic
│   ├── metadata.js       # Metadata processing
│   └── gallery.js        # Gallery functionality
├── artworks/             # Your artwork images
│   ├── painting1.jpg
│   ├── painting1.json    # Metadata for painting1.jpg
│   └── ...
├── config/
│   └── collections.csv   # Collections and ordering
└── data/
    └── portfolio.json    # Generated portfolio data
```

## Metadata Format

Create a JSON file for each artwork with the same name:

```json
{
  "title": "Moonlight Reflection",
  "medium": "Acrylic on canvas",
  "dimensions": "24 x 36 inches",
  "year": "2024",
  "price": "$1,200",
  "description": "A serene landscape capturing...",
  "available": true,
  "collection": "Landscapes",
  "tags": ["landscape", "night", "water"]
}
```

## CSV Configuration

Use `config/collections.csv` to control ordering and collections:

```csv
filename,title,collection,order,featured
painting1.jpg,Moonlight Reflection,Landscapes,1,true
sculpture2.jpg,Abstract Form,Sculptures,2,false
```

## Development

```bash
# Start local server
npm run dev

# Build optimized version
npm run build
```

Visit `http://localhost:8080` to view your portfolio.

## Deployment

This is a static website that can be deployed to:
- GitHub Pages
- Netlify
- Vercel
- Any static hosting service

Simply upload the files or connect your repository.