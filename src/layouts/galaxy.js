export function getGalaxyLayout(countries, radius = 600) {
  return countries.map((country, i) => {
    // Distribute in a spiral or random cluster based on GDP/Pop
    const angle = i * 137.5 * (Math.PI / 180); // golden angle
    const r = radius * Math.sqrt(i / countries.length);
    
    // Z-axis displacement for 3D feel
    const z = (Math.random() - 0.5) * 400;
    
    const x = r * Math.cos(angle);
    const y = r * Math.sin(angle);
    
    return { x, y, z };
  });
}
