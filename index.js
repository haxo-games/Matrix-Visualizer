let camera, scene, renderer;
let cube, platform;
let matrixDisplay;
let cameraRotation = { x: 0, y: 0 };
let keys = {};
let isLeftHanded = false;
let currentAxesHelper;

init();
animate();

function init() {
  document.getElementById("copyrightYear").innerHTML = new Date().getFullYear();

  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );

  renderer = new THREE.WebGLRenderer();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  document.body.appendChild(renderer.domElement);

  const platformGeometry = new THREE.BoxGeometry(10, 0.5, 10);
  const platformMaterial = new THREE.MeshPhongMaterial({
    color: 0x808080,
  });
  platform = new THREE.Mesh(platformGeometry, platformMaterial);
  platform.receiveShadow = true;
  platform.position.y = -2;
  scene.add(platform);

  const textureLoader = new THREE.TextureLoader();
  const texture = textureLoader.load("iron.png");
  const geometry = new THREE.BoxGeometry();
  const material = new THREE.MeshPhongMaterial({ 
    map: texture,
    color: 0xffffff,
  });
  cube = new THREE.Mesh(geometry, material);
  cube.castShadow = true;
  cube.position.y = 0;

  scene.add(cube);

  const ambientLight = new THREE.AmbientLight(0x404040);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
  directionalLight.position.set(5, 5, 5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  currentAxesHelper = new THREE.AxesHelper(5);
  scene.add(currentAxesHelper);

  camera.position.set(5, 2, 5);

  matrixDisplay = document.getElementById("matrices");

  document
    .getElementById("matrix-format")
    .addEventListener("change", updateMatrixDisplay);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  document
    .getElementById("coordinate-system")
    .addEventListener("change", (e) => {
      isLeftHanded = e.target.value === "directx";

      scene.remove(currentAxesHelper);
      currentAxesHelper = new THREE.AxesHelper(5);

      if (isLeftHanded) currentAxesHelper.scale.z = -1;

      scene.add(currentAxesHelper);
      updateMatrixDisplay();
    });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      document.exitPointerLock();
    } else if (e.key === " ") {
      keys["space"] = true;
      e.preventDefault();
    } else if (e.key === "Shift") {
      keys["shift"] = true;
      e.preventDefault();
    } else {
      keys[e.key.toLowerCase()] = true;
    }
  });

  document.addEventListener("keyup", (e) => {
    if (e.key === " ") {
      keys["space"] = false;
    } else if (e.key === "Shift") {
      keys["shift"] = false;
    } else {
      keys[e.key.toLowerCase()] = false;
    }
  });

  document.addEventListener("click", (event) => {
    if (event.target instanceof HTMLCanvasElement) {
      document.body.requestPointerLock();
    }
  });

  document.addEventListener("mousemove", (e) => {
    if (document.pointerLockElement === document.body) {
      const deltaX = e.movementX;
      const deltaY = e.movementY;

      cameraRotation.y -= deltaX * 0.002;
      cameraRotation.x -= deltaY * 0.002;
      cameraRotation.x = Math.max(
        -Math.PI / 2,
        Math.min(Math.PI / 2, cameraRotation.x)
      );
    }
  });
}

function formatMatrix(matrix, isRowMajor) {
  const elements = matrix.elements;
  let str = "";

  if (isRowMajor) {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        str += elements[i * 4 + j].toFixed(2).padStart(8) + " ";
      }

      str += "\n";
    }
  } else {
    for (let i = 0; i < 4; i++) {
      for (let j = 0; j < 4; j++) {
        str += elements[j * 4 + i].toFixed(2).padStart(8) + " ";
      }

      str += "\n";
    }
  }

  return str;
}

function updateMatrixDisplay() {
  const viewMatrix = camera.matrixWorldInverse.clone();
  const projectionMatrix = camera.projectionMatrix.clone();
  const viewProjectionMatrix = projectionMatrix.clone().multiply(viewMatrix);

  const isRowMajor = document.getElementById("matrix-format").value === "row";
  const formatLabel = isRowMajor ? "Row-Major" : "Column-Major";

  matrixDisplay.innerHTML = `
                <h3>View Matrix (${formatLabel}):</h3>
                <pre>${formatMatrix(viewMatrix, isRowMajor)}</pre>
                <h3>Projection Matrix (${formatLabel}):</h3>
                <pre>${formatMatrix(projectionMatrix, isRowMajor)}</pre>
                <h3>View-Projection Matrix (${formatLabel}):</h3>
                <pre>${formatMatrix(viewProjectionMatrix, isRowMajor)}</pre>
    
        `;
}

function resetCamera() {
  camera.position.set(5, 2, 5);
  cameraRotation.x = 0;
  cameraRotation.y = 0;
}

function updateCamera() {
  const moveSpeed = 0.1;

  if (keys["w"]) camera.translateZ(-moveSpeed);
  if (keys["s"]) camera.translateZ(moveSpeed);
  if (keys["a"]) camera.translateX(-moveSpeed);
  if (keys["d"]) camera.translateX(moveSpeed);

  if (keys["space"]) camera.position.y += moveSpeed;
  if (keys["shift"]) camera.position.y -= moveSpeed;

  if (keys["i"]) cameraRotation.x = Math.PI / 2;
  if (keys["k"]) cameraRotation.x = -Math.PI / 2;

  if (keys["r"]) resetCamera();

  camera.rotation.set(0, 0, 0);
  camera.rotateY(cameraRotation.y);
  camera.rotateX(cameraRotation.x);
}

function animate() {
  if (
    Math.abs(camera.position.x) >= 40 ||
    Math.abs(camera.position.y) >= 40 ||
    Math.abs(camera.position.z) >= 40
  ) {
    resetCamera();
  }

  requestAnimationFrame(animate);
  updateCamera();
  updateMatrixDisplay();
  renderer.render(scene, camera);
}
