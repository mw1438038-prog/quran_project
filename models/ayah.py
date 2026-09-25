
from extensions import db


class Ayah(db.Model):
    __tablename__ = "ayahs"

    id = db.Column(
        db.Integer,
        primary_key=True
    )

    surah_id = db.Column(
        db.Integer,
        db.ForeignKey("surahs.id"),
        nullable=False
    )

    ayah_number = db.Column(
        db.Integer,
        nullable=False
    )

    # =====================================================
    # ORIGINAL ARABIC QURAN TEXT
    # =====================================================

    arabic_text = db.Column(
        db.Text,
        nullable=False
    )

    # =====================================================
    # TAJWEED TEXT
    # =====================================================

    tajweed_text = db.Column(
        db.Text,
        nullable=True
    )

    # =====================================================
    # TRANSLATION
    # =====================================================

    translation = db.Column(
        db.Text,
        nullable=True
    )

    # =====================================================
    # QURAN INFORMATION
    # =====================================================

    juz_number = db.Column(
        db.Integer,
        nullable=True
    )

    page_number = db.Column(
        db.Integer,
        nullable=True
    )

    ruku_number = db.Column(
        db.Integer,
        nullable=True
    )

    manzil_number = db.Column(
        db.Integer,
        nullable=True
    )

    hizb_number = db.Column(
        db.Integer,
        nullable=True
    )

    sajdah = db.Column(
        db.Boolean,
        default=False,
        nullable=False
    )

    # =====================================================
    # RELATIONSHIPS
    # =====================================================

    surah = db.relationship(
        "Surah",
        back_populates="ayahs"
    )

    tafsirs = db.relationship(
        "Tafsir",
        back_populates="ayah",
        cascade="all, delete-orphan"
    )

    # =====================================================
    # REPRESENTATION
    # =====================================================

    def __repr__(self):
        return f"<Ayah {self.surah_id}:{self.ayah_number}>"

