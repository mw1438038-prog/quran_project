
from app import create_app
from extensions import db
from models import Surah, Ayah, Tafsir
from services.quran_service import QuranService


# =========================================================
# SETTINGS
# =========================================================

TRANSLATION_ID = 234   # Fatah Muhammad Jalandhari - Urdu
TAFSIR_ID = 159        # Bayan ul Quran - Urdu


# =========================================================
# IMPORT QURAN
# =========================================================

def import_quran():

    app = create_app()

    with app.app_context():

        service = QuranService()

        print("=" * 60)
        print("QURAN IMPORT STARTED")
        print("=" * 60)

        # -------------------------------------------------
        # GET AVAILABLE SURAHS
        # -------------------------------------------------

        chapters_data = service.get_chapters()

        chapters = chapters_data.get(
            "chapters",
            []
        )

        print(
            f"Available Surahs: {len(chapters)}"
        )

        # -------------------------------------------------
        # IMPORT EACH SURAH
        # -------------------------------------------------

        for chapter in chapters:

            surah_number = chapter["id"]

            print()
            print("-" * 60)
            print(
                f"Importing Surah {surah_number}: "
                f"{chapter['name_simple']}"
            )
            print("-" * 60)

            # -------------------------------------------------
            # FIND OR CREATE SURAH
            # -------------------------------------------------

            surah = Surah.query.filter_by(
                number=surah_number
            ).first()

            if not surah:

                surah = Surah(
                    number=surah_number,
                    name_arabic=chapter.get(
                        "name_arabic",
                        chapter["name_simple"]
                    ),
                    name_english=chapter["name_simple"],
                    revelation_type=chapter.get(
                        "revelation_place"
                    ),
                    verses_count=chapter["verses_count"]
                )

                db.session.add(surah)

                # ID generate karne ke liye
                db.session.flush()

                print(
                    "Created Surah:",
                    chapter["name_simple"]
                )

            else:

                surah.name_arabic = chapter.get(
                    "name_arabic",
                    surah.name_arabic
                )

                surah.name_english = chapter[
                    "name_simple"
                ]

                surah.revelation_type = chapter.get(
                    "revelation_place"
                )

                surah.verses_count = chapter[
                    "verses_count"
                ]

                print(
                    "Updated Surah:",
                    chapter["name_simple"]
                )

            # -------------------------------------------------
            # GET VERSES + URDU TRANSLATION + URDU TAFSEER
            # -------------------------------------------------

            verses = service.get_verses_with_translation_tafsir(
                chapter_number=surah_number,
                translation_id=TRANSLATION_ID,
                tafsir_id=TAFSIR_ID
            )

            print(
                f"API verses received: {len(verses)}"
            )

            new_ayahs = 0
            updated_ayahs = 0
            new_tafsirs = 0
            updated_tafsirs = 0

            # -------------------------------------------------
            # IMPORT AYAHS
            # -------------------------------------------------

            for verse in verses:

                ayah_number = verse[
                    "verse_number"
                ]

                # ---------------------------------------------
                # FIND EXISTING AYAH
                # ---------------------------------------------

                ayah = Ayah.query.filter_by(
                    surah_id=surah.id,
                    ayah_number=ayah_number
                ).first()

                # ---------------------------------------------
                # GET TRANSLATION
                # ---------------------------------------------

                translations = verse.get(
                    "translations",
                    []
                )

                translation_text = None

                for translation in translations:

                    if translation.get(
                        "resource_id"
                    ) == TRANSLATION_ID:

                        translation_text = translation.get(
                            "text"
                        )

                        break

                # ---------------------------------------------
                # CREATE / UPDATE AYAH
                # ---------------------------------------------

                if not ayah:

                    ayah = Ayah(
                        surah_id=surah.id,
                        ayah_number=ayah_number,
                        arabic_text=verse.get(
                            "text_uthmani",
                            ""
                        ),
                        translation=translation_text,
                        juz_number=verse.get(
                            "juz_number"
                        ),
                        page_number=verse.get(
                            "page_number"
                        ),
                        hizb_number=verse.get(
                            "hizb_number"
                        ),
                    )

                    db.session.add(ayah)

                    db.session.flush()

                    new_ayahs += 1

                else:

                    ayah.arabic_text = verse.get(
                        "text_uthmani",
                        ayah.arabic_text
                    )

                    ayah.translation = translation_text

                    ayah.juz_number = verse.get(
                        "juz_number"
                    )

                    ayah.page_number = verse.get(
                        "page_number"
                    )

                    ayah.hizb_number = verse.get(
                        "hizb_number"
                    )

                    updated_ayahs += 1

                # ---------------------------------------------
                # GET TAFSEER
                # ---------------------------------------------

                tafsirs = verse.get(
                    "tafsirs",
                    []
                )

                tafsir_text = None

                for tafsir in tafsirs:

                    if tafsir.get(
                        "resource_id"
                    ) == TAFSIR_ID:

                        tafsir_text = tafsir.get(
                            "text"
                        )

                        break

                # ---------------------------------------------
                # SAVE TAFSEER
                # ---------------------------------------------

                if tafsir_text:

                    existing_tafsir = Tafsir.query.filter_by(
                        ayah_id=ayah.id,
                        resource_name="Bayan ul Quran",
                        language="ur"
                    ).first()

                    if existing_tafsir:

                        existing_tafsir.text = tafsir_text

                        updated_tafsirs += 1

                    else:

                        new_tafsir = Tafsir(
                            ayah_id=ayah.id,
                            resource_name="Bayan ul Quran",
                            language="ur",
                            text=tafsir_text
                        )

                        db.session.add(
                            new_tafsir
                        )

                        new_tafsirs += 1

            # -------------------------------------------------
            # COMMIT SURAH
            # -------------------------------------------------

            db.session.commit()

            # -------------------------------------------------
            # SURAH RESULT
            # -------------------------------------------------

            total_ayahs = Ayah.query.filter_by(
                surah_id=surah.id
            ).count()

            total_tafsirs = Tafsir.query.join(
                Ayah
            ).filter(
                Ayah.surah_id == surah.id
            ).count()

            print()
            print(
                "New Ayahs:",
                new_ayahs
            )

            print(
                "Updated Ayahs:",
                updated_ayahs
            )

            print(
                "New Tafseers:",
                new_tafsirs
            )

            print(
                "Updated Tafseers:",
                updated_tafsirs
            )

            print(
                "Total Ayahs in DB:",
                total_ayahs
            )

            print(
                "Total Tafseers in DB:",
                total_tafsirs
            )

        # -------------------------------------------------
        # FINAL RESULT
        # -------------------------------------------------

        print()
        print("=" * 60)
        print("QURAN IMPORT COMPLETED")
        print("=" * 60)

        total_surahs = Surah.query.count()
        total_ayahs = Ayah.query.count()
        total_tafsirs = Tafsir.query.count()

        print(
            "Total Surahs:",
            total_surahs
        )

        print(
            "Total Ayahs:",
            total_ayahs
        )

        print(
            "Total Tafseers:",
            total_tafsirs
        )

        print("=" * 60)


# =========================================================
# RUN
# =========================================================

if __name__ == "__main__":
    import_quran()

