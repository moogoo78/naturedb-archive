import json
import time

from flask import (
    jsonify,
    make_response,
)
from sqlalchemy import (
    select,
    desc,
    text,
)

from app.database import session

def make_cors_preflight_response():
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

def make_react_admin_response(result, ra_range=None):
    resp = jsonify(result)
    resp.headers.add('Access-Control-Allow-Origin', '*')
    resp.headers.add('Access-Control-Allow-Methods', '*')

    if ra_range:
        resp.headers.add('Access-Control-Expose-Headers', 'Content-Range')
        resp.headers.add('Content-Range', 'items {}-{}/{}'.format(ra_range[0], ra_range[1], result['total']))

    return resp

def ra_get_list_response(res_name, req, query):
    '''
    model must has to_dict method
    res_name: for debug
    range: default 20, max 1000
    '''
    if req.method == 'OPTIONS':
        return make_cors_preflight_response()

    payload = {
        'range': '',
    }
    if r := req.args.get('range'):
        payload['range'] = json.loads(r)
    if s := req.args.get('sort'):
        payload['sort'] = json.loads(s)
    # filter apply before
    #if f := req.args.get('filter'):
    #    payload['filter'] = json.loads(f)
    begin_time = time.time()
    # order_by must apply before limit/offset
    # apply payload from react-admin

    sort_by = payload['sort'][0]
    if 'sort' in payload:
        if payload['sort'][1] == 'ASC':
            query = query.order_by(text(sort_by))
        elif payload['sort'][1] == 'DESC':
            query = query.order_by(desc(text(sort_by)))

    if 'range' in payload and payload['range'] != '':
        start = payload['range'][0]
        end = payload['range'][1]
        limit = min(((end-start)+1), 1000)
        query = query.limit(limit).offset(start)

    total = query.count()

    # must limit items
    if payload['range'] == '':
        query = query.limit(20).offset(0)

    #print(query, 'query!!', query.all())
    rows = [x.to_dict() for x in query.all()]

    end_time = time.time()

    elapsed = end_time - begin_time
    if rows[0]:
        rows[0]['query_elapsed'] = elapsed # for react admin display

    result = {
        'data': rows,
        'total': total,
        'query': str(query),
        'elapsed': elapsed,
    }
    return make_react_admin_response(result, payload['range'])

def ra_item_response(res_name, obj):
    resp = jsonify(obj.to_dict())
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp

def ra_get_specimen_list_response(instance, req, query):

    payload = {
        'range': '',
    }
    if r := req.args.get('range'):
        payload['range'] = json.loads(r)
    if s := req.args.get('sort'):
        payload['sort'] = json.loads(s)

    total = 999
    begin_time = time.time()
    #stmt =  select(Unit).join(Unit.collection).join(Collection.collector).join(Collection.identifications)
    #query = session.query(Unit.id, Unit.dataset_id, Unit.accession_number, Unit.collection_id).join(Unit.collection).join(Collection.collector).join(Collection.identifications)

    #query =  session.query(Unit,func.count(Unit.id).over().label('total')).join(Unit.collection).join(Collection.collector).join(Collection.identifications)
    #query = query.where(Collection.id.in_([9321, 9322, 9323]))
    #query = query.where(Collection.id > 13400)

    #stmt = stmt.limit(10).offset(200)
    #result = session.execute(stmt)
    total = query.count()

    if 'range' in payload and payload['range'] != '':
        start = payload['range'][0]
        end = payload['range'][1]
        limit = min(((end-start)+1), 1000)
        query = query.limit(limit).offset(start)

    #query = session.query(instance).from_statement(stmt)
    rows = []
    for u in query.all():
        item = {
            'id': u.id,
            'accession_number': u.accession_number,
            'image_url': u.get_image(),
            'collection': {
                'field_number': u.collection.field_number,
                'collector': u.collection.collector.to_dict(),
                'collect_date': u.collection.collect_date,
                'identification_last': None,#u.collection.rder_by(Identification.verification_level).all()[0].to_dict() if u.collection.identifications else None, TODO JOIN
            }
        }
        rows.append(item)

    end_time = time.time()
    elapsed = end_time - begin_time
    if len(rows) > 0:
        rows[0]['query_elapsed'] = elapsed

    result = {
        'data': rows,
        'total': total,
        'query': str(query),
        'elapsed': elapsed,
    }
    return make_react_admin_response(result, payload['range'])
