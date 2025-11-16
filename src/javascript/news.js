var newsContainer = document.getElementById('news-container');
const toggleButtons = document.querySelectorAll('.toggle-btn');
const toggleContents = document.querySelectorAll('.toggle-content');
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
        displayNews();
    } catch (error) {
        console.error('Error loading news data:', error);
    }
}

function handleToggleClick(event) {
    toggleButtons.forEach(button => button.classList.remove('active'));
    toggleContents.forEach(content => content.style.display = 'none');
    event.target.classList.add('active');
    const targetId = event.target.dataset.target;
    const targetSection = document.getElementById(targetId);
    if (targetSection) {
        targetSection.style.display = 'block';
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

loadNews();