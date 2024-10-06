$(document).ready(function () {
  // Crear la escena, la cámara y el renderizador
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(
    75,
    $(window).width() / $(window).height(),
    0.1,
    1000
  );
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize($(window).width(), $(window).height());
  $("#container").append(renderer.domElement);

  $(window).on("load", function() {
    setTimeout(function() {
        $("#loading-screen").fadeOut();
    }, 5000); // 5000 milisegundos = 5 segundos
  });

  document.getElementById("exit-button").onclick = function() {
    window.location.href = "./index.html"; // Cambia esta URL a la que quieras redirigir
  };

  document.getElementById('zoomIn').addEventListener('click', function () {
    camera.position.z = Math.max(camera.position.z - 0.5, 1); // Acercar
  });

  document.getElementById('zoomOut').addEventListener('click', function () {
    camera.position.z += 0.5; // Alejar
  });

  document.getElementById('exit').addEventListener('click', function () {
    followingPlanet = null;
    camera.position.copy(originalCameraPosition);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
    inputField.val(""); // Limpiar el campo de texto
    infoContainer.hide(); // Ocultar cuadro de información
  });

  // Crear la barra de texto
  const inputContainer = $("<div>").attr("id", "input-container").css({
    position: "absolute",
    top: "10px",
    left: "10px",
    zIndex: 100,
    backgroundColor: "rgba(255, 255, 255, 0.8)",
    padding: "10px",
    borderRadius: "5px",
  });
  const inputField = $("<input>")
    .attr("type", "text")
    .attr("placeholder", "Ingrese el nombre del cuerpo celeste")
    .css({
      width: "220px",
      
    });
  inputContainer.append(inputField);
  $("body").append(inputContainer);

  // Crear cuadro de información
  const infoContainer = $("<div>").attr("id", "info-container").css({
    position: "absolute",
    top: "80px",
    left: "10px",
    zIndex: 100,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    color: "white",
    padding: "10px",
    borderRadius: "5px",
    display: "none",
    width: "150px",
    height: "50px",
  });
  const infoTitle = $("<h3>").attr("id", "info-title");
  const infoContent = $("<p>").attr("id", "info-content").css({
    width: "150px",
    height: "50px",
  });
  infoContainer.append(infoTitle, infoContent);
  $("body").append(infoContainer);

  // Cargar la textura PNG para las estrellas
  const starTexture = new THREE.TextureLoader().load('./imagen/meteorito.png'); // Cambia esto por la ruta de tu imagen
  createStars(); // Crear estrellas solo después de que la textura se haya cargado

  // Crear las estrellas con la textura
  function createStars() {
    const starGeometry = new THREE.SphereGeometry(0.1, 16, 16); // Tamaño y forma de las estrellas
    const starMaterial = new THREE.MeshBasicMaterial({ map: starTexture, transparent: true }); // Aplicar la textura a las estrellas

    for (let i = 0; i < 15000; i++) { // Crear 1000 estrellas
      const star = new THREE.Mesh(starGeometry, starMaterial);

      // Posición aleatoria en el espacio
      star.position.set(
        (Math.random() - 0.5) * 200, // Distribuir en un rango más amplio
        (Math.random() - 0.5) * 200,
        (Math.random() - 0.5) * 200
      );

      scene.add(star); // Añadir la estrella a la escena
    }
  }

  // Crear la Tierra con textura
  const earthTexture = new THREE.TextureLoader().load("imagen/earth.png");
  const earthGeometry = new THREE.CircleGeometry(0.3, 32); // Tamaño aumentado 3 veces
  const earthMaterial = new THREE.MeshBasicMaterial({ map: earthTexture });
  const earth = new THREE.Mesh(earthGeometry, earthMaterial);
  earth.name = "Tierra";
  scene.add(earth);

  // Crear la Luna
  const moonGeometry = new THREE.CircleGeometry(0.1, 32); // Tamaño de la Luna
  const moonTexture = new THREE.TextureLoader().load("imagen/moon.png");
  const moonMaterial = new THREE.MeshBasicMaterial({ map: moonTexture });
  const moon = new THREE.Mesh(moonGeometry, moonMaterial);
  moon.name = "Luna";
  scene.add(moon);

  let moonAngle = 0; // Ángulo inicial de la Luna

  // Crear planetas con texturas
  const planets = [
    {
      name: "Mercurio",
      texture: "imagen/mercury.png",
      distance: 3,
      speed: 0.02,
    },
    { name: "Venus", texture: "imagen/venus.png", distance: 3.3, speed: 0.018 },
    { name: "Marte", texture: "imagen/mars.png", distance: 3.6, speed: 0.01 },
    {
      name: "Jupiter",
      texture: "imagen/jupiter.png",
      distance: 4.0,
      speed: 0.005,
    },
    {
      name: "Saturno",
      texture: "imagen/saturn.png",
      distance: 4.5,
      speed: 0.002,
    },
    {
      name: "Urano",
      texture: "imagen/uranus.png",
      distance: 5.2,
      speed: 0.001,
    },
    {
      name: "Neptuno",
      texture: "imagen/neptune.png",
      distance: 5.9,
      speed: 0.0005,
    },
  ];

  const planetMeshes = planets.map((planet) => {
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
    planetMeshes.forEach((planet) => {
      planet.angle += planet.speed;
      const eccentricity = 1.05; // Valor para simular una órbita ligeramente elíptica
      let inclination;
      switch (planet.mesh.name) {
        case "Mercurio":
          inclination = 3.38;
          break;
        case "Venus":
          inclination = 3.86;
          break;
        case "Tierra":
          inclination = 7.155;
          break;
        case "Marte":
          inclination = 5.65;
          break;
        case "Jupiter":
          inclination = 6.09;
          break;
        case "Saturno":
          inclination = 5.51;
          break;
        case "Urano":
          inclination = 6.48;
          break;
        case "Neptuno":
          inclination = 6.43;
          break;
        default:
          inclination = 0;
      }

      planet.mesh.position.x =
        Math.cos(planet.angle) * planet.distance * eccentricity;
      planet.mesh.position.z = Math.sin(planet.angle) * planet.distance;
      planet.mesh.position.y = Math.sin(planet.angle) * inclination * 0.1;

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


    // Seg


    // Seguir el planeta seleccionado
    if (followingPlanet) {
      camera.position.lerp(
        followingPlanet.position.clone().add(new THREE.Vector3(0, 0, 1)),
        0.1
      );
      camera.lookAt(followingPlanet.position);
    }

    renderer.render(scene, camera);
  }

  animate();

  // Ajustar la vista cuando se cambia el tamaño de la ventana
  $(window).on("resize", function () {
    const width = $(window).width();
    const height = $(window).height();
    renderer.setSize(width, height);
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
  });

  // Agregar controles de acercar y alejar la cámara y cambiar el tamaño de los planetas
  $(document).on("keydown", function (event) {
    switch (event.key) {
      case "+": // Acercar
        camera.position.z = Math.max(camera.position.z - 0.5, 1); // Limitar acercamiento
        break;
      case "-": // Alejar
        camera.position.z += 0.5;
        break;
      case "k": // Aumentar tamaño de la Tierra y los planetas
        earth.scale.set(
          earth.scale.x * 1.1,
          earth.scale.y * 1.1,
          earth.scale.z * 1.1
        );
        planetMeshes.forEach((planet) => {
          planet.mesh.scale.set(
            planet.mesh.scale.x * 1.1,
            planet.mesh.scale.y * 1.1,
            planet.mesh.scale.z * 1.1
          );
          planet.distance *= 1.1; // Aumentar la distancia proporcionalmente
        });
        break;
      case "l": // Reducir tamaño de la Tierra y los planetas
        earth.scale.set(
          earth.scale.x * 0.9,
          earth.scale.y * 0.9,
          earth.scale.z * 0.9
        );
        planetMeshes.forEach((planet) => {
          planet.mesh.scale.set(
            planet.mesh.scale.x * 0.9,
            planet.mesh.scale.y * 0.9,
            planet.mesh.scale.z * 0.9
          );
          planet.distance *= 0.9; // Reducir la distancia proporcionalmente
        });
        break;
      case "b": // Salir del zoom y volver a la cámara original
        followingPlanet = null;
        camera.position.copy(originalCameraPosition);
        camera.lookAt(new THREE.Vector3(0, 0, 0));
        inputField.val(""); // Limpiar el campo de texto
        infoContainer.hide(); // Ocultar cuadro de información
        break;
    }
    camera.updateProjectionMatrix(); // Actualizar la matriz de proyección para mantener las proporciones correctas
  });

  // Detectar el clic del ratón para seguir un planeta
  $(renderer.domElement).on("wheel", function (event) {
    event.preventDefault(); // Desactivar zoom con rueda del ratón o pad de laptop
  });

  $(renderer.domElement).on("mousedown", function (event) {
    if (event.which === 1) {
      // Clic izquierdo
      const mouse = new THREE.Vector2();
      mouse.x = (event.clientX / $(window).width()) * 2 - 1;
      mouse.y = -(event.clientY / $(window).height()) * 2 + 1;

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([
        earth,
        moon,
        ...planetMeshes.map((planet) => planet.mesh),
      ]);

      if (intersects.length > 0) {
        followingPlanet = intersects[0].object;
        infoTitle.text(followingPlanet.name);
        if (followingPlanet.name === "Tierra") {
          infoContent.text(
            "La Tierra es el tercer planeta desde el Sol y el único conocido con vida. Diámetro: 12,742 km."
          );
        } else if (followingPlanet.name === "Luna") {
          infoContent.text(
            "La Luna es el único satélite natural de la Tierra. Diámetro: 3,474 km. Distancia a la Tierra: 384,400 km."
          );
        } else if (followingPlanet.name === "Mercurio") {
          infoContent.text(
            "Mercurio es el planeta más cercano al Sol. Diámetro: 4,880 km. Distancia a la Tierra: 77 millones de km."
          );
        } else if (followingPlanet.name === "Venus") {
          infoContent.text(
            "Venus es el segundo planeta desde el Sol y es similar en tamaño a la Tierra. Diámetro: 12,104 km. Distancia a la Tierra: 41 millones de km."
          );
        } else if (followingPlanet.name === "Marte") {
          infoContent.text(
            "Marte es conocido como el planeta rojo. Diámetro: 6,779 km. Distancia a la Tierra: 78 millones de km."
          );
        } else if (followingPlanet.name === "Jupiter") {
          infoContent.text(
            "Jupiter es el planeta más grande del sistema solar. Diámetro: 142,984 km. Distancia a la Tierra: 628 millones de km."
          );
        } else if (followingPlanet.name === "Saturno") {
          infoContent.text(
            "Saturno es conocido por sus anillos impresionantes. Diámetro: 120,536 km. Distancia a la Tierra: 1,275 millones de km."
          );
        } else if (followingPlanet.name === "Urano") {
          infoContent.text(
            "Urano tiene un eje de rotación único que está casi paralelo a su órbita. Diámetro: 51,118 km. Distancia a la Tierra: 2,724 millones de km."
          );
        } else if (followingPlanet.name === "Neptuno") {
          infoContent.text(
            "Neptuno es el planeta más distante del Sol. Diámetro: 49,528 km. Distancia a la Tierra: 4,351 millones de km."
          );
        } else {
          infoContent.text(`Información sobre ${followingPlanet.name}`);
        }
        // Aquí podrías agregar más detalles sobre cada cuerpo celeste
        infoContainer.show();
      }
    }
  });
 inputField.on("keypress", function (event) {
    if (event.which === 13) {
      // Presionar Enter
      const inputText = inputField.val().toLowerCase();
      const celestial = [
        earth,
        moon,
        ...planetMeshes.map((planet) => planet.mesh),
      ].find((planet) => planet.name.toLowerCase() === inputText);
      if (celestial) {
        followingPlanet = celestial;
      } else if (inputText === "tierra") {
        followingPlanet = earth;
      } else if (inputText === "luna") {
        followingPlanet = moon;
      }

      if (followingPlanet === earth) {
        infoTitle.text(followingPlanet.name);
        infoContent.text(
          `Información sobre ${followingPlanet.name} \n La Tierra es el tercer planeta desde el Sol y el único conocido con vida. Diámetro: 12,742 km.`
        );
        infoContainer.show();
      } else if (followingPlanet === moon) {
        infoTitle.text(followingPlanet.name);
        infoContent.text(
          `Información sobre ${followingPlanet.name} \n La Luna es el único satélite natural de la Tierra. Diámetro: 3,474 km. Distancia a la Tierra: 384,400 km.`
        );
        infoContainer.show();
      } else if (followingPlanet && followingPlanet.name === "Mercurio") {
        infoTitle.text(followingPlanet.name);
        infoContent.text(
          `Información sobre ${followingPlanet.name} \n Mercurio es el planeta más cercano al Sol. Diámetro: 4,880 km. Distancia a la Tierra: 77 millones de km.`
        );
        infoContainer.show();
      } else if (followingPlanet && followingPlanet.name === "Venus") {
        infoTitle.text(followingPlanet.name);
        infoContent.text(
          `Información sobre ${followingPlanet.name} \n Venus es el segundo planeta desde el Sol y es similar en tamaño a la Tierra. Diámetro: 12,104 km. Distancia a la Tierra: 41 millones de km.`
        );
        infoContainer.show();
      } else if (followingPlanet && followingPlanet.name === "Marte") {
        infoTitle.text(followingPlanet.name);
        infoContent.text(
          `Información sobre ${followingPlanet.name} \n Marte es conocido como el planeta rojo. Diámetro: 6,779 km. Distancia a la Tierra: 78 millones de km.`
        );
        infoContainer.show();
      } else if (followingPlanet && followingPlanet.name === "Jupiter") {
        infoTitle.text(followingPlanet.name);
        infoContent.text(
          `Información sobre ${followingPlanet.name} \n Jupiter es el planeta más grande del sistema solar. Diámetro: 142,984 km. Distancia a la Tierra: 628 millones de km.`
        );
        infoContainer.show();
      } else if (followingPlanet && followingPlanet.name === "Saturno") {
        infoTitle.text(followingPlanet.name);
        infoContent.text(
          `Información sobre ${followingPlanet.name} \n Saturno es conocido por sus anillos impresionantes. Diámetro: 120,536 km. Distancia a la Tierra: 1,275 millones de km.`
        );
        infoContainer.show();
      } else if (followingPlanet && followingPlanet.name === "Urano") {
        infoTitle.text(followingPlanet.name);
        infoContent.text(
          `Información sobre ${followingPlanet.name} \n Urano tiene un eje de rotación único que está casi paralelo a su órbita. Diámetro: 51,118 km. Distancia a la Tierra: 2,724 millones de km.`
        );
        infoContainer.show();
      } else if (followingPlanet && followingPlanet.name === "Neptuno") {
        infoTitle.text(followingPlanet.name);
        infoContent.text(
          `Información sobre ${followingPlanet.name} \n Neptuno es el planeta más distante del Sol. Diámetro: 49,528 km. Distancia a la Tierra: 4,351 millones de km.`
        );
        infoContainer.show();
      } else {
        infoTitle.text(followingPlanet.name);
        infoContent.text(`Información sobre ${followingPlanet.name}`);
        infoContainer.show();
      }
    }
  });
  
});
