// Navigation appearance on scroll.
const nav = document.querySelector('.main-nav');
function updateNavbar() { nav?.classList.toggle('scrolled', window.scrollY > 30); }
window.addEventListener('scroll', updateNavbar, { passive: true });
updateNavbar();

// Team carousel.
const carousel = document.getElementById('carousel');
const cards = [...document.querySelectorAll('.member-card')];
const indicators = [...document.querySelectorAll('#indicators button')];
const previousButton = document.getElementById('previous');
const nextButton = document.getElementById('next');
const counter = document.getElementById('counter');
let activeIndex = 0;
let pointerStartX = null;

function renderCarousel() {
  const total = cards.length;
  if (!total) return;
  cards.forEach((card, index) => {
    card.classList.remove('active', 'side-left', 'side-right', 'hidden-card');
    if (index === activeIndex) card.classList.add('active');
    else if (index === (activeIndex - 1 + total) % total) card.classList.add('side-left');
    else if (index === (activeIndex + 1) % total) card.classList.add('side-right');
    else card.classList.add('hidden-card');
    card.setAttribute('aria-current', String(index === activeIndex));
  });
  indicators.forEach((button, index) => {
    button.classList.toggle('active', index === activeIndex);
    button.setAttribute('aria-pressed', String(index === activeIndex));
  });
  if (counter) counter.textContent = `${String(activeIndex + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}`;
}
function showMember(index) { if (cards.length) { activeIndex = (index + cards.length) % cards.length; renderCarousel(); } }
function nextMember() { showMember(activeIndex + 1); }
function previousMember() { showMember(activeIndex - 1); }
nextButton?.addEventListener('click', nextMember);
previousButton?.addEventListener('click', previousMember);
indicators.forEach((button, index) => button.addEventListener('click', () => showMember(index)));
cards.forEach((card, index) => {
  card.addEventListener('click', () => showMember(index));
  card.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); showMember(index); }
  });
});
carousel?.addEventListener('pointerdown', event => { if (event.pointerType !== 'mouse' || event.button === 0) pointerStartX = event.clientX; });
carousel?.addEventListener('pointerup', event => {
  if (pointerStartX === null) return;
  const distance = event.clientX - pointerStartX;
  if (Math.abs(distance) > 45) distance < 0 ? nextMember() : previousMember();
  pointerStartX = null;
});
carousel?.addEventListener('pointercancel', () => { pointerStartX = null; });
document.addEventListener('keydown', event => {
  if (event.target.matches('input, textarea, select')) return;
  if (event.key === 'ArrowRight') nextMember();
  if (event.key === 'ArrowLeft') previousMember();
});
renderCarousel();

// Subtle pointer tilt on the camera information card.
const qrCard = document.getElementById('qrFloatingCard');
if (qrCard) {
  qrCard.addEventListener('pointermove', event => {
    if (event.pointerType !== 'mouse') return;
    const bounds = qrCard.getBoundingClientRect();
    const horizontal = (event.clientX - bounds.left) / bounds.width * 2 - 1;
    const vertical = (event.clientY - bounds.top) / bounds.height * 2 - 1;
    qrCard.style.transform = `translate3d(${horizontal * 7}px, ${vertical * 7}px, 0) rotateX(${-vertical * 4}deg) rotateY(${horizontal * 4}deg) rotateZ(4deg)`;
  });
  qrCard.addEventListener('pointerleave', () => { qrCard.style.transform = 'rotate(4deg)'; });
}
