document.addEventListener('DOMContentLoaded', () => {
    let data = await fetch(`.netlify/functions/vaccinate`);
    data = data.json();
});