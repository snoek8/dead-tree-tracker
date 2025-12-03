# PWA Icon Generation

To generate PWA icons for the app, you have several options:

## Option 1: Online Generator (Recommended)

1. Visit [PWA Asset Generator](https://github.com/onderceylan/pwa-asset-generator) or use [RealFaviconGenerator](https://realfavicongenerator.net/)
2. Upload a 512x512 PNG image (square, preferably with transparent background)
3. Generate icons and download
4. Place all icons in `public/icons/` directory

## Option 2: Manual Creation

Create icons in the following sizes and save them as PNG files in `public/icons/`:
- icon-72x72.png
- icon-96x96.png
- icon-128x128.png
- icon-144x144.png
- icon-152x152.png
- icon-192x192.png
- icon-384x384.png
- icon-512x512.png

## Option 3: Using ImageMagick (Command Line)

If you have ImageMagick installed and a source image `icon.png`:

```bash
mkdir -p public/icons
convert icon.png -resize 72x72 public/icons/icon-72x72.png
convert icon.png -resize 96x96 public/icons/icon-96x96.png
convert icon.png -resize 128x128 public/icons/icon-128x128.png
convert icon.png -resize 144x144 public/icons/icon-144x144.png
convert icon.png -resize 152x152 public/icons/icon-152x152.png
convert icon.png -resize 192x192 public/icons/icon-192x192.png
convert icon.png -resize 384x384 public/icons/icon-384x384.png
convert icon.png -resize 512x512 public/icons/icon-512x512.png
```

## Temporary Solution

If you don't have icons yet, the app will still work. You can:
1. Create a simple placeholder icon (e.g., a tree emoji or simple graphic)
2. Use an online tool to generate all sizes
3. Add them later - the app will function without them, but PWA installation won't be optimal

