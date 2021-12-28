import subprocess
import click

from flask import Flask

#from app.models import Specimen

ALEMBIC_BIN_PATH = '/root/.local/bin/alembic'

def register_blueprint_api(app):
    from app.api import api as api_bp
    from app.api.views import PersonMethodView
    #app.register_blueprint(api_bp, url_prefix='/api')
    api_person_view = PersonMethodView.as_view('api-person')
    api_bp.add_url_rule(
        '/people',
        defaults={'item_id': None},
        view_func=api_person_view,
        methods=['GET', 'POST', 'OPTIONS']
    )
    api_bp.add_url_rule(
        '/people/<int:item_id>',
        view_func=api_person_view,
        methods=['GET', 'PUT', 'DELETE', 'OPTIONS']
    )

    app.register_blueprint(api_bp, url_prefix='/api/v1')


def create_app():
    app = Flask(__name__)

    from app.main import main as main_bp
    from app.admin import admin as admin_bp;

    app.register_blueprint(main_bp)
    app.register_blueprint(admin_bp, url_prefix='/admin')

    register_blueprint_api(app)

    @app.route('/')
    def index():
        #print (Specimen, 'ueueuuuee')
        return 'hello'

    @app.cli.command('makemigrations')
    @click.argument('message')
    def makemigrations(message):
        cmd_list = [ALEMBIC_BIN_PATH, 'revision', '--autogenerate', '-m', message]
        subprocess.call(cmd_list)

        return None

    @app.cli.command('migrate')
    def migrate():
        cmd_list = [ALEMBIC_BIN_PATH, 'upgrade', 'head']
        subprocess.call(cmd_list)

    return app
