const azkaarData = {
  morning: {
    title: "Morning Azkaar",

    items: [
      {
        arabic: "أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ",
        translation: "ہم نے صبح کی اور تمام بادشاہی اللہ ہی کی ہے۔",
        reference: "Sahih Muslim",
      },
      {
        arabic: "سُبْحَانَ اللَّهِ وَبِحَمْدِهِ",
        translation: "اللہ پاک ہے اور اسی کے لیے تمام تعریف ہے۔",
        reference: "Sahih Muslim",
      },
      {
        arabic: "لَا إِلٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ",
        translation:
          "اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں۔",
        reference: "Daily Zikr",
      },
    ],
  },

  evening: {
    title: "Evening Azkaar",

    items: [
      {
        arabic: "أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ",
        translation: "ہم نے شام کی اور تمام بادشاہی اللہ ہی کی ہے۔",
        reference: "Sahih Muslim",
      },
      {
        arabic:
          "أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ",
        translation:
          "میں اللہ کے کامل کلمات کے ذریعے اس کی تمام مخلوق کے شر سے پناہ مانگتا ہوں۔",
        reference: "Sahih Muslim",
      },
    ],
  },

  salah: {
    title: "After Salah",

    items: [
      {
        arabic: "أَسْتَغْفِرُ اللَّهَ",
        translation: "میں اللہ سے بخشش مانگتا ہوں۔",
        reference: "Sahih Muslim",
      },
      {
        arabic: "سُبْحَانَ اللَّهِ",
        translation: "اللہ پاک ہے۔",
        reference: "Sahih Muslim",
      },
      {
        arabic: "الْحَمْدُ لِلَّهِ",
        translation: "تمام تعریفیں اللہ کے لیے ہیں۔",
        reference: "Sahih Muslim",
      },
      {
        arabic: "اللَّهُ أَكْبَرُ",
        translation: "اللہ سب سے بڑا ہے۔",
        reference: "Sahih Muslim",
      },
    ],
  },

  daily: {
    title: "Daily Duas",

    items: [
      {
        arabic: "رَبِّ اغْفِرْ لِي وَارْحَمْنِي",
        translation: "اے میرے رب! مجھے بخش دے اور مجھ پر رحم فرما۔",
        reference: "Daily Dua",
      },
      {
        arabic: "رَبِّ زِدْنِي عِلْمًا",
        translation: "اے میرے رب! میرے علم میں اضافہ فرما۔",
        reference: "Quran 20:114",
      },
    ],
  },

  protection: {
    title: "Protection Azkaar",

    items: [
      {
        arabic: "قُلْ هُوَ اللَّهُ أَحَدٌ",
        translation: "کہہ دیجیے: وہ اللہ ایک ہے۔",
        reference: "Surah Al-Ikhlas",
      },
      {
        arabic: "قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ",
        translation: "کہہ دیجیے: میں صبح کے رب کی پناہ لیتا ہوں۔",
        reference: "Surah Al-Falaq",
      },
      {
        arabic: "قُلْ أَعُوذُ بِرَبِّ النَّاسِ",
        translation: "کہہ دیجیے: میں لوگوں کے رب کی پناہ لیتا ہوں۔",
        reference: "Surah An-Nas",
      },
    ],
  },

  general: {
    title: "General Zikr",

    items: [
      {
        arabic: "سُبْحَانَ اللَّهِ",
        translation: "اللہ پاک ہے۔",
        reference: "Zikr",
      },
      {
        arabic: "الْحَمْدُ لِلَّهِ",
        translation: "تمام تعریفیں اللہ کے لیے ہیں۔",
        reference: "Zikr",
      },
      {
        arabic: "اللَّهُ أَكْبَرُ",
        translation: "اللہ سب سے بڑا ہے۔",
        reference: "Zikr",
      },
      {
        arabic: "أَسْتَغْفِرُ اللَّهَ",
        translation: "میں اللہ سے بخشش مانگتا ہوں۔",
        reference: "Zikr",
      },
    ],
  },
};

const list = document.getElementById("azkaarList");
const sectionTitle = document.querySelector(".section-title h2");

const categoryButtons = document.querySelectorAll(".category");

function renderAzkaar(category) {
  const data = azkaarData[category];

  if (!data) return;

  sectionTitle.textContent = data.title;

  list.innerHTML = "";

  data.items.forEach((item, index) => {
    const card = document.createElement("article");

    card.className = "zikr-card";

    card.innerHTML = `
            <div class="zikr-number">
                ZIKR ${index + 1}
            </div>

            <div class="zikr-arabic">
                ${item.arabic}
            </div>

            <div class="zikr-translation">
                ${item.translation}
            </div>

            <div class="zikr-reference">
                ${item.reference}
            </div>
        `;

    list.appendChild(card);
  });
}

categoryButtons.forEach((button) => {
  button.addEventListener("click", () => {
    categoryButtons.forEach((btn) => {
      btn.classList.remove("active");
    });

    button.classList.add("active");

    renderAzkaar(button.dataset.category);
  });
});

/* =====================================================
   TASBEEH COUNTER
===================================================== */

let count = 0;

const counter = document.getElementById("counter");

document.getElementById("countButton").addEventListener("click", () => {
  count++;

  counter.textContent = count;
});

document.getElementById("minusButton").addEventListener("click", () => {
  if (count > 0) {
    count--;
  }

  counter.textContent = count;
});

document.getElementById("resetButton").addEventListener("click", () => {
  count = 0;

  counter.textContent = count;
});

/* Initial */
renderAzkaar("morning");
