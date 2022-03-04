// add questions to the page
appendSlider(questions, ".personality-type--input-main-container")

showNcards(1);
addPagination('.personality-type--input-main-container', Object.keys(questions).length);

runGame(slideClass, paginationCirclesClass);

const sliderMainContainer = document.querySelector(".personality-type--input-main-container");

const sliderResizeListener = new ResizeObserver(entries => {
    entries.forEach(entry => {
        showNcards(1);
    });
});

sliderResizeListener.observe(sliderMainContainer);