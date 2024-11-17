const temp = document.getElementById("temp"),
  date = document.getElementById("date-time"),
  condition = document.getElementById("condition"),
  rain = document.getElementById("rain"),
  mainIcon = document.getElementById("icon"),
  currentLocation = document.getElementById("location"),
  uvIndex = document.querySelector(".uv-index"),
  uvText = document.querySelector(".uv-text"),
  windSpeed = document.querySelector(".wind-speed"),
  sunRise = document.querySelector(".sun-rise"),
  sunSet = document.querySelector(".sun-set"),
  humidity = document.querySelector(".humidity"),
  visibilty = document.querySelector(".visibilty"),
  humidityStatus = document.querySelector(".humidity-status"),
  airQuality = document.querySelector(".air-quality"),
  airQualityStatus = document.querySelector(".air-quality-status"),
  visibilityStatus = document.querySelector(".visibilty-status"),
  searchForm = document.querySelector("#search"),
  search = document.querySelector("#query"),
  celciusBtn = document.querySelector(".celcius"),
  fahrenheitBtn = document.querySelector(".fahrenheit"),
  tempUnit = document.querySelectorAll(".temp-unit"),
  hourlyBtn = document.querySelector(".hourly"),
  weekBtn = document.querySelector(".week"),
  weatherCards = document.querySelector("#weather-cards");

let currentCity = "";
let currentUnit = "c";
let hourlyorWeek = "week";

// function to get date and time
function getDateTime() {
  let now = new Date(),
    hour = now.getHours(),
    minute = now.getMinutes();

  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  // 12 hours format
  hour = hour % 12;
  if (hour < 10) {
    hour = "0" + hour;
  }
  if (minute < 10) {
    minute = "0" + minute;
  }
  let dayString = days[now.getDay()];
  return `${dayString}, ${hour}:${minute}`;
}

//Updating date and time
date.innerText = getDateTime();
setInterval(() => {
  date.innerText = getDateTime();
}, 1000);

// function to get public ip address
function getPublicIp() {
  fetch("https://geolocation-db.com/json/", {
    method: "GET",
    headers: {},
  })
    .then((response) => response.json())
    .then((data) => {
      currentCity = data.city;
      getWeatherData(data.city, currentUnit, hourlyorWeek);
    })
    .catch((err) => {
      console.error(err);
    });
}

getPublicIp();

// function to get weather data
function getWeatherData(city, unit, hourlyorWeek) {
  fetch(
    `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${city}?unitGroup=metric&key=EJ6UBL2JEQGYB3AA4ENASN62J&contentType=json`,
    {
      method: "GET",
      headers: {},
    }
  )
    .then((response) => response.json())
    .then((data) => {
      let today = data.currentConditions;
      if (unit === "c") {
        temp.innerText = today.temp;
      } else {
        temp.innerText = celciusToFahrenheit(today.temp);
      }
      currentLocation.innerText = data.resolvedAddress;
      condition.innerText = today.conditions;
      rain.innerText = "Perc - " + today.precip + "%";
      uvIndex.innerText = today.uvindex;
      windSpeed.innerText = today.windspeed;
      measureUvIndex(today.uvindex);
      mainIcon.src = getIcon(today.icon);
      changeBackground(today.icon);
      humidity.innerText = today.humidity + "%";
      updateHumidityStatus(today.humidity);
      visibilty.innerText = today.visibility;
      updateVisibiltyStatus(today.visibility);
      airQuality.innerText = today.winddir;
      updateAirQualityStatus(today.winddir);
      if (hourlyorWeek === "hourly") {
        updateForecast(data.days[0].hours, unit, "day");
      } else {
        updateForecast(data.days, unit, "week");
      }
      sunRise.innerText = covertTimeTo12HourFormat(today.sunrise);
      sunSet.innerText = covertTimeTo12HourFormat(today.sunset);
    })
    .catch((err) => {
      alert("City not found in our database");
    });
}

//function to update Forecast
function updateForecast(data, unit, type) {
  weatherCards.innerHTML = "";
  let day = 0;
  let numCards = 0;
  if (type === "day") {
    numCards = 24;
  } else {
    numCards = 7;
  }
  for (let i = 0; i < numCards; i++) {
    let card = document.createElement("div");
    card.classList.add("card");
    let dayName = getHour(data[day].datetime);
    if (type === "week") {
      dayName = getDayName(data[day].datetime);
    }
    let dayTemp = data[day].temp;
    if (unit === "f") {
      dayTemp = celciusToFahrenheit(data[day].temp);
    }
    let iconCondition = data[day].icon;
    let iconSrc = getIcon(iconCondition);
    let tempUnit = "°C";
    if (unit === "f") {
      tempUnit = "°F";
    }
    card.innerHTML = `
                <h2 class="day-name">${dayName}</h2>
            <div class="card-icon">
              <img src="${iconSrc}" class="day-icon" alt="" />
            </div>
            <div class="day-temp">
              <h2 class="temp">${dayTemp}</h2>
              <span class="temp-unit">${tempUnit}</span>
            </div>
  `;
    weatherCards.appendChild(card);
    day++;
  }
}

// function to change weather icons
function getIcon(condition) {
  if (condition === "partly-cloudy-day") {
    return "https://i.ibb.co/PZQXH8V/27.png";
  } else if (condition === "partly-cloudy-night") {
    return "https://i.ibb.co/Kzkk59k/15.png";
  } else if (condition === "rain") {
    return "https://i.ibb.co/kBd2NTS/39.png";
  } else if (condition === "clear-day") {
    return "https://i.ibb.co/rb4rrJL/26.png";
  } else if (condition === "clear-night") {
    return "https://i.ibb.co/1nxNGHL/10.png";
  } else {
    return "https://i.ibb.co/rb4rrJL/26.png";
  }
}

// function to change background depending on weather conditions
function changeBackground(condition) {
  const body = document.querySelector("body");
  let bg = "";
  if (condition === "partly-cloudy-day") {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  } else if (condition === "partly-cloudy-night") {
    bg = "https://i.ibb.co/RDfPqXz/pcn.jpg";
  } else if (condition === "rain") {
    bg = "https://i.ibb.co/h2p6Yhd/rain.webp";
  } else if (condition === "clear-day") {
    bg = "https://i.ibb.co/WGry01m/cd.jpg";
  } else if (condition === "clear-night") {
    bg = "https://i.ibb.co/kqtZ1Gx/cn.jpg";
  } else {
    bg = "https://i.ibb.co/qNv7NxZ/pc.webp";
  }
  body.style.backgroundImage = `linear-gradient( rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5) ),url(${bg})`;
}

//get hours from hh:mm:ss
function getHour(time) {
  let hour = time.split(":")[0];
  let min = time.split(":")[1];
  if (hour > 12) {
    hour = hour - 12;
    return `${hour}:${min} PM`;
  } else {
    return `${hour}:${min} AM`;
  }
}

// convert time to 12 hour format
function covertTimeTo12HourFormat(time) {
  let hour = time.split(":")[0];
  let minute = time.split(":")[1];
  let ampm = hour >= 12 ? "pm" : "am";
  hour = hour % 12;
  hour = hour ? hour : 12; // the hour '0' should be '12'
  hour = hour < 10 ? "0" + hour : hour;
  minute = minute < 10 ? "0" + minute : minute;
  let strTime = hour + ":" + minute + " " + ampm;
  return strTime;
}

// function to get day name from date
function getDayName(date) {
  let day = new Date(date);
  let days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days[day.getDay()];
}

// function to get uv index status
function measureUvIndex(uvIndex) {
  if (uvIndex <= 2) {
    uvText.innerText = "Low";
  } else if (uvIndex <= 5) {
    uvText.innerText = "Moderate";
  } else if (uvIndex <= 7) {
    uvText.innerText = "High";
  } else if (uvIndex <= 10) {
    uvText.innerText = "Very High";
  } else {
    uvText.innerText = "Extreme";
  }
}

// function to get humidity status
function updateHumidityStatus(humidity) {
  if (humidity <= 30) {
    humidityStatus.innerText = "Low";
  } else if (humidity <= 60) {
    humidityStatus.innerText = "Moderate";
  } else {
    humidityStatus.innerText = "High";
  }
}

// function to get visibility status
function updateVisibiltyStatus(visibility) {
  if (visibility <= 0.03) {
    visibilityStatus.innerText = "Dense Fog";
  } else if (visibility <= 0.16) {
    visibilityStatus.innerText = "Moderate Fog";
  } else if (visibility <= 0.35) {
    visibilityStatus.innerText = "Light Fog";
  } else if (visibility <= 1.13) {
    visibilityStatus.innerText = "Very Light Fog";
  } else if (visibility <= 2.16) {
    visibilityStatus.innerText = "Light Mist";
  } else if (visibility <= 5.4) {
    visibilityStatus.innerText = "Very Light Mist";
  } else if (visibility <= 10.8) {
    visibilityStatus.innerText = "Clear Air";
  } else {
    visibilityStatus.innerText = "Very Clear Air";
  }
}

// function to get air quality status
function updateAirQualityStatus(airquality) {
  if (airquality <= 50) {
    airQualityStatus.innerText = "Good👌";
  } else if (airquality <= 100) {
    airQualityStatus.innerText = "Moderate😐";
  } else if (airquality <= 150) {
    airQualityStatus.innerText = "Unhealthy for Sensitive Groups😷";
  } else if (airquality <= 200) {
    airQualityStatus.innerText = "Unhealthy😷";
  } else if (airquality <= 250) {
    airQualityStatus.innerText = "Very Unhealthy😨";
  } else {
    airQualityStatus.innerText = "Hazardous😱";
  }
}

// function to handle search form
searchForm.addEventListener("submit", (e) => {
  e.preventDefault();
  let location = search.value;
  if (location) {
    currentCity = location;
    getWeatherData(location, currentUnit, hourlyorWeek);
  }
});

// function to conver celcius to fahrenheit
function celciusToFahrenheit(temp) {
  return ((temp * 9) / 5 + 32).toFixed(1);
}


var currentFocus;
search.addEventListener("input", function (e) {
  removeSuggestions();
  var a,
    b,
    i,
    val = this.value;
  if (!val) {
    return false;
  }
  currentFocus = -1;

  a = document.createElement("ul");
  a.setAttribute("id", "suggestions");

  this.parentNode.appendChild(a);

  for (i = 0; i < cities.length; i++) {
    /*check if the item starts with the same letters as the text field value:*/
    if (
      cities[i].name.substr(0, val.length).toUpperCase() == val.toUpperCase()
    ) {
      /*create a li element for each matching element:*/
      b = document.createElement("li");
      /*make the matching letters bold:*/
      b.innerHTML =
        "<strong>" + cities[i].name.substr(0, val.length) + "</strong>";
      b.innerHTML += cities[i].name.substr(val.length);
      /*insert a input field that will hold the current array item's value:*/
      b.innerHTML += "<input type='hidden' value='" + cities[i].name + "'>";
      /*execute a function when someone clicks on the item value (DIV element):*/
      b.addEventListener("click", function (e) {
        /*insert the value for the autocomplete text field:*/
        search.value = this.getElementsByTagName("input")[0].value;
        removeSuggestions();
      });

      a.appendChild(b);
    }
  }
});
/*execute a function presses a key on the keyboard:*/
search.addEventListener("keydown", function (e) {
  var x = document.getElementById("suggestions");
  if (x) x = x.getElementsByTagName("li");
  if (e.keyCode == 40) {
    /*If the arrow DOWN key
      is pressed,
      increase the currentFocus variable:*/
    currentFocus++;
    /*and and make the current item more visible:*/
    addActive(x);
  } else if (e.keyCode == 38) {
    /*If the arrow UP key
      is pressed,
      decrease the currentFocus variable:*/
    currentFocus--;
    /*and and make the current item more visible:*/
    addActive(x);
  }
  if (e.keyCode == 13) {
    /*If the ENTER key is pressed, prevent the form from being submitted,*/
    e.preventDefault();
    if (currentFocus > -1) {
      /*and simulate a click on the "active" item:*/
      if (x) x[currentFocus].click();
    }
  }
});
function addActive(x) {
  /*a function to classify an item as "active":*/
  if (!x) return false;
  /*start by removing the "active" class on all items:*/
  removeActive(x);
  if (currentFocus >= x.length) currentFocus = 0;
  if (currentFocus < 0) currentFocus = x.length - 1;
  /*add class "autocomplete-active":*/
  x[currentFocus].classList.add("active");
}
function removeActive(x) {
  /*a function to remove the "active" class from all autocomplete items:*/
  for (var i = 0; i < x.length; i++) {
    x[i].classList.remove("active");
  }
}

function removeSuggestions() {
  var x = document.getElementById("suggestions");
  if (x) x.parentNode.removeChild(x);
}

fahrenheitBtn.addEventListener("click", () => {
  changeUnit("f");
});
celciusBtn.addEventListener("click", () => {
  changeUnit("c");
});

// function to change unit
function changeUnit(unit) {
  if (currentUnit !== unit) {
    currentUnit = unit;
    tempUnit.forEach((elem) => {
      elem.innerText = `°${unit.toUpperCase()}`;
    });
    if (unit === "c") {
      celciusBtn.classList.add("active");
      fahrenheitBtn.classList.remove("active");
    } else {
      celciusBtn.classList.remove("active");
      fahrenheitBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}

hourlyBtn.addEventListener("click", () => {
  changeTimeSpan("hourly");
});
weekBtn.addEventListener("click", () => {
  changeTimeSpan("week");
});

// function to change hourly to weekly or vice versa
function changeTimeSpan(unit) {
  if (hourlyorWeek !== unit) {
    hourlyorWeek = unit;
    if (unit === "hourly") {
      hourlyBtn.classList.add("active");
      weekBtn.classList.remove("active");
    } else {
      hourlyBtn.classList.remove("active");
      weekBtn.classList.add("active");
    }
    getWeatherData(currentCity, currentUnit, hourlyorWeek);
  }
}



// Cities add your own to get in search

cities = [
  {
    country: "IN",
    name: "Mumbai",
    lat: "19.0760",
    lng: "72.8777"
  },
  {
    country: "IN",
    name: "Delhi",
    lat: "28.7041",
    lng: "77.1025"
  },
  {
    country: "IN",
    name: "Bengaluru",
    lat: "12.9716",
    lng: "77.5946"
  },
  {
    country: "IN",
    name: "Hyderabad",
    lat: "17.3850",
    lng: "78.4867"
  },
  {
    country: "IN",
    name: "Ahmedabad",
    lat: "23.0225",
    lng: "72.5714"
  },
  {
    country: "IN",
    name: "Chennai",
    lat: "13.0827",
    lng: "80.2707"
  },
  {
    country: "IN",
    name: "Kolkata",
    lat: "22.5726",
    lng: "88.3639"
  },
  {
    country: "IN",
    name: "Surat",
    lat: "21.1702",
    lng: "72.8311"
  },
  {
    country: "IN",
    name: "Pune",
    lat: "18.5204",
    lng: "73.8567"
  },
  {
    country: "IN",
    name: "Jaipur",
    lat: "26.9124",
    lng: "75.7873"
  },
  {
    country: "IN",
    name: "Lucknow",
    lat: "26.8467",
    lng: "80.9462"
  },
  {
    country: "IN",
    name: "Kanpur",
    lat: "26.4499",
    lng: "80.3319"
  },
  {
    country: "IN",
    name: "Nagpur",
    lat: "21.1458",
    lng: "79.0882"
  },
  {
    country: "IN",
    name: "Indore",
    lat: "22.7196",
    lng: "75.8577"
  },
  {
    country: "IN",
    name: "Thane",
    lat: "19.2183",
    lng: "72.9781"
  },
  {
    country: "IN",
    name: "Bhopal",
    lat: "23.2599",
    lng: "77.4126"
  },
  {
    country: "IN",
    name: "Visakhapatnam",
    lat: "17.6868",
    lng: "83.2185"
  },
  {
    country: "IN",
    name: "Pimpri-Chinchwad",
    lat: "18.6279",
    lng: "73.8008"
  },
  {
    country: "IN",
    name: "Patna",
    lat: "25.5941",
    lng: "85.1376"
  },
  {
    country: "IN",
    name: "Vadodara",
    lat: "22.3072",
    lng: "73.1812"
  },
  {
    country: "IN",
    name: "Ghaziabad",
    lat: "28.6692",
    lng: "77.4538"
  },
  {
    country: "IN",
    name: "Ludhiana",
    lat: "30.9000",
    lng: "75.8573"
  },
  {
    country: "IN",
    name: "Agra",
    lat: "27.1767",
    lng: "78.0081"
  },
  {
    country: "IN",
    name: "Nashik",
    lat: "19.9975",
    lng: "73.7898"
  },
  {
    country: "IN",
    name: "Faridabad",
    lat: "28.4089",
    lng: "77.3178"
  },
  {
    country: "IN",
    name: "Meerut",
    lat: "28.9845",
    lng: "77.7064"
  },
  {
    country: "IN",
    name: "Rajkot",
    lat: "22.3039",
    lng: "70.8022"
  },
  {
    country: "IN",
    name: "Kalyan-Dombivli",
    lat: "19.2403",
    lng: "73.1305"
  },
  {
    country: "IN",
    name: "Vasai-Virar",
    lat: "19.3919",
    lng: "72.8397"
  },
  {
    country: "IN",
    name: "Varanasi",
    lat: "25.3176",
    lng: "82.9739"
  },
  {
    country: "IN",
    name: "Srinagar",
    lat: "34.0837",
    lng: "74.7973"
  },
  {
    country: "IN",
    name: "Aurangabad",
    lat: "19.8762",
    lng: "75.3433"
  },
  {
    country: "IN",
    name: "Dhanbad",
    lat: "23.7957",
    lng: "86.4304"
  },
  {
    country: "IN",
    name: "Amritsar",
    lat: "31.6340",
    lng: "74.8723"
  },
  {
    country: "IN",
    name: "Navi Mumbai",
    lat: "19.0330",
    lng: "73.0297"
  },
  {
    country: "IN",
    name: "Allahabad",
    lat: "25.4358",
    lng: "81.8463"
  },
  {
    country: "IN",
    name: "Ranchi",
    lat: "23.3441",
    lng: "85.3096"
  },
  {
    country: "IN",
    name: "Howrah",
    lat: "22.5958",
    lng: "88.2636"
  },
  {
    country: "IN",
    name: "Coimbatore",
    lat: "11.0168",
    lng: "76.9558"
  },
  {
    country: "IN",
    name: "Jabalpur",
    lat: "23.1815",
    lng: "79.9864"
  },
  {
    country: "IN",
    name: "Gwalior",
    lat: "26.2183",
    lng: "78.1828"
  },
  {
    country: "IN",
    name: "Vijayawada",
    lat: "16.5062",
    lng: "80.6480"
  },
  {
    country: "IN",
    name: "Jodhpur",
    lat: "26.2389",
    lng: "73.0243"
  },
  {
    country: "IN",
    name: "Madurai",
    lat: "9.9252",
    lng: "78.1198"
  },
  {
    country: "IN",
    name: "Raipur",
    lat: "21.2514",
    lng: "81.6296"
  },
  {
    country: "IN",
    name: "Kota",
    lat: "25.2138",
    lng: "75.8648"
  },
  {
    country: "IN",
    name: "Guwahati",
    lat: "26.1445",
    lng: "91.7362"
  },
  {
    country: "IN",
    name: "Chandigarh",
    lat: "30.7333",
    lng: "76.7794"
  },
  {
    country: "IN",
    name: "Solapur",
    lat: "17.6599",
    lng: "75.9064"
  },
  {
    country: "IN",
    name: "Hubballi-Dharwad",
    lat: "15.3647",
    lng: "75.1239"
  },
  {
    country: "IN",
    name: "Tiruchirappalli",
    lat: "10.7905",
    lng: "78.7047"
  },
  {
    country: "IN",
    name: "Bareilly",
    lat: "28.3670",
    lng: "79.4304"
  },
  {
    country: "IN",
    name: "Moradabad",
    lat: "28.8386",
    lng: "78.7733"
  },
  {
    country: "IN",
    name: "Mysore",
    lat: "12.2958",
    lng: "76.6394"
  },
  {
    country: "IN",
    name: "Tiruppur",
    lat: "11.1085",
    lng: "77.3411"
  },
  {
    country: "IN",
    name: "Gurgaon",
    lat: "28.4595",
    lng: "77.0266"
  },
  {
    country: "IN",
    name: "Aligarh",
    lat: "27.8974",
    lng: "78.0880"
  },
  {
    country: "IN",
    name: "Jalandhar",
    lat: "31.3260",
    lng: "75.5762"
  },
  {
    country: "IN",
    name: "Bhubaneswar",
    lat: "20.2961",
    lng: "85.8245"
  },
  {
    country: "IN",
    name: "Salem",
    lat: "11.6643",
    lng: "78.1460"
  },
  {
    country: "IN",
    name: "Mira-Bhayandar",
    lat: "19.2952",
    lng: "72.8544"
  },
  {
    country: "IN",
    name: "Warangal",
    lat: "17.9689",
    lng: "79.5941"
  },
  {
    country: "IN",
    name: "Thiruvananthapuram",
    lat: "8.5241",
    lng: "76.9366"
  },
  {
    country: "IN",
    name: "Guntur",
    lat: "16.3067",
    lng: "80.4365"
  },
  {
    country: "IN",
    name: "Bhiwandi",
    lat: "19.2813",
    lng: "73.0483"
  },
  {
    country: "IN",
    name: "Saharanpur",
    lat: "29.9640",
    lng: "77.5460"
  },
  {
    country: "IN",
    name: "Gorakhpur",
    lat: "26.7606",
    lng: "83.3732"
  },
  {
    country: "IN",
    name: "Bikaner",
    lat: "28.0229",
    lng: "73.3119"
  },
  {
    country: "IN",
    name: "Amravati",
    lat: "20.9333",
    lng: "77.7510"
  },
  {
    country: "IN",
    name: "Noida",
    lat: "28.5355",
    lng: "77.3910"
  },
  {
    country: "IN",
    name: "Jamshedpur",
    lat: "22.8046",
    lng: "86.2029"
  },
  {
    country: "IN",
    name: "Bhilai",
    lat: "21.1938",
    lng: "81.3509"
  },
  {
    country: "IN",
    name: "Cuttack",
    lat: "20.4625",
    lng: "85.8830"
  },
  {
    country: "IN",
    name: "Firozabad",
    lat: "27.1591",
    lng: "78.3958"
  },
  {
    country: "IN",
    name: "Kochi",
    lat: "9.9312",
    lng: "76.2673"
  },
  {
    country: "IN",
    name: "Nellore",
    lat: "14.4426",
    lng: "79.9865"
  },
  {
    country: "IN",
    name: "Bhavnagar",
    lat: "21.7645",
    lng: "72.1519"
  },
  {
    country: "IN",
    name: "Dehradun",
    lat: "30.3165",
    lng: "78.0322"
  },
  {
    country: "IN",
    name: "Durgapur",
    lat: "23.5204",
    lng: "87.3119"
  },
  {
    country: "IN",
    name: "Asansol",
    lat: "23.6833",
    lng: "86.9833"
  },
  {
    country: "IN",
    name: "Rourkela",
    lat: "22.2604",
    lng: "84.8536"
  },
  {
    country: "IN",
    name: "Nanded",
    lat: "19.1383",
    lng: "77.3206"
  },
  {
    country: "IN",
    name: "Kolhapur",
    lat: "16.7050",
    lng: "74.2433"
  },
  {
    country: "IN",
    name: "Ajmer",
    lat: "26.4499",
    lng: "74.6399"
  },
  {
    country: "IN",
    name: "Gulbarga",
    lat: "17.3297",
    lng: "76.8343"
  },
  {
    country: "IN",
    name: "Jamnagar",
    lat: "22.4707",
    lng: "70.0577"
  },
  {
    country: "IN",
    name: "Ujjain",
    lat: "23.1793",
    lng: "75.7849"
  },
  {
    country: "IN",
    name: "Loni",
    lat: "28.7515",
    lng: "77.2880"
  },
  {
    country: "IN",
    name: "Siliguri",
    lat: "26.7271",
    lng: "88.3953"
  },
  {
    country: "IN",
    name: "Jhansi",
    lat: "25.4484",
    lng: "78.5685"
  },
  {
    country: "IN",
    name: "Ulhasnagar",
    lat: "19.2215",
    lng: "73.1645"
  },
  {
    country: "IN",
    name: "Jammu",
    lat: "32.7266",
    lng: "74.8570"
  },
  {
    country: "IN",
    name: "Sangli-Miraj & Kupwad",
    lat: "16.8544",
    lng: "74.5642"
  },
  {
    country: "IN",
    name: "Mangalore",
    lat: "12.9141",
    lng: "74.8560"
  },
  {
    country: "IN",
    name: "Erode",
    lat: "11.3410",
    lng: "77.7172"
  },
  {
    country: "IN",
    name: "Belgaum",
    lat: "15.8497",
    lng: "74.4977"
  },
  {
    country: "IN",
    name: "Ambattur",
    lat: "13.0982",
    lng: "80.1620"
  },
  {
    country: "IN",
    name: "Tirunelveli",
    lat: "8.7139",
    lng: "77.7567"
  },
  {
    country: "IN",
    name: "Malegaon",
    lat: "20.5575",
    lng: "74.5286"
  },
  {
    country: "IN",
    name: "Gaya",
    lat: "24.7955",
    lng: "85.0002"
  },
  {
    country: "IN",
    name: "Udaipur",
    lat: "24.5854",
    lng: "73.7125"
  },
  {
    country: "IN",
    name: "Maheshtala",
    lat: "22.5087",
    lng: "88.2532"
  },
  {
    country: "IN",
    name: "Davanagere",
    lat: "14.4640",
    lng: "75.9217"
  },
  {
    country: "IN",
    name: "Kozhikode",
    lat: "11.2588",
    lng: "75.7804"
  },
  {
    country: "IN",
    name: "Kurnool",
    lat: "15.8281",
    lng: "78.0373"
  },
  {
    country: "IN",
    name: "Rajpur Sonarpur",
    lat: "22.4498",
    lng: "88.3915"
  },
  {
    country: "IN",
    name: "Rajahmundry",
    lat: "17.0005",
    lng: "81.8040"
  },
  {
    country: "IN",
    name: "Bokaro Steel City",
    lat: "23.6693",
    lng: "86.1511"
  },
  {
    country: "IN",
    name: "South Dumdum",
    lat: "22.6100",
    lng: "88.4000"
  },
  {
    country: "IN",
    name: "Bellary",
    lat: "15.1394",
    lng: "76.9214"
  },
  {
    country: "IN",
    name: "Patiala",
    lat: "30.3398",
    lng: "76.3869"
  },
  {
    country: "IN",
    name: "Gopalpur",
    lat: "24.8333",
    lng: "87.8167"
  },
  {
    country: "IN",
    name: "Agartala",
    lat: "23.8315",
    lng: "91.2868"
  },
  {
    country: "IN",
    name: "Bhagalpur",
    lat: "25.2425",
    lng: "86.9842"
  },
  {
    country: "IN",
    name: "Muzaffarnagar",
    lat: "29.4737",
    lng: "77.7041"
  },
  {
    country: "IN",
    name: "Bhatpara",
    lat: "22.8664",
    lng: "88.4011"
  },
  {
    country: "IN",
    name: "Panihati",
    lat: "22.6902",
    lng: "88.3740"
  },
  {
    country: "IN",
    name: "Latur",
    lat: "18.4088",
    lng: "76.5604"
  },
  {
    country: "IN",
    name: "Dhule",
    lat: "20.9042",
    lng: "74.7749"
  },
  {
    country: "IN",
    name: "Rohtak",
    lat: "28.8955",
    lng: "76.6066"
  },
  {
    country: "IN",
    name: "Sagar",
    lat: "23.8388",
    lng: "78.7378"
  },
  {
    country: "IN",
    name: "Korba",
    lat: "22.3595",
    lng: "82.7501"
  },
  {
    country: "IN",
    name: "Bhilwara",
    lat: "25.3462",
    lng: "74.6313"
  },
  {
    country: "IN",
    name: "Berhampur",
    lat: "19.3149",
    lng: "84.7941"
  },
  {
    country: "IN",
    name: "Muzaffarpur",
    lat: "26.1209",
    lng: "85.3647"
  },
  {
    country: "IN",
    name: "Ahmednagar",
    lat: "19.0948",
    lng: "74.7480"
  },
  {
    country: "IN",
    name: "Mathura",
    lat: "27.4924",
    lng: "77.6737"
  },
  {
    country: "IN",
    name: "Kollam",
    lat: "8.8932",
    lng: "76.6141"
  },
  {
    country: "IN",
    name: "Avadi",
    lat: "13.1147",
    lng: "80.1098"
  },
  {
    country: "IN",
    name: "Kadapa",
    lat: "14.4673",
    lng: "78.8242"
  },
  {
    country: "IN",
    name: "Kamarhati",
    lat: "22.6711",
    lng: "88.3740"
  },
  {
    country: "IN",
    name: "Sambalpur",
    lat: "21.4669",
    lng: "83.9812"
  },
  {
    country: "IN",
    name: "Bilaspur",
    lat: "22.0797",
    lng: "82.1391"
  },
  {
    country: "IN",
    name: "Shahjahanpur",
    lat: "27.8815",
    lng: "79.9094"
  },
  {
    country: "IN",
    name: "Satara",
    lat: "17.6805",
    lng: "73.9951"
  },
  {
    country: "IN",
    name: "Bijapur",
    lat: "16.8302",
    lng: "75.7100"
  },
  {
    country: "IN",
    name: "Rampur",
    lat: "28.7890",
    lng: "79.0260"
  },
  {
    country: "IN",
    name: "Shivamogga",
    lat: "13.9299",
    lng: "75.5681"
  },
  {
    country: "IN",
    name: "Chandrapur",
    lat: "19.9615",
    lng: "79.2961"
  },
  {
    country: "IN",
    name: "Junagadh",
    lat: "21.5222",
    lng: "70.4579"
  },
  {
    country: "IN",
    name: "Thrissur",
    lat: "10.5276",
    lng: "76.2144"
  },
  {
    country: "IN",
    name: "Alwar",
    lat: "27.5520",
    lng: "76.6346"
  },
  {
    country: "IN",
    name: "Bardhaman",
    lat: "23.2324",
    lng: "87.8615"
  },
  {
    country: "IN",
    name: "Kulti",
    lat: "23.7310",
    lng: "86.8437"
  },
  {
    country: "IN",
    name: "Kakinada",
    lat: "16.9891",
    lng: "82.2475"
  },
  {
    country: "IN",
    name: "Nizamabad",
    lat: "18.6725",
    lng: "78.0941"
  },
  {
    country: "IN",
    name: "Parbhani",
    lat: "19.2704",
    lng: "76.7767"
  },
  {
    country: "IN",
    name: "Tumkur",
    lat: "13.3389",
    lng: "77.1010"
  },
  {
    country: "IN",
    name: "Khammam",
    lat: "17.2473",
    lng: "80.1514"
  },
  {
    country: "IN",
    name: "Ozhukarai",
    lat: "11.9489",
    lng: "79.7121"
  },
  {
    country: "IN",
    name: "Bihar Sharif",
    lat: "25.2000",
    lng: "85.5230"
  },
  {
    country: "IN",
    name: "Panipat",
    lat: "29.3909",
    lng: "76.9635"
  },
  {
    country: "IN",
    name: "Darbhanga",
    lat: "26.1542",
    lng: "85.8918"
  },
  {
    country: "IN",
    name: "Bally",
    lat: "22.6500",
    lng: "88.3400"
  },
  {
    country: "IN",
    name: "Aizawl",
    lat: "23.7271",
    lng: "92.7176"
  },
  {
    country: "IN",
    name: "Dewas",
    lat: "22.9676",
    lng: "76.0534"
  },
  {
    country: "IN",
    name: "Ichalkaranji",
    lat: "16.6912",
    lng: "74.4605"
  },
  {
    country: "IN",
    name: "Tirupati",
    lat: "13.6288",
    lng: "79.4192"
  },
  {
    country: "IN",
    name: "Karnal",
    lat: "29.6857",
    lng: "76.9905"
  },
  {
    country: "IN",
    name: "Bathinda",
    lat: "30.2109",
    lng: "74.9455"
  },
  {
    country: "IN",
    name: "Jalna",
    lat: "19.8410",
    lng: "75.8864"
  },
  {
    country: "IN",
    name: "Barasat",
    lat: "22.7248",
    lng: "88.4747"
  },
  {
    country: "IN",
    name: "Kirari Suleman Nagar",
    lat: "28.7016",
    lng: "77.0379"
  },
  {
    country: "IN",
    name: "Purnia",
    lat: "25.7781",
    lng: "87.4740"
  },
  {
    country: "IN",
    name: "Satna",
    lat: "24.6005",
    lng: "80.8322"
  },
  {
    country: "IN",
    name: "Mau",
    lat: "25.9417",
    lng: "83.5611"
  },
  {
    country: "IN",
    name: "Sonipat",
    lat: "28.9931",
    lng: "77.0151"
  },
  {
    country: "IN",
    name: "Farrukhabad",
    lat: "27.3913",
    lng: "79.5782"
  },
  {
    country: "IN",
    name: "Sagar",
    lat: "14.1670",
    lng: "75.0403"
  },
  {
    country: "IN",
    name: "Rourkela Industrial Township",
    lat: "22.2270",
    lng: "84.8644"
  },
  {
    country: "IN",
    name: "Durg",
    lat: "21.1904",
    lng: "81.2849"
  },
  {
    country: "IN",
    name: "Imphal",
    lat: "24.8170",
    lng: "93.9368"
  },
  {
    country: "IN",
    name: "Ratlam",
    lat: "23.3315",
    lng: "75.0367"
  },
  {
    country: "IN",
    name: "Hapur",
    lat: "28.7437",
    lng: "77.7628"
  },
  {
    country: "IN",
    name: "Arrah",
    lat: "25.5560",
    lng: "84.6637"
  },
  {
    country: "IN",
    name: "Anantapur",
    lat: "14.6819",
    lng: "77.6006"
  },
  {
    country: "IN",
    name: "Karimnagar",
    lat: "18.4386",
    lng: "79.1288"
  },
  {
    country: "IN",
    name: "Etawah",
    lat: "26.7855",
    lng: "79.0150"
  },
  {
    country: "IN",
    name: "Ambernath",
    lat: "19.2012",
    lng: "73.2003"
  },
  {
    country: "IN",
    name: "North Dumdum",
    lat: "22.6500",
    lng: "88.4200"
  },
  {
    country: "IN",
    name: "Bharatpur",
    lat: "27.2173",
    lng: "77.4901"
  },
  {
    country: "IN",
    name: "Begusarai",
    lat: "25.4185",
    lng: "86.1294"
  },
  {
    country: "IN",
    name: "New Delhi",
    lat: "28.6139",
    lng: "77.2090"
  },
  {
    country: "IN",
    name: "Guntakal",
    lat: "15.1711",
    lng: "77.3624"
  },
  {
    country: "IN",
    name: "Baranagar",
    lat: "22.6436",
    lng: "88.3659"
  },
  {
    country: "IN",
    name: "Bhatinda",
    lat: "30.2110",
    lng: "74.9455"
  },
  {
    country: "IN",
    name: "Porbandar",
    lat: "21.6417",
    lng: "69.6293"
  },
  {
    country: "IN",
    name: "Pali",
    lat: "25.7711",
    lng: "73.3234"
  },
  {
    country: "IN",
    name: "Raichur",
    lat: "16.2076",
    lng: "77.3566"
  },
  {
    country: "IN",
    name: "Bahraich",
    lat: "27.5743",
    lng: "81.5941"
  },
  {
    country: "IN",
    name: "Rewa",
    lat: "24.5362",
    lng: "81.3031"
  },
  {
    country: "IN",
    name: "Satna",
    lat: "24.6005",
    lng: "80.8322"
  },
  {
    country: "IN",
    name: "Silchar",
    lat: "24.8333",
    lng: "92.7789"
  },
  {
    country: "IN",
    name: "Vizianagaram",
    lat: "18.1168",
    lng: "83.4115"
  },
  {
    country: "IN",
    name: "Katihar",
    lat: "25.5385",
    lng: "87.5681"
  },
  {
    country: "IN",
    name: "Hardwar",
    lat: "29.9457",
    lng: "78.1642"
  },
  {
    country: "IN",
    name: "Sonipat",
    lat: "28.9931",
    lng: "77.0151"
  },
  {
    country: "IN",
    name: "Nagercoil",
    lat: "8.1780",
    lng: "77.4344"
  },
  {
    country: "IN",
    name: "Thanjavur",
    lat: "10.7870",
    lng: "79.1378"
  },
  {
    country: "IN",
    name: "Murwara (Katni)",
    lat: "23.8356",
    lng: "80.3948"
  },
  {
    country: "IN",
    name: "Naihati",
    lat: "22.8948",
    lng: "88.4194"
  },
  {
    country: "IN",
    name: "Sambhal",
    lat: "28.5840",
    lng: "78.5663"
  },
  {
    country: "IN",
    name: "Nadiad",
    lat: "22.6939",
    lng: "72.8616"
  },
  {
    country: "IN",
    name: "Yamunanagar",
    lat: "30.1290",
    lng: "77.2674"
  },
  {
    country: "IN",
    name: "English Bazar",
    lat: "25.0368",
    lng: "88.1459"
  },
  {
    country: "IN",
    name: "Eluru",
    lat: "16.7107",
    lng: "81.0952"
  },
  {
    country: "IN",
    name: "Munger",
    lat: "25.3746",
    lng: "86.4735"
  },
  {
    country: "IN",
    name: "Panchkula",
    lat: "30.6952",
    lng: "76.8537"
  },
  {
    country: "IN",
    name: "Raiganj",
    lat: "25.6127",
    lng: "88.1245"
  },
  {
    country: "IN",
    name: "Panvel",
    lat: "18.9894",
    lng: "73.1175"
  },
  {
    country: "IN",
    name: "Deoghar",
    lat: "24.4850",
    lng: "86.6950"
  },
  {
    country: "IN",
    name: "Ongole",
    lat: "15.5057",
    lng: "80.0499"
  },
  {
    country: "IN",
    name: "Nandyal",
    lat: "15.4770",
    lng: "78.4836"
  },
  {
    country: "IN",
    name: "Morena",
    lat: "26.4989",
    lng: "78.0010"
  },
  {
    country: "IN",
    name: "Bhiwani",
    lat: "28.7997",
    lng: "76.1330"
  },
  {
    country: "IN",
    name: "Porbandar",
    lat: "21.6417",
    lng: "69.6293"
  },
  {
    country: "IN",
    name: "Palakkad",
    lat: "10.7867",
    lng: "76.6548"
  },
  {
    country: "IN",
    name: "Anand",
    lat: "22.5645",
    lng: "72.9289"
  },
  {
    country: "IN",
    name: "Purnia",
    lat: "25.7781",
    lng: "87.4740"
  },
  {
    country: "IN",
    name: "Baharampur",
    lat: "24.1000",
    lng: "88.2500"
  },
  {
    country: "IN",
    name: "Barmer",
    lat: "25.7457",
    lng: "71.3921"
  },
  {
    country: "IN",
    name: "Morvi",
    lat: "22.8173",
    lng: "70.8370"
  },
  {
    country: "IN",
    name: "Chhapra",
    lat: "25.7810",
    lng: "84.7289"
  },
  {
    country: "IN",
    name: "Bhusawal",
    lat: "21.0469",
    lng: "75.7740"
  },
  {
    country: "IN",
    name: "Orai",
    lat: "25.9900",
    lng: "79.4500"
  },
  {
    country: "IN",
    name: "Bahadurgarh",
    lat: "28.6929",
    lng: "76.9355"
  },
  {
    country: "IN",
    name: "Vellore",
    lat: "12.9165",
    lng: "79.1325"
  },
  {
    country: "IN",
    name: "Mehsana",
    lat: "23.5880",
    lng: "72.3693"
  },
  {
    country: "IN",
    name: "Saharsa",
    lat: "25.8820",
    lng: "86.6000"
  },
  {
    country: "IN",
    name: "Miryalaguda",
    lat: "16.8722",
    lng: "79.5625"
  },
  {
    country: "IN",
    name: "Jaunpur",
    lat: "25.7551",
    lng: "82.6836"
  },
  {
    country: "IN",
    name: "Serampore",
    lat: "22.7528",
    lng: "88.3451"
  },
  {
    country: "IN",
    name: "Shivpuri",
    lat: "25.4232",
    lng: "77.6586"
  },
  {
    country: "IN",
    name: "Unnao",
    lat: "26.5478",
    lng: "80.4878"
  },
  {
    country: "IN",
    name: "Chandausi",
    lat: "28.4510",
    lng: "78.7835"
  },
  {
    country: "IN",
    name: "Krishnanagar",
    lat: "23.4050",
    lng: "88.4900"
  },
  {
    country: "IN",
    name: "Bidhannagar",
    lat: "22.6016",
    lng: "88.4005"
  },
  {
    country: "IN",
    name: "Phusro",
    lat: "23.7575",
    lng: "85.9963"
  },
  {
    country: "IN",
    name: "Jaipur",
    lat: "26.9124",
    lng: "75.7873"
  },
  {
    country: "IN",
    name: "Haldia",
    lat: "22.0667",
    lng: "88.0698"
  },
  {
    country: "IN",
    name: "Vidisha",
    lat: "23.5245",
    lng: "77.8090"
  },
  {
    country: "IN",
    name: "Puri",
    lat: "19.8135",
    lng: "85.8312"
  },
  {
    country: "IN",
    name: "Navsari",
    lat: "20.9467",
    lng: "72.9520"
  },
  {
    country: "IN",
    name: "Mahbubnagar",
    lat: "16.7375",
    lng: "77.9807"
  },
  {
    country: "IN",
    name: "Shahjahanpur",
    lat: "27.8815",
    lng: "79.9094"
  },
  {
    country: "IN",
    name: "Sri Ganganagar",
    lat: "29.9038",
    lng: "73.8772"
  },
  {
    country: "IN",
    name: "Barasat",
    lat: "22.7248",
    lng: "88.4747"
  },
  {
    country: "IN",
    name: "Aizawl",
    lat: "23.7271",
    lng: "92.7176"
  },
  {
    country: "IN",
    name: "Giridih",
    lat: "24.1839",
    lng: "86.3119"
  },
  {
    country: "IN",
    name: "Madanapalle",
    lat: "13.5503",
    lng: "78.5029"
  },
  {
    country: "IN",
    name: "Budaun",
    lat: "28.0362",
    lng: "79.1265"
  },
  {
    country: "IN",
    name: "Hugli-Chinsurah",
    lat: "22.8969",
    lng: "88.3915"
  },
  {
    country: "IN",
    name: "Gandhidham",
    lat: "23.0752",
    lng: "70.1337"
  },
  {
    country: "IN",
    name: "Sitapur",
    lat: "27.5750",
    lng: "80.6638"
  },
  {
    country: "IN",
    name: "Parbhani",
    lat: "19.2704",
    lng: "76.7767"
  },
  {
    country: "IN",
    name: "Naihati",
    lat: "22.8948",
    lng: "88.4194"
  },
  {
    country: "IN",
    name: "Shrirampur",
    lat: "22.7528",
    lng: "88.3451"
  },
  {
    country: "IN",
    name: "Erode",
    lat: "11.3410",
    lng: "77.7172"
  },
  {
    country: "IN",
    name: "Kaithal",
    lat: "29.8018",
    lng: "76.3967"
  },
  {
    country: "IN",
    name: "Rajapalayam",
    lat: "9.4510",
    lng: "77.5534"
  },
  {
    country: "IN",
    name: "Ghazipur",
    lat: "25.5840",
    lng: "83.5770"
  },
  {
    country: "IN",
    name: "Chittoor",
    lat: "13.2172",
    lng: "79.1000"
  },
  {
    country: "IN",
    name: "Gadag-Betigeri",
    lat: "15.4298",
    lng: "75.6297"
  },
  {
    country: "IN",
    name: "Fatehpur",
    lat: "25.9240",
    lng: "80.8140"
  },
  {
    country: "IN",
    name: "Bettiah",
    lat: "26.8023",
    lng: "84.5021"
  },
  {
    country: "IN",
    name: "Ambikapur",
    lat: "23.1267",
    lng: "83.1968"
  },
  {
    country: "IN",
    name: "Sikar",
    lat: "27.6094",
    lng: "75.1399"
  },
  {
    country: "IN",
    name: "Tumkur",
    lat: "13.3389",
    lng: "77.1010"
  },
  {
    country: "IN",
    name: "Siliguri",
    lat: "26.7271",
    lng: "88.3953"
  },
  {
    country: "IN",
    name: "Sambalpur",
    lat: "21.4669",
    lng: "83.9812"
  },
  {
    country: "IN",
    name: "Shimla",
    lat: "31.1048",
    lng: "77.1734"
  },
  {
    country: "IN",
    name: "Ghandinagar",
    lat: "23.2230",
    lng: "72.6500"
  },
  {
    country: "IN",
    name: "Shimoga",
    lat: "13.9299",
    lng: "75.5681"
  },
  {
    country: "IN",
    name: "Tirupati",
    lat: "13.6288",
    lng: "79.4192"
  },
  {
    country: "IN",
    name: "Saharanpur",
    lat: "29.9640",
    lng: "77.5460"
  },
  {
    country: "IN",
    name: "Bahraich",
    lat: "27.5743",
    lng: "81.5941"
  },
  {
    country: "IN",
    name: "Azamgarh",
    lat: "26.0730",
    lng: "83.1859"
  },
  {
    country: "IN",
    name: "Rampur",
    lat: "28.7890",
    lng: "79.0260"
  },
  {
    country: "IN",
    name: "Bidar",
    lat: "17.9149",
    lng: "77.5047"
  },
  {
    country: "IN",
    name: "Udupi",
    lat: "13.3409",
    lng: "74.7421"
  },
  {
    country: "IN",
    name: "Sirsa",
    lat: "29.5349",
    lng: "75.0280"
  },
  {
    country: "IN",
    name: "Thrissur",
    lat: "10.5276",
    lng: "76.2144"
  },
  {
    country: "IN",
    name: "Bihar Sharif",
    lat: "25.2000",
    lng: "85.5230"
  },
  {
    country: "IN",
    name: "Jorhat",
    lat: "26.7500",
    lng: "94.2167"
  },
  {
    country: "IN",
    name: "Mango",
    lat: "22.8380",
    lng: "86.2138"
  },
  {
    country: "IN",
    name: "Karaikkudi",
    lat: "10.0661",
    lng: "78.7679"
  },
  {
    country: "IN",
    name: "Kharagpur",
    lat: "22.3460",
    lng: "87.2315"
  },
  {
    country: "IN",
    name: "Nagercoil",
    lat: "8.1780",
    lng: "77.4344"
  },
  {
    country: "IN",
    name: "Bally",
    lat: "22.6500",
    lng: "88.3400"
  },
  {
    country: "IN",
    name: "Kumbakonam",
    lat: "10.9601",
    lng: "79.3766"
  },
  {
    country: "IN",
    name: "Kumbakonam",
    lat: "10.9601",
    lng: "79.3766"
  },
  {
    country: "IN",
    name: "Ambattur",
    lat: "13.0982",
    lng: "80.1620"
  },
  {
    country: "IN",
    name: "Etawah",
    lat: "26.7855",
    lng: "79.0150"
  },
  {
    country: "IN",
    name: "Baranagar",
    lat: "22.6436",
    lng: "88.3659"
  },
  {
    country: "IN",
    name: "Darbhanga",
    lat: "26.1542",
    lng: "85.8918"
  },
  {
    country: "IN",
    name: "Rampur",
    lat: "28.7890",
    lng: "79.0260"
  },
  {
    country: "IN",
    name: "Vijayanagaram",
    lat: "18.1168",
    lng: "83.4115"
  },
  {
    country: "IN",
    name: "Kolar",
    lat: "13.1367",
    lng: "78.1291"
  },
  {
    country: "IN",
    name: "Tinsukia",
    lat: "27.4985",
    lng: "95.3558"
  },
  {
    country: "IN",
    name: "Bellary",
    lat: "15.1394",
    lng: "76.9214"
  },
  {
    country: "IN",
    name: "Patiala",
    lat: "30.3398",
    lng: "76.3869"
  },
  {
    country: "IN",
    name: "Gopalpur",
    lat: "24.8333",
    lng: "87.8167"
  },
  {
    country: "IN",
    name: "Bharuch",
    lat: "21.7051",
    lng: "72.9959"
  },
  {
    country: "IN",
    name: "Zirakpur",
    lat: "30.6430",
    lng: "76.8178"
  },
  {
    country: "IN",
    name: "Surendranagar Dudhrej",
    lat: "22.7275",
    lng: "71.6486"
  },
  {
    country: "IN",
    name: "Jalpaiguri",
    lat: "26.5167",
    lng: "88.7333"
  },
  {
    country: "IN",
    name: "Sangli",
    lat: "16.8524",
    lng: "74.5815"
  },
  {
    country: "IN",
    name: "Sikar",
    lat: "27.6094",
    lng: "75.1399"
  },
  {
    country: "IN",
    name: "Silchar",
    lat: "24.8333",
    lng: "92.7789"
  },
  {
    country: "IN",
    name: "Cuttack",
    lat: "20.4625",
    lng: "85.8830"
  },
  {
    country: "IN",
    name: "Bijapur",
    lat: "16.8302",
    lng: "75.7100"
  },
  {
    country: "IN",
    name: "Rewari",
    lat: "28.1975",
    lng: "76.6173"
  },
  {
    country: "IN",
    name: "Dadri",
    lat: "28.5537",
    lng: "77.5534"
  },
  {
    country: "IN",
    name: "Gurdaspur",
    lat: "32.0410",
    lng: "75.4057"
  },
  {
    country: "IN",
    name: "Suryapet",
    lat: "17.1314",
    lng: "79.6333"
  },
  {
    country: "IN",
    name: "Guntakal",
    lat: "15.1711",
    lng: "77.3624"
  },
  {
    country: "IN",
    name: "Proddatur",
    lat: "14.7502",
    lng: "78.5481"
  },
  {
    country: "IN",
    name: "Chandannagar",
    lat: "22.8625",
    lng: "88.3630"
  },
  {
    country: "IN",
    name: "Hardoi",
    lat: "27.3943",
    lng: "80.1311"
  },
  {
    country: "IN",
    name: "Bhind",
    lat: "26.5667",
    lng: "78.7873"
  },
  {
    country: "IN",
    name: "Saharsa",
    lat: "25.8820",
    lng: "86.6000"
  },
  {
    country: "IN",
    name: "Dibrugarh",
    lat: "27.4728",
    lng: "94.9119"
  },
  {
    country: "IN",
    name: "Kanchipuram",
    lat: "12.8342",
    lng: "79.7036"
  },
  {
    country: "IN",
    name: "Karaikal",
    lat: "10.9167",
    lng: "79.8333"
  },
  {
    country: "IN",
    name: "Pathankot",
    lat: "32.2645",
    lng: "75.6421"
  },
  {
    country: "IN",
    name: "Kharagpur",
    lat: "22.3460",
    lng: "87.2315"
  },
  {
    country: "IN",
    name: "Haldwani",
    lat: "29.2190",
    lng: "79.5120"
  },
  {
    country: "IN",
    name: "Gangtok",
    lat: "27.3389",
    lng: "88.6065"
  },
  {
    country: "IN",
    name: "Shillong",
    lat: "25.5788",
    lng: "91.8933"
  },
  {
    country: "IN",
    name: "Kohima",
    lat: "25.6701",
    lng: "94.1077"
  },
  {
    country: "IN",
    name: "Itanagar",
    lat: "27.0844",
    lng: "93.6053"
  },
  {
    country: "IN",
    name: "Alappuzha",
    lat: "9.4981",
    lng: "76.3388"
  },
  {
    country: "IN",
    name: "Dharmavaram",
    lat: "14.4149",
    lng: "77.7150"
  },
  {
    country: "IN",
    name: "Ambala",
    lat: "30.3752",
    lng: "76.7821"
  },
  {
    country: "IN",
    name: "Maunath Bhanjan",
    lat: "25.9400",
    lng: "83.5600"
  },
  {
    country: "IN",
    name: "Dehri",
    lat: "24.9087",
    lng: "84.1829"
  },
  {
    country: "IN",
    name: "Bidar",
    lat: "17.9149",
    lng: "77.5047"
  },
  {
    country: "IN",
    name: "Chakradharpur",
    lat: "22.7000",
    lng: "85.6300"
  },
  {
    country: "IN",
    name: "Vaniyambadi",
    lat: "12.6819",
    lng: "78.6205"
  },
  {
    country: "IN",
    name: "Sasaram",
    lat: "24.9500",
    lng: "84.0300"
  },
  {
    country: "IN",
    name: "Hazaribagh",
    lat: "23.9986",
    lng: "85.3597"
  },
  {
    country: "IN",
    name: "Porbandar",
    lat: "21.6417",
    lng: "69.6293"
  }
];
