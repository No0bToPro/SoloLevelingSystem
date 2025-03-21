# AI Self Growth Web App - Solo Leveling Edition

A modern web application designed to track personal growth and self-improvement with a sleek, animated interface inspired by the popular manhwa/anime "Solo Leveling." This app gamifies the self-improvement journey with stylish blue animations, stat tracking, and achievement systems.

![Solo Leveling Self Growth App](/screenshot.png)

## Features

- **Dashboard**: View your progress at a glance with animated stats and daily streaks
- **Goals System**: Create, track, and complete goals with task breakdowns
- **Progress Tracking**: Visualize your improvement with animated charts and statistics
- **Resources Section**: Access curated learning materials with animated card interface
- **Shop**: Spend earned points on digital rewards with animated item cards
- **Solo Leveling Theme**: Dark UI with blue accents, glowing effects, and manhwa-inspired animations

## Animation System

This application features an extensive animation system with Solo Leveling inspired effects:

- **Page Transitions**: Smooth fade and slide animations between pages
- **Status Windows**: Scanning line effects and glowing borders
- **Level Up Effects**: Particle systems and brightness animations
- **Skill Activation**: Blue glow pulse effects on achievements
- **Shadow Summoning**: Scale and filter animations for important elements
- **Electric Effects**: Blue flicker animations on interactive elements
- **Card Animations**: Hover lift effects and radial gradients

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/aiselfgrowthwebapp.git
```

2. Navigate to the project directory:
```bash
cd aiselfgrowthwebapp
```

3. Open `index.html` in your browser or use a local server:
```bash
# Using Python
python -m http.server

# Using Node.js
npx serve
```

## Usage

### Applying Animation Classes

You can apply the animation classes to any HTML element:

```html
<!-- Basic animations -->
<div class="sl-animate-fade">Fades in smoothly</div>
<div class="sl-animate-slide">Slides up while fading in</div>
<div class="sl-animate-pulse">Pulses with a blue glow</div>

<!-- Solo Leveling specific animations -->
<div class="sl-animate-shadow-summon">Summons like a shadow soldier</div>
<div class="sl-animate-skill-activate">Activates like a skill</div>
<div class="sl-animate-arise">Appears with the "Arise" effect</div>
<div class="sl-animate-electric">Shows an electric blue flicker</div>

<!-- Animation timing -->
<div class="sl-animate-fade sl-speed-slow">Slow fade animation</div>
<div class="sl-animate-pulse sl-speed-fast">Fast pulse animation</div>

<!-- Animation delays -->
<div class="sl-animate-fade sl-delay-1">Delayed by 0.1s</div>
<div class="sl-animate-fade sl-delay-3">Delayed by 0.3s</div>
```

### Page Structure

- `index.html` - Dashboard page
- `goals.html` - Goals tracking system
- `progress.html` - Progress and statistics
- `resources.html` - Learning resources
- `shop.html` - Rewards shop

## Customization

### Modifying Animations

You can customize animations by editing the CSS files:

- `styles.css` - Core styles and animation framework
- `dashboard.css` - Dashboard-specific styles and animations
- `goals.css` - Goal-specific animations
- `progress.css` - Progress page animations
- `resources.css` - Resource section animations
- `shop.css` - Shop interface animations

### Changing Colors

The app uses CSS variables for easy color customization. Edit the `:root` section in `styles.css`:

```css
:root {
  --sl-blue: #00a8ff;
  --sl-light-blue: #33bbff;
  --sl-dark-blue: #0d142b;
  --sl-darker-blue: #080d1d;
  --sl-bg-dark: #0a0c1b;
  /* ... other variables ... */
}
```

## Dependencies

- FontAwesome 5 - For icons
- Rajdhani font - For Solo Leveling typography

## Browser Compatibility

- Chrome: Latest
- Firefox: Latest
- Safari: Latest
- Edge: Latest

## License

MIT License

## Acknowledgements

- Inspired by "Solo Leveling" created by Chugong
- Animations inspired by Solo Leveling manhwa/anime visual effects 