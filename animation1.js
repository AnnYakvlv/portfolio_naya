// animation.js - обновленная версия с адаптацией анимации под мобильные

// TouchTexture class
class TouchTexture {
  constructor() {
    // Адаптивный размер текстуры для мобильных
    const isMobile = window.innerWidth <= 768;
    this.size = isMobile ? 32 : 64;
    this.width = this.height = this.size;
    this.maxAge = isMobile ? 48 : 64;
    this.radius = 0.25 * this.size;
    this.speed = 1 / this.maxAge;
    this.trail = [];
    this.last = null;
    this.initTexture();
  }

  initTexture() {
    this.canvas = document.createElement("canvas");
    this.canvas.width = this.width;
    this.canvas.height = this.height;
    this.ctx = this.canvas.getContext("2d");
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    this.texture = new THREE.Texture(this.canvas);
  }

  update() {
    this.clear();
    let speed = this.speed;
    for (let i = this.trail.length - 1; i >= 0; i--) {
      const point = this.trail[i];
      let f = point.force * speed * (1 - point.age / this.maxAge);
      point.x += point.vx * f;
      point.y += point.vy * f;
      point.age++;
      if (point.age > this.maxAge) {
        this.trail.splice(i, 1);
      } else {
        this.drawPoint(point);
      }
    }
    this.texture.needsUpdate = true;
  }

  clear() {
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }

  addTouch(point) {
    let force = 0;
    let vx = 0;
    let vy = 0;
    const last = this.last;
    if (last) {
      const dx = point.x - last.x;
      const dy = point.y - last.y;
      if (dx === 0 && dy === 0) return;
      const dd = dx * dx + dy * dy;
      let d = Math.sqrt(dd);
      vx = dx / d;
      vy = dy / d;
      // Адаптивная сила для мобильных
      const isMobile = window.innerWidth <= 768;
      force = Math.min(dd * (isMobile ? 10000 : 20000), isMobile ? 1.5 : 2.0);
    }
    this.last = { x: point.x, y: point.y };
    this.trail.push({ x: point.x, y: point.y, age: 0, force, vx, vy });
  }

  drawPoint(point) {
    const pos = {
      x: point.x * this.width,
      y: (1 - point.y) * this.height
    };

    let intensity = 1;
    if (point.age < this.maxAge * 0.3) {
      intensity = Math.sin((point.age / (this.maxAge * 0.3)) * (Math.PI / 2));
    } else {
      const t = 1 - (point.age - this.maxAge * 0.3) / (this.maxAge * 0.7);
      intensity = -t * (t - 2);
    }
    intensity *= point.force;

    const radius = this.radius;
    let color = `${((point.vx + 1) / 2) * 255}, ${
      ((point.vy + 1) / 2) * 255
    }, ${intensity * 255}`;
    let offset = this.size * 5;
    this.ctx.shadowOffsetX = offset;
    this.ctx.shadowOffsetY = offset;
    this.ctx.shadowBlur = radius * 1;
    this.ctx.shadowColor = `rgba(${color},${0.2 * intensity})`;

    this.ctx.beginPath();
    this.ctx.fillStyle = "rgba(255,0,0,1)";
    this.ctx.arc(pos.x - offset, pos.y - offset, radius, 0, Math.PI * 2);
    this.ctx.fill();
  }
}

// GradientBackground class
class GradientBackground {
  constructor(sceneManager) {
    this.sceneManager = sceneManager;
    this.mesh = null;
    
    const isMobile = window.innerWidth <= 768;
    
    // Цвета
    const color1 = new THREE.Vector3(105/255, 155/255, 208/255);
    const color2 = new THREE.Vector3(179/255, 217/255, 241/255);
    const color3 = new THREE.Vector3(48/255, 103/255, 164/255);
    const color4 = new THREE.Vector3(156/255, 191/255, 233/255);
    const color5 = new THREE.Vector3(108/255, 155/255, 208/255);
    const color6 = new THREE.Vector3(24/255, 84/255, 140/255);
    
    this.uniforms = {
      uTime: { value: 0 },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
      },
      uColor1: { value: color1 },
      uColor2: { value: color2 },
      uColor3: { value: color3 },
      uColor4: { value: color4 },
      uColor5: { value: color5 },
      uColor6: { value: color6 },
      uSpeed: { value: isMobile ? 0.8 : 1.2 },
      uIntensity: { value: isMobile ? 1.2 : 1.5 },
      uTouchTexture: { value: null },
      uGrainIntensity: { value: isMobile ? 0.03 : 0.05 },
      uDarkNavy: { value: new THREE.Vector3(127/255, 187/255, 250/255) },
      uGradientSize: { value: isMobile ? 0.5 : 0.6 },
      uGradientCount: { value: isMobile ? 6.0 : 8.0 },
      uColor1Weight: { value: 1.0 },
      uColor2Weight: { value: 1.0 }
    };
  }

  init() {
    const viewSize = this.sceneManager.getViewSize();
    const geometry = new THREE.PlaneGeometry(
      viewSize.width,
      viewSize.height,
      1,
      1
    );

    const material = new THREE.ShaderMaterial({
      uniforms: this.uniforms,
      vertexShader: `
        varying vec2 vUv;
        void main() {
          vec3 pos = position.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.);
          vUv = uv;
        }
      `,
      fragmentShader: `
        uniform float uTime;
        uniform vec2 uResolution;
        uniform vec3 uColor1;
        uniform vec3 uColor2;
        uniform vec3 uColor3;
        uniform vec3 uColor4;
        uniform vec3 uColor5;
        uniform vec3 uColor6;
        uniform float uSpeed;
        uniform float uIntensity;
        uniform sampler2D uTouchTexture;
        uniform float uGrainIntensity;
        uniform vec3 uDarkNavy;
        uniform float uGradientSize;
        uniform float uGradientCount;
        uniform float uColor1Weight;
        uniform float uColor2Weight;
        
        varying vec2 vUv;
        
        #define PI 3.14159265359
        
        float grain(vec2 uv, float time) {
          vec2 grainUv = uv * uResolution * 0.5;
          float grainValue = fract(sin(dot(grainUv + time, vec2(12.9898, 78.233))) * 43758.5453);
          return grainValue * 2.0 - 1.0;
        }
        
        vec3 getGradientColor(vec2 uv, float time) {
          float gradientRadius = uGradientSize;
          
          vec2 center1 = vec2(
            0.5 + sin(time * uSpeed * 0.4) * 0.4,
            0.5 + cos(time * uSpeed * 0.5) * 0.4
          );
          vec2 center2 = vec2(
            0.5 + cos(time * uSpeed * 0.6) * 0.5,
            0.5 + sin(time * uSpeed * 0.45) * 0.5
          );
          vec2 center3 = vec2(
            0.5 + sin(time * uSpeed * 0.35) * 0.45,
            0.5 + cos(time * uSpeed * 0.55) * 0.45
          );
          vec2 center4 = vec2(
            0.5 + cos(time * uSpeed * 0.5) * 0.4,
            0.5 + sin(time * uSpeed * 0.4) * 0.4
          );
          vec2 center5 = vec2(
            0.5 + sin(time * uSpeed * 0.7) * 0.35,
            0.5 + cos(time * uSpeed * 0.6) * 0.35
          );
          vec2 center6 = vec2(
            0.5 + cos(time * uSpeed * 0.45) * 0.5,
            0.5 + sin(time * uSpeed * 0.65) * 0.5
          );
          vec2 center7 = vec2(
            0.5 + sin(time * uSpeed * 0.55) * 0.38,
            0.5 + cos(time * uSpeed * 0.48) * 0.42
          );
          vec2 center8 = vec2(
            0.5 + cos(time * uSpeed * 0.65) * 0.36,
            0.5 + sin(time * uSpeed * 0.52) * 0.44
          );
          
          float dist1 = length(uv - center1);
          float dist2 = length(uv - center2);
          float dist3 = length(uv - center3);
          float dist4 = length(uv - center4);
          float dist5 = length(uv - center5);
          float dist6 = length(uv - center6);
          float dist7 = length(uv - center7);
          float dist8 = length(uv - center8);
          
          float influence1 = 1.0 - smoothstep(0.0, gradientRadius, dist1);
          float influence2 = 1.0 - smoothstep(0.0, gradientRadius, dist2);
          float influence3 = 1.0 - smoothstep(0.0, gradientRadius, dist3);
          float influence4 = 1.0 - smoothstep(0.0, gradientRadius, dist4);
          float influence5 = 1.0 - smoothstep(0.0, gradientRadius, dist5);
          float influence6 = 1.0 - smoothstep(0.0, gradientRadius, dist6);
          float influence7 = 1.0 - smoothstep(0.0, gradientRadius, dist7);
          float influence8 = 1.0 - smoothstep(0.0, gradientRadius, dist8);
          
          vec3 color = uDarkNavy * 0.3;
          
          color += uColor1 * influence1 * (0.5 + 0.5 * sin(time * uSpeed)) * uColor1Weight;
          color += uColor2 * influence2 * (0.5 + 0.5 * cos(time * uSpeed * 1.2)) * uColor2Weight;
          color += uColor3 * influence3 * (0.5 + 0.5 * sin(time * uSpeed * 0.8)) * uColor1Weight;
          color += uColor4 * influence4 * (0.5 + 0.5 * cos(time * uSpeed * 1.3)) * uColor2Weight;
          color += uColor5 * influence5 * (0.5 + 0.5 * sin(time * uSpeed * 1.1)) * uColor1Weight;
          color += uColor6 * influence6 * (0.5 + 0.5 * cos(time * uSpeed * 0.9)) * uColor2Weight;
          
          if (uGradientCount > 6.0) {
            color += uColor1 * influence7 * (0.5 + 0.5 * sin(time * uSpeed * 1.4)) * uColor1Weight;
            color += uColor2 * influence8 * (0.5 + 0.5 * cos(time * uSpeed * 1.5)) * uColor2Weight;
          }
          
          color = color * uIntensity;
          
          float luminance = dot(color, vec3(0.299, 0.587, 0.114));
          color = mix(vec3(luminance), color, 1.2);
          
          return color;
        }
        
        void main() {
          vec2 uv = vUv;
          
          vec4 touchTex = texture2D(uTouchTexture, uv);
          float vx = -(touchTex.r * 2.0 - 1.0);
          float vy = -(touchTex.g * 2.0 - 1.0);
          float intensity = touchTex.b;
          uv.x += vx * 0.3 * intensity;
          uv.y += vy * 0.3 * intensity;
          
          vec2 center = vec2(0.5);
          float dist = length(uv - center);
          float ripple = sin(dist * 15.0 - uTime * 2.0) * 0.02 * intensity;
          uv += vec2(ripple);
          
          vec3 color = getGradientColor(uv, uTime);
          
          float grainValue = grain(uv, uTime);
          color += grainValue * uGrainIntensity;
          
          gl_FragColor = vec4(color, 1.0);
        }
      `
    });

    this.mesh = new THREE.Mesh(geometry, material);
    this.mesh.position.z = 0;
    this.sceneManager.scene.add(this.mesh);
  }

  update(delta) {
    if (this.uniforms.uTime) {
      this.uniforms.uTime.value += delta;
    }
  }

  onResize(width, height) {
    const viewSize = this.sceneManager.getViewSize();
    if (this.mesh) {
      this.mesh.geometry.dispose();
      this.mesh.geometry = new THREE.PlaneGeometry(
        viewSize.width,
        viewSize.height,
        1,
        1
      );
    }
    if (this.uniforms.uResolution) {
      this.uniforms.uResolution.value.set(width, height);
    }
  }
}

// App class
class App {
  constructor() {
    this.renderer = new THREE.WebGLRenderer({
      antialias: true,
      powerPreference: "high-performance",
      alpha: false,
      stencil: false,
      depth: false
    });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(this.renderer.domElement);
    this.renderer.domElement.id = "webGLApp";

    this.camera = new THREE.PerspectiveCamera(
      45,
      window.innerWidth / window.innerHeight,
      0.1,
      10000
    );
    this.camera.position.z = 50;
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0xF1F2F6);
    
    this.clock = new THREE.Clock();

    this.touchTexture = new TouchTexture();
    this.gradientBackground = new GradientBackground(this);
    this.gradientBackground.uniforms.uTouchTexture.value = this.touchTexture.texture;

    this.init();
  }

  init() {
    this.gradientBackground.init();
    this.render();
    this.tick();

    window.addEventListener("resize", () => this.onResize());
    window.addEventListener("mousemove", (ev) => this.onMouseMove(ev));
    window.addEventListener("touchmove", (ev) => this.onTouchMove(ev));

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        this.render();
      }
    });
  }

  onTouchMove(ev) {
    const touch = ev.touches[0];
    this.onMouseMove({ clientX: touch.clientX, clientY: touch.clientY });
  }

  onMouseMove(ev) {
    this.mouse = {
      x: ev.clientX / window.innerWidth,
      y: 1 - ev.clientY / window.innerHeight
    };
    this.touchTexture.addTouch(this.mouse);
  }

  getViewSize() {
    const fovInRadians = (this.camera.fov * Math.PI) / 180;
    const height = Math.abs(
      this.camera.position.z * Math.tan(fovInRadians / 2) * 2
    );
    return { width: height * this.camera.aspect, height };
  }

  update(delta) {
    this.touchTexture.update();
    this.gradientBackground.update(delta);
  }

  render() {
    const delta = this.clock.getDelta();
    const clampedDelta = Math.min(delta, 0.1);
    this.renderer.render(this.scene, this.camera);
    this.update(clampedDelta);
  }

  tick() {
    this.render();
    requestAnimationFrame(() => this.tick());
  }

  onResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.gradientBackground.onResize(window.innerWidth, window.innerHeight);
  }
}

// Определяем мобильное устройство
const isMobile = window.innerWidth <= 768;
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

if (isMobile || isTouchDevice) {
  document.addEventListener('DOMContentLoaded', () => {
    const webGLApp = document.getElementById('webGLApp');
    if (webGLApp) {
      webGLApp.style.display = 'block';
    }
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
      heroSection.style.background = 'linear-gradient(135deg, #699BD0 0%, #3067A4 100%)';
    }
  });
  
  // Запускаем приложение даже на мобильных, но с уменьшенными настройками
  const app = new App();
  
} else {
  const app = new App();
}

// Кастомный курсор (только для десктопа)
if (!isMobile && !isTouchDevice) {
  const cursor = document.getElementById("customCursor");
  let mouseX = 0;
  let mouseY = 0;

  document.addEventListener("mousemove", (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  let isCursorAnimating = false;
  function animateCursor() {
    if (!isCursorAnimating) return;
    if (cursor) {
      cursor.style.left = mouseX + "px";
      cursor.style.top = mouseY + "px";
    }
    requestAnimationFrame(animateCursor);
  }

  document.addEventListener(
    "mousemove",
    () => {
      if (!isCursorAnimating) {
        isCursorAnimating = true;
        animateCursor();
      }
    },
    { once: false }
  );

  const footerLink = document.querySelector(".footer a");
  if (footerLink && cursor) {
    footerLink.addEventListener("mouseenter", () => {
      cursor.style.width = "50px";
      cursor.style.height = "50px";
      cursor.style.borderWidth = "3px";
    });
    footerLink.addEventListener("mouseleave", () => {
      cursor.style.width = "40px";
      cursor.style.height = "40px";
      cursor.style.borderWidth = "2px";
    });
  }
}