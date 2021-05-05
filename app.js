document.addEventListener("DOMContentLoaded", async () => {
  let html = "";
  try {
    let data = await fetch(`.netlify/functions/vaccinate`);
    data = await data.json();

    if (!(data && data.length)) {
      document.querySelector("#alert-box-happy").classList.remove("d-none");
      return;
    }

    for (let i = 0; i < data.length; i++) {
      html += `<tr>
      <th scope="row">${i + 1}</th>
      <td>${data[i].name}</td>
      <td>${data[i].pincode}</td>
      <td>${data[i].address}</td>
    </tr>`;
    }

    document.querySelector("tbody").innerHTML = html;
  } catch (e) {
    document.querySelector("#alert-box-sad").classList.remove("d-none");
  }
});
