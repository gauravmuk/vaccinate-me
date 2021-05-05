document.addEventListener("DOMContentLoaded", async () => {
  let data = await fetch(`.netlify/functions/vaccinate`);
  data = data.json();
  console.log(data);
});
