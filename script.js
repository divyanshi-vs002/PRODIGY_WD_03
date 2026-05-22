const canvas = document.getElementById("spaceCanvas");
const ctx = canvas.getContext("2d");
const heroVisual = document.getElementById("heroVisual");
const parallaxItems = document.querySelectorAll("[data-depth]");
const revealItems = document.querySelectorAll(".reveal");
const tiltCards = document.querySelectorAll(".tilt-card");

let width = 0;
let height = 0;
let particles = [];
let pointerX = 0;
let pointerY = 0;
let latestScrollY = 0;
let ticking = false;

// Make the canvas match the viewport and rebuild particles for the new size.
function resizeCanvas() {
  const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
  width = window.innerWidth;
  height = window.innerHeight;

  canvas.width = Math.floor(width * pixelRatio);
  canvas.height = Math.floor(height * pixelRatio);
  ctx.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

  const particleCount = Math.floor(Math.min(150, Math.max(70, width / 10)));
  particles = Array.from({ length: particleCount }, createParticle);
}

// z controls depth: larger z particles move and glow more strongly.
function createParticle() {
  return {
    x: Math.random() * width,
    y: Math.random() * height,
    z: Math.random() * 0.9 + 0.1,
    radius: Math.random() * 1.8 + 0.7,
    speed: Math.random() * 0.35 + 0.12,
    hue: [198, 207, 216, 226][Math.floor(Math.random() * 4)]
  };
}

// Draw one particle with pointer-based drift to create a 3D parallax effect.
function drawParticle(particle) {
  const driftX = pointerX * particle.z * 28;
  const driftY = pointerY * particle.z * 22;
  const size = particle.radius * (1 + particle.z);

  ctx.beginPath();
  ctx.arc(particle.x + driftX, particle.y + driftY, size, 0, Math.PI * 2);
  ctx.fillStyle = `hsla(${particle.hue}, 92%, 68%, ${0.2 + particle.z * 0.42})`;
  ctx.fill();
}

// Animation loop: move particles upward, wrap them, then redraw every frame.
function animateParticles() {
  ctx.clearRect(0, 0, width, height);

  particles.forEach((particle) => {
    particle.y -= particle.speed * particle.z;
    particle.x += Math.sin((particle.y + particle.z * 260) * 0.01) * 0.25;

    if (particle.y < -20) {
      particle.y = height + 20;
      particle.x = Math.random() * width;
    }

    drawParticle(particle);
  });

  requestAnimationFrame(animateParticles);
}

// Pointer movement tilts the hero visual and shifts the particle field.
function handlePointerMove(event) {
  const halfWidth = window.innerWidth / 2;
  const halfHeight = window.innerHeight / 2;

  pointerX = (event.clientX - halfWidth) / halfWidth;
  pointerY = (event.clientY - halfHeight) / halfHeight;

  if (heroVisual) {
    heroVisual.style.transform = `rotateY(${pointerX * 8}deg) rotateX(${-pointerY * 8}deg)`;
  }
}

// Reset the 3D header tilt when the pointer leaves the window.
function resetVisualTilt() {
  pointerX = 0;
  pointerY = 0;

  if (heroVisual) {
    heroVisual.style.transform = "rotateY(0deg) rotateX(0deg)";
  }
}

// Scroll parallax moves elements with data-depth at different speeds.
function updateParallax() {
  parallaxItems.forEach((item) => {
    const depth = Number(item.dataset.depth || 0);
    const rect = item.getBoundingClientRect();
    const viewportCenter = window.innerHeight / 2;
    const itemCenter = rect.top + rect.height / 2;
    const offset = (viewportCenter - itemCenter) * depth;

    item.style.translate = `0 ${offset}px`;
  });
}

// requestAnimationFrame prevents scroll work from running too often.
function handleScroll() {
  latestScrollY = window.scrollY;

  if (!ticking) {
    requestAnimationFrame(() => {
      document.documentElement.style.setProperty("--scroll-y", latestScrollY);
      updateParallax();
      ticking = false;
    });
    ticking = true;
  }
}

// Reveal sections only when they enter the viewport.
function setupRevealObserver() {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },
    {
      rootMargin: "0px 0px -10% 0px",
      threshold: 0.15
    }
  );

  revealItems.forEach((item) => observer.observe(item));
}

// Project/contact cards tilt toward the pointer for an interactive 3D feel.
function setupCardTilt() {
  tiltCards.forEach((card) => {
    card.addEventListener("pointermove", (event) => {
      const rect = card.getBoundingClientRect();
      const x = (event.clientX - rect.left) / rect.width - 0.5;
      const y = (event.clientY - rect.top) / rect.height - 0.5;

      card.style.transform = `rotateX(${-y * 10}deg) rotateY(${x * 12}deg) translateZ(18px)`;
    });

    card.addEventListener("pointerleave", () => {
      card.style.transform = "rotateX(0deg) rotateY(0deg) translateZ(0)";
    });
  });
}

window.addEventListener("resize", () => {
  resizeCanvas();
  updateParallax();
});
window.addEventListener("pointermove", handlePointerMove);
window.addEventListener("pointerleave", resetVisualTilt);
window.addEventListener("scroll", handleScroll, { passive: true });

resizeCanvas();
setupRevealObserver();
setupCardTilt();
updateParallax();
animateParticles();
