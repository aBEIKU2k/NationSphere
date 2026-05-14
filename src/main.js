import './styles.css';
import { countries } from './data/countries.js';
import { getGlobeLayout } from './layouts/globe.js';
import { getGalaxyLayout } from './layouts/galaxy.js';
import { getOrbitLayout } from './layouts/orbit.js';
import { getNetworkLayout } from './layouts/network.js';
import { formatCurrency, formatNumber } from './utils/math.js';
// Import anime.js v4 exactly as requested
import { createLayout, utils, stagger, spring, createTimer, createAnimatable } from 'https://esm.sh/animejs@4.3.0';

const $scene = document.getElementById('scene');
const $sceneContent = document.getElementById('scene-content');
const $template = document.getElementById('country-card-template');
const $layoutBtns = document.querySelectorAll('.layout-btn');
const $searchInput = document.getElementById('search-input');

let currentLayout = 'globe';
const nodes = [];

// 1. Data-Driven DOM Generation
countries.forEach((country, index) => {
  const $clone = $template.content.cloneNode(true);
  const $node = $clone.querySelector('.country-node');
  
  $node.dataset.index = index;
  $node.style.setProperty('--node-color', country.color);
  
  // Populate element content
  $node.querySelector('.country-label').textContent = country.name;
  $node.querySelector('.card-name').textContent = country.name;
  $node.querySelector('.card-capital').textContent = country.capital;
  $node.querySelector('.card-continent').textContent = country.continent;
  $node.querySelector('.card-population').textContent = formatNumber(country.population);
  $node.querySelector('.card-gdp').textContent = formatCurrency(country.gdp);
  $node.querySelector('.card-currency').textContent = country.currency;
  $node.querySelector('.card-languages').textContent = country.languages;
  $node.querySelector('.card-flag').style.backgroundImage = `url(${country.flag})`;
  
  // Size scaling
  const scale = Math.max(0.8, Math.min(2, country.population / 50000000));
  $node.style.setProperty('--node-size', `${30 * scale}px`);
  
  $sceneContent.appendChild($node);
  nodes.push($node);
});

// Calculate grid columns once
const cols = Math.ceil(Math.sqrt(countries.length));
$sceneContent.style.setProperty('--grid-cols', cols);

// 2. Anime.js v4 Layout and Animation tracking
const elementsLayout = createLayout($sceneContent, {
  duration: 800,
  easing: spring(1, 80, 10, 0),
  delay: stagger(30, { start: 0 })
});

// Scene wrapper for 3D rotation
const sceneAnimatable = createAnimatable('#scene', {
  rotateX: 0,
  rotateY: 0
});

// Mouse tracking
const pointer = {
  x: 0, y: 0,
  rx: 0, ry: 0,
  targetX: 0, targetY: 0
};

// 3. Layout Algorithms wrapped in an object
const transformLayout = {
  globe: () => {
    $sceneContent.dataset.layout = 'globe';
    const coords = getGlobeLayout(countries);
    nodes.forEach(($node, i) => {
      const pos = coords[i];
      $node.style.position = 'absolute';
      $node.style.transform = `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)`;
    });
  },
  galaxy: () => {
    $sceneContent.dataset.layout = 'galaxy';
    const coords = getGalaxyLayout(countries);
    nodes.forEach(($node, i) => {
      const pos = coords[i];
      $node.style.position = 'absolute';
      $node.style.transform = `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)`;
    });
  },
  orbit: () => {
    $sceneContent.dataset.layout = 'orbit';
    const coords = getOrbitLayout(countries);
    nodes.forEach(($node, i) => {
      const pos = coords[i];
      $node.style.position = 'absolute';
      $node.style.transform = `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)`;
    });
  },
  network: () => {
    $sceneContent.dataset.layout = 'network';
    const coords = getNetworkLayout(countries);
    nodes.forEach(($node, i) => {
      const pos = coords[i];
      $node.style.position = 'absolute';
      $node.style.transform = `translate3d(${pos.x}px, ${pos.y}px, ${pos.z}px)`;
    });
  },
  grid: () => {
    $sceneContent.dataset.layout = 'grid';
    // Clear inline transforms, let CSS Grid handle positioning
    nodes.forEach($node => {
      $node.style.position = 'relative';
      $node.style.transform = '';
    });
  }
};

// 4. Interactive Scene Rotation (Timer & Lerp)
document.addEventListener('pointermove', (e) => {
  // Normalize -1 to 1 relative to center
  pointer.targetX = (e.clientX / window.innerWidth) * 2 - 1;
  pointer.targetY = (e.clientY / window.innerHeight) * 2 - 1;
});

createTimer({
  onUpdate: () => {
    // Smooth interpolation for mouse movement
    pointer.rx = utils.lerp(pointer.rx, pointer.targetY * -30, 0.05); // max 30deg vertical
    pointer.ry = utils.lerp(pointer.ry, pointer.targetX * 90, 0.05);  // max 90deg horizontal
    
    // Apply interpolated rotation to the scene
    $scene.style.transform = `translateZ(-500px) rotateX(${pointer.rx}deg) rotateY(${pointer.ry}deg)`;
    
    // Billboard labels so they always face the camera
    const invRotX = -pointer.rx;
    const invRotY = -pointer.ry;
    nodes.forEach($node => {
      const $label = $node.querySelector('.country-label');
      if ($label && !$node.classList.contains('is-expanded')) {
        $label.style.transform = `rotateY(${invRotY}deg) rotateX(${invRotX}deg)`;
      }
    });
  }
});

// 5. Event Handling
$layoutBtns.forEach($btn => {
  $btn.addEventListener('click', () => {
    $layoutBtns.forEach(b => b.classList.remove('is-active'));
    $btn.classList.add('is-active');
    
    currentLayout = $btn.dataset.layout;
    
    // Calculate new positions
    transformLayout[currentLayout]();
    
    // Trigger anime v4 FLIP/Layout animation
    elementsLayout.update();
  });
});

document.addEventListener('click', (e) => {
  const $node = e.target.closest('.country-node');
  
  if ($node) {
    // Collapse others
    nodes.forEach(n => {
      if (n !== $node) n.classList.remove('is-expanded');
    });
    
    $node.classList.toggle('is-expanded');
    
    // Re-apply base layout to keep nodes in their structure
    transformLayout[currentLayout]();
    
    if ($node.classList.contains('is-expanded') && currentLayout !== 'grid') {
        // Bring expanded element forward
        const match = $node.style.transform.match(/translate3d\(([^,]+),\s*([^,]+),\s*([^)]+)\)/);
        if (match) {
            $node.style.transform = `translate3d(${match[1]}, ${match[2]}, 300px)`;
        }
    }
    
    // Trigger smooth transition
    elementsLayout.update();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    nodes.forEach(n => n.classList.remove('is-expanded'));
    transformLayout[currentLayout]();
    elementsLayout.update();
  }
});

// Search functionality
$searchInput.addEventListener('input', (e) => {
  const term = e.target.value.toLowerCase();
  nodes.forEach(($node, i) => {
    const country = countries[i];
    const match = country.name.toLowerCase().includes(term) || country.continent.toLowerCase().includes(term);
    $node.style.display = match ? 'flex' : 'none';
  });
  elementsLayout.update();
});

// Initialize stats
const totalGdp = countries.reduce((sum, c) => sum + c.gdp, 0);
const totalPop = countries.reduce((sum, c) => sum + c.population, 0);
document.getElementById('stat-gdp').innerText = formatCurrency(totalGdp);
document.getElementById('stat-pop').innerText = formatNumber(totalPop);

// Theme selector
document.getElementById('theme-selector').addEventListener('change', (e) => {
  document.body.className = e.target.value;
});

// Initial Setup
transformLayout.globe();
elementsLayout.update();

// Stars background logic
const starfield = document.getElementById('starfield');
for (let i = 0; i < 200; i++) {
  const star = document.createElement('div');
  star.style.position = 'absolute';
  star.style.width = Math.random() * 3 + 'px';
  star.style.height = star.style.width;
  star.style.background = '#fff';
  star.style.borderRadius = '50%';
  star.style.left = Math.random() * 100 + '%';
  star.style.top = Math.random() * 100 + '%';
  star.style.opacity = Math.random();
  star.style.animation = `twinkle ${Math.random() * 5 + 3}s infinite alternate`;
  starfield.appendChild(star);
}

const style = document.createElement('style');
style.innerHTML = `
@keyframes twinkle {
  0% { opacity: 0.2; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.2); }
}
`;
document.head.appendChild(style);
