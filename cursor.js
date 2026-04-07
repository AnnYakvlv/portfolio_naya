const cursor = document.getElementById("customCursor");
let mouseX = 0;
let mouseY = 0;
let cursorX = 0;
let cursorY = 0;

document.addEventListener("mousemove", (e) => {
  mouseX = e.clientX;
  mouseY = e.clientY;
});

let isCursorAnimating = false;
function animateCursor() {
  if (!isCursorAnimating) return;
  cursorX = mouseX;
  cursorY = mouseY;

  cursor.style.left = cursorX + "px";
  cursor.style.top = cursorY + "px";

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

// Увеличение курсора при наведении на ссылку в футере
const footerLink = document.querySelector(".footer a");
if (footerLink) {
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