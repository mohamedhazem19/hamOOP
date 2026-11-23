// Owner: Belal Mohamed Ahmed (GUI general)
// animate(element, 'fadeUp' | 'pop' | 'float' | 'grow' | 'slideDown') restarts a CSS animation from css/animations.css.
// Also adds the ripple effect to every button.
const prefersReduce = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export default function animate(element, type = 'fadeUp', delay = 0) {
  if (!element || prefersReduce()) return element;
  const cls = 'anim-' + type;
  element.classList.remove(cls);
  void element.offsetWidth;                 // restart the animation
  element.style.animationDelay = delay + 'ms';
  element.classList.add(cls);
  return element;
}

/* animate children one by one ("piece by piece") */
animate.stagger = (parent, type = 'fadeUp', step = 70) =>
  Array.from(parent.children).forEach((el, i) => animate(el, type, i * step));

/* ripple effect on every button */
document.addEventListener('click', (e) => {
  const b = e.target.closest('button, .btn');
  if (!b || prefersReduce()) return;
  const r = b.getBoundingClientRect();
  const dot = document.createElement('span');
  dot.className = 'ripple-dot';
  dot.style.left = (e.clientX - r.left - 10) + 'px';
  dot.style.top = (e.clientY - r.top - 10) + 'px';
  b.appendChild(dot);
  setTimeout(() => dot.remove(), 650);
});
