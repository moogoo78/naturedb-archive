import json

from flask import (
    request,
    render_template
)

from app.main import main
from app.database import session
#from app.database import session
#from app.models import Dataset, Collection
from app.models import Collection
from app.helpers import conv_hast21


@main.route('/conv-hast21')
def foo():
    conv_hast21()

    return ('foo-data')


@main.route('/print-label')
def print_label():
    ids =request.args.get('ids')
    rows = Collection.query.filter(Collection.id.in_(ids.split(','))).all()
    return render_template('print-label.html', item_list=rows)
