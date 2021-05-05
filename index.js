const fetch = require("node-fetch");

function getDate(dateDiff) {
  let date = new Date().getDate() + dateDiff;
  let month = new Date().getMonth() + 1;
  let year = new Date().getFullYear();

  date = date < 10 ? `0${date}` : date;
  month = month < 10 ? `0${month}` : month;

  return `${date}-${month}-${year}`;
}

async function getXHRData(url) {
  let data = await fetch(url, {
    headers: {
      accept: "application/json, text/plain, */*",
      "accept-language": "en",
      "cache-control": "no-cache",
      pragma: "no-cache",
      "sec-ch-ua":
        '" Not A;Brand";v="99", "Chromium";v="90", "Google Chrome";v="90"',
      "sec-ch-ua-mobile": "?0",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      "sec-fetch-site": "cross-site",
      "sec-fetch-user": "?1",
      "upgrade-insecure-requests": "1",
      "user-agent":
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36",
    },
    referrer: "https://www.cowin.gov.in/",
    referrerPolicy: "strict-origin-when-cross-origin",
    body: null,
    method: "GET",
    mode: "cors",
  });

  console.log(url, data.status);

  if (data.status === 200) {
    data = await data.json();
    return data;
  } else {
    return false;
  }
}

exports.handler = async function () {
  try {
    const finalCenters = [];
    const finalDates = [];
    const days = 2;

    for (let i = 1; i <= days; i++) {
      finalDates.push(getDate(i));
    }

    let { districts } = await getXHRData(
      "https://cdn-api.co-vin.in/api/v2/admin/location/districts/9"
    );

    if (!districts) {
      return false;
    }

    for (let i = 0; i < finalDates.length; i++) {
      for (let j = 0; j < districts.length; j++) {
        let slots = await getXHRData(
          `https://cdn-api.co-vin.in/api/v2/appointment/sessions/public/calendarByDistrict?district_id=${districts[j].district_id}&date=${finalDates[i]}`
        );

        if (slots && slots.centers && slots.centers.length) {
          const centers = slots.centers.filter(
            (center) =>
              center &&
              center.fee_type &&
              center.fee_type.toLowerCase() === "free"
          );

          for (let i = 0; i < centers.length; i++) {
            if (centers[i].sessions && centers[i].sessions.length) {
              const sessions = centers[i].sessions.filter(
                (session) =>
                  session.vaccine.toUpperCase() === "COVISHIELD" &&
                  session.min_age_limit === 18 &&
                  session.available_capacity >= 3
              );

              if (sessions.length) {
                finalCenters.push({
                  name: centers[i].name,
                  address: centers[i].address,
                  pincode: centers[i].pincode,
                });
              }
            }
          }
        }
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify(finalCenters),
    };
  } catch (err) {
    console.log(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ data: err.message }),
    };
  }
};
