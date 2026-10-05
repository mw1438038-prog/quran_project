from flask import Flask, render_template, send_from_directory

from config import Config
from extensions import db
from routes.quran import quran_bp


def create_app():

    app = Flask(__name__)

    # =====================================================
    # CONFIG
    # =====================================================

    app.config.from_object(Config)

    # =====================================================
    # DATABASE
    # =====================================================

    db.init_app(app)

    with app.app_context():
        db.create_all()

    # =====================================================
    # QURAN API BLUEPRINT
    # =====================================================

    app.register_blueprint(quran_bp)

    # =====================================================
    # HOME
    # =====================================================

    @app.route("/")
    def home():
        return render_template("index.html")

    # =====================================================
    # QURAN UI
    # =====================================================

    @app.route("/quran")
    def quran_page():
        return render_template("quran.html")

    # =====================================================
    # ZIKR & AZKAAR
    # =====================================================

    @app.route("/azkaar")
    def azkaar():
        return render_template("azkaar.html")

    # =====================================================
    # NAMAZ
    # =====================================================

    @app.route("/namaz")
    def namaz():
        return render_template("namaz.html")

    # =====================================================
    # PWA SERVICE WORKER
    # =====================================================

    @app.route("/sw.js")
    def service_worker():

        response = send_from_directory(
            app.static_folder,
            "sw.js",
            mimetype="application/javascript"
        )

        response.headers["Service-Worker-Allowed"] = "/"

        return response

    return app


# =========================================================
# CREATE APP
# =========================================================

app = create_app()


# =========================================================
# RUN SERVER
# =========================================================

if __name__ == "__main__":
    app.run(debug=True)