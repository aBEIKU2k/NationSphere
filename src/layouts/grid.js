export function getGridLayout(countries) {
  const cols = Math.ceil(Math.sqrt(countries.length));
  const spacing = 150;
  
  return countries.map((country, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    
    // Center the grid
    const startX = -((cols - 1) * spacing) / 2;
    const startY = -((Math.ceil(countries.length / cols) - 1) * spacing) / 2;
    
    return {
      x: startX + col * spacing,
      y: startY + row * spacing,
      z: 0 // flat for grid
    };
  });
}
