var newsContainer = document.getElementById('news-container');
const toggleButtons = document.querySelectorAll('.toggle-btn');
var newsData = [];

toggleButtons.forEach(button => {
    button.addEventListener('click', handleToggleClick);
});
if (toggleButtons.length > 0) {
    toggleButtons[0].click();
}

async function loadNews() {
    try {
        const response = await fetch('../../data/sample-news.json');
        newsData = await response.json();
        console.log('News data loaded:', newsData);
        displayNews("all");
    } catch (error) {
        console.error('Error loading news data:', error);
    }
}

function handleToggleClick(event) {
    const button = event.target;
    const filter = button.dataset.filter;
    toggleButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    displayNews(filter);
}

function displayNews(filterCategory) {
    newsContainer.innerHTML = "";
    const filteredNews = newsData.filter(item => filterCategory === "all" || item.category === filterCategory);
    filteredNews.forEach(news => {
        newsContainer.innerHTML += `
            <div class="news-card" data-category="${news.category}">
                <h3>${news.title}</h3>
                <p>${news.summary}</p>
                <a href="${news.link}" target="_blank">Read More</a>
            </div>
        `;
    });
}

loadNews();
