export function getOrbitLayout(countries) {
  const continents = {};
  
  // Group by continent
  countries.forEach(country => {
    if (!continents[country.continent]) continents[country.continent] = [];
    continents[country.continent].push(country);
  });
  
  const continentCenters = {
    'Africa': { x: 0, y: -200, z: -100 },
    'North America': { x: -300, y: 100, z: 100 },
    'South America': { x: -200, y: 300, z: 0 },
    'Europe': { x: 100, y: -300, z: 200 },
    'Asia': { x: 400, y: -100, z: -200 },
    'Oceania': { x: 300, y: 200, z: 100 }
  };
  
  const positions = new Array(countries.length);
  
  // Create orbits around continent hubs
  countries.forEach((country, index) => {
    const center = continentCenters[country.continent] || {x:0, y:0, z:0};
    const group = continents[country.continent];
    const localIndex = group.indexOf(country);
    
    const angle = (localIndex / group.length) * Math.PI * 2;
    const r = 150; // orbit radius
    
    positions[index] = {
      x: center.x + r * Math.cos(angle),
      y: center.y,
      z: center.z + r * Math.sin(angle)
    };
  });
  
  return positions;
}
