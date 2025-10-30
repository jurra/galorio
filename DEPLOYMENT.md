# Deployment Guide

This guide covers deploying your static art portfolio to various hosting platforms.

## Pre-deployment Checklist

- [ ] Add your artwork images to `artworks/` folder
- [ ] Create metadata JSON files for each artwork
- [ ] Update `config/collections.csv` with your collections and ordering
- [ ] Run `npm run build` to generate portfolio data
- [ ] Test locally with `npm run dev`
- [ ] Update contact information in the code
- [ ] Replace placeholder content with your details

## Hosting Options

### 1. GitHub Pages (Free)

1. Create a new repository on GitHub
2. Upload your portfolio files
3. Go to Settings > Pages
4. Select source: Deploy from a branch
5. Choose `main` branch and `/ (root)` folder
6. Your site will be available at `https://username.github.io/repository-name`

### 2. Netlify (Free tier available)

1. Sign up at [netlify.com](https://netlify.com)
2. Drag and drop your project folder to Netlify dashboard
3. Or connect your GitHub repository for automatic deployments
4. Your site will get a random subdomain (can be customized)

### 3. Vercel (Free tier available)

1. Sign up at [vercel.com](https://vercel.com)
2. Import your GitHub repository
3. Vercel will automatically detect it's a static site
4. Deploy and get a `.vercel.app` domain

### 4. Custom Domain Setup

After deploying to any platform:

1. Purchase a domain from a registrar (GoDaddy, Namecheap, etc.)
2. Update DNS settings to point to your hosting platform
3. Configure HTTPS (usually automatic on modern platforms)

## Environment-Specific Updates

### Update Contact Information

Edit these files with your details:

- `index.html` - Artist name, bio, social links
- `artwork.html` - Contact form email address
- `js/artwork-detail.js` - Email address in `handleContactSubmission` function

### Custom Styling

- `css/main.css` - Main styling and brand colors
- `css/gallery.css` - Gallery layout and hover effects
- `css/artwork.css` - Individual artwork page styles

### SEO Optimization

1. Update meta tags in HTML files
2. Generate and submit sitemap.xml to search engines
3. Add Google Analytics code if desired
4. Optimize image file sizes for web

## Performance Optimization

### Image Optimization

```bash
# Install imagemin tools
npm install -g imagemin-cli imagemin-mozjpeg imagemin-pngquant

# Optimize images
imagemin artworks/*.jpg --out-dir=artworks/optimized --plugin=mozjpeg
imagemin artworks/*.png --out-dir=artworks/optimized --plugin=pngquant
```

### Progressive Web App (Optional)

Add these files for PWA functionality:

1. `manifest.json` - App manifest
2. `sw.js` - Service worker for offline support
3. Icon files in various sizes

## Monitoring and Analytics

### Google Analytics

Add to `<head>` section of HTML files:

```html
<!-- Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'GA_MEASUREMENT_ID');
</script>
```

### Error Monitoring

Consider adding error tracking services like:
- Sentry
- LogRocket
- Rollbar

## Backup Strategy

1. Keep source files in version control (Git)
2. Backup original high-resolution images separately
3. Export metadata regularly
4. Document any custom modifications

## Updates and Maintenance

1. Regular content updates via Git commits
2. Monitor site performance and loading times
3. Check for broken links periodically
4. Update dependencies when needed
5. Review and respond to contact form submissions

## Support

For technical issues:
1. Check browser console for JavaScript errors
2. Validate HTML and CSS
3. Test on different devices and browsers
4. Check hosting platform status pages