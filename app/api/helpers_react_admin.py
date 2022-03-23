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
    func,
)
from sqlalchemy.orm import lazyload

from app.database import session

from app.models import Unit

class ReactAdminProvider(object):

    payload = None
    query = None
    base_query = None
    stmt = None
    limit = 20
    offset = 0
    MAX_QUERY_RANGE = 1000

    def __init__(self, req, stmt):
        payload = {
            'filter': json.loads(req.args.get('filter')) if req.args.get('filter') else {},
            'sort': json.loads(req.args.get('sort')) if req.args.get('sort') else {},
            'range': json.loads(req.args.get('range')) if req.args.get('range') else [0, 10],
        }

        # append payload to query
        '''
        if 'sort' in payload and len(payload['sort']):
            sort_by = payload['sort'][0]
            #if sort_by == 'accession_number':
            #    sort_by = cast(func.nullif(Unit.accession_number, ''), Integer)
            #elif sort_by == 'unit.id':
            #    sort_by = text('unit.id')
            if sort_by == 'collectionKey':
                #sort_by = text('person.full_name, collection.field_number')
                pass
            if payload['sort'][1] == 'ASC':
                query = query.order_by(sort_by)
            elif payload['sort'][1] == 'DESC':
                query = query.order_by(desc(sort_by))
        '''
        if 'range' in payload and payload['range'] != '':
            try:
                start = int(payload['range'][0])
                end = int(payload['range'][1])
            except:
                pass

            self.limit = min((end-start)+1, self.MAX_QUERY_RANGE)
            self.offset = start

        self.payload = payload
        #self.query = query
        self.base_query = stmt

    def get_result(self, mapping_func=None, count_total=None):
        total = 0
        if count_total:
            total = count_total

        if self.offset > 0:
            #self.query = self.query.limit(self.limit).offset(self.start)
            self.query = self.base_query.limit(self.limit).offset(self.offset)
        else:
            #self.query = self.query.limit(self.limit)
            self.query = self.base_query.limit(self.limit)

        rows = []
        begin_time = time.time()
        print(self.query, self.offset, self.limit, flush=True)
        result = session.execute(self.query)
        for r in result.all():
            if mapping_func:
                rows.append(mapping_func(r))

        end_time = time.time()

        elapsed = end_time - begin_time
        if len(rows) > 0:
            rows[0]['query_elapsed'] = elapsed

        result = {
            'data': rows,
            'total': total,
            'query': str(self.query),
            'elapsed': elapsed,
            'payload': self.payload,
        }
        self.result = result

        return self.add_cors_header(result, self.payload['range'])

    def add_cors_header(self, result, ra_range):
        resp = jsonify(result)
        resp.headers.add('Access-Control-Allow-Origin', '*')
        resp.headers.add('Access-Control-Allow-Methods', '*')

        if ra_range:
            resp.headers.add('Access-Control-Expose-Headers', 'Content-Range')
            resp.headers.add('Content-Range', 'items {}-{}/{}'.format(ra_range[0], ra_range[1], result['total']))

        return resp

def get_list_payload(req):
    payload = {
        'filter': json.loads(req.args.get('filter')) if req.args.get('filter') else {},
        'sort': json.loads(req.args.get('sort')) if req.args.get('sort') else {},
        'range': json.loads(req.args.get('range')) if req.args.get('range') else [0, 10],
    }
    return payload


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

    if 'sort' in payload:
        sort_by = payload['sort'][0]
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
    if len(rows) and rows[0]:
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
