// ── THREE.JS 3D ASTEROID FIELD ──
const scene    = new THREE.Scene();
const camera   = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ canvas: document.getElementById('bg'), alpha: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
camera.position.z = 5;

// Asteroid colors — fiery orange, red, ember
const asteroidColors = [0xff6a00, 0xff2200, 0xffaa00, 0xff4500, 0xcc3300];

const asteroids = [];
const ASTEROID_COUNT = 120;

function createAsteroid() {
  const detail   = Math.random() > 0.5 ? 0 : 1;
  const geo      = new THREE.IcosahedronGeometry(Math.random() * 0.35 + 0.08, detail);

  // Displace vertices to make it look like a rough rock
  const posAttr = geo.attributes.position;
  for (let i = 0; i < posAttr.count; i++) {
    posAttr.setXYZ(
      i,
      posAttr.getX(i) + (Math.random() - 0.5) * 0.08,
      posAttr.getY(i) + (Math.random() - 0.5) * 0.08,
      posAttr.getZ(i) + (Math.random() - 0.5) * 0.08
    );
  }
  posAttr.needsUpdate = true;
  geo.computeVertexNormals();

  const color = asteroidColors[Math.floor(Math.random() * asteroidColors.length)];
  const mat   = new THREE.MeshStandardMaterial({
    color,
    emissive: color,
    emissiveIntensity: 0.25,
    roughness: 0.95,
    metalness: 0.1,
    wireframe: false
  });

  const mesh = new THREE.Mesh(geo, mat);

  // Spread across a wide volume
  mesh.position.set(
    (Math.random() - 0.5) * 30,
    Math.random() * 30 + 10,   // start above the view
    (Math.random() - 0.5) * 20
  );

  mesh.rotation.set(
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2,
    Math.random() * Math.PI * 2
  );

  const speed = Math.random() * 0.04 + 0.01;
  const rotSpeed = {
    x: (Math.random() - 0.5) * 0.02,
    y: (Math.random() - 0.5) * 0.02,
    z: (Math.random() - 0.5) * 0.02
  };

  scene.add(mesh);
  asteroids.push({ mesh, speed, rotSpeed });
}

for (let i = 0; i < ASTEROID_COUNT; i++) createAsteroid();

// Ambient + point lights for fiery glow
const ambientLight = new THREE.AmbientLight(0xff4400, 0.6);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xff6a00, 2, 50);
pointLight1.position.set(5, 5, 5);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0xff2200, 1.5, 50);
pointLight2.position.set(-5, -5, -5);
scene.add(pointLight2);

// Stars background
const starGeo    = new THREE.BufferGeometry();
const starPos    = new Float32Array(3000 * 3);
for (let i = 0; i < 3000; i++) {
  starPos[i * 3]     = (Math.random() - 0.5) * 200;
  starPos[i * 3 + 1] = (Math.random() - 0.5) * 200;
  starPos[i * 3 + 2] = (Math.random() - 0.5) * 200;
}
starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
const starMat  = new THREE.PointsMaterial({ color: 0xffffff, size: 0.08, transparent: true, opacity: 0.6 });
const starMesh = new THREE.Points(starGeo, starMat);
scene.add(starMesh);

// Mouse parallax
let mouseX = 0, mouseY = 0;
document.addEventListener('mousemove', e => {
  mouseX = (e.clientX / innerWidth  - 0.5) * 0.4;
  mouseY = (e.clientY / innerHeight - 0.5) * 0.4;
});

window.addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});

// Animation loop
(function animate() {
  requestAnimationFrame(animate);

  asteroids.forEach(({ mesh, speed, rotSpeed }) => {
    // Fall downward
    mesh.position.y -= speed;
    // Slight horizontal drift
    mesh.position.x += (Math.random() - 0.5) * 0.002;

    // Tumble
    mesh.rotation.x += rotSpeed.x;
    mesh.rotation.y += rotSpeed.y;
    mesh.rotation.z += rotSpeed.z;

    // Reset to top when fallen below view
    if (mesh.position.y < -15) {
      mesh.position.y = Math.random() * 10 + 15;
      mesh.position.x = (Math.random() - 0.5) * 30;
      mesh.position.z = (Math.random() - 0.5) * 20;
    }
  });

  // Slow star rotation
  starMesh.rotation.y += 0.0001;

  // Mouse parallax on camera
  camera.position.x += (mouseX - camera.position.x) * 0.03;
  camera.position.y += (-mouseY - camera.position.y) * 0.03;

  renderer.render(scene, camera);
})();

// ── SCROLL REVEAL ──
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      entry.target.querySelectorAll('.skill-fill').forEach(bar => {
        bar.style.width = bar.dataset.w + '%';
      });
    }
  });
}, { threshold: 0.15 });

document.querySelectorAll('.glass-card, .section-title').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});

window.addEventListener('load', () => {
  const hero = document.querySelector('.hero-inner');
  if (hero) hero.classList.add('visible');
});

// ── 3D TILT ON GLASS CARDS ──
document.querySelectorAll('.glass-card').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width  - 0.5;
    const y = (e.clientY - r.top)  / r.height - 0.5;
    card.style.transform = `perspective(600px) rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = 'perspective(600px) rotateY(0) rotateX(0) translateY(0)';
  });
});

// ── FORM HANDLER ──
function handleForm(e) {
  e.preventDefault();
  const success = document.getElementById('formSuccess');
  success.style.display = 'block';
  e.target.reset();
  setTimeout(() => { success.style.display = 'none'; }, 4000);
}
