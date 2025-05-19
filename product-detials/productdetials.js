
const productImg = document.getElementById('productImg');
const leftArrow = document.querySelector('.left-arrow');
const rightArrow = document.querySelector('.right-arrow');

const images = [
    'img/product-1.jpg',
    'img/product-1_0.jpg',

];

let currentIndex = 0;

function updateImage(index) {
    productImg.classList.add('fade-out');
    setTimeout(() => {
        productImg.src = images[index];
        productImg.classList.remove('fade-out');
        productImg.classList.add('fade-in');
        setTimeout(() => productImg.classList.remove('fade-in'), 300);
    }, 200);
}

leftArrow.addEventListener('click', () => {
    currentIndex = (currentIndex - 1 + images.length) % images.length;
    updateImage(currentIndex);
});

rightArrow.addEventListener('click', () => {
    currentIndex = (currentIndex + 1) % images.length;
    updateImage(currentIndex);
});
