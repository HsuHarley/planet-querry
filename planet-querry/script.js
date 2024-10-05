$(document).ready(function() {
    // Crear la escena, la cámara y el renderizador
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, $(window).width() / $(window).height(), 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize($(window).width(), $(window).height());
    $('#container').append(renderer.domElement);

    // Crear la barra de texto
    const inputContainer = $('<div>').attr('id', 'input-container').css({
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 100,
        backgroundColor: 'rgba(255, 255, 255, 0.8)',
        padding: '10px',
        borderRadius: '5px'
    });
    const inputField = $('<input>').attr('type', 'text').attr('placeholder', 'Ingrese el nombre del cuerpo celeste').css({
        width: '220px',
        backgroundColor: 'purple'
    });
    inputContainer.append(inputField);
    $('body').append(inputContainer);

    // Crear cuadro de información
    const infoContainer = $('<div>').attr('id', 'info-container').css({
        position: 'absolute',
        top: '80px',
        left: '10px',
        zIndex: 100,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        color: 'white',
        padding: '10px',
        borderRadius: '5px',
        display: 'none'
    });
    const infoTitle = $('<h3>').attr('id', 'info-title');
    const infoContent = $('<p>').attr('id', 'info-content');
    infoContainer.append(infoTitle, infoContent);
    $('body').append(infoContainer);

    // Crear la Tierra con textura
    const earthTexture = new THREE.TextureLoader().load('imagen/earth.png');
    const earthGeometry = new THREE.CircleGeometry(0.3, 32); // Tamaño aumentado 3 veces
    const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
    const earth = new THREE.Mesh(earthGeometry, earthMaterial);
    earth.name = 'Tierra';
    scene.add(earth);

    // Crear la Luna
    const moonGeometry = new THREE.CircleGeometry(0.1, 32); // Tamaño de la Luna
    const moonTexture = new THREE.TextureLoader().load('imagen/moon.png');
    const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
    const moon = new THREE.Mesh(moonGeometry, moonMaterial);
    moon.name = 'Luna';
    scene.add(moon);

    let moonAngle = 0; // Ángulo inicial de la Luna

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
        mesh.name = planet.name;
        scene.add(mesh);
        return { mesh, distance: planet.distance, speed: planet.speed, angle: 0 };
    });

    camera.position.z = 5; // Posición de la cámara
    let earthAngle = 0; // Ángulo inicial de la Tierra
    let followingPlanet = null; // Referencia del planeta que se está siguiendo
    const originalCameraPosition = camera.position.clone();

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
        moonAngle += 0.03; // Velocidad de la Luna

        // Posicionar la Luna alrededor de la Tierra
        moon.position.x = earth.position.x + Math.cos(moonAngle) * 0.6;
        moon.position.z = earth.position.z + Math.sin(moonAngle) * 0.6;
        moon.position.y = earth.position.y;
        earth.position.x = Math.cos(earthAngle) * 0.1;
        earth.position.z = Math.sin(earthAngle) * 0.1;

        // Seguir el planeta seleccionado
        if (followingPlanet) {
            camera.position.lerp(followingPlanet.position.clone().add(new THREE.Vector3(0, 0, 1)), 0.1);
            camera.lookAt(followingPlanet.position);
        }

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
            case 'b': // Salir del zoom y volver a la cámara original
                followingPlanet = null;
                camera.position.copy(originalCameraPosition);
                camera.lookAt(new THREE.Vector3(0, 0, 0));
                inputField.val(''); // Limpiar el campo de texto
                infoContainer.hide(); // Ocultar cuadro de información
                break;
        }
        camera.updateProjectionMatrix(); // Actualizar la matriz de proyección para mantener las proporciones correctas
    });

    // Detectar el clic del ratón para seguir un planeta
    $(renderer.domElement).on('wheel', function(event) {
        event.preventDefault(); // Desactivar zoom con rueda del ratón o pad de laptop
    });

    $(renderer.domElement).on('mousedown', function(event) {
        if (event.which === 1) { // Clic izquierdo
            const mouse = new THREE.Vector2();
            mouse.x = (event.clientX / $(window).width()) * 2 - 1;
            mouse.y = -(event.clientY / $(window).height()) * 2 + 1;

            const raycaster = new THREE.Raycaster();
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObjects([earth, moon, ...planetMeshes.map(planet => planet.mesh)]);

            if (intersects.length > 0) {
                followingPlanet = intersects[0].object;
                infoTitle.text(followingPlanet.name);
                infoContent.text(`Información sobre ${followingPlanet.name}`); // Aquí podrías agregar más detalles sobre cada cuerpo celeste
                infoContainer.show();
            }
        }
    });

    // Detectar el texto ingresado en el campo de entrada
    inputField.on('keypress', function(event) {
        if (event.which === 13) { // Presionar Enter
            const inputText = inputField.val().toLowerCase();
            const planet = planetMeshes.find(planet => planet.mesh.name.toLowerCase() === inputText);
            if (planet) {
                followingPlanet = planet.mesh;
            } else if (inputText === 'tierra') {
                followingPlanet = earth;
            } else if (inputText === 'luna') {
                followingPlanet = moon;
            }
            if (followingPlanet) {
                infoTitle.text(followingPlanet.name);
                infoContent.text(`Información sobre ${followingPlanet.name}`); // Aquí podrías agregar más detalles sobre cada cuerpo celeste
                infoContainer.show();
            }
        }
    });
});