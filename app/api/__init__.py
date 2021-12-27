import json

from flask import (
    Blueprint,
    render_template,
    jsonify,
    request,
    make_response,
)
from sqlalchemy import (
    select,
    desc
)

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
    #response.headers["Content-Range"] = "bytes %d-%d/%d" % (
    #            0, 20 - 1, 200)
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add("Content-Range", "bytes 0-19/50")
    return response

def make_react_admin_response(data, ra_range, total):
    resp = jsonify(data)
    resp.headers.add('Access-Control-Allow-Origin', '*')
    resp.headers.add('Access-Control-Allow-Methods', '*')

    if ra_range:
        resp.headers.add('Access-Control-Expose-Headers', 'Content-Range')
        resp.headers.add('Content-Range', 'items {}-{}/{}'.format(ra_range[0], ra_range[1], total))

    return resp

def ra_get_list_response(res_name, req, query):
    '''
    model must has to_dict method
    res_name: for debug
    '''
    payload = {
        'range': '',
    }
    if r := req.args.get('range'):
        payload['range'] = json.loads(r)
    if s := req.args.get('sort'):
        payload['sort'] = json.loads(s)
    if f := req.args.get('filter'):
        payload['filter'] = json.loads(f)

    query, total = apply_react_admin_query(query, payload)
    rows = []
    for r in query.all():
        rows.append(r.to_dict())
    return make_react_admin_response(rows, payload['range'], total)

def ra_item_response(res_name, req, obj):
    if req.method == 'OPTIONS':
        return _build_cors_preflight_response()
    else:
        data = obj.to_dict()
        if req.method == 'PUT':
            for k, v in req.json.items():
                if v != data[k]:
                    setattr(obj, k, v)
            session.commit()
        resp = jsonify(obj.to_dict())
        resp.headers.add('Access-Control-Allow-Origin', '*')
        return resp

def apply_react_admin_query(query, payload):
    total = query.count()
    # order_by must apply before limit/offset
    if 'sort' in payload:
        if payload['sort'][1] == 'ASC':
            query = query.order_by(payload['sort'][0])
        elif v[1] == 'DESC':
            query = query.order_by(desc(payload['sort'][0]))

    if 'range' in payload and payload['range'] != '':
        start = payload['range'][0]
        end = payload['range'][1]
        query = query.limit((end-start)+1).offset(start)

    return query, total

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
    #res = Collection.query.all()
    query = Collection.query
    #rows = []
    #for r in res:
    #    rows.append(r.to_dict())

    #return _corsify_actual_response(jsonify(rows))
    return ra_get_list_response('collection', request, query)

@api.route('/v1/collections/<int:collection_id>')
def get_collection_detail(collection_id):
    col = session.get(Collection, collection_id)
    #result = Person.query.filter(Person.is_collector==True).all()
    return _corsify_actual_response(jsonify(col.to_dict()))

@api.route('/v1/people/<int:person_id>', methods=['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'])
def get_person_detail(person_id):
    #print(person_id, request.method, request.form, request.args, request.json, request.get_json())
    obj = session.get(Person, person_id)
    return ra_item_response('people', request, obj)

@api.route('/v1/people')
def get_person_list():
    keyword = request.args.get('q', '')

    if keyword:
        query = Person.query.filter(Person.full_name.ilike(f'%{keyword}%') | Person.atomized_name['en']['given_name'].astext.ilike(f'%{keyword}%') | Person.atomized_name['en']['inherited_name'].astext.ilike(f'%{keyword}%')).all()
    else:
        query = Person.query

    '''
    ra_payload = {
        'range': json.loads(request.args.get('range')),
        'sort': json.loads(request.args.get('sort'))
    }

    return query_to_response(query, request)
    rows = []
    query, total = apply_react_admin_query(query, ra_payload)
    for r in query.all():
        rows.append(r.to_dict())

    #return _corsify_actual_response(jsonify(rows))
    return make_react_admin_response(rows, ra_payload['range'], total)
    '''
    return ra_get_list_response('people', request, query)
