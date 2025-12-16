const api_key = "f35021025f6b49af999e69d7aa095081";
const newsContainer = document.getElementById('news-container');
const toggleButtons = document.querySelectorAll('.toggle-btn');
let newsData = [];

toggleButtons.forEach(button => {
    button.addEventListener('click', handleToggleClick);
});
if (toggleButtons.length > 0) {
    toggleButtons[0].click();
}

async function loadNews(category = "general") {
    const response = await fetch(`https://newsapi.org/v2/top-headlines?category=${category}&apiKey=${api_key}`);
    try {
        const newsData = await response.json();
        console.log('News data loaded:', newsData);
        if (newsData.articles) {
            displayNews(newsData.articles.slice(0, 8));
        } else {
            console.error('No articles found in response');
        }
    } catch (error) {
        console.error('Error loading news data:', error);
    }
}

function handleToggleClick(event) {
    const button = event.target;
    const filter = button.dataset.filter;
    toggleButtons.forEach(btn => btn.classList.remove('active'));
    button.classList.add('active');
    loadNews(filter);
}

function displayNews(articles) {
    newsContainer.innerHTML = "";
    articles.forEach(news => {
        newsContainer.innerHTML += `
            <div class="news-card">
                <h3>${news.title}</h3>
                <p>${news.source.name}</p>
                <p>By ${news.author || 'Unknown author'}</p>
                <p>${news.description || 'No description available.'}</p>
                <a href="${news.url}" target="_blank">Read More</a>
            </div>
        `;
    });
}

loadNews();
