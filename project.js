// Навигация между страницами с зацикливанием
const prevArrow = document.getElementById('prevPageArrow');
const nextArrow = document.getElementById('nextPageArrow');

// Массив всех страниц в нужном порядке
const pages = [
  'firstproj.html',
  'secondproj.html',
  'thirdproj.html',
  'fourproj.html',
  'fiveproj.html'
];

const currentPage = window.location.pathname.split('/').pop();
const currentIndex = pages.indexOf(currentPage);

if (prevArrow && nextArrow) {
  prevArrow.addEventListener('click', function() {
    let newIndex = currentIndex - 1;
    if (newIndex < 0) {
      newIndex = pages.length - 1; // переходим на последнюю
    }
    window.location.href = pages[newIndex];
  });
  
  nextArrow.addEventListener('click', function() {
    let newIndex = currentIndex + 1;
    if (newIndex >= pages.length) {
      newIndex = 0; // переходим на первую
    }
    window.location.href = pages[newIndex];
  });
}

// Навигация с клавиатуры
document.addEventListener('keydown', function(e) {
  if (e.key === 'ArrowLeft') {
    if (prevArrow) prevArrow.click();
    e.preventDefault();
  } else if (e.key === 'ArrowRight') {
    if (nextArrow) nextArrow.click();
    e.preventDefault();
  }
});

    // Анимация деформации фото
    (function() {
      const imgSize = [1920, 1080];
      
      const vertex = `
        attribute vec2 uv;
        attribute vec2 position;
        varying vec2 vUv;
        void main() {
          vUv = uv;
          gl_Position = vec4(position, 0, 1);
        }
      `;
      
      const fragment = `
        precision highp float;
        precision highp int;
        uniform sampler2D tWater;
        uniform sampler2D tFlow;
        uniform float uTime;
        varying vec2 vUv;
        uniform vec4 res;
        
        void main() {
          vec3 flow = texture2D(tFlow, vUv).rgb;
          vec2 uv = .5 * gl_FragCoord.xy / res.xy ;
          vec2 myUV = (uv - vec2(0.5))*res.zw + vec2(0.5);
          myUV -= flow.xy * (0.15 * 0.7);
          
          vec2 myUV2 = (uv - vec2(0.5))*res.zw + vec2(0.5);
          myUV2 -= flow.xy * (0.125 * 0.7);
          
          vec2 myUV3 = (uv - vec2(0.5))*res.zw + vec2(0.5);
          myUV3 -= flow.xy * (0.10 * 0.7);
          
          vec3 tex = texture2D(tWater, myUV).rgb;
          vec3 tex2 = texture2D(tWater, myUV2).rgb;
          vec3 tex3 = texture2D(tWater, myUV3).rgb;
          
          gl_FragColor = vec4(tex.r, tex2.g, tex3.b, 1.0);
        }
      `;
      
      const renderer = new ogl.Renderer({ dpr: 2 });
      const gl = renderer.gl;
      document.getElementById('canvas-container').appendChild(gl.canvas);
      
      let aspect = 1;
      const mouse = new ogl.Vec2(0.5, 0.5);
      const velocity = new ogl.Vec2(0, 0);
      
      function resize() {
        let a1, a2;
        const imageAspect = imgSize[1] / imgSize[0];
        const windowAspect = window.innerHeight / window.innerWidth;
        
        if (windowAspect < imageAspect) {
          a1 = 1;
          a2 = windowAspect / imageAspect;
        } else {
          a1 = (window.innerWidth / window.innerHeight) * imageAspect;
          a2 = 1;
        }
        
        if (mesh && mesh.program && mesh.program.uniforms.res) {
          mesh.program.uniforms.res.value = new ogl.Vec4(
            window.innerWidth,
            window.innerHeight,
            a1,
            a2
          );
        }
        renderer.setSize(window.innerWidth, window.innerHeight);
        aspect = window.innerWidth / window.innerHeight;
        
        if (window.flowmapInstance) {
          window.flowmapInstance.aspect = aspect;
        }
      }
      
      const flowmap = new ogl.Flowmap(gl, {
        falloff: 0.95,
        alpha: 0.4,
        dissipation: 0.92
      });
      window.flowmapInstance = flowmap;
      
      const geometry = new ogl.Geometry(gl, {
        position: {
          size: 2,
          data: new Float32Array([-1, -1, 3, -1, -1, 3])
        },
        uv: { size: 2, data: new Float32Array([0, 0, 2, 0, 0, 2]) }
      });
      
      const texture = new ogl.Texture(gl, {
        minFilter: gl.LINEAR,
        magFilter: gl.LINEAR
      });
      
      const img = new Image();
      img.onload = () => {
        texture.image = img;
        if (img.width && img.height) {
          imgSize[0] = img.width;
          imgSize[1] = img.height;
          resize();
        }
      };
      img.crossOrigin = "Anonymous";
      img.src = "images/hash1.png";
      
      let a1, a2;
      const imageAspectInit = imgSize[1] / imgSize[0];
      if (window.innerHeight / window.innerWidth < imageAspectInit) {
        a1 = 1;
        a2 = window.innerHeight / window.innerWidth / imageAspectInit;
      } else {
        a1 = (window.innerWidth / window.innerHeight) * imageAspectInit;
        a2 = 1;
      }
      
      const program = new ogl.Program(gl, {
        vertex,
        fragment,
        uniforms: {
          uTime: { value: 0 },
          tWater: { value: texture },
          res: {
            value: new ogl.Vec4(window.innerWidth, window.innerHeight, a1, a2)
          },
          img: { value: new ogl.Vec2(imgSize[0], imgSize[1]) },
          tFlow: flowmap.uniform
        }
      });
      
      const mesh = new ogl.Mesh(gl, { geometry, program });
      
      window.addEventListener("resize", resize, false);
      resize();
      
      let lastAutoTime = performance.now();
      let timeAcc = 0;
      
      function updateAutoMouse(now) {
        const delta = Math.min(0.033, (now - lastAutoTime) / 1000);
        lastAutoTime = now;
        
        timeAcc += delta * 0.55;
        
        const longTerm = now * 0.006;
        const radiusX = 0.42 + Math.sin(longTerm * 0.41) * 0.08;
        const radiusY = 0.32 + Math.cos(longTerm * 0.58) * 0.07;
        const centerX = 0.5 + Math.sin(now * 0.00018) * 0.1;
        const centerY = 0.5 + Math.cos(now * 0.00022) * 0.08;
        
        let autoX = centerX + radiusX * Math.sin(timeAcc * 1.23);
        let autoY = centerY + radiusY * Math.cos(timeAcc * 0.97);
        
        autoX += Math.sin(timeAcc * 2.67) * 0.04;
        autoY += Math.cos(timeAcc * 2.34) * 0.04;
        autoX += Math.sin(now * 0.0018) * 0.025;
        autoY += Math.cos(now * 0.0016) * 0.025;
        
        autoX = Math.min(0.97, Math.max(0.03, autoX));
        autoY = Math.min(0.97, Math.max(0.03, autoY));
        
        const prevX = mouse.x;
        const prevY = mouse.y;
        
        mouse.set(autoX, autoY);
        
        if (delta > 0.001) {
          velocity.x = (mouse.x - prevX) / delta;
          velocity.y = (mouse.y - prevY) / delta;
          velocity.x = Math.min(6.0, Math.max(-6.0, velocity.x));
          velocity.y = Math.min(6.0, Math.max(-6.0, velocity.y));
        }
        
        velocity.needsUpdate = true;
      }
      
      function update(timestamp) {
        requestAnimationFrame(update);
        
        const now = performance.now();
        updateAutoMouse(now);
        
        flowmap.aspect = aspect;
        flowmap.mouse.copy(mouse);
        flowmap.velocity.lerp(velocity, 0.15);
        flowmap.update();
        
        program.uniforms.uTime.value = timestamp * 0.008;
        
        renderer.render({ scene: mesh });
        velocity.needsUpdate = false;
      }
      
      requestAnimationFrame(update);
    })();


   
