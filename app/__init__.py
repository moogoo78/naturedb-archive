import subprocess
import click

from flask import Flask

#from app.models import Specimen

ALEMBIC_BIN_PATH = '/root/.local/bin/alembic'

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
