
from extensions import db


class Tafsir(db.Model):
    __tablename__ = "tafsirs"

    id = db.Column(db.Integer, primary_key=True)

    ayah_id = db.Column(
        db.Integer,
        db.ForeignKey("ayahs.id"),
        nullable=False
    )

    resource_name = db.Column(
        db.String(100),
        nullable=False
    )

    language = db.Column(
        db.String(20),
        nullable=False,
        default="en"
    )

    text = db.Column(
        db.Text,
        nullable=False
    )

    ayah = db.relationship(
        "Ayah",
        back_populates="tafsirs"
    )

    def __repr__(self):
        return f"<Tafsir {self.ayah_id}: {self.resource_name}>"

