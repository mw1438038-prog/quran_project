
import os

import requests
from requests.auth import HTTPBasicAuth
from dotenv import load_dotenv

load_dotenv()


class QuranService:

    def __init__(self):
        self.client_id = os.getenv("QF_CLIENT_ID")
        self.client_secret = os.getenv("QF_CLIENT_SECRET")
        self.environment = os.getenv("QF_ENV", "prelive")

        if not self.client_id or not self.client_secret:
            raise ValueError(
                "QF_CLIENT_ID or QF_CLIENT_SECRET is missing in .env"
            )

        if self.environment == "production":
            self.auth_url = "https://oauth2.quran.foundation"
            self.api_url = "https://apis.quran.foundation"
        else:
            self.auth_url = "https://prelive-oauth2.quran.foundation"
            self.api_url = "https://apis-prelive.quran.foundation"

    # =========================================================
    # ACCESS TOKEN
    # =========================================================

    def get_access_token(self):

        response = requests.post(
            f"{self.auth_url}/oauth2/token",
            auth=HTTPBasicAuth(
                self.client_id,
                self.client_secret
            ),
            data={
                "grant_type": "client_credentials",
                "scope": "content"
            },
            timeout=30
        )

        if not response.ok:
            print("Token error:")
            print(response.text)
            response.raise_for_status()

        return response.json()["access_token"]

    # =========================================================
    # COMMON HEADERS
    # =========================================================

    def get_headers(self, token):

        return {
            "x-auth-token": token,
            "x-client-id": self.client_id,
        }

    # =========================================================
    # GET CHAPTERS / SURAHS
    # =========================================================

    def get_chapters(self):

        token = self.get_access_token()

        response = requests.get(
            f"{self.api_url}/content/api/v4/chapters",
            headers=self.get_headers(token),
            timeout=30
        )

        if not response.ok:
            print("Chapters error:")
            print(response.text)
            response.raise_for_status()

        return response.json()

    # =========================================================
    # GET VERSES
    # =========================================================

    def get_verses_by_chapter(self, chapter_number):

        token = self.get_access_token()

        all_verses = []

        page = 1
        per_page = 50

        while True:

            response = requests.get(
                f"{self.api_url}/content/api/v4/verses/by_chapter/"
                f"{chapter_number}",
                headers=self.get_headers(token),
                params={
                    "page": page,
                    "per_page": per_page,
                    "fields": (
                        "text_uthmani,"
                        "juz_number,"
                        "hizb_number,"
                        "page_number"
                    ),
                },
                timeout=30
            )

            if not response.ok:
                print("Verses error:")
                print(response.text)
                response.raise_for_status()

            data = response.json()

            verses = data.get("verses", [])

            all_verses.extend(verses)

            pagination = data.get(
                "pagination",
                {}
            )

            current_page = pagination.get(
                "current_page",
                page
            )

            total_pages = pagination.get(
                "total_pages",
                page
            )

            print(
                f"Surah {chapter_number}: "
                f"page {current_page}/{total_pages}"
            )

            if current_page >= total_pages:
                break

            page += 1

        return all_verses

    # =========================================================
    # GET VERSES WITH TRANSLATION + TAFSEER
    # =========================================================

    def get_verses_with_translation_tafsir(
        self,
        chapter_number,
        translation_id=234,
        tafsir_id=159
    ):

        token = self.get_access_token()

        all_verses = []

        page = 1
        per_page = 50

        while True:

            response = requests.get(
                f"{self.api_url}/content/api/v4/verses/by_chapter/"
                f"{chapter_number}",
                headers=self.get_headers(token),
                params={
                    "page": page,
                    "per_page": per_page,

                    # Urdu Translation
                    "translations": translation_id,

                    # Urdu Tafseer
                    "tafsirs": tafsir_id,

                    "fields": (
                        "text_uthmani,"
                        "juz_number,"
                        "hizb_number,"
                        "page_number"
                    ),
                },
                timeout=30
            )

            if not response.ok:
                print("Verse content error:")
                print(response.text)
                response.raise_for_status()

            data = response.json()

            verses = data.get(
                "verses",
                []
            )

            all_verses.extend(verses)

            pagination = data.get(
                "pagination",
                {}
            )

            current_page = pagination.get(
                "current_page",
                page
            )

            total_pages = pagination.get(
                "total_pages",
                page
            )

            print(
                f"Surah {chapter_number}: "
                f"page {current_page}/{total_pages}"
            )

            if current_page >= total_pages:
                break

            page += 1

        return all_verses

    # =========================================================
    # GET TRANSLATIONS
    # =========================================================

    def get_translations(self):

        token = self.get_access_token()

        response = requests.get(
            f"{self.api_url}/content/api/v4/resources/translations",
            headers=self.get_headers(token),
            timeout=30
        )

        print(
            "Translations status:",
            response.status_code
        )

        if not response.ok:
            print("Translations error:")
            print(response.text)
            response.raise_for_status()

        return response.json()

    # =========================================================
    # GET TAFSIRS
    # =========================================================

    def get_tafsirs(self):

        token = self.get_access_token()

        response = requests.get(
            f"{self.api_url}/content/api/v4/resources/tafsirs",
            headers=self.get_headers(token),
            timeout=30
        )

        print(
            "Tafsirs status:",
            response.status_code
        )

        if not response.ok:
            print("Tafsirs error:")
            print(response.text)
            response.raise_for_status()

        return response.json()


# =============================================================
# TEST
# =============================================================

if __name__ == "__main__":

    print("Quran API test started")

    service = QuranService()

    print(
        "Client ID found:",
        bool(service.client_id)
    )

    print(
        "Client Secret found:",
        bool(service.client_secret)
    )

    print(
        "Environment:",
        service.environment
    )

    # ---------------------------------------------------------
    # CHAPTER TEST
    # ---------------------------------------------------------

    print("\nTesting chapters...")

    chapters_data = service.get_chapters()

    chapters = chapters_data.get(
        "chapters",
        []
    )

    print(
        "Total chapters:",
        len(chapters)
    )

    # ---------------------------------------------------------
    # TRANSLATION TEST
    # ---------------------------------------------------------

    print("\nTesting translations...")

    translations = service.get_translations()

    print(
        "Total translations:",
        len(translations.get("translations", []))
    )

    for item in translations.get("translations", []):

        print(
            item["id"],
            "-",
            item["name"],
            "-",
            item["language_name"]
        )

    # ---------------------------------------------------------
    # TAFSIR TEST
    # ---------------------------------------------------------

    print("\nTesting tafsirs...")

    tafsirs = service.get_tafsirs()

    print(
        "Total tafsirs:",
        len(tafsirs.get("tafsirs", []))
    )

    for item in tafsirs.get("tafsirs", []):

        print(
            item["id"],
            "-",
            item["name"],
            "-",
            item["language_name"]
        )

    # ---------------------------------------------------------
    # VERSE + TRANSLATION + TAFSEER TEST
    # ---------------------------------------------------------

    print("\nTesting Surah 1 with Urdu translation and Tafseer...")

    verses = service.get_verses_with_translation_tafsir(
        chapter_number=1,
        translation_id=234,
        tafsir_id=159
    )

    print(
        "Total verses:",
        len(verses)
    )

    if verses:

        verse = verses[0]

        print("\n========================================")
        print("VERSE KEY:")
        print(verse.get("verse_key"))

        print("\nARABIC:")
        print(verse.get("text_uthmani"))

        print("\nTRANSLATION:")
        print(verse.get("translations"))

        print("\nTAFSEER:")
        print(verse.get("tafsirs"))

        print("========================================")

