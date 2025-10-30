# Google Sheets Workflow Guide

This guide explains how to manage your art portfolio using Google Sheets and export to your static website.

## Google Sheets Setup

### Column Structure

Your Google Sheets should have exactly these columns in this order:

| Column | Name | Description | Example |
|--------|------|-------------|---------|
| A | Title | Artwork title | "Black Swan" |
| B | ID | Unique artwork identifier | "ABS-0001" |
| C | Collection | Collection/series name | "COLL-0001" |
| D | Reference | Thumbnail/reference image | (embedded image) |
| E | Pricing | Price or pricing notes | "$1200" |
| F | Dimensions | Artwork dimensions | "71.1*101.6" |
| G | Size | Size category | "medium", "small", "large" |
| H | x | Featured marker | "x" for featured, empty for not |
| I | Dimensions | Additional dimensions | (can be empty or duplicate) |
| J | Notes | Short notes or tags | "A line for this work" |
| K | Extended description | Full artwork description | Detailed description with meaning |

### Setting Up Your Sheet

1. **Create a new Google Sheet** with the exact column headers above
2. **Add your artwork data** row by row
3. **Use consistent formatting**:
   - Prices: Include $ symbol (e.g., "$1200")
   - IDs: Use a consistent format (e.g., "ABS-0001")
   - Collections: Group related works
   - Featured: Mark with "x" for featured artworks

### Data Guidelines

#### Title (Column A)
- Use clear, descriptive titles
- Avoid special characters that might cause issues
- Example: "Black Swan", "Phoenix Flight"

#### ID (Column B)
- Create unique IDs for each artwork
- Suggested format: PREFIX-NUMBER (e.g., "ABS-0001")
- IDs will be used to generate image filenames

#### Collection (Column C)
- Group related artworks
- Use consistent naming
- Example: "COLL-0001", "Spiritual Series"

#### Pricing (Column E)
- Include currency symbol: "$1200"
- Use "Price on request" or "POA" for special cases
- Leave empty for not-for-sale items

#### Size Categories (Column G)
- "small" - typically under 24 inches
- "medium" - 24-48 inches  
- "large" - over 48 inches
- "x-large" - oversized works

#### Featured Marker (Column H)
- Put "x" for artworks you want to highlight
- Featured works appear prominently in gallery
- Leave empty for regular display

#### Extended Description (Column K)
- Include meaning, inspiration, techniques
- Mention spiritual or symbolic significance
- Add any story behind the artwork

## Exporting from Google Sheets

### Step 1: Download as CSV
1. Open your Google Sheet
2. Go to **File > Download > Comma Separated Values (.csv)**
3. Save the file as `artwork-inventory.csv`

### Step 2: Upload to Website
1. Place the CSV file in the `config/` folder of your website
2. Replace the existing `artwork-inventory.csv`

### Step 3: Add Artwork Images
1. Create image files named after your IDs
2. Format: `{ID}.jpg` (e.g., `abs-0001.jpg`)
3. Place images in the `artworks/` folder
4. Recommended: 1200px minimum width for quality

### Step 4: Build and Deploy
1. Run the build script: `npm run build`
2. Test locally: `npm run dev`
3. Deploy to your hosting platform

## Image Naming Convention

Based on your ID column, images should be named:
- ID: "ABS-0001" → Image: "abs-0001.jpg"
- ID: "PORTRAIT-015" → Image: "portrait-015.jpg"

The system automatically converts IDs to lowercase and uses `.jpg` extension.

## Supported Image Formats
- JPEG (.jpg, .jpeg) - Recommended
- PNG (.png)
- WebP (.webp)
- SVG (.svg)
- GIF (.gif)

## Collection Management

### Creating Collections
- Use the Collection column to group artworks
- Collections automatically become filter buttons
- Examples: "Spiritual Series", "Landscapes", "Portraits"

### Collection Display
- Artworks are automatically grouped by collection
- Users can filter by collection on the website
- Each collection gets its own page/section

## Pricing and Availability

### Price Formats
- `$1200` - Standard pricing
- `$2,500` - With comma separator
- `Price on request` - For inquiries
- `POA` - Price on application
- Empty - Not for sale

### Availability Logic
- Artwork is "Available" if Pricing column has a value
- Mark as "Sold" by putting "sold" in Pricing column
- Featured items (marked with "x") get special prominence

## SEO and Metadata

The system automatically generates:
- **Page titles** from artwork titles
- **Meta descriptions** from extended descriptions
- **Schema.org markup** for search engines
- **Social media tags** for sharing
- **Sitemap** for search indexing

## Troubleshooting

### Common Issues

1. **Artworks not appearing**
   - Check that Title column has values
   - Verify CSV headers match exactly
   - Ensure CSV is properly formatted

2. **Images not displaying**
   - Check image filenames match ID format
   - Verify images are in `artworks/` folder
   - Check file extensions are supported

3. **Pricing not showing**
   - Include $ symbol in pricing
   - Check for extra spaces or formatting

4. **Collections not grouping**
   - Use consistent collection names
   - Check for spelling variations

### Testing Your Data

1. **Preview in browser**: Check `http://localhost:8080`
2. **Check console**: Look for JavaScript errors
3. **Validate CSV**: Ensure proper formatting
4. **Test all features**: Gallery, filters, detail pages

## Advanced Features

### Custom Styling
- Modify `css/` files to match your brand
- Update colors, fonts, and layouts
- Customize hover effects and animations

### Contact Integration
- Update contact form to your email
- Add social media links
- Customize inquiry types

### Analytics
- Add Google Analytics tracking
- Monitor visitor behavior
- Track artwork views and inquiries

## Backup Strategy

1. **Keep Google Sheets as master copy**
2. **Backup CSV exports regularly**
3. **Version control for website files**
4. **Backup original high-resolution images**

## Performance Tips

1. **Optimize images**: Compress before uploading
2. **Use WebP format**: Better compression than JPEG
3. **Responsive images**: Multiple sizes for different devices
4. **CDN hosting**: For faster global loading

## Support

For technical questions:
1. Check browser console for errors
2. Validate CSV format
3. Test image file paths
4. Review documentation thoroughly

Your workflow: **Google Sheets → CSV Export → Website Upload → Build → Deploy**