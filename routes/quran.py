from flask import Blueprint, jsonify

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

    surahs = Surah.query.order_by(
        Surah.number.asc()
    ).all()

    data = []

    for surah in surahs:

        first_ayah = Ayah.query.filter_by(
            surah_id=surah.id
        ).order_by(
            Ayah.ayah_number.asc()
        ).first()

        first_page = None

        if first_ayah:
            first_page = first_ayah.page_number

        data.append({
            "id": surah.id,
            "number": surah.number,
            "name_arabic": surah.name_arabic,
            "name_english": surah.name_english,
            "revelation_type": surah.revelation_type,
            "verses_count": surah.verses_count,
            "first_page": first_page
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

    surah = Surah.query.filter_by(
        number=surah_number
    ).first()

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

    surah = Surah.query.filter_by(
        number=surah_number
    ).first()

    if not surah:

        return jsonify({
            "success": False,
            "message": "Surah not found"
        }), 404

    first_ayah = Ayah.query.filter_by(
        surah_id=surah.id
    ).order_by(
        Ayah.ayah_number.asc()
    ).first()

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

    surah = Surah.query.filter_by(
        number=surah_number
    ).first()

    if not surah:

        return jsonify({
            "success": False,
            "message": "Surah not found"
        }), 404

    ayahs = Ayah.query.filter_by(
        surah_id=surah.id
    ).order_by(
        Ayah.ayah_number.asc()
    ).all()

    data = []

    for ayah in ayahs:

        data.append({
            "id": ayah.id,
            "ayah_number": ayah.ayah_number,
            "arabic_text": ayah.arabic_text,
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

    surah = Surah.query.filter_by(
        number=surah_number
    ).first()

    if not surah:

        return jsonify({
            "success": False,
            "message": "Surah not found"
        }), 404

    ayah = Ayah.query.filter_by(
        surah_id=surah.id,
        ayah_number=ayah_number
    ).first()

    if not ayah:

        return jsonify({
            "success": False,
            "message": "Ayah not found"
        }), 404

    tafsirs = Tafsir.query.filter_by(
        ayah_id=ayah.id
    ).all()

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
            "arabic_text": ayah.arabic_text,
            "translation": ayah.translation,
            "juz_number": ayah.juz_number,
            "page_number": ayah.page_number,
            "hizb_number": ayah.hizb_number,
            "ruku_number": ayah.ruku_number,
            "manzil_number": ayah.manzil_number,
            "sajdah": ayah.sajdah
        },

        "tafsirs": tafsir_data
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

    first_ayah = Ayah.query.filter_by(
        juz_number=juz_number
    ).order_by(
        Ayah.page_number.asc(),
        Ayah.ayah_number.asc()
    ).first()

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

    ayahs = Ayah.query.filter_by(
        page_number=page_number
    ).order_by(
        Ayah.surah_id.asc(),
        Ayah.ayah_number.asc()
    ).all()

    if not ayahs:

        return jsonify({
            "success": False,
            "message": "Quran page not found"
        }), 404

    previous_page = None
    next_page = None

    if page_number > 1:
        previous_page = page_number - 1

    if page_number < 604:
        next_page = page_number + 1

    page_data = []

    for ayah in ayahs:

        surah = Surah.query.get(
            ayah.surah_id
        )

        if not surah:
            continue

        tafsirs = Tafsir.query.filter_by(
            ayah_id=ayah.id
        ).all()

        tafsir_data = []

        for tafsir in tafsirs:

            tafsir_data.append({
                "id": tafsir.id,
                "resource_name": tafsir.resource_name,
                "language": tafsir.language,
                "text": tafsir.text
            })

        page_data.append({

            "surah": {
                "number": surah.number,
                "name_arabic": surah.name_arabic,
                "name_english": surah.name_english
            },

            "ayah": {
                "id": ayah.id,
                "ayah_number": ayah.ayah_number,
                "arabic_text": ayah.arabic_text,
                "translation": ayah.translation,
                "juz_number": ayah.juz_number,
                "page_number": ayah.page_number,
                "hizb_number": ayah.hizb_number,
                "ruku_number": ayah.ruku_number,
                "manzil_number": ayah.manzil_number,
                "sajdah": ayah.sajdah
            },

            "tafsirs": tafsir_data
        })

    return jsonify({

        "success": True,

        "page": {
            "current": page_number,
            "previous": previous_page,
            "next": next_page,
            "total_pages": 604
        },

        "count": len(page_data),

        "ayahs": page_data
    })