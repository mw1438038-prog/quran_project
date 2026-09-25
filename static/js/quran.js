let currentPage = 1;

let readingMode = "arabic";

const pageInput = document.getElementById("pageInput");

const currentPageElement = document.getElementById("currentPage");

const progressText = document.getElementById("progressText");

const progressFill = document.getElementById("progressFill");

const surahSelect = document.getElementById("surahSelect");

const juzSelect = document.getElementById("juzSelect");

const readingModeSelect = document.getElementById("readingMode");

const surahTitle = document.getElementById("surahTitle");

const juzTitle = document.getElementById("juzTitle");

const ayahList = document.getElementById("ayahList");

const loading = document.getElementById("loading");

const errorMessage = document.getElementById("errorMessage");

const previousPageBottom = document.getElementById("previousPageBottom");

const nextPageBottom = document.getElementById("nextPageBottom");

const quranPage = document.querySelector(".quran-page");

/* =========================================================
   PARA NAMES
========================================================= */

const juzNames = [
  "Alif Lam Mim",
  "Sayaqul",
  "Tilkal Rusul",
  "Lan Tanaloo",
  "Wal Muhsanat",
  "La Yuhibbullah",
  "Wa Iza Samiu",
  "Wa Lau Annana",
  "Qalal Malao",
  "Wa A'lamu",
  "Yatazeroon",
  "Wa Mamin Daabbah",
  "Wa Ma Ubarriu",
  "Rubama",
  "Subhanallazi",
  "Qala Alam",
  "Iqtaraba",
  "Qad Aflaha",
  "Wa Qalallazina",
  "Amman Khalaq",
  "Utlu Ma Oohiya",
  "Wa Manyaqnut",
  "Wa Mali",
  "Faman Azlam",
  "Ilayhi Yuraddu",
  "Ha Meem",
  "Qala Fama Khatbukum",
  "Qad Sami Allah",
  "Tabarakallazi",
  "Amma",
];

/* =========================================================
   LOAD SURAHS
========================================================= */

async function loadSurahs() {
  if (!surahSelect) {
    return;
  }

  try {
    const response = await fetch("/api/quran/surahs");

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Surahs load nahi ho saken.");
    }

    surahSelect.innerHTML = "";

    const defaultOption = document.createElement("option");

    defaultOption.value = "";

    defaultOption.textContent = "Select Surah";

    surahSelect.appendChild(defaultOption);

    data.surahs.forEach(function (surah) {
      const option = document.createElement("option");

      option.value = surah.number;

      option.dataset.firstPage = surah.first_page || "";

      option.textContent = `${surah.number}. ${surah.name_arabic} — ${surah.name_english}`;

      surahSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Surah error:", error);

    showError(error.message);
  }
}

/* =========================================================
   LOAD JUZ / PARA LIST
========================================================= */

function loadJuzList() {
  if (!juzSelect) {
    return;
  }

  juzSelect.innerHTML = "";

  const defaultOption = document.createElement("option");

  defaultOption.value = "";

  defaultOption.textContent = "Select Para";

  juzSelect.appendChild(defaultOption);

  juzNames.forEach(function (name, index) {
    const juzNumber = index + 1;

    const option = document.createElement("option");

    option.value = juzNumber;

    option.textContent = `Para ${juzNumber} — ${name}`;

    juzSelect.appendChild(option);
  });
}

/* =========================================================
   SELECT SURAH
========================================================= */

if (surahSelect) {
  surahSelect.addEventListener("change", function () {
    const selectedOption = surahSelect.options[surahSelect.selectedIndex];

    if (!selectedOption) {
      return;
    }

    const firstPage = parseInt(selectedOption.dataset.firstPage);

    if (!isNaN(firstPage) && firstPage >= 1 && firstPage <= 604) {
      loadQuranPage(firstPage);
    }
  });
}

/* =========================================================
   SELECT JUZ / PARA
========================================================= */

if (juzSelect) {
  juzSelect.addEventListener("change", async function () {
    const juzNumber = parseInt(juzSelect.value);

    if (isNaN(juzNumber) || juzNumber < 1 || juzNumber > 30) {
      return;
    }

    try {
      const response = await fetch(`/api/quran/juz/${juzNumber}`);

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Para load nahi ho saka.");
      }

      loadQuranPage(data.juz.first_page);
    } catch (error) {
      console.error("Juz error:", error);

      showError(error.message);
    }
  });
}

/* =========================================================
   READING MODE
========================================================= */

if (readingModeSelect) {
  readingModeSelect.addEventListener("change", function () {
    readingMode = readingModeSelect.value;

    renderCurrentPage();
  });
}

/* =========================================================
   LOAD QURAN PAGE
========================================================= */

async function loadQuranPage(pageNumber) {
  if (pageNumber < 1) {
    pageNumber = 1;
  }

  if (pageNumber > 604) {
    pageNumber = 604;
  }

  loading.style.display = "block";

  errorMessage.style.display = "none";

  ayahList.innerHTML = "";

  try {
    const response = await fetch(`/api/quran/pages/${pageNumber}`);

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || "Quran page load nahi ho saka.");
    }

    window.currentQuranData = data;

    currentPage = data.page.current;

    pageInput.value = currentPage;

    currentPageElement.textContent = currentPage;

    progressText.textContent = `Page ${currentPage} of 604`;

    progressFill.style.width = `${(currentPage / 604) * 100}%`;

    updateHeader(data);

    updateSelectors(data);

    renderCurrentPage();

    updateButtons();

    if (quranPage) {
      quranPage.scrollTop = 0;
    }
  } catch (error) {
    console.error("Quran page error:", error);

    showError(error.message);
  } finally {
    loading.style.display = "none";
  }
}

/* =========================================================
   UPDATE HEADER
========================================================= */

function updateHeader(data) {
  if (!data.ayahs || data.ayahs.length === 0) {
    return;
  }

  const firstItem = data.ayahs[0];

  const surah = firstItem.surah;

  surahTitle.textContent = `${surah.name_english} — ${surah.name_arabic}`;

  const juzNumber = firstItem.ayah.juz_number;

  if (juzNumber && juzNumber >= 1 && juzNumber <= 30) {
    juzTitle.textContent = `Para ${juzNumber} — ${juzNames[juzNumber - 1]}`;
  }
}

/* =========================================================
   UPDATE SELECTORS
========================================================= */

function updateSelectors(data) {
  if (!data.ayahs || data.ayahs.length === 0) {
    return;
  }

  const firstItem = data.ayahs[0];

  const currentSurahNumber = firstItem.surah.number;

  const currentJuz = firstItem.ayah.juz_number;

  if (surahSelect) {
    const surahOption = Array.from(surahSelect.options).find(function (option) {
      return option.value === String(currentSurahNumber);
    });

    if (surahOption) {
      surahSelect.value = String(currentSurahNumber);
    }
  }

  if (juzSelect && currentJuz && currentJuz >= 1 && currentJuz <= 30) {
    juzSelect.value = String(currentJuz);
  }
}

/* =========================================================
   RENDER CURRENT PAGE
========================================================= */

function renderCurrentPage() {
  if (!window.currentQuranData || !window.currentQuranData.ayahs) {
    return;
  }

  ayahList.innerHTML = "";

  window.currentQuranData.ayahs.forEach(function (item) {
    createAyah(item);
  });
}

/* =========================================================
   CREATE AYAH
========================================================= */

function createAyah(item) {
  const ayah = item.ayah;

  const card = document.createElement("article");

  card.className = "ayah-card";

  const surahName = document.createElement("div");

  surahName.className = "ayah-surah-name";

  surahName.textContent = `${item.surah.number}. ${item.surah.name_english} — ${item.surah.name_arabic}`;

  card.appendChild(surahName);

  const content = document.createElement("div");

  content.className = "ayah-content";

  /* =====================================================
       TRANSLATION + TAFSEER
    ===================================================== */

  if (readingMode === "translation" || readingMode === "tafsir") {
    const left = document.createElement("div");

    left.className = "translation-side";

    const translationTitle = document.createElement("div");

    translationTitle.className = "side-title";

    translationTitle.textContent = "Urdu Translation";

    left.appendChild(translationTitle);

    const translation = document.createElement("div");

    translation.className = "translation";

    translation.textContent = ayah.translation || "Translation not available.";

    left.appendChild(translation);

    if (readingMode === "tafsir") {
      const tafsirTitle = document.createElement("div");

      tafsirTitle.className = "side-title tafsir-heading";

      tafsirTitle.textContent = "Tafseer";

      left.appendChild(tafsirTitle);

      if (item.tafsirs && item.tafsirs.length > 0) {
        item.tafsirs.forEach(function (tafsir) {
          const tafsirBox = document.createElement("div");

          tafsirBox.className = "tafsir-text";

          tafsirBox.textContent = tafsir.text;

          left.appendChild(tafsirBox);
        });
      } else {
        const noTafsir = document.createElement("div");

        noTafsir.className = "tafsir-text";

        noTafsir.textContent = "Tafseer not available.";

        left.appendChild(noTafsir);
      }
    }

    content.appendChild(left);
  }

  /* =====================================================
       ARABIC
    ===================================================== */

  const right = document.createElement("div");

  right.className = "arabic-side";

  const ayahNumber = document.createElement("div");

  ayahNumber.className = "ayah-number";

  ayahNumber.textContent = ayah.ayah_number;

  const arabic = document.createElement("div");

  arabic.className = "arabic-text";

  arabic.textContent = ayah.arabic_text;

  right.appendChild(ayahNumber);

  right.appendChild(arabic);

  content.appendChild(right);

  card.appendChild(content);

  ayahList.appendChild(card);
}

/* =========================================================
   ERROR
========================================================= */

function showError(message) {
  if (!errorMessage) {
    return;
  }

  errorMessage.textContent = message;

  errorMessage.style.display = "block";
}

/* =========================================================
   BUTTON STATE
========================================================= */

function updateButtons() {
  if (previousPageBottom) {
    previousPageBottom.disabled = currentPage <= 1;
  }

  if (nextPageBottom) {
    nextPageBottom.disabled = currentPage >= 604;
  }
}

/* =========================================================
   NEXT PAGE
========================================================= */

if (nextPageBottom) {
  nextPageBottom.addEventListener("click", function () {
    if (currentPage < 604) {
      loadQuranPage(currentPage + 1);
    }
  });
}

/* =========================================================
   PREVIOUS PAGE
========================================================= */

if (previousPageBottom) {
  previousPageBottom.addEventListener("click", function () {
    if (currentPage > 1) {
      loadQuranPage(currentPage - 1);
    }
  });
}

/* =========================================================
   PAGE INPUT
========================================================= */

if (pageInput) {
  pageInput.addEventListener("change", function () {
    let page = parseInt(pageInput.value);

    if (isNaN(page)) {
      page = currentPage;
    }

    if (page < 1) {
      page = 1;
    }

    if (page > 604) {
      page = 604;
    }

    loadQuranPage(page);
  });
}

/* =========================================================
   INITIALIZE
========================================================= */

async function initializeQuran() {
  await loadSurahs();

  loadJuzList();

  await loadQuranPage(1);
}

initializeQuran();
