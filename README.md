# Rasya Andrean - Developer Portfolio

A modern, interactive developer portfolio website featuring dynamic theme switching, project galleries, blog system, and comprehensive animations. Built with vanilla JavaScript using ES6 modules and enhanced with property-based testing.

## Features

- **Dynamic Theme System**: Dark/light mode with smooth transitions and localStorage persistence
- **Interactive Project Gallery**: Filterable project showcase with modal details and category organization
- **Blog System**: Article management with search functionality and category filtering
- **Responsive Navigation**: Mobile-friendly hamburger menu with smooth animations
- **Skills Timeline**: Visual timeline for experience and skills with interactive details
- **Animation Engine**: Scroll-triggered animations, parallax effects, and micro-interactions
- **SEO Optimized**: Structured data, meta tags, sitemap generation, and semantic HTML
- **Performance Focused**: Lazy image loading and optimized asset delivery

## Directory Structure

```
Rasya-Andrean---Developer-main/
├── index.html                 # Main HTML file (updated with new sections)
├── package.json              # Node.js dependencies and scripts
├── vitest.config.js          # Vitest configuration for testing
├── css/
│   ├── themes.css            # CSS custom properties for theme management
│   └── components.css        # Styles for new components
├── js/
│   ├── main.js              # Main application entry point
│   └── components/
│       ├── AnimationEngine.js    # Scroll animations and micro-interactions
│       ├── BlogSystem.js         # Blog/articles management
│       ├── ContactForm.js        # Enhanced form validation
│       ├── LazyImageLoader.js    # Performance optimization
│       ├── NavigationManager.js  # Responsive navigation
│       ├── ProjectGallery.js     # Project showcase component
│       ├── SkillsTimeline.js     # Timeline and skills display
│       └── ThemeManager.js       # Theme switching functionality
├── data/
│   ├── projects.json        # Project data
│   ├── articles.json        # Blog articles data
│   └── timeline.json        # Experience and education timeline
├── images/
│   └── projects/            # Project thumbnails and images
├── test/
│   ├── setup.js            # Test configuration
│   └── *.test.js           # Comprehensive test suite
└── README.md               # This file
```

## Components Overview

### 1. ThemeManager
- Handles dark/light theme switching with system preference detection
- Persists theme preference in localStorage
- Uses CSS custom properties for smooth transitions
- Applies theme changes across all components

### 2. ProjectGallery
- Displays project cards with responsive grid layout
- Category-based filtering system
- Modal view for detailed project information
- Integration with project data management

### 3. BlogSystem
- Article listing with search functionality
- Category filtering for articles
- Full article view with markdown parsing support
- Article preview and metadata display

### 4. NavigationManager
- Responsive navigation with hamburger menu
- Smooth scroll to sections
- Active section highlighting
- Mobile-friendly interactions

### 5. SkillsTimeline
- Visual timeline for work experience and education
- Skills categorization and proficiency display
- Interactive timeline item details
- Progress bars and visual indicators

### 6. AnimationEngine
- Scroll-triggered fade-in animations
- Parallax scrolling effects
- Hover interactions and micro-feedback
- Performance-optimized animation handling

### 7. ContactForm
- Enhanced form validation with real-time feedback
- Specific error messages for each field type
- Form success state with confirmation
- Accessibility-compliant form handling

### 8. LazyImageLoader
- Intersection observer-based lazy loading
- Progressive image loading with placeholders
- Performance optimization for image assets
- Responsive image handling

## Data Structure

### Projects (data/projects.json)
- Project information with categories and descriptions
- Technology stacks and external links
- Thumbnail and gallery images
- Project status and completion dates

### Articles (data/articles.json)
- Blog posts with metadata and categories
- Article content and publication dates
- Author information and tags
- Reading time estimates

### Timeline (data/timeline.json)
- Work experience and education history
- Skills and proficiency levels
- Achievement highlights
- Timeline visualization data

## CSS Architecture

### Theme System (css/themes.css)
- CSS custom properties for both light and dark themes
- Smooth transition animations between themes
- Consistent color palette and typography
- Accessibility-compliant contrast ratios

### Component Styles (css/components.css)
- Modular component styling with BEM methodology
- Responsive design patterns and breakpoints
- Interactive element states and animations
- Cross-browser compatibility

## Testing

### Property-Based Testing
- Uses fast-check library for comprehensive input testing
- Tests universal properties across all component inputs
- Validates component rendering completeness and consistency
- Ensures robust behavior across edge cases

### Unit Testing
- Specific scenario testing for component functionality
- Edge case handling and error condition testing
- Integration testing between components
- Performance and accessibility testing

### Test Coverage
- 24 comprehensive property-based tests
- Unit tests for all major components
- Integration tests for cross-component interactions
- SEO and performance validation tests

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn package manager

### Installation

1. Clone the repository:
```bash
git clone https://github.com/username/Rasya-Andrean---Developer.git
cd Rasya-Andrean---Developer-main
```

2. Install dependencies:
```bash
npm install
```

3. Run tests:
```bash
npm test
```

4. Start development server:
```bash
npm run dev
```

5. Open browser to `http://localhost:8000`

### Available Scripts

- `npm test` - Run the complete test suite
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run code linting

## ES6 Modules

The project uses modern ES6 modules for:
- Clean component separation and encapsulation
- Tree-shaking support for optimized bundles
- Modern JavaScript practices and syntax
- Better maintainability and code organization
- Improved development experience

## Performance Features

- **Lazy Loading**: Images load only when needed using Intersection Observer
- **Code Splitting**: Components loaded as separate modules
- **CSS Optimization**: Custom properties for efficient theme switching
- **Animation Optimization**: RequestAnimationFrame for smooth animations
- **SEO Enhancement**: Structured data and semantic HTML for better search visibility

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contact

Rasya Andrean - 

Project Link: [https://github.com/username/Rasya-Andrean---Developer](https://github.com/username/Rasya-Andrean---Developer)