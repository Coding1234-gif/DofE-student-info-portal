document.querySelectorAll('.toggle-btn').forEach(button => {
    button.addEventListener('click', () => {
        const target = button.dataset.target;
        document.querySelectorAll('.toggle-content').forEach(section => {
            section.style.display = 'none';
        });
        document.querySelectorAll('.toggle-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(target).style.display = 'block';
        button.classList.add('active');
    });
});
