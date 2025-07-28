// import moment from "../node_modules/moment/dist/moment.js";
import moment from "https://cdn.jsdelivr.net/npm/moment@2.29.4/+esm";
let btnsearch = document.querySelector("button");
let inputCity = document.querySelector("input");
let inputCountry = document.querySelector("#inputCountry");
let DateMalady = document.querySelector(".Datemalady");
let DateHegira = document.querySelector(".DateHegira");
let timeNow = document.querySelectorAll(".timeNow h2");
let prayerName = document.querySelectorAll(".prayday h3");
let prayerTime = document.querySelectorAll(".prayday span");
let nextpray = document.querySelector("#next-paray h3 span");
let differentTimePraye = document.querySelector("#next-paray .different");
let loadingOverlay = document.getElementById("loadingOverlay");
let currentCityName = document.querySelector("#currentCityName span");
let myInterval;
function showLoading() {
  if (loadingOverlay) {
    loadingOverlay.classList.remove("hidden");
  }
}
function hideLoading() {
  if (loadingOverlay) {
    setTimeout(() => {
      loadingOverlay.classList.add("hidden");
    }, 500);
  }
}
function makeClock() {
  let time = new Date();
  let hour = time.getHours();
  let hr = time.getHours();
  let minutes = time.getMinutes();
  let am = hour >= 12 ? "PM" : "AM";
  if (hour > 12) {
    hour = hour - 12;
  }
  hour = hour < 10 ? "0" + hour : hour;
  minutes = minutes < 10 ? "0" + minutes : minutes;
  timeNow[0].innerHTML = `${hour}:${minutes} ${am}`;
  timeNow[1].innerHTML = `${hr}:${minutes}`;
}
setInterval(makeClock, 1000);
makeClock();

async function getprayertimes(city, country) {
  if (!country || country.trim() === "") {
    alert("Please enter country name - Country is required");
    return;
  }
  showLoading();
  try {
    let apiUrl = `https://api.aladhan.com/v1/timingsByCity?city=${city}&country=${country}`;
    let Date = await fetch(apiUrl);
    if (Date.status === 400) {
      hideLoading();
      alert("Please enter correct city and country names");
      return;
    }
    let getDate = await Date.json();
    let finalDate = getDate.data;
    if (currentCityName) {
      let displayName =
        city.charAt(0).toUpperCase() + city.slice(1).toLowerCase();
      displayName += `, ${
        country.charAt(0).toUpperCase() + country.slice(1).toLowerCase()
      }`;
      currentCityName.textContent = displayName;
    }
    DateMalady.innerHTML = ` ${finalDate.date.gregorian.day}  ${finalDate.date.gregorian.month.en} , ${finalDate.date.gregorian.year}`;
    DateHegira.innerHTML = `${finalDate.date.hijri.weekday.ar} ${finalDate.date.hijri.day} , ${finalDate.date.hijri.month.ar} ${finalDate.date.hijri.year}`;
    function convertTo12HourFormat(time24) {
      const [hours, minutes] = time24.split(":");
      let period = "AM";
      let hours12 = parseInt(hours, 10);
      if (hours12 >= 12) {
        period = "PM";
        if (hours12 > 12) {
          hours12 -= 12;
        }
      }
      if (hours12 === 0) {
        hours12 = 12;
      }
      const time12 = `${hours12
        .toString()
        .padStart(2, "0")}:${minutes} ${period}`;
      return time12;
    }
    prayerTime[0].textContent = convertTo12HourFormat(finalDate.timings.Fajr);
    prayerTime[1].textContent = convertTo12HourFormat(
      finalDate.timings.Sunrise
    );
    prayerTime[2].textContent = convertTo12HourFormat(finalDate.timings.Dhuhr);
    prayerTime[3].textContent = convertTo12HourFormat(finalDate.timings.Asr);
    prayerTime[4].textContent = convertTo12HourFormat(
      finalDate.timings.Maghrib
    );
    prayerTime[5].textContent = convertTo12HourFormat(finalDate.timings.Isha);
    const timing = {
      Fajr: prayerTime[0].innerHTML,
      Dhuhr: prayerTime[2].innerHTML,
      Asr: prayerTime[3].innerHTML,
      Maghrib: prayerTime[4].innerHTML,
      Isha: prayerTime[5].innerHTML,
    };
    const prayerarr = [
      { key: "Fajr" },
      { key: "Dhuhr" },
      { key: "Asr" },
      { key: "Maghrib" },
      { key: "Isha" },
    ];
    const setupcounterdown = () => {
      const momentnow = moment();
      if (
        momentnow.isAfter(moment(timing.Fajr, "hh:mm a")) &&
        momentnow.isBefore(moment(timing.Dhuhr, "hh:mm a"))
      ) {
        nextpray.innerHTML = "Dhuhr";
      } else if (
        momentnow.isAfter(moment(timing.Dhuhr, "hh:mm a")) &&
        momentnow.isBefore(moment(timing.Asr, "hh:mm a"))
      ) {
        nextpray.innerHTML = "Asr";
      } else if (
        momentnow.isAfter(moment(timing.Asr, "hh:mm a")) &&
        momentnow.isBefore(moment(timing.Maghrib, "hh:mm a"))
      ) {
        nextpray.innerHTML = "Maghrib";
      } else if (
        momentnow.isAfter(moment(timing.Maghrib, "hh:mm a")) &&
        momentnow.isBefore(moment(timing.Isha, "hh:mm a"))
      ) {
        nextpray.innerHTML = "Isha";
      } else {
        nextpray.innerHTML = "Fajr";
      }
    };
    setupcounterdown();
    let parayindex = 0;
    if (nextpray.innerHTML == "Dhuhr") {
      parayindex = 1;
    } else if (nextpray.innerHTML == "Asr") {
      parayindex = 2;
    } else if (nextpray.innerHTML == "Maghrib") {
      parayindex = 3;
    } else if (nextpray.innerHTML == "Isha") {
      parayindex = 4;
    }
    if (myInterval) {
      clearInterval(myInterval);
    }
    myInterval = setInterval(function () {
      let nextprayobject = prayerarr[parayindex];
      let nextprayertiming = timing[nextprayobject.key];
      let nextprayertomoment = moment(nextprayertiming, "hh:mm ");
      let momentnow = moment();
      let remain = moment(nextprayertiming, "hh:mm a").diff(momentnow);
      let duration = moment.duration(remain);
      if (remain < 0) {
        const midnightdiff = moment("23:59:59", "hh:mm:ss").diff(momentnow);
        const Fajrtomidnightdiff = nextprayertomoment.diff(
          moment("00:00:00", "hh:mm:ss")
        );
        const totaldifference = midnightdiff + Fajrtomidnightdiff;
        remain = totaldifference;
        duration = moment.duration(remain);
      }
      differentTimePraye.textContent = `${
        duration.hours() < 10 ? "0" + duration.hours() : duration.hours()
      }:${
        duration.minutes() < 10 ? "0" + duration.minutes() : duration.minutes()
      }:${
        duration.seconds() < 10 ? "0" + duration.seconds() : duration.seconds()
      }`;
    }, 1000);
    hideLoading();
  } catch (error) {
    hideLoading();
    console.error(
      "Error fetching data, please check your internet connection ",
      error
    );
    alert("Error fetching data, please check your internet connection");
  }
}
document.addEventListener("DOMContentLoaded", function () {
  hideLoading();
  setTimeout(() => {
    getprayertimes("Cairo", "Egypt");
  }, 100);
});
function performSearch() {
  const cityValue = inputCity.value.trim();
  const countryValue = inputCountry ? inputCountry.value.trim() : "";
  if (cityValue === "") {
    alert("Please enter city name");
    return;
  }
  if (countryValue === "") {
    alert("Please enter country name - Country is required");
    return;
  }
  getprayertimes(cityValue, countryValue);
  inputCity.value = "";
  if (inputCountry) {
    inputCountry.value = "";
  }
}
btnsearch.addEventListener("click", performSearch);
document.addEventListener("keypress", function (event) {
  if (event.key === "Enter") {
    performSearch();
  }
});
if (inputCountry) {
  inputCountry.addEventListener("keypress", function (event) {
    if (event.key === "Enter") {
      performSearch();
    }
  });
} else {
  console.warn(
    "Make sure country input field exists in HTML with id='inputCountry'"
  );
}
