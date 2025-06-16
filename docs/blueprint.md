# **App Name**: MacSphere Blog

## Core Features:

- Glassmorphism Material: Implement glass morphism effect for navigation bar/cards using `background: rgba(255, 255, 255, 0.35)` with `backdrop-filter: blur(16px)`. Add border details with `1px solid rgba(255, 255, 255, 0.6)` and inner glow using `box-shadow: inset 0 0 3px rgba(255,255,255,0.5)`.
- Dynamic Color System: Dynamically extract gradient colors from macOS wallpapers using the ColorThief algorithm to generate a dynamic color scheme. Use `#8A6DFF` (dynamic purple) for interactive states and `#40F5D3` (Touch Bar-like effect) for highlight states.
- SF Pro Font Scheme: Implement SF Pro font using private font hosting for titles (`SF Pro Display Bold`) and body text (`SF Pro Text Regular`). Include a fallback chain: `system-ui, -apple-system, BlinkMacSystemFont`.
- Spatial Motion Engine: Use `@keyframes` to implement Genie-like window scaling animations for component appearance. Create 3D tilt effect on hovering cards using `transform: perspective(1000px) rotateX() rotateY()`.
- Dynamic Rendering Layer: Use WebGL to implement dynamic wallpapers (simulating macOS dynamic desert/mountain). Use Canvas to generate real-time frosted glass effects for cards. Compress and asynchronously load proprietary font files in WOFF2 format.
- Gesture System: Implement three-finger swipe to switch articles (using Hammer.js to recognize gesture direction). Simulate touchpad scrolling inertia (based on deltaY momentum algorithm).
- Voice Integration: Use Web Speech API to implement article reading (Siri-style voice control).
- Data Layer: Inject dynamic components during Markdown → HTML conversion using Remark + Rehype plugin stream. Use Service Worker to pre-cache article directory tree for incremental updates. Load content based on mouse trajectory prediction (Rover.js algorithm).

## Style Guidelines:

- Implement Spring physics animation for button feedback (using Popmotion) with stiffness: 300, damping: 10.
- Use FLIP animation strategy + SVG path morphing with Bézier curves: cubic-bezier(0.68, 0, 0.32, 1.6) for tab switching.
- Use Lottie-driven AE-exported icon animations for dropdown menus with frame synchronization accuracy: 0.01s.
- Use CSS Houdini gradient transition with color interpolation in Lab mode for dark mode conversion.
- Overlay `@supports (backdrop-filter: none)` detection on the frosted glass layer. Use CSS Gradient to generate noise texture background as a fallback solution.
- Respond to system font size settings: `font-size: clamp(1rem, 1.5vw + 8px, 1.2rem)`. Link dark mode media queries to reduce light flux.