
from extensions import db


class Surah(db.Model):
    __tablename__ = "surahs"

    id = db.Column(db.Integer, primary_key=True)

    number = db.Column(
        db.Integer,
        unique=True,
        nullable=False
    )

    name_arabic = db.Column(
        db.String(100),
        nullable=False
    )

    name_english = db.Column(
        db.String(100),
        nullable=False
    )

    revelation_type = db.Column(
        db.String(20),
        nullable=True
    )

    verses_count = db.Column(
        db.Integer,
        nullable=False,
        default=0
    )

    ayahs = db.relationship(
        "Ayah",
        back_populates="surah",
        cascade="all, delete-orphan"
    )

    def __repr__(self):
        return f"<Surah {self.number}: {self.name_english}>"

