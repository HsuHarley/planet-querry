$(document).ready(function() {
    // Crear la escena, la cámara y el renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, $(window).width() / $(window).height(), 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize($(window).width(), $(window).height());
    $('#container').append(renderer.domElement);

    // Crear la Tierra con textura
    const earthTexture = new THREE.TextureLoader().load('imagen/earth.png');
    const earthGeometry = new THREE.CircleGeometry(0.3, 32); // Tamaño aumentado 3 veces
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
        { name: "Neptuno", texture: 'imagen/neptune.png', distance: 5.9, speed: 0.0005 }
    ];

    const planetMeshes = planets.map(planet => {
        const texture = new THREE.TextureLoader().load(planet.texture);
        const geometry = new THREE.CircleGeometry(0.15, 32); // Tamaño aumentado 3 veces
        const material = new THREE.MeshBasicMaterial({ map: texture });
        const mesh = new THREE.Mesh(geometry, material);
        scene.add(mesh);
        return { mesh, distance: planet.distance, speed: planet.speed, angle: 0 };
    });

    camera.position.z = 5; // Posición de la cámara
    let earthAngle = 0; // Ángulo inicial de la Tierra

    // Función para actualizar la posición de los planetas
    function animate() {
        requestAnimationFrame(animate);

        // Rotar planetas alrededor de la Tierra con órbitas inclinadas y movimiento elíptico
        planetMeshes.forEach(planet => {
            planet.angle += planet.speed;
            const eccentricity = 1.05; // Valor para simular una órbita ligeramente elíptica
            const inclination = Math.sin(planet.angle * 0.1) * 0.2; // Añadir inclinación en el eje Y
            planet.mesh.position.x = Math.cos(planet.angle) * planet.distance * eccentricity;
            planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
            planet.mesh.position.y = inclination; // Añadir componente vertical para la inclinación

            // Mantener el planeta mirando a la cámara
            planet.mesh.lookAt(camera.position);
        });

        // Mover la Tierra en un pequeño círculo en el eje Z
        earthAngle += 0.01;
        earth.position.x = Math.cos(earthAngle) * 0.1;
        earth.position.z = Math.sin(earthAngle) * 0.1;

        renderer.render(scene, camera);
    }

    animate();

    // Ajustar la vista cuando se cambia el tamaño de la ventana
    $(window).on('resize', function() {
        const width = $(window).width();
        const height = $(window).height();
        renderer.setSize(width, height);
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
    });

    // Agregar controles de acercar y alejar la cámara y cambiar el tamaño de los planetas
    $(document).on('keydown', function(event) {
        switch(event.key) {
            case '+': // Acercar
                camera.position.z = Math.max(camera.position.z - 0.5, 1); // Limitar acercamiento
                break;
            case '-': // Alejar
                camera.position.z += 0.5;
                break;
            case 'k': // Aumentar tamaño de la Tierra y los planetas
                earth.scale.set(earth.scale.x * 1.1, earth.scale.y * 1.1, earth.scale.z * 1.1);
                planetMeshes.forEach(planet => {
                    planet.mesh.scale.set(planet.mesh.scale.x * 1.1, planet.mesh.scale.y * 1.1, planet.mesh.scale.z * 1.1);
                    planet.distance *= 1.1; // Aumentar la distancia proporcionalmente
                });
                break;
            case 'l': // Reducir tamaño de la Tierra y los planetas
                earth.scale.set(earth.scale.x * 0.9, earth.scale.y * 0.9, earth.scale.z * 0.9);
                planetMeshes.forEach(planet => {
                    planet.mesh.scale.set(planet.mesh.scale.x * 0.9, planet.mesh.scale.y * 0.9, planet.mesh.scale.z * 0.9);
                    planet.distance *= 0.9; // Reducir la distancia proporcionalmente
                });
                break;
        }
        camera.updateProjectionMatrix(); // Actualizar la matriz de proyección para mantener las proporciones correctas
    });
});