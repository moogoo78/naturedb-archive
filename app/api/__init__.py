from flask import (
    Blueprint,
    render_template,
    jsonify,
    request,
    make_response,
)
from sqlalchemy import select

from app.database import session
from app.models import (
    Collection,
    Person
)

api = Blueprint('api', __name__)

def _build_cors_preflight_response():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

def _corsify_actual_response(response):
    #response.headers.add('Content-Range: bytes 200-20/200')
    #response.headers["Content-Range"] = "bytes %d-%d/%d" % (
    #            0, 20 - 1, 200)
    response.headers.add("Access-Control-Allow-Origin", "*")
    print (response.headers)
    return response

@api.route('/v1/collections')
def get_collection_list():
    data = {
        'header': (
            ('pk', '#', {'align':'right'}),
            ('collector__full_name', '採集者', {'align': 'right'}),
            ('display_field_number', '採集號', {'align': 'right', 'type': 'x_field_number'}),
            ('collect_date', '採集日期', {'align': 'right'}),
        ),
        'rows': [],
        'model': 'collection',
    }
    #result = session.execute(select(Collection))
    #print (result.all())
    res = Collection.query.all()
    rows = []
    for r in res:
        rows.append(r.to_dict())

    return _corsify_actual_response(jsonify(rows))

@api.route('/v1/collections/<int:collection_id>')
def get_collection_detail(collection_id):
    col = session.get(Collection, collection_id)
    #result = Person.query.filter(Person.is_collector==True).all()
    return _corsify_actual_response(jsonify(col.to_dict()))

@api.route('/v1/people')
def get_perso_list():
    keyword = request.args.get('q', '')
    rows = []
    if keyword:
        result = Person.query.filter(Person.full_name.ilike(f'%{keyword}%') | Person.atomized_name['en']['given_name'].astext.ilike(f'%{keyword}%') | Person.atomized_name['en']['inherited_name'].astext.ilike(f'%{keyword}%')).all()
    else:
        result = Person.query.all()

    for r in result:
        print (r.to_dict())
        rows.append(r.to_dict())

    return _corsify_actual_response(jsonify(rows))
