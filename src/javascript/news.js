var newsContainer = document.getElementById('news-container');
var newsData = [];

async function loadNews() {
    try {
        const response = await fetch('../../data/sample-news.json');
        newsData = await response.json();
        console.log('News data loaded:', newsData);
        displayNews();
    } catch (error) {
        console.error('Error loading news data:', error);
    }
}

function displayNews() {
    newsContainer.innerHTML = "";
    newsData.forEach(news => {
        newsContainer.innerHTML += `
            <div class="news-card">
                <h3>${news.title}</h3>
                <p>${news.summary}</p>
                <a href="${news.link}" target="_blank">Read More</a>
            </div>
        `;
    });
}