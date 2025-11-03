# Art Portfolio Static

A customizable static art portfolio that auto-populates from image metadata with responsive design and mobile navigation.

## Features

- 📱 **Responsive Design**: Mobile-first approach with hamburger navigation
- 🎨 **Dynamic Gallery**: Auto-generates from CSV configuration
- 🔍 **Search & Filter**: Find artworks by title, description, or tags
- �️ **Image Zoom**: Interactive zoom functionality for detailed viewing
- 📊 **Collection Organization**: Group artworks into custom collections
- 🎯 **Smooth Interactions**: Drag, zoom, and navigate with smooth animations
- ♿ **Accessibility**: ARIA attributes and keyboard navigation support

## Quick Start

1. **Clone and Install**:
   ```bash
   git clone <your-repo-url>
   cd galorio-static
   npm install
   ```

2. **Setup Your Data**:
   ```bash
   npm run setup  # Creates example CSV files
   ```

3. **Add Your Content**:
   - Add artwork images to `artworks/` folder
   - Edit `config/artwork-inventory.csv` with your artwork details
   - Edit `config/collections.csv` to organize your collections

4. **Build and Preview**:
   ```bash
   npm run build:all  # Builds metadata and bundles JavaScript
   npm run dev        # Starts local server at http://localhost:8080
   ```

## Deployment

### GitHub Pages (Automatic)

This project is configured for automatic deployment to GitHub Pages:

1. **Push to GitHub**:
   ```bash
   git add .
   git commit -m "Deploy portfolio"
   git push origin main
   ```

2. **Enable GitHub Pages**:
   - Go to your repository Settings
   - Navigate to Pages section
   - Source: "GitHub Actions"
   - The workflow will automatically build and deploy

3. **Access Your Site**:
   - Your portfolio will be live at: `https://yourusername.github.io/repository-name`

### Manual Deployment

For other hosting services:

```bash
npm run deploy  # Builds everything ready for deployment
```

Then upload all files to your hosting provider.

## Project Structure

```
galorio-static/
├── index.html              # Main gallery page
├── artwork.html            # Individual artwork viewer
├── config/                 # CSV configuration files
│   ├── artwork-inventory.csv    # Artwork metadata
│   └── collections.csv          # Collection definitions
├── artworks/               # Artwork image files (add your images here)
├── css/                    # Stylesheets
├── js/                     # JavaScript modules
├── data/                   # Generated portfolio data
└── dist/                   # Built JavaScript bundles
```

## Configuration

### Artwork CSV Format

The `config/artwork-inventory.csv` should include:
- `title`: Artwork title
- `image_path`: Filename in artworks/ folder
- `description`: Artwork description
- `collection`: Collection name
- `featured`: true/false for homepage display
- `tags`: Comma-separated tags for search

### Collections CSV Format

The `config/collections.csv` should include:
- `name`: Collection display name
- `description`: Collection description
- `order`: Display order number

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build JavaScript bundles
- `npm run build:metadata` - Generate portfolio data from CSV
- `npm run build:all` - Build everything (metadata + bundles)
- `npm run deploy` - Complete build for deployment
- `npm run setup` - Copy example CSV files

## Responsive Design

The portfolio automatically adapts to different screen sizes:
- **Desktop**: Full navigation bar with hover effects
- **Tablet**: Responsive grid layouts
- **Mobile**: Hamburger menu with touch-friendly interactions

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Progressive enhancement for older browsers

## License

MIT License - feel free to use for your own art portfolio!