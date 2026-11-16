// Owner: Belal Mohamed Ahmed (GUI general)
// TODO(Belal): animate(element, 'fadeUp' | 'pop' | 'float' | 'grow') using classes from css/animations.css
export default function animate(element, name) {
  element.classList.remove(name);
  void element.offsetWidth; // restart the animation
  element.classList.add(name);
}
