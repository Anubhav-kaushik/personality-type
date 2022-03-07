const mainContainerClass = '.personality-type--input-main-container';
const sliderContainerClass = '.personality-type--input-main-container .slider-container';
const slideContainerClass = '.personality-type--input-main-container .slide-container';
const slideClass = '.personality-type--input-main-container .slide';
const paginationClass = '.personality-type--input-main-container .pagination-container';
const paginationCirclesClass = '.personality-type--input-main-container .pagination-container .pagination-circle';

function showNcards(n) {
    const mainContainer = document.querySelector(`${mainContainerClass}`);
    const sliderContainer = document.querySelector(`${sliderContainerClass}`);
    const slides = document.querySelectorAll(`${slideClass}`);

    if (n > slides.length) {
        n = slides.length;
    }

    if (n < 1) {
        n = 1;
    }

    const mainContainerWidth = mainContainer.offsetWidth;

    console.log(mainContainerWidth);

    if (n * slides[0].offsetWidth > mainContainerWidth) {
        while (n * slides[0].offsetWidth > mainContainerWidth) {
            n -= 1;

            if (n < 1) {
                n = 1;
                break;
            }
        }
    }

    const slideWidth = mainContainerWidth / n;
    const slideContainerWidth = slideWidth * slides.length;

    sliderContainer.style.width = `${slideContainerWidth}px`;

}

let currentXdisplacement = 0;

function moveSlide(direction) {
    const sliderContainer = document.querySelector(`${sliderContainerClass}`);
    const slides = document.querySelectorAll(`${slideClass}`);

    const slideWidth = slides[0].offsetWidth;
    const sliderContainerWidth = sliderContainer.offsetWidth;

    if (direction === 'left' && Math.abs(currentXdisplacement) < Math.abs(sliderContainerWidth - slideWidth)) {
        sliderContainer.style.transform = `translateX(${currentXdisplacement - slideWidth}px)`;
        currentXdisplacement -= slideWidth;
    } else if (direction === 'right' && currentXdisplacement < 0) {
        sliderContainer.style.transform = `translateX(${currentXdisplacement + slideWidth}px)`;
        currentXdisplacement += slideWidth;
    } else {
        console.log('Move to nowhere');
    }
}

function createSVGCircles(howMany, circleRadius = 10) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');

    svg.setAttribute('viewBox', `0 0 ${howMany * 3 * circleRadius} ${circleRadius * 3}`);
    svg.setAttribute('width', `${howMany * 3 * circleRadius}px`);

    for (let i = 0; i < howMany; i++) {
        const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        circle.setAttribute('cx', `${circleRadius * 1.5 * (2 * i + 1)}`);
        circle.setAttribute('cy', `${circleRadius * 1.5}`);
        circle.setAttribute('r', `${circleRadius}`);
        circle.setAttribute('class', 'pagination-circle');
        circle.dataset.index = i + 1;
        circle.dataset.visited = i + 1 === 1 ? true : false;
        circle.dataset.active = i + 1 === 1 ? true : false;
        circle.dataset.fade = '';
        svg.appendChild(circle);
    }

    return svg;
}

function createPagination(howMany) {
    const paginationContainer = document.createElement('div');
    paginationContainer.className = 'pagination-container';

    const svg = createSVGCircles(howMany, 7);

    paginationContainer.appendChild(svg);

    return paginationContainer;
}

function addPagination(containerClass, howMany) {
    const paginationContainer = createPagination(howMany);
    const container = document.querySelector(`${containerClass}`);

    container.appendChild(paginationContainer);
}

function syncPaginationNSlides(slideSelector, paginationSelector) {
    const slides = document.querySelectorAll(`${slideSelector}`);
    const pagination = document.querySelectorAll(`${paginationSelector}`);

    for (let i = 0; i < slides.length; i++) {
        pagination[i].dataset.active = slides[i].dataset.active;
        if (slides[i].dataset.active === 'true') {
            pagination[i].dataset.visited = true;
        }
    }
}

async function sleep(s) {
    return new Promise(resolve => setTimeout(resolve, s * 1000));
}

async function isOptionSelected(slide) {
    const options = slide.querySelectorAll('input[type="radio"]');

    for (let option of options) {
        if (option.checked) {
            const value = parseInt(option.value);
            return value;
        }
    }

    await sleep(0.2);

    return isOptionSelected(slide);
}

function totalScore(dict) {
    let total = 0;

    for (let key in dict) {
        total += dict[key];
    }

    return total;
}

let score = 0;
let quesScores = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
    10: 0
}

async function updateScore(slideSelector) {
    const slides = document.querySelectorAll(`${slideSelector}`);

    for (let i = 0; i < slides.length; i++) {
        if (slides[i].dataset.active === 'true') {
            const value = await isOptionSelected(slides[i]);
            slides[i].dataset.value = value;
            quesScores[i + 1] = value;
            score = totalScore(quesScores);
        }
    }
}

function getActiveSlideIndex(slides) {
    for (let i = 0; i < slides.length; i++) {
        if (slides[i].dataset.active === 'true') {
            return i + 1;
        }
    }
}

async function move2NthSlide(slideIndex, slideSelector) {
    const slides = document.querySelectorAll(`${slideSelector}`);
    const activeSlideIndex = getActiveSlideIndex(slides);

    const gap = slideIndex - activeSlideIndex;

    if (gap > 0) {
        for (let i = 0; i < gap; i++) {
            const prevSlide = slides[activeSlideIndex + i - 1];
            prevSlide.dataset.active = false;
            prevSlide.dataset.visited = true;
            const nextSlide = slides[activeSlideIndex + i];
            nextSlide.dataset.active = true;
            syncPaginationNSlides(slideSelector, paginationCirclesClass);
            moveSlide('left');
            await sleep(0.5);
        }
    } else if (gap === 0) {
        return;
    } else {
        for (let i = 0; i < Math.abs(gap); i++) {
            const prevSlide = slides[activeSlideIndex - i - 1];
            prevSlide.dataset.active = false;
            prevSlide.dataset.visited = true;
            const nextSlide = slides[activeSlideIndex - i - 2];
            nextSlide.dataset.active = true;
            syncPaginationNSlides(slideSelector, paginationCirclesClass);
            moveSlide('right');
            await sleep(0.5);
        }
    }

}

function findNextNotVisitedSlideIndex(activeSlideIndex, slides) {
    if (activeSlideIndex === slides.length) {
        return -1;
    }
    for (let i = activeSlideIndex; i < slides.length; i++) {
        if (slides[i].dataset.value == '') {
            return i + 1;
        }
    }

    return 1;

}

function activatePaginationFunc(slideSelector, paginationSelector) {
    const paginations = document.querySelectorAll(`${paginationSelector}`);

    for (let i = 0; i < paginations.length; i++) {
        paginations[i].addEventListener('click', function () {
            if (this.dataset.visited === 'false') {
                return;
            }
            move2NthSlide(parseInt(this.dataset.index), slideSelector);
        });
    }
}

async function updateSlides(slideSelector, paginationSelector) {
    const slides = document.querySelectorAll(`${slideSelector}`);
    const activeSlideIndex = getActiveSlideIndex(slides);

    await updateScore(slideSelector);

    const nextSlideIndex = findNextNotVisitedSlideIndex(activeSlideIndex, slides);

    if (nextSlideIndex < 0) {
        return showResult(score);
    }

    move2NthSlide(nextSlideIndex, slideSelector);


}

async function runGame(slideSelector, paginationSelector) {
    const slides = document.querySelectorAll(`${slideSelector}`);

    for (let slide of slides) {
        const inputs = slide.querySelectorAll('input[type="radio"]');
        for (let input of inputs) {
            input.addEventListener('change', () => {
                updateSlides(slideSelector, paginationSelector);
            });
        }
    }

    activatePaginationFunc(slideSelector, paginationSelector);
}

async function changeBackgroundImage(containerSelector, imageUrl, time, delay=0) {
    const container = document.querySelector(containerSelector);
    container.style.animation = `changeScreen ${time}s ease-in-out ${delay}s forwards`;

    setTimeout(() => {
        container.style.backgroundImage = `url("${imageUrl}")`;
    }, time*1000/2);

    await sleep(time + delay);

    container.style.animation = 'none';
}

// fade out animation
function fadeOut(element, direction, duration, delay = 0) {
    if (direction === 'left') {
        element.style.animation = `fadeOutLeft ${duration}ms ease-in-out forwards`;
        element.style.animationDelay = `${delay}ms`;
    } else if (direction === 'right') {
        element.style.animation = `fadeOutRight ${duration}ms ease-in-out forwards`;
        element.style.animationDelay = `${delay}ms`;
    } else if (direction === 'top') {
        element.style.animation = `fadeOutTop ${duration}ms ease-in-out forwards`;
        element.style.animationDelay = `${delay}ms`;
    } else if (direction === 'bottom') {
        element.style.animation = `fadeOutBottom ${duration}ms ease-in-out forwards`;
        element.style.animationDelay = `${delay}ms`;
    }
}

// fade in animation

function fadeIn(element, direction, duration, delay = 0) {
    if (direction === 'left') {
        element.style.animation = `fadeInLeft ${duration}ms ease-in-out forwards`;
        element.style.animationDelay = `${delay}ms`;
    } else if (direction === 'right') {
        element.style.animation = `fadeInRight ${duration}ms ease-in-out forwards`;
        element.style.animationDelay = `${delay}ms`;
    } else if (direction === 'top') {
        element.style.animation = `fadeInTop ${duration}ms ease-in-out forwards`;
        element.style.animationDelay = `${delay}ms`;
    } else if (direction === 'bottom') {
        element.style.animation = `fadeInBottom ${duration}ms ease-in-out forwards`;
        element.style.animationDelay = `${delay}ms`;
    }
}

async function fadeAll(elementSelector, fadeType, direction, duration, delay = 0) {
    const elements = document.querySelectorAll(`${elementSelector} *[data-fade]`);
    for (let i = elements.length - 1; i >= 0; i--) {
        let element = elements[i];
        if (fadeType === 'in') {
            element.dataset.fade = 'in';
            fadeIn(element, direction, duration, delay < duration * 0.5 ? delay += duration * 0.1 : duration * 0.5);
        } else if (fadeType === 'out') {
            element.dataset.fade = 'out';
            fadeOut(element, direction, duration, delay < duration * 0.5 ? delay += duration * 0.1 : duration * 0.5);
        }
    }

    await sleep(duration * 1.5 / 1000);
    return;
}

function showPointer(score, barSelector) {
    let bar = document.querySelector(barSelector);
    let pointer;
    
    let percentDeviation = score <= 15 ? (score - 9) * 100 / 7 : score <=25 ? (score - 15) * 100 / 11 : (score - 25) * 100 / 6;

    if (score <= 15) {
        pointer = bar.querySelector(`.bar-extrovert`);
        pointer.dataset.pointed = true;
    } else if (score <= 25) {
        pointer = bar.querySelector(`.bar-ambivert`);
        pointer.dataset.pointed = true;
    } else {
        pointer = bar.querySelector(`.bar-introvert`);
        pointer.dataset.pointed = true;
    }

    console.log('score', score);
    console.log('percentDeviation', percentDeviation);

    document.documentElement.style.setProperty('--percent-deviation', `${percentDeviation}%`);
}

function resetPointer(barSelector) {
    let bar = document.querySelector(barSelector);
    let pointer = bar.querySelector(`*[data-pointed="true"]`);
    pointer.dataset.pointed = false;
    document.documentElement.style.setProperty('--incline-percentage', `0%`);
}

async function showResult(score) {
    const inputSection = document.querySelector('.personality-type--input-section');
    const outputSection = document.querySelector('.personality-type--output-section');

    let resultCategory;
    for (let cat in result) {
        if (score >= result[cat].score.min && score <= result[cat].score.max) {
            resultCategory = result[cat];
            break;
        }
    }

    const resultDiv = outputSection.querySelector('.personality-type--result');

    const img = resultDiv.querySelector('img');
    img.src = resultCategory.image.src;
    img.alt = resultCategory.image.alt;

    const textContent = resultDiv.querySelector('.result-text');
    const heading = textContent.querySelector('h2');
    heading.innerText = resultCategory.heading.text;

    const descriptions = textContent.querySelectorAll('p');

    for (let i = 0; i < descriptions.length; i++) {
        descriptions[i].innerText = resultCategory.para[i + 1];
    }

    const learnMoreText = outputSection.querySelector('.personality-type--learn-more-container p');
    learnMoreText.innerText = resultCategory.learnMore.text;

    const learnMoreLink = outputSection.querySelector('.personality-type--learn-more-container button');
    learnMoreLink.addEventListener('click', () => {
        window.open(resultCategory.learnMore.link, '_blank');
    });

    showPointer(score, '.personality-type--bar');

    changeBackgroundImage('.personality-type--main-container', "infographics/interactive-names/bg-output.jpg", 1.5, 0.5);

    await fadeAll('.personality-type--input-section', 'out', 'right', 1000);

    inputSection.dataset.isVisible = 'false';
    outputSection.dataset.isVisible = 'true';

    window.scrollTo('.personality-type--header', {
        behavior: 'smooth'
    });
    
    fadeIn(outputSection, 'right', 1000);
    await fadeAll('.personality-type--output-section', 'in', 'right', 1000);
}

async function replay() {
    const inputSection = document.querySelector('.personality-type--input-section');
    const outputSection = document.querySelector('.personality-type--output-section');

    appendSlider(questions, ".personality-type--input-main-container")

    addPagination('.personality-type--input-main-container', Object.keys(questions).length);

    runGame(slideClass, paginationCirclesClass);

    changeBackgroundImage('.personality-type--main-container', "infographics/interactive-names/bg-input.jpg", 1.5, 0.5);

    fadeOut(outputSection, 'left', 1500);
    await fadeAll('.personality-type--output-section', 'out', 'left', 800);
    outputSection.dataset.isVisible = 'false';
    inputSection.dataset.isVisible = 'true';

    window.scrollTo('.personality-type--header', {
        behavior: 'smooth'
    });

    showNcards(1);
    currentXdisplacement = 0;
    quesScores = {
        1: 0,
        2: 0,
        3: 0,
        4: 0,
        5: 0,
        6: 0,
        7: 0,
        8: 0,
        9: 0,
        10: 0
    }

    fadeIn(inputSection, 'left', 500);
    await fadeAll('.personality-type--input-section', 'in', 'left', 1000);

    resetPointer('.personality-type--bar');
}