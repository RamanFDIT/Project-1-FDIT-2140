# Open Data Portal - FDIT 2140 Project

A web application for visualizing transportation mode share data using Apache ECharts, featuring an interactive dashboard with FAQ accordion and modern UI components.

## 🚀 Features

- **Interactive Data Visualization**: Dynamic bar charts using Apache ECharts
- **FAQ Accordion**: Smooth sliding animations with custom CSS
- **Data Export**: Download charts as images or PDF
- **Modern UI**: Clean, professional interface with custom CSS variables

## 📁 Project Structure

```
FDIT-2140-Project-1/
├── index.html          # Main dashboard page
├── about.html          # About page
├── style.css           # Custom styles and CSS variables
├── index.js            # Chart configuration and data handling
├── script.js           # Interactive components (accordion)
├── data.csv            # Transportation data source
├── data.json           # JSON formatted data
├── package.json        # Project metadata
├── images/             # Static assets
│   ├── LogoFDIT2140.svg
│   └── expand-solid-full.svg
└── README.md           # Project documentation
```

## 🛠️ Installation & Setup

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- Local web server (optional but recommended)

### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/RamanFDIT/Project-1-FDIT-2140.git
   cd Project-1-FDIT-2140
   ```

2. **Open in browser**
   - **Option A**: Double-click `index.html` to open directly
   - **Option B**: Use a local server (recommended)
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx http-server
     
     # Using VS Code Live Server extension (recommended)
     Right-click on index.html → "Open with Live Server"
     ```

3. **Access the application**
   Online Link: https://modeshare.netlify.app/

## 🎨 CSS Class Reference

### Layout Classes

```css
/* Main layout containers */
.layout-column          /* Flex column layout */
.layout-row            /* Flex row layout */

/* Navigation */
.nav-container         /* Main navigation wrapper */
.nav-top              /* Top navigation section */
.nav-buttons          /* Button container */
.navLinks             /* Navigation link styling */

/* Content sections */
.chartContainer       /* Chart display area */
.questionContainer    /* FAQ container */
.footerContainer      /* Footer layout */
```

### Component Classes

```css
/* Buttons */
.primaryBtn           /* Primary action buttons */

/* Typography */
.subHeads            /* Section headings */
.page-heading        /* Main page title */

/* Interactive Components */
.questionComp        /* FAQ question button */
.questionExpanded    /* FAQ answer content */
.is-open            /* Active/expanded state */

/* Footer */
.footer             /* Footer wrapper */
.footerLinks        /* Footer navigation links */
.copyright          /* Copyright text */
```

## 🎯 CSS Variables

### Color System
```css
--primaryColor: #0074C8        /* Main brand blue */
--accentColor: #4D8C3F         /* Secondary green */
--textColorPrimary: #000000    /* Primary text */
--textColorSecondary: #ffffff  /* Secondary text */
--backgroundColor: #ffffff     /* Background color */
```

### Typography Scale
```css
--fontLarge: 1.75rem          /* Headings */
--fontMedium: 1.25rem         /* Subheadings */
--fontSmall: 1rem             /* Body text */
--fontExtraSmall: 0.875rem    /* Small text */
--font: 'Montserrat', sans-serif /* Font family */
```

### Layout
```css
--widthMax: 1500px            /* Maximum content width */
```

## 📊 Data Structure

The application expects CSV data with the following format:

```csv
Year,Male-identifying,Female-identifying
2013,50.00,48.50
2014,49.75,48.25
...
```

## 🔧 Customization

### Adding New CSS Classes

1. **Define in style.css**:
   ```css
   .your-custom-class {
     /* Your styles */
     color: var(--primaryColor);
     font-size: var(--fontMedium);
   }
   ```

2. **Use CSS variables** for consistency:
   ```css
   .custom-component {
     background-color: var(--primaryColor);
     max-width: var(--widthMax);
     font-family: var(--font);
   }
   ```

### Modifying Colors
Update CSS variables in `:root` selector:
```css
:root {
  --primaryColor: #your-color;
  --accentColor: #your-accent;
}
```

### Adding Interactive Components
1. Add HTML structure
2. Define CSS classes in `style.css`
3. Add JavaScript functionality in `script.js`

## 🌐 Browser Support

- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+


## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit changes: `git commit -m 'Add feature'`
4. Push to branch: `git push origin feature-name`
5. Submit a pull reques

## 🐛 Troubleshooting

### Common Issues

**Styles not loading:**
- Ensure `style.css` path is correct
- Check browser console for 404 errors
- Verify Tailwind CDN is accessible

**Chart not displaying:**
- Check browser console for JavaScript errors
- Ensure `data.csv` file exists and is properly formatted
- Verify ECharts CDN is loading

**Accordion not working:**
- Ensure `script.js` is loaded after DOM elements
- Check for JavaScript errors in console

### Development Tips

1. Use browser DevTools to inspect CSS classes
2. Test responsive design with device emulation
3. Validate HTML and CSS for accessibility
4. Use semantic HTML elements for better SEO

---

**Project**: FDIT 2140 - Web Development  
**Author**: Ramandeep Singh  
**Repository**: [Project-1-FDIT-2140](https://github.com/RamanFDIT/Project-1-FDIT-2140)