// Crear la escena, la cámara y el renderizador
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.getElementById('container').appendChild(renderer.domElement);


// Crear la Tierra con textura
const earthTexture = new THREE.TextureLoader().load('imagen/earth.png');
const earthGeometry = new THREE.SphereGeometry(0.1, 32, 32);
const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
const earth = new THREE.Mesh(earthGeometry, earthMaterial);
scene.add(earth);

// Crear planetas con texturas
const planets = [
    { name: "Mercurio", texture: 'imagen/mercury.png', distance: 3, speed: 0.02 }, 
    { name: "Venus", texture: 'imagen/venus.png', distance: 3.3, speed: 0.018 },   
    { name: "Marte", texture: 'imagen/mars.png', distance: 3.6, speed: 0.01 },    
    { name: "Júpiter", texture: 'imagen/jupiter.png', distance: 4.0, speed: 0.005 },   
    { name: "Saturno", texture: 'imagen/saturn.png', distance: 4.5, speed: 0.002 },  
    { name: "Urano", texture: 'imagen/uranus.png', distance: 5.2, speed: 0.001 },    
    { name: "Neptuno", texture: 'imagen/neptune.png', distance: 5.9, speed: 0.0005 },
];

const planetMeshes = planets.map(planet => {
    const texture = new THREE.TextureLoader().load(planet.texture);
    const geometry = new THREE.SphereGeometry(0.05, 32, 32);
    const material = new THREE.MeshBasicMaterial({ map: texture });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);
    return { mesh, distance: planet.distance, speed: planet.speed, angle: 0 };
});

camera.position.z = 5; // Posición de la cámara

// Función para actualizar la posición de los planetas
function animate() {
    requestAnimationFrame(animate);

    // Rotar planetas alrededor de la Tierra
    planetMeshes.forEach(planet => {
        planet.angle += planet.speed;
        planet.mesh.position.x = Math.cos(planet.angle) * planet.distance;
        planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
    });

    renderer.render(scene, camera);
}

animate();

// Ajustar la vista cuando se cambia el tamaño de la ventana
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
});
