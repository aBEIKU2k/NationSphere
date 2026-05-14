export function getNetworkLayout(countries) {
  return countries.map(() => {
    return {
      x: (Math.random() - 0.5) * 800,
      y: (Math.random() - 0.5) * 600,
      z: (Math.random() - 0.5) * 400
    };
  });
}
