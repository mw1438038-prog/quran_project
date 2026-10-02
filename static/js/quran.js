let currentPage = 1;

let readingMode = "arabic";

let currentQuranData = null;

/* =========================================================
   AUDIO
========================================================= */

let currentAudio = null;

let nextSurahAudio = null;

let currentAudioButton = null;

/* =========================================================
   FULL SURAH AUDIO
========================================================= */

let surahAudioFiles = [];

let surahAudioIndex = 0;

let isSurahPlaying = false;

let isSurahPaused = false;

let surahAudio = null;

let playSurahButton = null;

let pauseSurahButton = null;

let stopSurahButton = null;

let surahAudioStatus = null;

/* =========================================================
   QARI
========================================================= */

const qariSelect = document.getElementById("qariSelect");

let selectedRecitationId = "1";

/*
 * Current Quran Foundation ayah-by-ayah recitations.
 *
 * ID 1 = AbdulBaset AbdulSamad — Mujawwad
 * ID 7 = Mishari Rashid al-Afasy — Murattal
 */

/* =========================================================
   ELEMENTS
========================================================= */

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
   PAGE CACHE
========================================================= */

const pageCache = new Map();

/* =========================================================
   AUDIO CACHE
========================================================= */

const audioCache = new Map();

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
   BISMILLAH
========================================================= */

const BISMILLAH_TEXT = "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ";

const SURAH_WITHOUT_BISMILLAH = 9;

/* =========================================================
   HIDE STATIC BISMILLAH
========================================================= */

const staticBismillah = document.querySelector(".bismillah");

if (staticBismillah) {
  staticBismillah.style.display = "none";
  staticBismillah.hidden = true;
}

/* =========================================================
   HIDE LOADING
========================================================= */

function hideLoading() {
  if (!loading) {
    return;
  }

  loading.style.display = "none";
  loading.hidden = true;
  loading.removeAttribute("aria-busy");
}

hideLoading();

/* =========================================================
   SURAH AUDIO CONTROLS
========================================================= */

function createSurahAudioControls() {
  if (playSurahButton) {
    return;
  }

  const wrapper = document.createElement("div");

  wrapper.className = "surah-audio-controls";

  /* -------------------------------------------------------
     PLAY
  ------------------------------------------------------- */

  playSurahButton = document.createElement("button");

  playSurahButton.type = "button";

  playSurahButton.className = "surah-audio-button";

  playSurahButton.textContent = "▶ Play Surah";

  playSurahButton.addEventListener("click", function () {
    playCompleteSurah();
  });

  /* -------------------------------------------------------
     PAUSE
  ------------------------------------------------------- */

  pauseSurahButton = document.createElement("button");

  pauseSurahButton.type = "button";

  pauseSurahButton.className = "surah-audio-button";

  pauseSurahButton.textContent = "⏸ Pause";

  pauseSurahButton.disabled = true;

  pauseSurahButton.addEventListener("click", function () {
    pauseSurahAudio();
  });

  /* -------------------------------------------------------
     STOP
  ------------------------------------------------------- */

  stopSurahButton = document.createElement("button");

  stopSurahButton.type = "button";

  stopSurahButton.className = "surah-audio-button";

  stopSurahButton.textContent = "⏹ Stop";

  stopSurahButton.disabled = true;

  stopSurahButton.addEventListener("click", function () {
    stopSurahAudio();
  });

  /* -------------------------------------------------------
     STATUS
  ------------------------------------------------------- */

  surahAudioStatus = document.createElement("div");

  surahAudioStatus.className = "surah-audio-status";

  surahAudioStatus.textContent = "Ready";

  /* -------------------------------------------------------
     APPEND
  ------------------------------------------------------- */

  wrapper.appendChild(playSurahButton);

  wrapper.appendChild(pauseSurahButton);

  wrapper.appendChild(stopSurahButton);

  wrapper.appendChild(surahAudioStatus);

  /* -------------------------------------------------------
     PLACE CONTROLS
  ------------------------------------------------------- */

  if (qariSelect) {
    const parent = qariSelect.parentElement;

    if (parent && parent.parentElement) {
      parent.parentElement.appendChild(wrapper);
    } else {
      qariSelect.insertAdjacentElement("afterend", wrapper);
    }
  } else {
    document.body.prepend(wrapper);
  }
}

/* =========================================================
   SURAH AUDIO STATUS
========================================================= */

function updateSurahAudioStatus(text) {
  if (surahAudioStatus) {
    surahAudioStatus.textContent = text;
  }
}

/* =========================================================
   SURAH AUDIO BUTTON STATES
========================================================= */

function updateSurahAudioButtons() {
  if (!playSurahButton) {
    return;
  }

  if (isSurahPlaying) {
    playSurahButton.textContent = "▶ Playing Surah";

    playSurahButton.classList.add("playing");

    playSurahButton.disabled = true;
  } else {
    playSurahButton.textContent = isSurahPaused
      ? "▶ Resume Surah"
      : "▶ Play Surah";

    playSurahButton.classList.remove("playing");

    playSurahButton.disabled = false;
  }

  if (pauseSurahButton) {
    pauseSurahButton.disabled = !surahAudio || !isSurahPlaying;
  }

  if (stopSurahButton) {
    stopSurahButton.disabled = !surahAudio && surahAudioFiles.length === 0;
  }
}

/* =========================================================
   QARI SELECTION
========================================================= */

if (qariSelect) {
  selectedRecitationId = qariSelect.value || "1";

  qariSelect.addEventListener("change", function () {
    selectedRecitationId = qariSelect.value || "1";

    /*
     * Stop current audio
     */

    stopCurrentAudio();

    /*
     * New Qari ke liye
     * Surah audio dobara load hogi.
     */

    surahAudioFiles = [];

    surahAudioIndex = 0;

    updateSurahAudioStatus("Ready");
  });
}

/* =========================================================
   AUDIO URL
========================================================= */

function buildAudioUrl(audioPath) {
  if (!audioPath) {
    return null;
  }

  if (audioPath.startsWith("http://") || audioPath.startsWith("https://")) {
    return audioPath;
  }

  return "https://verses.quran.foundation/" + audioPath.replace(/^\/+/, "");
}

/* =========================================================
   GET AYAH AUDIO
========================================================= */

async function getAyahAudio(surahNumber, ayahNumber) {
  const cacheKey =
    `${selectedRecitationId}:` + `${surahNumber}:` + `${ayahNumber}`;

  if (audioCache.has(cacheKey)) {
    return audioCache.get(cacheKey);
  }

  const response = await fetch(
    `/api/quran/audio/` +
      `${surahNumber}/` +
      `${ayahNumber}` +
      `?recitation_id=${encodeURIComponent(selectedRecitationId)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    console.error(
      "Audio API returned non-JSON:",
      response.status,
      responseText,
    );

    throw new Error("Audio API ne JSON ke bajaye HTML/error response diya.");
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Audio load nahi ho saka.");
  }

  const audioUrl = buildAudioUrl(data.audio_url);

  if (!audioUrl) {
    throw new Error("Audio URL available nahi hai.");
  }

  audioCache.set(cacheKey, audioUrl);

  return audioUrl;
}

/* =========================================================
   GET COMPLETE SURAH AUDIO
========================================================= */

async function getSurahAudio(surahNumber) {
  const response = await fetch(
    `/api/quran/audio/surah/` +
      `${surahNumber}` +
      `?recitation_id=${encodeURIComponent(selectedRecitationId)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    console.error(
      "Surah Audio API returned non-JSON:",
      response.status,
      responseText,
    );

    throw new Error(
      "Surah Audio API ne JSON ke bajaye HTML/error response diya.",
    );
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Surah audio load nahi ho saka.");
  }

  if (!Array.isArray(data.audio_files) || data.audio_files.length === 0) {
    throw new Error("Is Surah ki audio available nahi hai.");
  }

  return data.audio_files;
}

/* =========================================================
   PLAY COMPLETE SURAH
========================================================= */

async function playCompleteSurah() {
  if (
    !currentQuranData ||
    !currentQuranData.ayahs ||
    currentQuranData.ayahs.length === 0
  ) {
    alert("Pehle Quran page load karein.");

    return;
  }

  const firstItem = currentQuranData.ayahs[0];

  const surahNumber = Number(firstItem.surah.number);

  if (!surahNumber || surahNumber < 1 || surahNumber > 114) {
    alert("Surah number nahi mila.");

    return;
  }

  /*
   * Resume paused audio
   */

  if (surahAudio && isSurahPaused) {
    try {
      await surahAudio.play();

      isSurahPaused = false;

      isSurahPlaying = true;

      updateSurahAudioButtons();

      const ayahNumber =
        surahAudioFiles[surahAudioIndex]?.verse_number || surahAudioIndex + 1;

      updateSurahAudioStatus(
        `Playing Ayah ${ayahNumber} / ${surahAudioFiles.length}`,
      );

      return;
    } catch (error) {
      console.error("Surah audio resume error:", error);
    }
  }

  /*
   * Load complete Surah
   */

  if (surahAudioFiles.length === 0) {
    try {
      if (playSurahButton) {
        playSurahButton.disabled = true;

        playSurahButton.textContent = "⏳ Loading Surah...";
      }

      updateSurahAudioStatus("Loading complete Surah audio...");

      surahAudioFiles = await getSurahAudio(surahNumber);

      surahAudioIndex = 0;
    } catch (error) {
      console.error("Complete Surah audio error:", error);

      if (playSurahButton) {
        playSurahButton.disabled = false;

        playSurahButton.textContent = "▶ Play Surah";
      }

      updateSurahAudioStatus("Audio load failed");

      alert("Surah audio load nahi ho saki.\n\n" + error.message);

      return;
    }
  }

  await playSurahAyah(surahAudioIndex);
}
async function playSurahAyah(index, preloadedAudio = null) {
  if (index < 0 || index >= surahAudioFiles.length) {
    finishSurahAudio();
    return;
  }

  surahAudioIndex = index;

  const audioFile = surahAudioFiles[index];
  const audioUrl = buildAudioUrl(audioFile.url);

  if (!audioUrl) {
    console.error("Audio URL missing:", audioFile);
    await playSurahAyah(index + 1);
    return;
  }

  const ayahNumber = audioFile.verse_number || index + 1;

  updateSurahAudioStatus(
    `Playing Ayah ${ayahNumber} / ${surahAudioFiles.length}`,
  );

  /*
   * ---------------------------------------------------------
   * CURRENT AUDIO
   * ---------------------------------------------------------
   */

  let audio = preloadedAudio;

  /*
   * Agar function ko preloaded audio nahi mila
   * to check karein ke next audio already preload hai.
   */

  if (!audio) {
    if (nextSurahAudio && nextSurahAudio.dataset.index === String(index)) {
      audio = nextSurahAudio;
      nextSurahAudio = null;
    }
  }

  /*
   * Agar preload available nahi hai
   * to naya audio create karein.
   */

  if (!audio) {
    audio = new Audio(audioUrl);
    audio.preload = "auto";
    audio.src = audioUrl;
    audio.load();
  }

  /*
   * Purana audio stop karein.
   * Lekin agar wahi audio current ban raha hai
   * to usko destroy nahi karna.
   */

  if (surahAudio && surahAudio !== audio) {
    surahAudio.pause();
    surahAudio.src = "";
    surahAudio.load();
  }

  /*
   * New current audio
   */

  surahAudio = audio;

  isSurahPlaying = true;
  isSurahPaused = false;

  updateSurahAudioButtons();

  /*
   * ---------------------------------------------------------
   * PRELOAD NEXT AYAH
   * ---------------------------------------------------------
   */

  const nextIndex = index + 1;

  if (nextIndex < surahAudioFiles.length) {
    /*
     * Agar next audio already correct Ayah ka preload hai
     * to dobara create na karein.
     */

    if (!nextSurahAudio || nextSurahAudio.dataset.index !== String(nextIndex)) {
      /*
       * Purana preload remove karein
       */

      if (nextSurahAudio) {
        nextSurahAudio.pause();
        nextSurahAudio.src = "";
        nextSurahAudio.load();
        nextSurahAudio = null;
      }

      const nextFile = surahAudioFiles[nextIndex];
      const nextUrl = buildAudioUrl(nextFile.url);

      if (nextUrl) {
        const nextAudio = new Audio();

        nextAudio.preload = "auto";
        nextAudio.src = nextUrl;

        /*
         * Important:
         * Next Ayah ka index store kar rahe hain.
         */

        nextAudio.dataset.index = String(nextIndex);

        /*
         * Browser ko abhi se audio load karne dein.
         */

        nextAudio.load();

        nextSurahAudio = nextAudio;
      }
    }
  }

  /*
   * ---------------------------------------------------------
   * AYAH FINISHED
   * ---------------------------------------------------------
   */

  audio.onended = async function () {
    /*
     * Agar user ne Stop kar diya ya koi aur audio
     * current ban gaya ho to kuch na karein.
     */

    if (surahAudio !== audio) {
      return;
    }

    const nextIndex = index + 1;

    /*
     * Surah complete
     */

    if (nextIndex >= surahAudioFiles.length) {
      finishSurahAudio();
      return;
    }

    /*
     * -----------------------------------------------------
     * PRELOADED NEXT AUDIO
     * -----------------------------------------------------
     */

    if (nextSurahAudio && nextSurahAudio.dataset.index === String(nextIndex)) {
      const nextAudio = nextSurahAudio;

      /*
       * Pehle reference remove karein.
       */

      nextSurahAudio = null;

      /*
       * IMPORTANT:
       * Isi preloaded audio ko directly next Ayah
       * ke taur par use karein.
       *
       * Dobara new Audio() create nahi hoga.
       */

      await playSurahAyah(nextIndex, nextAudio);

      return;
    }

    /*
     * -----------------------------------------------------
     * FALLBACK
     * -----------------------------------------------------
     */

    await playSurahAyah(nextIndex);
  };

  /*
   * ---------------------------------------------------------
   * ERROR
   * ---------------------------------------------------------
   */

  audio.onerror = async function () {
    console.error("Surah audio browser error:", audio.error);

    if (surahAudio !== audio) {
      return;
    }

    surahAudio = null;

    await playSurahAyah(index + 1);
  };

  /*
   * ---------------------------------------------------------
   * PLAY
   * ---------------------------------------------------------
   */

  try {
    await audio.play();

    isSurahPlaying = true;
    isSurahPaused = false;

    updateSurahAudioButtons();
  } catch (error) {
    console.error("Surah audio play error:", error);

    isSurahPlaying = false;

    updateSurahAudioButtons();

    updateSurahAudioStatus("Tap Play Surah to start audio");
  }
}

/* =========================================================
   PAUSE SURAH
========================================================= */

function pauseSurahAudio() {
  if (!surahAudio || !isSurahPlaying) {
    return;
  }

  surahAudio.pause();

  isSurahPaused = true;

  isSurahPlaying = false;

  updateSurahAudioButtons();

  const ayahNumber =
    surahAudioFiles[surahAudioIndex]?.verse_number || surahAudioIndex + 1;

  updateSurahAudioStatus(
    `Paused — Ayah ${ayahNumber} / ${surahAudioFiles.length}`,
  );
}

/* =========================================================
   STOP SURAH
========================================================= */
function stopSurahAudio() {
  /*
   * Current audio stop
   */

  if (surahAudio) {
    surahAudio.pause();
    surahAudio.currentTime = 0;
    surahAudio.src = "";
    surahAudio.load();
    surahAudio = null;
  }

  /*
   * Preloaded next audio stop
   */

  if (nextSurahAudio) {
    nextSurahAudio.pause();
    nextSurahAudio.currentTime = 0;
    nextSurahAudio.src = "";
    nextSurahAudio.load();
    nextSurahAudio = null;
  }

  surahAudioFiles = [];
  surahAudioIndex = 0;

  isSurahPlaying = false;
  isSurahPaused = false;

  updateSurahAudioButtons();
  updateSurahAudioStatus("Ready");
}

function finishSurahAudio() {
  if (surahAudio) {
    surahAudio.pause();
    surahAudio.currentTime = 0;
    surahAudio.src = "";
    surahAudio.load();
    surahAudio = null;
  }

  if (nextSurahAudio) {
    nextSurahAudio.pause();
    nextSurahAudio.currentTime = 0;
    nextSurahAudio.src = "";
    nextSurahAudio.load();
    nextSurahAudio = null;
  }

  isSurahPlaying = false;
  isSurahPaused = false;
  surahAudioIndex = 0;

  updateSurahAudioButtons();
  updateSurahAudioStatus("Surah completed ✓");

  if (playSurahButton) {
    playSurahButton.textContent = "▶ Play Surah";
  }
}

/* =========================================================
   STOP CURRENT AUDIO
========================================================= */

function stopCurrentAudio() {
  /*
   * Single Ayah
   */

  if (currentAudio) {
    currentAudio.pause();

    currentAudio.currentTime = 0;

    currentAudio = null;
  }

  if (currentAudioButton) {
    currentAudioButton.textContent = "▶ Play";

    currentAudioButton.classList.remove("playing");

    currentAudioButton.disabled = false;

    currentAudioButton = null;
  }

  /*
   * Complete Surah
   */

  stopSurahAudio();
}

/* =========================================================
   PLAY SINGLE AYAH AUDIO
========================================================= */

async function playAyahAudio(surahNumber, ayahNumber, button) {
  /*
   * Agar complete Surah chal rahi ho
   */

  if (isSurahPlaying || isSurahPaused) {
    stopSurahAudio();
  }

  /*
   * Same button
   */

  if (currentAudio && currentAudioButton === button) {
    if (!currentAudio.paused) {
      currentAudio.pause();

      button.textContent = "▶ Play";

      button.classList.remove("playing");

      return;
    }

    try {
      await currentAudio.play();

      button.textContent = "⏸ Pause";

      button.classList.add("playing");

      return;
    } catch (error) {
      console.error("Audio resume error:", error);
    }
  }

  /*
   * Stop another audio
   */

  stopCurrentAudio();

  button.disabled = true;

  button.textContent = "⏳ Loading...";

  try {
    const audioUrl = await getAyahAudio(surahNumber, ayahNumber);

    const audio = new Audio(audioUrl);

    audio.preload = "auto";

    currentAudio = audio;

    currentAudioButton = button;

    audio.addEventListener("ended", function () {
      button.textContent = "▶ Play";

      button.classList.remove("playing");

      button.disabled = false;

      currentAudio = null;

      currentAudioButton = null;
    });

    audio.addEventListener("error", function () {
      console.error("Browser audio error:", audio.error);

      button.textContent = "▶ Play";

      button.classList.remove("playing");

      button.disabled = false;

      currentAudio = null;

      currentAudioButton = null;
    });

    await audio.play();

    button.disabled = false;

    button.textContent = "⏸ Pause";

    button.classList.add("playing");
  } catch (error) {
    console.error("Ayah audio error:", error);

    button.disabled = false;

    button.textContent = "▶ Play";

    button.classList.remove("playing");

    currentAudio = null;

    currentAudioButton = null;

    alert("Quran audio load nahi ho saki.\n\n" + error.message);
  }
}

/* =========================================================
   CREATE AUDIO BUTTON
========================================================= */

function createAudioButton(ayah) {
  const button = document.createElement("button");

  button.type = "button";

  button.className = "ayah-audio-button";

  button.textContent = "▶ Play";

  button.setAttribute("aria-label", `Play Ayah ${ayah.ayah_number}`);

  button.addEventListener("click", function () {
    playAyahAudio(ayah.surah_number, ayah.ayah_number, button);
  });

  return button;
}

/* =========================================================
   LOAD SURAHS
========================================================= */

async function loadSurahs() {
  if (!surahSelect) {
    return;
  }

  try {
    const response = await fetch("/api/quran/surahs", {
      method: "GET",
      cache: "no-store",
    });

    const responseText = await response.text();

    let data;

    try {
      data = JSON.parse(responseText);
    } catch (error) {
      console.error("Surahs API returned non-JSON:", responseText);

      throw new Error("Surahs API ne JSON ke bajaye HTML/error response diya.");
    }

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

      option.textContent =
        `${surah.number}. ` +
        `${surah.name_arabic} — ` +
        `${surah.name_english}`;

      surahSelect.appendChild(option);
    });
  } catch (error) {
    console.error("Surah error:", error);

    showError(error.message);
  }
}

/* =========================================================
   LOAD JUZ
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
  surahSelect.addEventListener("change", async function () {
    const selectedOption = surahSelect.options[surahSelect.selectedIndex];

    if (!selectedOption) {
      return;
    }

    const surahNumber = parseInt(selectedOption.value);
    const firstPage = parseInt(selectedOption.dataset.firstPage);

    if (
      isNaN(surahNumber) ||
      isNaN(firstPage) ||
      firstPage < 1 ||
      firstPage > 604
    ) {
      return;
    }

    try {
      /*
       * Pehle selected Surah ka first page load karo.
       */
      await loadQuranPage(firstPage);

      /*
       * IMPORTANT:
       * First page mein sirf selected Surah ki
       * Ayat render karo.
       */
      renderCurrentPage(surahNumber);

      /*
       * Page ko top par rakho.
       */
      window.scrollTo(0, 0);

      if (quranPage) {
        quranPage.scrollTop = 0;
      }

      /*
       * Header ko selected Surah ke mutabiq set karo.
       */
      const selectedAyah = currentQuranData.ayahs.find(function (item) {
        return Number(item.surah.number) === surahNumber;
      });

      if (selectedAyah && surahTitle) {
        surahTitle.textContent =
          `${selectedAyah.surah.name_english} — ` +
          `${selectedAyah.surah.name_arabic}`;
      }
    } catch (error) {
      console.error("Surah selection error:", error);

      showError(error.message);
    }
  });
}
/* =========================================================
   SELECT JUZ
========================================================= */

if (juzSelect) {
  juzSelect.addEventListener("change", async function () {
    const juzNumber = parseInt(juzSelect.value);

    if (isNaN(juzNumber) || juzNumber < 1 || juzNumber > 30) {
      return;
    }

    try {
      const response = await fetch(`/api/quran/juz/${juzNumber}`, {
        method: "GET",
        cache: "no-store",
      });

      const responseText = await response.text();

      let data;

      try {
        data = JSON.parse(responseText);
      } catch (error) {
        console.error("Juz API returned non-JSON:", responseText);

        throw new Error("Juz API ne JSON ke bajaye HTML/error response diya.");
      }

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

    pageCache.clear();

    stopCurrentAudio();

    loadQuranPage(currentPage);
  });
}

/* =========================================================
   FETCH QURAN PAGE
========================================================= */

async function fetchQuranPage(pageNumber) {
  const cacheKey = `${pageNumber}-${readingMode}`;

  if (pageCache.has(cacheKey)) {
    return pageCache.get(cacheKey);
  }

  const response = await fetch(
    `/api/quran/pages/${pageNumber}` +
      `?mode=${encodeURIComponent(readingMode)}`,
    {
      method: "GET",
      cache: "no-store",
    },
  );

  const responseText = await response.text();

  let data;

  try {
    data = JSON.parse(responseText);
  } catch (error) {
    console.error(
      "Quran API returned non-JSON:",
      response.status,
      responseText,
    );

    throw new Error("Quran API ne JSON ke bajaye HTML/error response diya.");
  }

  if (!response.ok || !data.success) {
    throw new Error(data.message || "Quran page load nahi ho saka.");
  }

  pageCache.set(cacheKey, data);

  return data;
}

/* =========================================================
   PREFETCH PAGE
========================================================= */

async function prefetchPage(pageNumber) {
  if (pageNumber < 1 || pageNumber > 604) {
    return;
  }

  try {
    await fetchQuranPage(pageNumber);

    console.log("Prefetched page:", pageNumber);
  } catch (error) {
    console.warn("Prefetch failed:", pageNumber, error);
  }
}

/* =========================================================
   PREFETCH NEARBY
========================================================= */

function prefetchNearbyPages() {
  if (currentPage < 604) {
    prefetchPage(currentPage + 1);
  }

  if (currentPage > 1) {
    prefetchPage(currentPage - 1);
  }
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

  stopCurrentAudio();

  hideLoading();

  if (errorMessage) {
    errorMessage.style.display = "none";
  }

  try {
    const data = await fetchQuranPage(pageNumber);

    currentQuranData = data;

    window.currentQuranData = data;

    currentPage = data.page.current;

    if (pageInput) {
      pageInput.value = currentPage;
    }

    if (currentPageElement) {
      currentPageElement.textContent = currentPage;
    }

    if (progressText) {
      progressText.textContent = `Page ${currentPage} of 604`;
    }

    if (progressFill) {
      progressFill.style.width = `${(currentPage / 604) * 100}%`;
    }

    updateHeader(data);

    updateSelectors(data);

    renderCurrentPage();

    updateButtons();

    hideLoading();

    window.scrollTo(0, 0);

    if (quranPage) {
      quranPage.scrollTop = 0;
    }

    setTimeout(function () {
      prefetchNearbyPages();
    }, 50);
  } catch (error) {
    console.error("Quran page error:", error);

    hideLoading();

    showError(error.message);
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

  if (surahTitle) {
    surahTitle.textContent =
      `${surah.name_english} — ` + `${surah.name_arabic}`;
  }

  const juzNumber = firstItem.ayah.juz_number;

  if (juzTitle && juzNumber && juzNumber >= 1 && juzNumber <= 30) {
    juzTitle.textContent =
      `Para ${juzNumber} — ` + `${juzNames[juzNumber - 1]}`;
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
function renderCurrentPage(surahFilter = null) {
  if (!currentQuranData || !currentQuranData.ayahs) {
    return;
  }

  if (!ayahList) {
    return;
  }

  ayahList.innerHTML = "";

  let ayahsToRender = currentQuranData.ayahs;

  /*
   * Agar Surah select ki gayi hai
   * to sirf usi Surah ki Ayat render karo.
   */
  if (surahFilter !== null) {
    ayahsToRender = currentQuranData.ayahs.filter(function (item) {
      return Number(item.surah.number) === Number(surahFilter);
    });
  }

  ayahsToRender.forEach(function (item) {
    createAyah(item);
  });
}

/* =========================================================
   CREATE BISMILLAH
========================================================= */

function createBismillah() {
  const bismillah = document.createElement("div");

  bismillah.className = "bismillah";

  bismillah.textContent = BISMILLAH_TEXT;

  return bismillah;
}

/* =========================================================
   CREATE SURAH HEADER
========================================================= */

function createSurahHeader(surah) {
  const surahHeader = document.createElement("div");

  surahHeader.className = "ayah-surah-name";

  surahHeader.textContent =
    `${surah.number}. ` + `${surah.name_english} — ` + `${surah.name_arabic}`;

  return surahHeader;
}

/* =========================================================
   TAJWEED RULES
========================================================= */

const TAJWEED = {
  qalqalah: new Set(["ق", "ط", "ب", "ج", "د"]),

  idgham: new Set(["ي", "ر", "م", "ل", "و", "ن"]),

  ikhfa: new Set([
    "ت",
    "ث",
    "ج",
    "د",
    "ذ",
    "ز",
    "س",
    "ش",
    "ص",
    "ض",
    "ط",
    "ظ",
    "ف",
    "ق",
    "ك",
  ]),

  iqlab: new Set(["ب"]),
};

/* =========================================================
   ARABIC MARKS
========================================================= */

function isArabicMark(char) {
  if (!char) {
    return false;
  }

  const code = char.codePointAt(0);

  return (
    (code >= 0x064b && code <= 0x065f) ||
    code === 0x0670 ||
    (code >= 0x06d6 && code <= 0x06ed)
  );
}

/* =========================================================
   ARABIC LETTER
========================================================= */

function isArabicLetter(char) {
  if (!char) {
    return false;
  }

  return (
    !isArabicMark(char) &&
    char.trim() !== "" &&
    /[\u0621-\u063A\u0641-\u064A\u0671-\u06D3]/u.test(char)
  );
}

/* =========================================================
   GET MARKS
========================================================= */

function getMarksAfter(chars, letterIndex) {
  const marks = [];

  for (let i = letterIndex + 1; i < chars.length; i++) {
    if (isArabicMark(chars[i])) {
      marks.push(chars[i]);
    } else {
      break;
    }
  }

  return marks;
}

/* =========================================================
   PREVIOUS LETTER
========================================================= */

function getPreviousLetter(chars, startIndex) {
  for (let i = startIndex - 1; i >= 0; i--) {
    if (isArabicLetter(chars[i])) {
      return {
        char: chars[i],
        index: i,
      };
    }
  }

  return null;
}

/* =========================================================
   NEXT LETTER
========================================================= */

function getNextLetter(chars, startIndex) {
  for (let i = startIndex; i < chars.length; i++) {
    if (isArabicLetter(chars[i])) {
      return {
        char: chars[i],
        index: i,
      };
    }
  }

  return null;
}

/* =========================================================
   MARK CHECKS
========================================================= */

function hasSukoon(marks) {
  return marks.includes("ْ");
}

function hasShadda(marks) {
  return marks.includes("ّ");
}

function hasTanween(marks) {
  return marks.includes("ً") || marks.includes("ٍ") || marks.includes("ٌ");
}

/* =========================================================
   MADD DETECTION
========================================================= */

function isMaddLetter(chars, index) {
  const char = chars[index];

  const marks = getMarksAfter(chars, index);

  if (char === "ٰ") {
    return true;
  }

  if (char === "آ") {
    return true;
  }

  if (char === "ا") {
    const previous = getPreviousLetter(chars, index);

    if (previous) {
      const previousMarks = getMarksAfter(chars, previous.index);

      if (previousMarks.includes("َ")) {
        return true;
      }
    }
  }

  if (char === "و" && hasSukoon(marks)) {
    const previous = getPreviousLetter(chars, index);

    if (previous) {
      const previousMarks = getMarksAfter(chars, previous.index);

      if (previousMarks.includes("ُ")) {
        return true;
      }
    }
  }

  if (char === "ي" && hasSukoon(marks)) {
    const previous = getPreviousLetter(chars, index);

    if (previous) {
      const previousMarks = getMarksAfter(chars, previous.index);

      if (previousMarks.includes("ِ")) {
        return true;
      }
    }
  }

  if (char === "ى") {
    return true;
  }

  return false;
}

/* =========================================================
   DETECT TAJWEED RULE
========================================================= */

function detectTajweedRule(chars, index) {
  const char = chars[index];

  if (!isArabicLetter(char)) {
    return null;
  }

  const marks = getMarksAfter(chars, index);

  const next = getNextLetter(chars, index + 1);

  if ((char === "ن" || char === "م") && hasShadda(marks)) {
    return "ghunnah";
  }

  if (char === "ن" && hasSukoon(marks) && next) {
    if (TAJWEED.iqlab.has(next.char)) {
      return "iqlab";
    }

    if (TAJWEED.idgham.has(next.char)) {
      return "idgham";
    }

    if (TAJWEED.ikhfa.has(next.char)) {
      return "ikhfa";
    }
  }

  if (hasTanween(marks) && next) {
    if (TAJWEED.iqlab.has(next.char)) {
      return "iqlab";
    }

    if (TAJWEED.idgham.has(next.char)) {
      return "idgham";
    }

    if (TAJWEED.ikhfa.has(next.char)) {
      return "ikhfa";
    }
  }

  if (TAJWEED.qalqalah.has(char) && hasSukoon(marks)) {
    return "qalqalah";
  }

  if (isMaddLetter(chars, index)) {
    return "madd";
  }

  return null;
}

/* =========================================================
   CREATE PLAIN TAJWEED
========================================================= */

function createPlainTajweedArabic(arabicText) {
  const wrapper = document.createElement("span");

  wrapper.className = "arabic-ayah-text tajweed-text";

  if (!arabicText) {
    return wrapper;
  }

  const chars = Array.from(arabicText);

  let index = 0;

  while (index < chars.length) {
    const char = chars[index];

    if (char.trim() === "") {
      wrapper.appendChild(document.createTextNode(char));

      index++;

      continue;
    }

    if (isArabicMark(char)) {
      wrapper.appendChild(document.createTextNode(char));

      index++;

      continue;
    }

    if (!isArabicLetter(char)) {
      wrapper.appendChild(document.createTextNode(char));

      index++;

      continue;
    }

    const rule = detectTajweedRule(chars, index);

    const marks = getMarksAfter(chars, index);

    const fullText = char + marks.join("");

    if (rule) {
      const span = document.createElement("span");

      span.className = `tajweed-${rule}`;

      span.textContent = fullText;

      wrapper.appendChild(span);
    } else {
      wrapper.appendChild(document.createTextNode(fullText));
    }

    index += 1 + marks.length;
  }

  return wrapper;
}

/* =========================================================
   CREATE TAJWEED ARABIC
========================================================= */

function createTajweedArabic(tajweedText, fallbackText) {
  const wrapper = document.createElement("span");

  wrapper.className = "arabic-ayah-text tajweed-text";

  const text = tajweedText || fallbackText || "";

  if (typeof text === "string" && /<[^>]+>/.test(text)) {
    wrapper.innerHTML = text;

    return wrapper;
  }

  return createPlainTajweedArabic(text);
}

/* =========================================================
   ARABIC AYAH MARKER
========================================================= */

function createArabicWithMarker(arabicText, tajweedText, ayahNumber) {
  const wrapper = document.createElement("span");

  wrapper.className = "arabic-ayah";

  const text = createTajweedArabic(tajweedText, arabicText);

  const marker = document.createElement("span");

  marker.className = "ayah-marker";

  marker.textContent = `۝${toArabicNumber(ayahNumber)}`;

  wrapper.appendChild(text);

  wrapper.appendChild(document.createTextNode(" "));

  wrapper.appendChild(marker);

  return wrapper;
}

/* =========================================================
   ARABIC NUMBERS
========================================================= */

function toArabicNumber(number) {
  const arabicDigits = ["٠", "١", "٢", "٣", "٤", "٥", "٦", "٧", "٨", "٩"];

  return String(number)
    .split("")
    .map(function (digit) {
      return arabicDigits[parseInt(digit)];
    })
    .join("");
}

/* =========================================================
   CREATE AYAH
========================================================= */

function createAyah(item) {
  const ayah = item.ayah;

  const card = document.createElement("article");

  card.className = "ayah-card";

  card.dataset.surah = String(item.surah.number);
  card.dataset.ayah = String(ayah.ayah_number);

  const isSurahStart = Number(ayah.ayah_number) === 1;

  const isTawbah = Number(item.surah.number) === SURAH_WITHOUT_BISMILLAH;

  /* =====================================================
     SURAH NAME + BISMILLAH
  ===================================================== */

  if (isSurahStart) {
    const surahName = createSurahHeader(item.surah);

    card.appendChild(surahName);

    if (!isTawbah) {
      const bismillah = createBismillah();

      card.appendChild(bismillah);
    }
  }

  /* =====================================================
     CONTENT
  ===================================================== */

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

    /* =================================================
       TAFSEER
    ================================================= */

    if (readingMode === "tafsir") {
      const tafsirTitle = document.createElement("div");

      tafsirTitle.className = "side-title tafsir-heading";

      tafsirTitle.textContent = "Tafseer";

      left.appendChild(tafsirTitle);

      const tafsirs = Array.isArray(ayah.tafsirs) ? ayah.tafsirs : [];

      if (tafsirs.length > 0) {
        tafsirs.forEach(function (tafsir) {
          const tafsirBox = document.createElement("div");

          tafsirBox.className = "tafsir-text";

          tafsirBox.textContent = tafsir.text || "Tafseer text not available.";

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

  /* =====================================================
     AYAH AUDIO
  ===================================================== */

  const audioButton = createAudioButton({
    surah_number: item.surah.number,

    ayah_number: ayah.ayah_number,
  });

  right.appendChild(audioButton);

  /* =====================================================
     ARABIC ONLY
  ===================================================== */

  if (readingMode === "arabic") {
    const arabic = document.createElement("div");

    arabic.className = "arabic-text";

    const arabicAyah = createArabicWithMarker(
      ayah.arabic_text,
      ayah.tajweed_text,
      ayah.ayah_number,
    );

    arabic.appendChild(arabicAyah);

    right.appendChild(arabic);
  } else {
    const ayahNumber = document.createElement("div");

    ayahNumber.className = "ayah-number";

    ayahNumber.textContent = ayah.ayah_number;

    const arabic = document.createElement("div");

    arabic.className = "arabic-text";

    const arabicAyah = createTajweedArabic(ayah.tajweed_text, ayah.arabic_text);

    arabic.appendChild(arabicAyah);

    right.appendChild(ayahNumber);

    right.appendChild(arabic);
  }

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
  hideLoading();

  loadJuzList();

  /*
   * Full Surah audio controls
   */

  createSurahAudioControls();

  await Promise.all([loadSurahs(), loadQuranPage(1)]);
}

/* =========================================================
   START
========================================================= */

initializeQuran();
