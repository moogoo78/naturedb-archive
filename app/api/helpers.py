import json

from flask import (
    jsonify,
    make_response,
)
from sqlalchemy import (
    select,
    desc
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

def make_react_admin_response(result, ra_range):
    resp = jsonify(result)
    resp.headers.add('Access-Control-Allow-Origin', '*')
    resp.headers.add('Access-Control-Allow-Methods', '*')

    if ra_range:
        resp.headers.add('Access-Control-Expose-Headers', 'Content-Range')
        resp.headers.add('Content-Range', 'items {}-{}/{}'.format(ra_range[0], ra_range[1], result['total']))

    return resp

def apply_react_admin_query(query, payload):
    '''
    filter must apply before
    '''
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

def ra_get_list_response(res_name, req, query):
    '''
    model must has to_dict method
    res_name: for debug
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

    total = query.count()
    # order_by must apply before limit/offset
    if 'sort' in payload:
        if payload['sort'][1] == 'ASC':
            query = query.order_by(payload['sort'][0])
        elif payload['sort'][1] == 'DESC':
            query = query.order_by(desc(payload['sort'][0]))

    if 'range' in payload and payload['range'] != '':
        start = payload['range'][0]
        end = payload['range'][1]
        query = query.limit((end-start)+1).offset(start)

    rows = [x.to_dict() for x in query.all()]

    result = {
        'data': rows,
        'total': total
    }
    return make_react_admin_response(result, payload['range'])

def ra_item_response(res_name, req, obj):
    data = obj.to_dict()
    if req.method == 'PUT':
        for k, v in req.json.items():
            if v != data[k]:
                setattr(obj, k, v)
        session.commit()
    resp = jsonify(obj.to_dict())
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp
