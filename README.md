# AetherDrop Share

Build "AetherDrop", an ultra-minimalist web app for sharing data and files via dynamic QR codes with a dark liquid glassmorphism aesthetic.

Key requirements:
1. Visual identity: Dark moody ambient background with floating iridescent mesh gradients (violet, indigo, soft cyan orbs with CSS blur), translucent glass cards with backdrop-blur-2xl, fine borders, glossy top-edge highlights, and Geist/Inter typography with Lucide icons.
2. Header: Fluid glass badge logo ("AetherDrop"), local encryption/ready status pill, and theme toggle.
3. Central Control Hub with 4 tabs:
   - Tab 1 (Text & Links): Textarea/URL input, paste from clipboard, clear button, character counter, and payload size indicator.
   - Tab 2 (File & ZIP Transfer): Drag-and-drop zone with animated dashed glass border for .zip/documents/media. Store files in local Blob/IndexedDB or downloadable mock URLs to encode into the QR code within size limits.
   - Tab 3 (Wi-Fi Access): Network SSID, password, and encryption type (WPA/WPA2/WPA3) generating standard Wi-Fi configuration QR codes.
   - Tab 4 (QR Scanner): In-browser camera viewfinder and drop zone to scan and decode QR codes.
4. Live QR Display Panel:
   - Real-time QR generation (qrcode.react) on a glass pedestal.
   - Customization controls (corner rounding, colors, embedded icon toggle).
   - Quick actions: Download PNG, Download SVG, Copy payload/link.
   - "Simulate Mobile Scan" modal to preview recipient experience.
5. Smooth animations with framer-motion, sonner toasts for feedback, and responsive desktop split view / mobile stack layout.

This project was built with [Lovable](https://lovable.dev).

**Live app**: https://aether-drop-share.lovable.app

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/ffa97e33-53cd-403f-9ac6-8f64aab89b5e).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
