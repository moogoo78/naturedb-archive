import subprocess
import click
import json
#import logging
from logging.config import dictConfig

from flask import Flask

from app.database import session
from scripts import load_data
#from app.models import Specimen

ALEMBIC_BIN_PATH = '/root/.local/bin/alembic'


# TODO: similer to flask default
'''
dictConfig({
    'version': 1,
    'formatters': {'default': {
        'format': '[%(asctime)s] %(levelname)s in %(module)s: %(message)s',
    }},
    'handlers': {'wsgi': {
        'class': 'logging.StreamHandler',
        'stream': 'ext://flask.logging.wsgi_errors_stream',
        'formatter': 'default'
    }},
    'root': {
        'level': 'DEBUG',
        'handlers': ['wsgi']
    }
})
'''
def register_blueprint_api(app):
    from app.api import api as api_bp
    from app.api.views import (
        PersonMethodView,
        CollectionMethodView,
        NamedAreaMethodView,
        AreaClassMethodView,
        UnitMethodView,
        DatasetMethodView,
        OrganizationMethodView,
        IdentificationMethodView,
        MeasurementOrFactsMethodView,
        TaxonMethodView,
        SpecimenMethodView,
    )
    #app.register_blueprint(api_bp, url_prefix='/api')

    api_specimen_view = SpecimenMethodView.as_view('api-specimen')
    api_bp.add_url_rule(
        '/specimens',
        defaults={'item_id': None},
        view_func=api_specimen_view,
        methods=['GET', 'POST', 'OPTIONS']
    )
    api_bp.add_url_rule(
        '/specimens/<int:item_id>',
        view_func=api_specimen_view,
        methods=['GET', 'PUT', 'DELETE', 'OPTIONS']
    )

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

    api_collection_view = CollectionMethodView.as_view('api-collection')
    api_bp.add_url_rule(
        '/collections',
        defaults={'item_id': None},
        view_func=api_collection_view,
        methods=['GET', 'POST', 'OPTIONS']
    )
    api_bp.add_url_rule(
        '/collections/<int:item_id>',
        view_func=api_collection_view,
        methods=['GET', 'PUT', 'DELETE', 'OPTIONS']
    )

    api_named_area_view = NamedAreaMethodView.as_view('api-named-area')
    api_bp.add_url_rule(
        '/named_areas',
        defaults={'item_id': None},
        view_func=api_named_area_view,
        methods=['GET', 'POST', 'OPTIONS']
    )
    api_bp.add_url_rule(
        '/named_areas/<int:item_id>',
        view_func=api_named_area_view,
        methods=['GET', 'PUT', 'DELETE', 'OPTIONS']
    )
    api_bp.add_url_rule(
        '/named_areas/<int:item_id>',
        view_func=api_named_area_view,
        methods=['GET', 'PUT', 'DELETE', 'OPTIONS']
    )

    api_area_class_view = AreaClassMethodView.as_view('api-area-class')
    api_bp.add_url_rule(
        '/area_classes',
        defaults={'item_id': None},
        view_func=api_area_class_view,
        methods=['GET', 'POST', 'OPTIONS']
    )
    api_bp.add_url_rule(
        '/area_classes/<int:item_id>',
        view_func=api_area_class_view,
        methods=['GET', 'PUT', 'DELETE', 'OPTIONS']
    )
    api_unit_view = UnitMethodView.as_view('api-unit')
    api_bp.add_url_rule(
        '/units',
        defaults={'item_id': None},
        view_func=api_unit_view,
        methods=['GET', 'POST', 'OPTIONS']
    )
    api_bp.add_url_rule(
        '/units/<int:item_id>',
        view_func=api_unit_view,
        methods=['GET', 'PUT', 'DELETE', 'OPTIONS']
    )

    api_dataset_view = DatasetMethodView.as_view('api-dataset')
    api_bp.add_url_rule(
        '/datasets',
        defaults={'item_id': None},
        view_func=api_dataset_view,
        methods=['GET', 'POST', 'OPTIONS']
    )
    api_bp.add_url_rule(
        '/datasets/<int:item_id>',
        view_func=api_dataset_view,
        methods=['GET', 'PUT', 'DELETE', 'OPTIONS']
    )

    api_organization_view = OrganizationMethodView.as_view('api-organization')
    api_bp.add_url_rule(
        '/organizations',
        defaults={'item_id': None},
        view_func=api_organization_view,
        methods=['GET', 'POST', 'OPTIONS']
    )
    api_bp.add_url_rule(
        '/organizations/<int:item_id>',
        view_func=api_organization_view,
        methods=['GET', 'PUT', 'DELETE', 'OPTIONS']
    )

    api_identification_view = IdentificationMethodView.as_view('api-identification')
    api_bp.add_url_rule(
        '/identifications',
        defaults={'item_id': None},
        view_func=api_identification_view,
        methods=['GET', 'POST', 'OPTIONS']
    )
    api_bp.add_url_rule(
        '/identifications/<int:item_id>',
        view_func=api_identification_view,
        methods=['GET', 'PUT', 'DELETE', 'OPTIONS']
    )

    api_mof_view = MeasurementOrFactsMethodView.as_view('api-measurement-and-fact')
    api_bp.add_url_rule(
        '/measurement_or_facts',
        defaults={'item_id': None},
        view_func=api_mof_view,
        methods=['GET', 'POST', 'OPTIONS']
    )
    api_bp.add_url_rule(
        '/measurement_or_facts/<int:item_id>',
        view_func=api_mof_view,
        methods=['GET', 'PUT', 'DELETE', 'OPTIONS']
    )
    api_taxon_view = TaxonMethodView.as_view('api-taxon')
    api_bp.add_url_rule(
        '/taxa',
        defaults={'item_id': None},
        view_func=api_taxon_view,
        methods=['GET', 'POST', 'OPTIONS']
    )
    api_bp.add_url_rule(
        '/taxa/<int:item_id>',
        view_func=api_taxon_view,
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

    #@app.route('/')
    #def index():
    #return 'hello'

    @app.teardown_appcontext
    def shutdown_session(exception=None):
        # SQLAlchemy won`t close connection, will occupy pool
        session.remove()

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

    @app.cli.command('load_data')
    def func_load_data():
        import load_data_conf
        load_data.import_csv(load_data_conf.conf)
        return None
    return app
