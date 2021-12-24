from flask import Flask

#from app.models import Specimen

def create_app():
    app = Flask(__name__)

    from app.main import main as main_bp
    from app.admin import admin as admin_bp
    from app.api import api as api_bp
    app.register_blueprint(main_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')
    app.register_blueprint(api_bp, url_prefix='/api')
    @app.route('/')
    def index():
        #print (Specimen, 'ueueuuuee')
        return 'hellxo'
    return app
