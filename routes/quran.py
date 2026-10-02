
from flask import Blueprint, jsonify, request

import os
import requests
from requests.auth import HTTPBasicAuth

from models import Surah, Ayah, Tafsir


quran_bp = Blueprint(
    "quran",
    __name__,
    url_prefix="/api/quran"
)


# =========================================================
# API HOME
# =========================================================

@quran_bp.route("/", methods=["GET"])
def quran_home():

    return jsonify({
        "success": True,
        "message": "Quran API is working"
    })


# =========================================================
# GET ALL SURAHS
# =========================================================

@quran_bp.route("/surahs", methods=["GET"])
def get_surahs():

    surahs = (
        Surah.query
        .order_by(Surah.number.asc())
        .all()
    )

    ayahs = (
        Ayah.query
        .order_by(
            Ayah.surah_id.asc(),
            Ayah.ayah_number.asc()
        )
        .all()
    )

    first_page_map = {}

    for ayah in ayahs:

        if ayah.surah_id not in first_page_map:
            first_page_map[ayah.surah_id] = ayah.page_number

    data = []

    for surah in surahs:

        data.append({
            "id": surah.id,
            "number": surah.number,
            "name_arabic": surah.name_arabic,
            "name_english": surah.name_english,
            "revelation_type": surah.revelation_type,
            "verses_count": surah.verses_count,
            "first_page": first_page_map.get(surah.id)
        })

    return jsonify({
        "success": True,
        "count": len(data),
        "surahs": data
    })


# =========================================================
# GET SINGLE SURAH
# =========================================================

@quran_bp.route(
    "/surahs/<int:surah_number>",
    methods=["GET"]
)
def get_surah(surah_number):

    surah = (
        Surah.query
        .filter_by(number=surah_number)
        .first()
    )

    if not surah:

        return jsonify({
            "success": False,
            "message": "Surah not found"
        }), 404

    return jsonify({
        "success": True,
        "surah": {
            "id": surah.id,
            "number": surah.number,
            "name_arabic": surah.name_arabic,
            "name_english": surah.name_english,
            "revelation_type": surah.revelation_type,
            "verses_count": surah.verses_count
        }
    })


# =========================================================
# GET SURAH FIRST PAGE
# =========================================================

@quran_bp.route(
    "/surahs/<int:surah_number>/page",
    methods=["GET"]
)
def get_surah_first_page(surah_number):

    surah = (
        Surah.query
        .filter_by(number=surah_number)
        .first()
    )

    if not surah:

        return jsonify({
            "success": False,
            "message": "Surah not found"
        }), 404

    first_ayah = (
        Ayah.query
        .filter_by(surah_id=surah.id)
        .order_by(Ayah.ayah_number.asc())
        .first()
    )

    if not first_ayah:

        return jsonify({
            "success": False,
            "message": "Surah has no ayahs"
        }), 404

    return jsonify({
        "success": True,
        "surah": {
            "number": surah.number,
            "name_arabic": surah.name_arabic,
            "name_english": surah.name_english
        },
        "first_page": first_ayah.page_number
    })


# =========================================================
# GET ALL AYAHS OF SURAH
# =========================================================

@quran_bp.route(
    "/surahs/<int:surah_number>/ayahs",
    methods=["GET"]
)
def get_surah_ayahs(surah_number):

    surah = (
        Surah.query
        .filter_by(number=surah_number)
        .first()
    )

    if not surah:

        return jsonify({
            "success": False,
            "message": "Surah not found"
        }), 404

    ayahs = (
        Ayah.query
        .filter_by(surah_id=surah.id)
        .order_by(Ayah.ayah_number.asc())
        .all()
    )

    data = []

    for ayah in ayahs:

        data.append({
            "id": ayah.id,
            "ayah_number": ayah.ayah_number,

            # Normal Arabic
            "arabic_text": ayah.arabic_text,

            # Tajweed Arabic
            "tajweed_text": ayah.tajweed_text,

            "translation": ayah.translation,
            "juz_number": ayah.juz_number,
            "page_number": ayah.page_number,
            "hizb_number": ayah.hizb_number,
            "ruku_number": ayah.ruku_number,
            "manzil_number": ayah.manzil_number,
            "sajdah": ayah.sajdah
        })

    return jsonify({
        "success": True,
        "surah": {
            "number": surah.number,
            "name_arabic": surah.name_arabic,
            "name_english": surah.name_english
        },
        "count": len(data),
        "ayahs": data
    })


# =========================================================
# GET SINGLE AYAH
# =========================================================

@quran_bp.route(
    "/ayah/<int:surah_number>/<int:ayah_number>",
    methods=["GET"]
)
def get_ayah(surah_number, ayah_number):

    surah = (
        Surah.query
        .filter_by(number=surah_number)
        .first()
    )

    if not surah:

        return jsonify({
            "success": False,
            "message": "Surah not found"
        }), 404

    ayah = (
        Ayah.query
        .filter_by(
            surah_id=surah.id,
            ayah_number=ayah_number
        )
        .first()
    )

    if not ayah:

        return jsonify({
            "success": False,
            "message": "Ayah not found"
        }), 404

    tafsirs = (
        Tafsir.query
        .filter_by(ayah_id=ayah.id)
        .all()
    )

    tafsir_data = []

    for tafsir in tafsirs:

        tafsir_data.append({
            "id": tafsir.id,
            "resource_name": tafsir.resource_name,
            "language": tafsir.language,
            "text": tafsir.text
        })

    return jsonify({
        "success": True,

        "surah": {
            "number": surah.number,
            "name_arabic": surah.name_arabic,
            "name_english": surah.name_english
        },

        "ayah": {
            "id": ayah.id,
            "ayah_number": ayah.ayah_number,

            # Normal Arabic
            "arabic_text": ayah.arabic_text,

            # Tajweed Arabic
            "tajweed_text": ayah.tajweed_text,

            "translation": ayah.translation,
            "juz_number": ayah.juz_number,
            "page_number": ayah.page_number,
            "hizb_number": ayah.hizb_number,
            "ruku_number": ayah.ruku_number,
            "manzil_number": ayah.manzil_number,
            "sajdah": ayah.sajdah,
            "tafsirs": tafsir_data
        }
    })


# =========================================================
# GET JUZ / PARA FIRST PAGE
# =========================================================

@quran_bp.route(
    "/juz/<int:juz_number>",
    methods=["GET"]
)
def get_juz(juz_number):

    if juz_number < 1 or juz_number > 30:

        return jsonify({
            "success": False,
            "message": "Juz number must be between 1 and 30"
        }), 404

    first_ayah = (
        Ayah.query
        .filter_by(juz_number=juz_number)
        .order_by(
            Ayah.page_number.asc(),
            Ayah.ayah_number.asc()
        )
        .first()
    )

    if not first_ayah:

        return jsonify({
            "success": False,
            "message": "Juz not found"
        }), 404

    return jsonify({
        "success": True,
        "juz": {
            "number": juz_number,
            "first_page": first_ayah.page_number
        }
    })


# =========================================================
# GET COMPLETE QURAN PAGE
# =========================================================

@quran_bp.route(
    "/pages/<int:page_number>",
    methods=["GET"]
)
def get_quran_page(page_number):

    if page_number < 1 or page_number > 604:

        return jsonify({
            "success": False,
            "message": "Page number must be between 1 and 604"
        }), 404

    # =====================================================
    # READING MODE
    # =====================================================

    mode = request.args.get(
        "mode",
        "arabic"
    ).lower()

    allowed_modes = {
        "arabic",
        "translation",
        "tafsir"
    }

    if mode not in allowed_modes:
        mode = "arabic"

    # =====================================================
    # GET PAGE AYAHS
    # =====================================================

    ayahs = (
        Ayah.query
        .filter_by(page_number=page_number)
        .order_by(
            Ayah.surah_id.asc(),
            Ayah.ayah_number.asc()
        )
        .all()
    )

    if not ayahs:

        return jsonify({
            "success": False,
            "message": "Quran page not found"
        }), 404

    # =====================================================
    # LOAD REQUIRED SURAHS
    # =====================================================

    surah_ids = list({
        ayah.surah_id
        for ayah in ayahs
    })

    surahs = (
        Surah.query
        .filter(
            Surah.id.in_(surah_ids)
        )
        .all()
    )

    surah_map = {
        surah.id: surah
        for surah in surahs
    }

    # =====================================================
    # LOAD TAFSEER ONLY WHEN NEEDED
    # =====================================================

    tafsir_map = {}

    if mode == "tafsir":

        ayah_ids = [
            ayah.id
            for ayah in ayahs
        ]

        tafsirs = (
            Tafsir.query
            .filter(
                Tafsir.ayah_id.in_(ayah_ids)
            )
            .all()
        )

        for tafsir in tafsirs:

            if tafsir.ayah_id not in tafsir_map:
                tafsir_map[tafsir.ayah_id] = []

            tafsir_map[
                tafsir.ayah_id
            ].append({
                "id": tafsir.id,
                "resource_name": tafsir.resource_name,
                "language": tafsir.language,
                "text": tafsir.text
            })

    # =====================================================
    # PREVIOUS / NEXT
    # =====================================================

    previous_page = None
    next_page = None

    if page_number > 1:
        previous_page = page_number - 1

    if page_number < 604:
        next_page = page_number + 1

    # =====================================================
    # BUILD RESPONSE
    # =====================================================

    page_data = []

    for ayah in ayahs:

        surah = surah_map.get(
            ayah.surah_id
        )

        if not surah:
            continue

        ayah_data = {
            "id": ayah.id,
            "ayah_number": ayah.ayah_number,

            # Normal Arabic
            "arabic_text": ayah.arabic_text,

            # Tajweed Arabic
            "tajweed_text": ayah.tajweed_text,

            "translation": ayah.translation,
            "juz_number": ayah.juz_number,
            "page_number": ayah.page_number,
            "hizb_number": ayah.hizb_number,
            "ruku_number": ayah.ruku_number,
            "manzil_number": ayah.manzil_number,
            "sajdah": ayah.sajdah
        }

        # =================================================
        # TAFSEER
        # =================================================

        if mode == "tafsir":

            ayah_data["tafsirs"] = tafsir_map.get(
                ayah.id,
                []
            )

        page_data.append({

            "surah": {
                "number": surah.number,
                "name_arabic": surah.name_arabic,
                "name_english": surah.name_english
            },

            "ayah": ayah_data
        })

    # =====================================================
    # RESPONSE
    # =====================================================

    return jsonify({

        "success": True,

        "mode": mode,

        "page": {
            "current": page_number,
            "previous": previous_page,
            "next": next_page,
            "total_pages": 604
        },

        "count": len(page_data),

        "ayahs": page_data
    })
    
    # =========================================================
# GET AYAH AUDIO
# =========================================================

@quran_bp.route(
    "/audio/<int:surah_number>/<int:ayah_number>",
    methods=["GET"]
)
def get_ayah_audio(surah_number, ayah_number):

    # -----------------------------------------
    # Quran Foundation credentials
    # -----------------------------------------

    client_id = os.getenv("QF_CLIENT_ID")
    client_secret = os.getenv("QF_CLIENT_SECRET")

    if not client_id or not client_secret:
        return jsonify({
            "success": False,
            "message": "Quran Foundation API credentials are not configured"
        }), 500

    # -----------------------------------------
    # Get recitation ID
    # Default: AbdulBaset AbdulSamad
    # -----------------------------------------

    recitation_id = request.args.get(
        "recitation_id",
        "1"
    )

    # -----------------------------------------
    # Get access token
    # -----------------------------------------

    try:

        token_response = requests.post(
            "https://oauth2.quran.foundation/oauth2/token",

            auth=HTTPBasicAuth(
                client_id,
                client_secret
            ),

            headers={
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },

            data={
                "grant_type":
                    "client_credentials",

                "scope":
                    "content"
            },

            timeout=30
        )

        if not token_response.ok:

            return jsonify({
                "success": False,
                "message":
                    "Unable to authenticate with Quran Foundation"
            }), 502

        token_data = token_response.json()

        access_token = token_data.get(
            "access_token"
        )

        if not access_token:

            return jsonify({
                "success": False,
                "message":
                    "Access token was not returned"
            }), 502

    except requests.RequestException as error:

        print(
            "Quran Foundation token error:",
            error
        )

        return jsonify({
            "success": False,
            "message":
                "Quran Foundation authentication failed"
        }), 502

    # -----------------------------------------
    # Get Ayah audio
    # -----------------------------------------

    ayah_key = (
        f"{surah_number}:{ayah_number}"
    )

    
    audio_url = (
            "https://apis.quran.foundation"
            "/content/api/v4"
            f"/quran/recitations/{recitation_id}"
        )
    try:

        response = requests.get(

            audio_url,

            headers={
                "x-auth-token":
                    access_token,

                "x-client-id":
                    client_id
            },

            params={
                "verse_key":
                    ayah_key
            },

            timeout=30
        )

        if not response.ok:

            return jsonify({
                "success": False,
                "message":
                    "Unable to fetch Quran audio",
                "status":
                    response.status_code
            }), 502

        data = response.json()

        audio_files = data.get(
            "audio_files",
            []
        )

        if not audio_files:

            return jsonify({
                "success": False,
                "message":
                    "Audio not found for this Ayah"
            }), 404

        audio = audio_files[0]

        return jsonify({

            "success": True,

            "surah_number":
                surah_number,

            "ayah_number":
                ayah_number,

            "verse_key":
                ayah_key,

            "recitation_id":
                recitation_id,

            "audio_url":
                audio.get("url")

        })

    except requests.RequestException as error:

        print(
            "Quran audio error:",
            error
        )

        return jsonify({
            "success": False,
            "message":
                "Quran audio request failed"
        }), 502
        
        # =========================================================
# GET COMPLETE SURAH AUDIO
# =========================================================

@quran_bp.route(
    "/audio/surah/<int:surah_number>",
    methods=["GET"]
)
def get_surah_audio(surah_number):

    # -----------------------------------------
    # Validate Surah number
    # -----------------------------------------

    if surah_number < 1 or surah_number > 114:

        return jsonify({
            "success": False,
            "message": "Surah number must be between 1 and 114"
        }), 400

    # -----------------------------------------
    # Quran Foundation credentials
    # -----------------------------------------

    client_id = os.getenv("QF_CLIENT_ID")
    client_secret = os.getenv("QF_CLIENT_SECRET")

    if not client_id or not client_secret:

        return jsonify({
            "success": False,
            "message": (
                "Quran Foundation API credentials "
                "are not configured"
            )
        }), 500

    # -----------------------------------------
    # Recitation ID
    # Default = 1 Abdul Basit Mujawwad
    # -----------------------------------------

    recitation_id = request.args.get(
        "recitation_id",
        "1"
    )

    # -----------------------------------------
    # Get access token
    # -----------------------------------------

    try:

        token_response = requests.post(

            "https://oauth2.quran.foundation/oauth2/token",

            auth=HTTPBasicAuth(
                client_id,
                client_secret
            ),

            headers={
                "Content-Type":
                    "application/x-www-form-urlencoded"
            },

            data={
                "grant_type":
                    "client_credentials",

                "scope":
                    "content"
            },

            timeout=30
        )

        if not token_response.ok:

            return jsonify({
                "success": False,
                "message":
                    "Unable to authenticate with Quran Foundation"
            }), 502

        token_data = token_response.json()

        access_token = token_data.get(
            "access_token"
        )

        if not access_token:

            return jsonify({
                "success": False,
                "message":
                    "Access token was not returned"
            }), 502

    except requests.RequestException as error:

        print(
            "Quran Foundation token error:",
            error
        )

        return jsonify({
            "success": False,
            "message":
                "Quran Foundation authentication failed"
        }), 502

    # -----------------------------------------
    # Get complete Surah audio
    # -----------------------------------------

    api_url = (
        "https://apis.quran.foundation"
        "/content/api/v4"
        f"/recitations/{recitation_id}"
        f"/by_chapter/{surah_number}"
    )

    all_audio_files = []

    page = 1

    try:

        while True:

            response = requests.get(

                api_url,

                headers={
                    "x-auth-token":
                        access_token,

                    "x-client-id":
                        client_id
                },

                params={
                    "page":
                        page,

                    "per_page":
                        50,

                    "fields":
                        "verse_key,verse_number,url"
                },

                timeout=30
            )

            if not response.ok:

                return jsonify({
                    "success": False,
                    "message":
                        "Unable to fetch Surah audio",
                    "status":
                        response.status_code
                }), 502

            data = response.json()

            audio_files = data.get(
                "audio_files",
                []
            )

            all_audio_files.extend(
                audio_files
            )

            pagination = data.get(
                "pagination",
                {}
            )

            next_page = pagination.get(
                "next_page"
            )

            if not next_page:
                break

            page = next_page

        # -------------------------------------
        # No audio found
        # -------------------------------------

        if not all_audio_files:

            return jsonify({
                "success": False,
                "message":
                    "Audio not found for this Surah"
            }), 404

        # -------------------------------------
        # Return complete Surah audio
        # -------------------------------------

        return jsonify({

            "success": True,

            "surah_number":
                surah_number,

            "recitation_id":
                recitation_id,

            "count":
                len(all_audio_files),

            "audio_files":
                all_audio_files
        })

    except requests.RequestException as error:

        print(
            "Quran Surah audio error:",
            error
        )

        return jsonify({
            "success": False,
            "message":
                "Quran Surah audio request failed"
        }), 502

