
from flask import Flask, render_template

from config import Config
from extensions import db

from models import Surah, Ayah, Tafsir
from routes.quran import quran_bp


def create_app():

    app = Flask(__name__)

    app.config.from_object(Config)

    db.init_app(app)

    app.register_blueprint(quran_bp)

    with app.app_context():
        db.create_all()

    # =====================================================
    # HOME
    # =====================================================

    @app.route("/")
    def home():

        return """
        <h2>Quran App Running</h2>
        <p>
            <a href="/quran">Open Quran</a>
        </p>
        """

    # =====================================================
    # QURAN UI
    # =====================================================

    @app.route("/quran")
    def quran_page():

        return render_template("quran.html")

    return app


app = create_app()


if __name__ == "__main__":

    app.run(debug=True)

