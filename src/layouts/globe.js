import { latLngToVector3 } from '../utils/math.js';

export function getGlobeLayout(countries, radius = 400) {
  return countries.map(country => {
    const pos = latLngToVector3(country.lat, country.lng, radius);
    return { x: pos.x, y: pos.y, z: pos.z };
  });
}
