import anime from 'animejs';

export function animateToLayout(nodes, targets, duration = 1500) {
  const animations = [];
  
  nodes.forEach((node, i) => {
    const target = targets[i];
    if (!target) return;
    
    // We update dataset attributes to animate them
    anime({
      targets: node,
      translateX: target.x,
      translateY: target.y,
      translateZ: target.z,
      duration: duration,
      delay: i * 20, // stagger
      easing: 'easeInOutExpo'
    });
  });
  
  return Promise.all(animations);
}
