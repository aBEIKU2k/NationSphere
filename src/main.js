import './styles.css';
import { countries } from './data/countries.js';
import { getGlobeLayout } from './layouts/globe.js';
import { getGalaxyLayout } from './layouts/galaxy.js';
import { getOrbitLayout } from './layouts/orbit.js';
import { getGridLayout } from './layouts/grid.js';
import { getNetworkLayout } from './layouts/network.js';
import { animateToLayout } from './utils/animations.js';
import { formatCurrency, formatNumber } from './utils/math.js';

let currentLayout = 'globe';
let nodeElements = [];
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let currentRotation = { x: 0, y: 0 };
let targetRotation = { x: 0, y: 0 };

const worldSpace = document.getElementById('world-space');
const searchInput = document.getElementById('search-input');
const themeSelector = document.getElementById('theme-selector');
const layoutBtns = document.querySelectorAll('.layout-btn');
const infoCardOverlay = document.getElementById('info-card-overlay');
const closeBtn = document.querySelector('.close-btn');

function init() {
  createNodes();
  updateStats();
  switchLayout('globe');
  setupEventListeners();
  renderLoop();
}

function createNodes() {
  worldSpace.innerHTML = '';
  nodeElements = [];

  countries.forEach((country, index) => {
    const node = document.createElement('div');
    node.className = 'country-node';
    node.style.setProperty('--node-color', country.color);
    
    // Scale node size slightly based on population
    const scale = Math.max(0.8, Math.min(2, country.population / 50000000));
    node.style.width = `${30 * scale}px`;
    node.style.height = `${30 * scale}px`;
    node.style.marginLeft = `${-15 * scale}px`;
    node.style.marginTop = `${-15 * scale}px`;
    
    const label = document.createElement('div');
    label.className = 'country-label';
    label.innerText = country.name;
    
    node.appendChild(label);
    
    // Click event for card
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      showCard(country);
    });

    worldSpace.appendChild(node);
    nodeElements.push(node);
  });
}

function switchLayout(layoutType) {
  currentLayout = layoutType;
  
  // Update buttons
  layoutBtns.forEach(btn => {
    btn.classList.toggle('active', btn.dataset.layout === layoutType);
  });

  let targets = [];
  switch (layoutType) {
    case 'globe': targets = getGlobeLayout(countries); break;
    case 'galaxy': targets = getGalaxyLayout(countries); break;
    case 'orbit': targets = getOrbitLayout(countries); break;
    case 'grid': targets = getGridLayout(countries); break;
    case 'network': targets = getNetworkLayout(countries); break;
  }

  animateToLayout(nodeElements, targets);
}

function showCard(country) {
  document.getElementById('card-name').innerText = country.name;
  document.getElementById('card-capital').innerText = country.capital;
  document.getElementById('card-continent').innerText = country.continent;
  document.getElementById('card-population').innerText = formatNumber(country.population);
  document.getElementById('card-gdp').innerText = formatCurrency(country.gdp);
  document.getElementById('card-currency').innerText = country.currency;
  document.getElementById('card-languages').innerText = country.languages;
  document.getElementById('card-internet').innerText = country.internet;
  document.getElementById('card-tourism').innerText = country.tourism;
  document.getElementById('card-startup').innerText = country.startup;
  
  document.getElementById('card-flag').style.backgroundImage = `url(${country.flag})`;
  
  infoCardOverlay.classList.remove('hidden');
}

function hideCard() {
  infoCardOverlay.classList.add('hidden');
}

function updateStats() {
  const totalGdp = countries.reduce((sum, c) => sum + c.gdp, 0);
  const totalPop = countries.reduce((sum, c) => sum + c.population, 0);
  
  document.getElementById('stat-gdp').innerText = formatCurrency(totalGdp);
  document.getElementById('stat-pop').innerText = formatNumber(totalPop);
}

function setupEventListeners() {
  layoutBtns.forEach(btn => {
    btn.addEventListener('click', () => switchLayout(btn.dataset.layout));
  });

  themeSelector.addEventListener('change', (e) => {
    document.body.className = e.target.value;
  });

  closeBtn.addEventListener('click', hideCard);
  infoCardOverlay.addEventListener('click', (e) => {
    if (e.target === infoCardOverlay) hideCard();
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') hideCard();
  });

  // Search filter
  searchInput.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    countries.forEach((c, i) => {
      const match = c.name.toLowerCase().includes(term) || c.continent.toLowerCase().includes(term);
      nodeElements[i].style.display = match ? 'flex' : 'none';
    });
  });

  // 3D Scene Drag/Rotate
  document.addEventListener('mousedown', (e) => {
    if (e.target.closest('.layout-btn') || e.target.closest('input') || e.target.closest('select')) return;
    isDragging = true;
    previousMousePosition = { x: e.offsetX, y: e.offsetY };
  });

  document.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const deltaMove = {
        x: e.offsetX - previousMousePosition.x,
        y: e.offsetY - previousMousePosition.y
      };

      targetRotation.y += deltaMove.x * 0.5;
      targetRotation.x -= deltaMove.y * 0.5;

      // Clamp X rotation to prevent flipping
      targetRotation.x = Math.max(-90, Math.min(90, targetRotation.x));
    }
    previousMousePosition = { x: e.offsetX, y: e.offsetY };
  });

  document.addEventListener('mouseup', () => { isDragging = false; });
  document.addEventListener('mouseleave', () => { isDragging = false; });
  
  // Wheel zoom
  let zoom = -500;
  document.addEventListener('wheel', (e) => {
    if (!infoCardOverlay.classList.contains('hidden')) return;
    zoom -= e.deltaY * 0.5;
    zoom = Math.max(-1500, Math.min(500, zoom));
    worldSpace.style.transform = `translateZ(${zoom}px) rotateX(${currentRotation.x}deg) rotateY(${currentRotation.y}deg)`;
  });
}

// Render loop for smooth rotation interpolation
function renderLoop() {
  // Lerp rotation
  currentRotation.x += (targetRotation.x - currentRotation.x) * 0.1;
  currentRotation.y += (targetRotation.y - currentRotation.y) * 0.1;

  // Preserve the zoom from the wheel handler if possible, but hardcode -500 for demo
  // Or extract translateZ from current transform
  let match = worldSpace.style.transform.match(/translateZ\(([^p]+)px\)/);
  let currentZ = match ? parseFloat(match[1]) : -500;

  worldSpace.style.transform = `translateZ(${currentZ}px) rotateX(${currentRotation.x}deg) rotateY(${currentRotation.y}deg)`;

  // Make labels face camera (billboarding)
  const invRotX = -currentRotation.x;
  const invRotY = -currentRotation.y;
  
  nodeElements.forEach(node => {
    const label = node.querySelector('.country-label');
    if (label) {
      label.style.transform = `rotateY(${invRotY}deg) rotateX(${invRotX}deg)`;
    }
  });

  requestAnimationFrame(renderLoop);
}

// Stars background animation
function createStars() {
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
}

// Add CSS keyframes for twinkle
const style = document.createElement('style');
style.innerHTML = `
@keyframes twinkle {
  0% { opacity: 0.2; transform: scale(0.8); }
  100% { opacity: 1; transform: scale(1.2); }
}
`;
document.head.appendChild(style);

createStars();
init();
