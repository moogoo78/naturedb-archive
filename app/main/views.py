import json

from app.main import main
from app.database import session
#from app.database import session
#from app.models import Dataset, Collection
from app.models import Person
from app.helpers import conv_hast21


@main.route('/conv-hast21')
def foo():
    conv_hast21()

    return ('foo-data')

