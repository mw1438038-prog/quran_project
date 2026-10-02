const method = 1; // University of Islamic Sciences, Karachi

const prayerList = document.getElementById("prayerList");
const locationElement = document.getElementById("location");
const dateElement = document.getElementById("date");

const nextPrayerElement = document.getElementById("nextPrayer");
const nextTimeElement = document.getElementById("nextTime");
const countdownElement = document.getElementById("countdown");

const prayers = [
  {
    key: "Fajr",
    name: "Fajr",
    arabic: "فجر",
    icon: "🌙",
  },
  {
    key: "Dhuhr",
    name: "Dhuhr",
    arabic: "ظہر",
    icon: "☀️",
  },
  {
    key: "Asr",
    name: "Asr",
    arabic: "عصر",
    icon: "🌤️",
  },
  {
    key: "Maghrib",
    name: "Maghrib",
    arabic: "مغرب",
    icon: "🌅",
  },
  {
    key: "Isha",
    name: "Isha",
    arabic: "عشاء",
    icon: "🌙",
  },
];

function formatTime(time) {
  const cleanTime = time.split(" ")[0];

  const [hour, minute] = cleanTime.split(":");

  const date = new Date();

  date.setHours(Number(hour), Number(minute), 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function getPrayerDate(time) {
  const cleanTime = time.split(" ")[0];

  const [hour, minute] = cleanTime.split(":");

  const date = new Date();

  date.setHours(Number(hour), Number(minute), 0, 0);

  return date;
}

function renderPrayerTimes(timings) {
  prayerList.innerHTML = "";

  prayers.forEach((prayer) => {
    const time = timings[prayer.key];

    const card = document.createElement("div");

    card.className = "prayer-card";

    card.dataset.key = prayer.key;

    card.innerHTML = `
            <div class="prayer-left">

                <div class="prayer-icon">
                    ${prayer.icon}
                </div>

                <div>
                    <div class="prayer-name">
                        ${prayer.name}
                    </div>

                    <div class="prayer-arabic">
                        ${prayer.arabic}
                    </div>
                </div>

            </div>

            <div class="prayer-time">
                ${formatTime(time)}
            </div>
        `;

    prayerList.appendChild(card);
  });
}

function updateCountdown(targetDate) {
  const now = new Date();

  let difference = targetDate.getTime() - now.getTime();

  if (difference < 0) {
    difference = 0;
  }

  const totalSeconds = Math.floor(difference / 1000);

  const hours = Math.floor(totalSeconds / 3600);

  const minutes = Math.floor((totalSeconds % 3600) / 60);

  const seconds = totalSeconds % 60;

  countdownElement.textContent = `${hours}h ${minutes}m ${seconds}s remaining`;
}

function updateNextPrayer(timings) {
  const now = new Date();

  let nextPrayer = null;
  let nextDate = null;

  for (const prayer of prayers) {
    const prayerDate = getPrayerDate(timings[prayer.key]);

    if (prayerDate > now) {
      nextPrayer = prayer;
      nextDate = prayerDate;

      break;
    }
  }

  // Isha ke baad next prayer Fajr hoga
  if (!nextPrayer) {
    nextPrayer = prayers[0];

    nextDate = getPrayerDate(timings[prayers[0].key]);

    nextDate.setDate(nextDate.getDate() + 1);
  }

  nextPrayerElement.textContent = nextPrayer.name;

  nextTimeElement.textContent = formatTime(timings[nextPrayer.key]);

  updateCountdown(nextDate);

  document.querySelectorAll(".prayer-card").forEach((card) => {
    card.classList.remove("active");
  });

  const activeCard = document.querySelector(
    `.prayer-card[data-key="${nextPrayer.key}"]`,
  );

  if (activeCard) {
    activeCard.classList.add("active");
  }
}

async function loadPrayerTimes(latitude, longitude) {
  try {
    prayerList.innerHTML = `
            <div class="loading">
                Loading prayer times...
            </div>
        `;

    const today = new Date();

    dateElement.textContent = today.toLocaleDateString(undefined, {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });

    /*
     * AlAdhan API
     * Coordinates se prayer timings calculate hongi.
     */

    const url =
      `https://api.aladhan.com/v1/timings` +
      `?latitude=${latitude}` +
      `&longitude=${longitude}` +
      `&method=${method}`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error("Prayer API request failed");
    }

    const result = await response.json();

    if (result.code !== 200 || !result.data || !result.data.timings) {
      throw new Error("Invalid prayer API response");
    }

    const timings = result.data.timings;

    renderPrayerTimes(timings);

    updateNextPrayer(timings);

    setInterval(() => {
      updateNextPrayer(timings);
    }, 1000);
  } catch (error) {
    console.error("Namaz timing error:", error);

    prayerList.innerHTML = `
            <div class="loading">
                Unable to load prayer times.
                <br>
                Please check your internet connection.
            </div>
        `;

    nextPrayerElement.textContent = "Unavailable";

    nextTimeElement.textContent = "--:--";

    countdownElement.textContent = "--";
  }
}

function detectLocation() {
  if (!navigator.geolocation) {
    locationElement.textContent = "Location not supported";

    return;
  }

  locationElement.textContent = "Detecting your location...";

  navigator.geolocation.getCurrentPosition(
    function (position) {
      const latitude = position.coords.latitude;

      const longitude = position.coords.longitude;

      locationElement.textContent = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;

      loadPrayerTimes(latitude, longitude);
    },

    function (error) {
      console.error("Location error:", error);

      locationElement.textContent = "Location permission required";

      prayerList.innerHTML = `
                <div class="loading">
                    Please allow location access
                    to calculate prayer times.
                </div>
            `;
    },

    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    },
  );
}

detectLocation();
