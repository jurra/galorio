import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import copy from 'rollup-plugin-copy';
import postcss from 'rollup-plugin-postcss';
import fs from 'fs';
import path from 'path';

// Custom plugin to bundle HTML with inlined CSS and JS
function htmlBundle() {
  return {
    name: 'html-bundle',
    generateBundle(options, bundle) {
      // Read the original HTML file
      const htmlContent = fs.readFileSync('index.html', 'utf-8');
      
      // Get the bundled JS content
      const jsBundle = Object.values(bundle).find(chunk => chunk.type === 'chunk');
      const jsContent = jsBundle ? jsBundle.code : '';
      
      // Read and combine CSS files
      const cssFiles = ['css/main.css', 'css/collections.css'];
      const cssContent = cssFiles
        .filter(file => fs.existsSync(file))
        .map(file => fs.readFileSync(file, 'utf-8'))
        .join('\n');
      
      // Create a cache-busting timestamp
      const timestamp = Date.now();
      
      // Create the bundled HTML with inlined CSS and JS
      let bundledHtml = htmlContent
        // Remove CSS link tags
        .replace(/<link[^>]*href="[^"]*\.css"[^>]*>/g, '')
        // Remove JS script tags
        .replace(/<script[^>]*src="[^"]*\.js"[^>]*><\/script>/g, '')
        // Insert bundled CSS
        .replace('</head>', `<style>${cssContent}</style>\n</head>`)
        // Insert bundled JS with cache-busting comment before closing body tag
        .replace('</body>', `<script>/* Build: ${timestamp} */ ${jsContent}</script>\n</body>`);
      
      // Emit the bundled HTML file
      this.emitFile({
        type: 'asset',
        fileName: 'index.html',
        source: bundledHtml
      });
    }
  };
}

// Custom plugin to bundle artwork.html with inlined CSS and JS
function artworkHtmlBundle() {
  return {
    name: 'artwork-html-bundle',
    generateBundle(options, bundle) {
      // Read the original artwork HTML file
      const htmlContent = fs.readFileSync('artwork.html', 'utf-8');
      
      // Get the bundled JS content
      const jsBundle = Object.values(bundle).find(chunk => chunk.type === 'chunk');
      const jsContent = jsBundle ? jsBundle.code : '';
      
      // Read and combine CSS files for artwork page
      const cssFiles = ['css/main.css', 'css/artwork.css'];
      const cssContent = cssFiles
        .filter(file => fs.existsSync(file))
        .map(file => fs.readFileSync(file, 'utf-8'))
        .join('\n');
      
      // Create a cache-busting timestamp
      const timestamp = Date.now();
      
      // Create the bundled HTML with inlined CSS and JS
      let bundledHtml = htmlContent
        // Remove CSS link tags
        .replace(/<link[^>]*href="[^"]*\.css"[^>]*>/g, '')
        // Remove JS script tags
        .replace(/<script[^>]*src="[^"]*\.js"[^>]*><\/script>/g, '')
        // Insert bundled CSS
        .replace('</head>', `<style>${cssContent}</style>\n</head>`)
        // Insert bundled JS with cache-busting comment before closing body tag
        .replace('</body>', `<script>/* Build: ${timestamp} */ ${jsContent}</script>\n</body>`);
      
      // Emit the bundled HTML file
      this.emitFile({
        type: 'asset',
        fileName: 'artwork.html',
        source: bundledHtml
      });
    }
  };
}

export default [
  // Main gallery bundle
  {
    input: 'js/main.js',
    output: {
      file: 'dist/bundle.js',
      format: 'iife',
      name: 'ArtPortfolio'
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      
      // Process CSS
      postcss({
        extract: false, // Don't extract CSS to separate file, we'll inline it
        minimize: true
      }),
      
      // Bundle HTML with inlined assets
      htmlBundle(),
      
      // Minify the output
      terser()
    ]
  },
  
  // Artwork detail bundle
  {
    input: 'js/artwork-detail.js',
    output: {
      file: 'dist/artwork-detail-bundle.js',
      format: 'iife',
      name: 'ArtworkDetail'
    },
    plugins: [
      nodeResolve(),
      commonjs(),
      
      // Copy images and other assets to dist (only needed once)
      copy({
        targets: [
          { src: 'artworks/**/*', dest: 'dist/artworks' },
          { src: 'data/**/*', dest: 'dist/data' },
          { src: 'config/**/*', dest: 'dist/config' },
          { src: 'favicon.ico', dest: 'dist' },
          { src: 'sitemap.xml', dest: 'dist' },
          { src: 'debug.html', dest: 'dist' }
        ]
      }),
      
      // Process artwork.html
      artworkHtmlBundle(),
      
      // Minify the output
      terser()
    ]
  }
];