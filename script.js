// Set up Three.js scene, camera, renderer
const container = document.getElementById('canvas-wrapper');
    const canvas = document.getElementById('solarSystemCanvas');
    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setClearColor(0x000022);

    const scene = new THREE.Scene();

    const camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 12, 40);
    
    // Lighting
    const ambientLight = new THREE.AmbientLight(0x222222);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1.5, 1000);
    pointLight.position.set(0, 0, 0);
    scene.add(pointLight);

    // OrbitControls for 360-degree interactive user camera movement
    const controls = new THREE.OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.minDistance = 10;
    controls.maxDistance = 90;
    controls.maxPolarAngle = Math.PI - 0.05; // prevent orbit under the ground

    // Sun
    const sunGeometry = new THREE.SphereGeometry(4, 64, 64);
    const sunMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00, emissive: 0xffff00, emissiveIntensity: 2 });
    const sun = new THREE.Mesh(sunGeometry, sunMaterial);
    scene.add(sun);

    // Planet data
    const planetData = [
      {name:'Mercury', size:0.35, color:0x909090, orbitRadius:6, speed:1},
      {name:'Venus', size:0.55, color:0xffddb3, orbitRadius:8, speed:0.8},
      {name:'Earth', size:0.6, color:0x4466ff, orbitRadius:10, speed:1},
      {name:'Mars', size:0.5, color:0xff5522, orbitRadius:12, speed:0.6},
      {name:'Jupiter', size:1.3, color:0xffa066, orbitRadius:16, speed:0.3},
      {name:'Saturn', size:1.15, color:0xffcc88, orbitRadius:19, speed:0.25},
      {name:'Uranus', size:1.1, color:0x66ccdd, orbitRadius:22, speed:0.1},
      {name:'Neptune', size:1, color:0x3366ff, orbitRadius:25, speed:0.07}
    ];

    // Create planets
    const planets = [];
    planetData.forEach(({name, size, color, orbitRadius, speed})=>{
      const geometry = new THREE.SphereGeometry(size, 32, 32);
      const material = new THREE.MeshStandardMaterial({color});
      const mesh = new THREE.Mesh(geometry, material);
      mesh.position.x = orbitRadius;
      scene.add(mesh);
      planets.push({name, mesh, orbitRadius, speed, angle: Math.random() * Math.PI*2});
    });

    // Orbit rings
    const orbitMaterial = new THREE.LineBasicMaterial({color: 0x444466, transparent: true, opacity: 0.3});
    planets.forEach(({orbitRadius}) => {
      const segments = 64;
      const points = [];
      for(let i=0; i <= segments; i++){
        const theta = (i/segments) * Math.PI*2;
        points.push(new THREE.Vector3(Math.cos(theta)*orbitRadius, 0, Math.sin(theta)*orbitRadius));
      }
      const geometry = new THREE.BufferGeometry().setFromPoints(points);
      const line = new THREE.LineLoop(geometry, orbitMaterial);
      scene.add(line);
    });

    // Speed controls DOM mapping
    const speedControls = {};
    planetData.forEach(({name}) => {
      speedControls[name] = document.getElementById(name.toLowerCase() + 'Speed');
    });

    const pauseBtn = document.getElementById('pauseResumeButton');
    let isPaused = false;
    pauseBtn.addEventListener('click', () => {
      isPaused = !isPaused;
      pauseBtn.textContent = isPaused ? 'Resume' : 'Pause';
    });

    // Responsive renderer resizing
    function onResize(){
      renderer.setSize(container.clientWidth, container.clientHeight);
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
    }
    window.addEventListener('resize', onResize);
    onResize();

    // Animation loop
    function animate(){
      requestAnimationFrame(animate);
      controls.update();

      if(!isPaused){
        planets.forEach(planet => {
          planet.speed = parseFloat(speedControls[planet.name].value);
          planet.angle += 0.01 * planet.speed;
          planet.angle %= Math.PI * 2;
          planet.mesh.position.x = Math.cos(planet.angle) * planet.orbitRadius;
          planet.mesh.position.z = Math.sin(planet.angle) * planet.orbitRadius;
          planet.mesh.rotation.y += 0.02 * planet.speed;
        });
      }

      renderer.render(scene, camera);
    }
    animate();

