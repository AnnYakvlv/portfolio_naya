// Слайдер с синхронизированной полосой прокрутки
document.addEventListener('DOMContentLoaded', () => {
  const sliderTrack = document.querySelector('.slider-track');
  const scrollbarThumb = document.getElementById('scrollbarThumb');
  const scrollbarTrack = document.querySelector('.scrollbar-track');
  
  if (!sliderTrack || !scrollbarThumb) return;
  
  let isDragging = false;
  let isThumbDragging = false;
  let startX = 0;
  let startScrollLeft = 0;
  let startThumbLeft = 0;
  
  // Получаем ширину контейнера и максимальную прокрутку
  const getMaxScroll = () => {
    return sliderTrack.scrollWidth - sliderTrack.clientWidth;
  };
  
  const getMaxThumbLeft = () => {
    const trackRect = scrollbarTrack.getBoundingClientRect();
    const thumbWidth = scrollbarThumb.offsetWidth;
    const leftOffset = 16; // отступ слева
    const rightOffset = 16; // отступ справа
    return trackRect.width - thumbWidth - leftOffset - rightOffset;
  };
  
  // Обновляем позицию ползунка на основе прокрутки слайдера
  const updateThumbPosition = () => {
    const maxScroll = getMaxScroll();
    const maxThumbLeft = getMaxThumbLeft();
    const leftOffset = 16;
    
    if (maxScroll > 0) {
      const scrollPercent = sliderTrack.scrollLeft / maxScroll;
      const thumbLeft = leftOffset + (scrollPercent * maxThumbLeft);
      scrollbarThumb.style.left = `${thumbLeft}px`;
    } else {
      scrollbarThumb.style.left = `${leftOffset}px`;
    }
  };
  
  // Обновляем прокрутку слайдера на основе позиции ползунка
  const updateScrollFromThumb = (thumbLeft) => {
    const maxScroll = getMaxScroll();
    const maxThumbLeft = getMaxThumbLeft();
    
    if (maxThumbLeft > 0) {
      const scrollPercent = thumbLeft / maxThumbLeft;
      sliderTrack.scrollLeft = scrollPercent * maxScroll;
      // Сразу обновляем позицию ползунка после изменения
      updateThumbPosition();
    }
  };
  
  // События для перетаскивания слайдера (мышкой)
  sliderTrack.addEventListener('mousedown', (e) => {
    if (e.target === scrollbarThumb || scrollbarThumb.contains(e.target)) return;
    isDragging = true;
    startX = e.pageX;
    startScrollLeft = sliderTrack.scrollLeft;
    sliderTrack.style.cursor = 'grabbing';
    e.preventDefault();
  });
  
  window.addEventListener('mousemove', (e) => {
    if (isDragging) {
      const dx = e.pageX - startX;
      sliderTrack.scrollLeft = startScrollLeft - dx;
      updateThumbPosition();
    }
    
    if (isThumbDragging) {
      const dx = e.pageX - startX;
      let newLeft = startThumbLeft + dx;
      const maxThumbLeft = getMaxThumbLeft();
      newLeft = Math.max(0, Math.min(newLeft, maxThumbLeft));
      scrollbarThumb.style.left = `${newLeft}px`;
      updateScrollFromThumb(newLeft);
    }
  });
  
  window.addEventListener('mouseup', () => {
    isDragging = false;
    isThumbDragging = false;
    sliderTrack.style.cursor = 'grab';
  });
  
  // События для перетаскивания ползунка
  scrollbarThumb.addEventListener('mousedown', (e) => {
    isThumbDragging = true;
    startX = e.pageX;
    startThumbLeft = parseFloat(scrollbarThumb.style.left) || 0;
    e.stopPropagation();
    e.preventDefault();
  });
  
  // Клик по треку для перехода
  scrollbarTrack.addEventListener('click', (e) => {
    if (e.target === scrollbarThumb || scrollbarThumb.contains(e.target)) return;
    
    const rect = scrollbarTrack.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const thumbWidth = scrollbarThumb.offsetWidth;
    let newLeft = clickX - thumbWidth / 2;
    const maxThumbLeft = getMaxThumbLeft();
    newLeft = Math.max(0, Math.min(newLeft, maxThumbLeft));
    
    scrollbarThumb.style.left = `${newLeft}px`;
    updateScrollFromThumb(newLeft);
  });
  
  // Слушаем событие скролла слайдера (для колесика мыши)
  sliderTrack.addEventListener('scroll', () => {
    updateThumbPosition();
  });
  
  // Обновляем при изменении размера окна
  window.addEventListener('resize', () => {
    updateThumbPosition();
  });
  
  // Инициализация позиции
  setTimeout(() => {
    updateThumbPosition();
  }, 100);
});




const contactForm = document.getElementById('contactForm');
const modal = document.getElementById('modal');
const modalClose = document.querySelector('.modal-close');
const modalBtn = document.querySelector('.modal-btn');

// Функция для открытия модального окна
function openModal() {
  modal.style.display = 'block';
  document.body.classList.add('modal-open');
}

// Функция для закрытия модального окна
function closeModal() {
  modal.style.display = 'none';
  document.body.classList.remove('modal-open'); // Удаляем класс, чтобы вернуть скролл
}

if (contactForm) {
  contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Получаем данные формы
    const formData = {
      task: document.getElementById('task').value,
      email: document.getElementById('email').value,
      idea: document.getElementById('idea').value
    };
    
    // Здесь можно добавить отправку данных на сервер
    console.log('Форма отправлена:', formData);
    
    // Показываем модальное окно - ИСПОЛЬЗУЕМ ФУНКЦИЮ openModal()
    openModal();
    
    // Очищаем форму (опционально)
    // document.getElementById('idea').value = '';
    // document.getElementById('email').value = '';
  });
}

// Закрытие модального окна - ИСПОЛЬЗУЕМ ФУНКЦИЮ closeModal()
if (modalClose) {
  modalClose.addEventListener('click', closeModal);
}

if (modalBtn) {
  modalBtn.addEventListener('click', closeModal);
}

// Закрытие по клику вне окна - ИСПОЛЬЗУЕМ ФУНКЦИЮ closeModal()
window.addEventListener('click', (e) => {
  if (e.target === modal) {
    closeModal();
  }
});