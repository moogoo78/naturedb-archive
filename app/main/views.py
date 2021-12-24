import json

from app.main import main
from app.database import session
#from app.database import session
#from app.models import Dataset, Collection
from app.models import Person
from app.helpers import conv_hast21


@main.route('/foo')
def index():
    #ds = Dataset()
    #c = Collection()
    #c.name = 'non'
    #p = Person(name='bar')
    #session.add(p)
    #session.commit()
    #a = open('specimen.json')
    #m = a.read()
    #data = json.loads(m)
    conv_hast21()

    return ('foo-data')

