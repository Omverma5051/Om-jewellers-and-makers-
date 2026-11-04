(() => {
  const buttons = document.querySelectorAll('[data-filter]');
  const products = document.querySelectorAll('[data-metal]');
  buttons.forEach(button => button.addEventListener('click', () => {
    buttons.forEach(item => { const active = item === button; item.classList.toggle('active', active); item.setAttribute('aria-pressed', String(active)); });
    products.forEach(product => { product.hidden = button.dataset.filter !== 'all' && product.dataset.metal !== button.dataset.filter; });
  }));

  const container = document.getElementById('ring-viewer');
  try {
    if (!window.THREE) throw new Error('3D unavailable');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100);
    camera.position.set(0, 0, 9);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    container.appendChild(renderer.domElement);
    const ring = new THREE.Group();
    const gold = new THREE.MeshStandardMaterial({ color: 0xcda45f, metalness: 0.88, roughness: 0.2 });
    const band = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.16, 24, 100), gold);
    ring.add(band);
    const mount = new THREE.Mesh(new THREE.CylinderGeometry(0.38, 0.27, 0.23, 8), gold);
    mount.position.y = 1.27;
    ring.add(mount);
    const gem = new THREE.Mesh(new THREE.OctahedronGeometry(0.48, 0), new THREE.MeshPhysicalMaterial({ color: 0xfff3d9, metalness: 0.1, roughness: 0.05, transparent: true, opacity: 0.9 }));
    gem.position.y = 1.52;
    gem.rotation.y = Math.PI / 8;
    ring.add(gem);
    ring.rotation.set(0.2, -0.45, -0.18);
    scene.add(ring);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3020, 1.2));
    const light = new THREE.DirectionalLight(0xffedc3, 2); light.position.set(3, 5, 6); scene.add(light);
    const back = new THREE.DirectionalLight(0xffffff, 1.3); back.position.set(-4, -2, -4); scene.add(back);
    function resize() { const width = container.clientWidth, height = container.clientHeight; if (!width || !height) return; camera.aspect = width / height; camera.updateProjectionMatrix(); renderer.setSize(width, height); }
    resize(); window.addEventListener('resize', resize);
    let dragging = false, lastX = 0, lastY = 0;
    container.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; container.setPointerCapture(e.pointerId); });
    container.addEventListener('pointermove', e => { if (!dragging) return; ring.rotation.y += (e.clientX - lastX) * 0.01; ring.rotation.x += (e.clientY - lastY) * 0.01; lastX = e.clientX; lastY = e.clientY; });
    container.addEventListener('pointerup', () => { dragging = false; });
    container.addEventListener('pointercancel', () => { dragging = false; });
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    function render() { requestAnimationFrame(render); if (!dragging && !reduceMotion.matches) ring.rotation.y += 0.004; renderer.render(scene, camera); }
    render();
  } catch (error) {
    document.querySelector('.viewer-fallback').hidden = false;
    document.querySelector('.experience-hint').textContent = 'A SCULPTURAL STUDY IN GOLD';
  }
})();
