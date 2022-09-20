import json
import time

from flask import (
    render_template,
    jsonify,
    request,
    current_app,
    abort,
    make_response,
)
from sqlalchemy import (
    select,
    func,
    text,
    desc,
    cast,
    between,
    Integer,
    extract,
    or_,
    inspect,
)

from flask.views import MethodView

from app.database import session
from app.models import (
    Collection,
    Person,
    NamedArea,
    AreaClass,
    Unit,
    Dataset,
    Organization,
    Identification,
    MeasurementOrFact,
    MeasurementOrFactParameter,
    LogEntry,
    collection_named_area,
    get_structed_list,
)
from app.taxon.models import (
    Taxon,
    TaxonRelation,
)
from app.api import api
from .helpers_react_admin import (
    ra_get_list_response,
    ra_item_response,
    make_cors_preflight_response,
    make_react_admin_response,
    ra_get_specimen_list_response,
    get_list_payload,
    ReactAdminProvider,
)

def allow_cors_preflight():
    response = make_response()
    response.headers.add("Access-Control-Allow-Origin", "*")
    response.headers.add('Access-Control-Allow-Headers', "*")
    response.headers.add('Access-Control-Allow-Methods', "*")
    return response

def allow_cors(data):
    resp = jsonify(data)
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp

@api.route('/auth', methods=['POST', 'OPTIONS'])
def auth():
    if request.method == 'OPTIONS':
        return make_cors_preflight_response()
    elif request.method == 'POST':
        payload = request.json

        data = {
            'err_msg': 'need check'
        }
        if payload['username'] == 'root' and payload['password'] == '1234':
            #data.update({'err_msg': ''})
            resp = jsonify(data)
            resp.headers.add('Access-Control-Allow-Origin', '*')
            resp.headers.add('Access-Control-Allow-Methods', '*')
            return resp
        else:
            #data.update({'err_msg': 'aoeus'})
            return abort(401)


@api.route('/<resource>/form')
def form_layout(resource):
    c = Collection()
    resp = jsonify({
        'data': c.to_dict(),
        'form': c.get_form_layout(),
    })
    resp.headers.add('Access-Control-Allow-Origin', '*')
    return resp


class AdminQuery(object):

    payload = None
    base_query = None
    query = None
    limit = 20
    offset = 0
    MAX_QUERY_RANGE = 1000
    func_mapping = None
    total = None

    def __init__(self, req, stmt, func_mapping=None, total=None):
        payload = {
            'filter': json.loads(req.args.get('filter')) if req.args.get('filter') else {},
            'sort': json.loads(req.args.get('sort')) if req.args.get('sort') else {},
            'range': json.loads(req.args.get('range')) if req.args.get('range') else [0, 20],
        }
        # print (payload['filter'], flush=True)
        start = int(payload['range'][0])
        end = int(payload['range'][1])

        if ft := payload.get('filter'):
            total = None  # re-count total
            if taxa := ft.get('taxon'):
                taxa_ids = []
                for x in taxa:
                    if t:= session.get(Taxon, x):
                        for c in t.get_children():
                            taxa_ids.append(c.id)

                # stmt = stmt.where(Identification.taxon_id.in_(taxon)) # strange join (not group?)
                stmt = stmt.where(Collection.last_taxon_id.in_(taxa_ids))

            if accession_number := ft.get('accession_number'):
                many_or = or_()
                for x in accession_number:
                    many_or = or_(many_or, Unit.accession_number==x)
                stmt = stmt.where(many_or)

            if collector := ft.get('collector'):
                stmt = stmt.where(Collection.collector_id.in_(collector))

            if field_number := ft.get('field_number'):
                many_or = or_()
                for x in field_number:
                    many_or = or_(many_or, Collection.field_number==x)
                stmt = stmt.where(many_or)

            if field_number_range := ft.get('field_number_range'):
                field_numbers = []
                for pair in field_number_range:
                    try:
                        values = list(range(int(pair[0]), int(pair[1])+1))
                        values = [str(x) for x in values]
                        field_numbers += values
                    except ValueError:
                        print('field_number_range value error', pair)

                if len(values):
                    stmt = stmt.where(Collection.field_number.in_(values))

            if collect_date := ft.get('collect_date'):
                # only pick one
                date_range = collect_date[0].split('/')
                stmt = stmt.where(
                    Collection.collect_date >= date_range[0],
                    Collection.collect_date <= date_range[1],
                )


        if len(payload['sort'].keys()) == 0:
            stmt = stmt.order_by(desc(Collection.id))
            #stmt = stmt.order_by(Collection.id)

        print(stmt, flush=True)

        self.limit = min((end-start), self.MAX_QUERY_RANGE)
        self.offset = start
        self.payload = payload
        self.base_query = stmt
        self.query = stmt.limit(self.limit)
        self.func_mapping = func_mapping
        self.total = total

        if start > 0:
            self.query = self.query.offset(self.offset)

    def get_result(self):
        begin_time = time.time()
        result = session.execute(self.query)
        elapsed = time.time() - begin_time

        # count total
        elapsed_count = None
        if self.total is None:
            begin_time = time.time()
            subq = self.base_query.subquery()
            new_stmt = select(func.count()).select_from(subq)
            self.total = session.execute(new_stmt).scalar()
            elapsed_count = time.time() - begin_time

        begin_time = time.time()
        data = []
        if func_mapping := self.func_mapping:
            for r in result.all():
                if r[0]: # no collection_id, only unit
                    data.append(func_mapping(r))

        resp = jsonify({
            'data': data,
            'total': self.total,
            'elapsed': elapsed,
            'elapsed_count': elapsed_count,
            'elapsed_mapping': time.time() - begin_time,
            'debug': {
                'query': str(self.query),
                'payload': self.payload,
            }
        })
        resp.headers.add('Access-Control-Allow-Origin', '*')
        resp.headers.add('Access-Control-Allow-Methods', '*')
        return resp

@api.route('/collections/<int:collection_id>', methods=['GET', 'PUT', 'DELETE', 'OPTIONS'])
def collection_item(collection_id):
    obj = session.get(Collection, collection_id)
    if not obj:
        return abort(404)

    if request.method == 'GET':
        data = obj.to_dict()
        return allow_cors({
            'data': data,
            'form': obj.get_form_layout()
        })

    elif request.method == 'OPTIONS':
        return allow_cors_preflight()

    elif request.method == 'PUT':
        changes = obj.update_from_json(request.json)
        log = LogEntry(
            model='Collection',
            item_id=collection_id,
            action='update',
            changes=changes)
        session.add(log)
        session.commit()

        return allow_cors(obj.to_dict())
    elif request.method == 'DELETE':
        session.delete(obj)
        session.commit()
        log = LogEntry(
            model='Collection',
            item_id=item.id,
            action='delete')
        session.add(log)
        session.commit()
        return allow_cors({})



@api.route('/search', methods=['GET'])
def get_search():
    q = request.args.get('q')
    data = []
    if q.isdigit():
        rows = Collection.query.filter(Collection.field_number.ilike(f'{q}%')).limit(10).all()
        for r in rows:
            collector = r.collector.display_name if r.collector and r.collector.display_name else ''
            data.append({'id': r.id, 'text': f'field_number:{r.collector.display_name()}{r.field_number}', 'category': 'field_number', 'collector_id': r.collector_id, 'field_number': r.field_number, 'collector': r.collector.display_name() if r.collector and r.collector.display_name() else ''})
        rows = Unit.query.filter(Unit.accession_number.ilike(f'{q}%')).limit(10).all()
        for r in rows:
            data.append({'id': r.id, 'text': f'accession_number:{r.accession_number}', 'category': 'accession_number'})
    else:
        rows = Person.query.filter(Person.full_name.ilike(f'%{q}%') | Person.atomized_name['en']['given_name'].astext.ilike(f'%{q}%') | Person.atomized_name['en']['inherited_name'].astext.ilike(f'%{q}%')).all()
        for r in rows:
            data.append({'id': r.id, 'text': f'collector:{r.display_name()}', 'category': 'collector'})

    resp = jsonify({
        'data': data,
    })
    resp.headers.add('Access-Control-Allow-Origin', '*')
    resp.headers.add('Access-Control-Allow-Methods', '*')
    return resp

@api.route('/explore', methods=['GET'])
def get_explore():
    # group by collection
    #stmt = select(Collection, func.array_agg(Unit.id), func.array_agg(Unit.accession_number)).select_from(Unit).join(Collection, full=True).group_by(Collection.id) #where(Unit.id>40, Unit.id<50)
    # TODO: full outer join cause slow
    #stmt = select(Collection, func.array_agg(Unit.id), func.array_agg(Unit.accession_number)).select_from(Collection).join(Unit).group_by(Collection.id)

    stmt = select(Unit.id, Unit.accession_number, Collection ).join(Collection)

    total = request.args.get('total', None)

    payload = {
        'filter': json.loads(request.args.get('filter')) if request.args.get('filter') else {},
        'sort': json.loads(request.args.get('sort')) if request.args.get('sort') else {},
        'range': json.loads(request.args.get('range')) if request.args.get('range') else [0, 20],
    }

    filtr = payload['filter']
    if accession_number := filtr.get('accession_number'):
        an_list = [accession_number]

        if accession_number2 := filtr.get('accession_number2'):
            # TODO validate
            an_int1 = int(accession_number)
            an_int2 = int(accession_number2)
            an_list = [str(x) for x in range(an_int1, an_int2+1)]
            if len(an_list) > 1000:
                an_list = [] # TODO flash

        stmt = stmt.where(Unit.accession_number.in_(an_list))
    if value := filtr.get('collector'):
        stmt = stmt.where(Collection.collector_id==value[0])
    if value := filtr.get('field_number'):
        if value2 := filtr.get('field_number2'):
            # TODO validate
            int1 = int(value)
            int2 = int(value2)
            fn_list = [str(x) for x in range(int1, int2+1)]
            if len(fn_list) > 1000:
                fn_list = [] # TODO flash

            many_or = or_()
            for x in fn_list:
                many_or = or_(many_or, Collection.field_number.ilike(f'{x}%'))
            stmt = stmt.where(many_or)
        else:
            stmt = stmt.where(Collection.field_number.ilike('%{}%'.format(value)))
    if value := filtr.get('collect_date'):
        if value2 := filtr.get('collect_date2'):
            stmt = stmt.where(Collection.collect_date>=value, Collection.collect_date<=value2)
        else:
            stmt = stmt.where(Collection.collect_date==value)
    if value := filtr.get('collect_month'):
        stmt = stmt.where(extract('month', Collection.collect_date) == value)
    if scientific_name := filtr.get('scientific_name'): # TODO variable name
        if t := session.get(Taxon, scientific_name[0]):
            taxa_ids = [x.id for x in t.get_children()]
            stmt = stmt.where(Collection.proxy_taxon_id.in_(taxa_ids))
    if taxa := filtr.get('species'):
        if t := session.get(Taxon, taxa[0]):
            taxa_ids = [x.id for x in t.get_children()]
            stmt = stmt.where(Collection.proxy_taxon_id.in_(taxa_ids))
    elif taxa := filtr.get('genus'):
        if t := session.get(Taxon, taxa[0]):
            taxa_ids = [x.id for x in t.get_children()]
            stmt = stmt.where(Collection.proxy_taxon_id.in_(taxa_ids))
    elif taxa := filtr.get('family'):
        if t := session.get(Taxon, taxa[0]):
            taxa_ids = [x.id for x in t.get_children()]
            stmt = stmt.where(Collection.proxy_taxon_id.in_(taxa_ids))

    if value := filtr.get('locality_text'):
        stmt = stmt.where(Collection.locality_text.ilike(f'%{value}%'))
    if value := filtr.get('municipality'):
        stmt = stmt.where(Collection.named_areas.any(id=value[0]))
    if value := filtr.get('country'):
        stmt = stmt.where(Collection.named_areas.any(id=value[0]))
    if value := filtr.get('state_province'):
        stmt = stmt.where(Collection.named_areas.any(id=value[0]))
    if value := filtr.get('county'):
        stmt = stmt.where(Collection.named_areas.any(id=value[0]))
    if value := filtr.get('locality'):
        stmt = stmt.where(Collection.named_areas.any(id=value[0]))
    if value := filtr.get('national_park'):
        stmt = stmt.where(Collection.named_areas.any(id=value[0]))
    if value := filtr.get('locality_text'):
        stmt = stmt.where(Collection.locality_text.ilike(f'%{value}%'))
    if value := filtr.get('altitude'):
        value2 = filtr.get('altitude2')
        if cond := filtr.get('altitude_condiction'):
            if cond == 'eq':
                stmt = stmt.where(Collection.altitude==value)
            elif cond == 'gte':
                stmt = stmt.where(Collection.altitude>=value)
            elif cond == 'lte':
                stmt = stmt.where(Collection.altitude<=value)
            elif cond == 'between' and value2:
                stmt = stmt.where(Collection.altitude>=value, Collection.altitude2<=value2)
        else:
            stmt = stmt.where(Collection.altitude==value)

    base_stmt = stmt

    # limit & offset
    start = int(payload['range'][0])
    end = int(payload['range'][1])
    limit = min((end-start), 1000) # max query range
    stmt = stmt.limit(limit)
    if start > 0:
        stmt = stmt.offset(start)

    # =======
    # results
    # =======
    begin_time = time.time()
    result = session.execute(stmt)
    elapsed = time.time() - begin_time

    # -----------
    # count total
    # -----------
    elapsed_count = None
    if total is None:
        begin_time = time.time()
        subquery = base_stmt.subquery()
        count_stmt = select(func.count()).select_from(subquery)
        total = session.execute(count_stmt).scalar()
        elapsed_count = time.time() - begin_time


    # --------------
    # result mapping
    # --------------
    data = []
    begin_time = time.time()
    elapsed_mapping = None
    for r in result.all():
        elapsed_mapping = time.time() - begin_time
        if c := r[2]:
            image_url = ''
            try:
                accession_number_int = int(r[0])
                instance_id = f'{accession_number_int:06}'
                first_3 = instance_id[0:3]
                image_url = f'https://brmas-pub.s3-ap-northeast-1.amazonaws.com/hast/{first_3}/S_{instance_id}_s.jpg'
            except:
                pass

            data.append({
                'unit_id': r[0],
                'accession_number': r[1],
                'image_url': image_url,
                'field_number': c.field_number,
                'collector': c.collector.to_dict() if c.collector else '',
                'collect_date': c.collect_date.strftime('%Y-%m-%d') if c.collect_date else '',
                'taxon': c.proxy_taxon_text,
                'named_areas': [x.to_dict() for x in c.named_areas],
                'locality_text': c.locality_text,
                'altitude': c.altitude,
                'altitude2': c.altitude2,
                'longitude_decimal': c.longitude_decimal,
                'latitude_decimal': c.latitude_decimal,
            })

    resp = jsonify({
        'data': data,
        'total': total,
        'elapsed': elapsed,
        'elapsed_count': elapsed_count,
        'elapsed_mapping': elapsed_mapping,
        'debug': {
            'query': str(stmt),
            'payload': payload,
        }
    })
    resp.headers.add('Access-Control-Allow-Origin', '*')
    resp.headers.add('Access-Control-Allow-Methods', '*')
    return resp


@api.route('/collections', methods=['GET', 'POST', 'OPTIONS'])
def collection():
    if request.method == 'GET':
        # group by collection
        #stmt = select(Collection, func.array_agg(Unit.id), func.array_agg(Unit.accession_number)).select_from(Unit).join(Collection, full=True).group_by(Collection.id) #where(Unit.id>40, Unit.id<50)
        # TODO: full outer join cause slow
        #stmt = select(Collection, func.array_agg(Unit.id), func.array_agg(Unit.accession_number)).select_from(Collection).join(Unit).group_by(Collection.id)

        stmt = select(Collection)

        total = request.args.get('total', None)
        payload = {
            'filter': json.loads(request.args.get('filter')) if request.args.get('filter') else {},
            'sort': json.loads(request.args.get('sort')) if request.args.get('sort') else {},
            'range': json.loads(request.args.get('range')) if request.args.get('range') else [0, 20],
        }

        # ======
        # filter
        # ======
        filtr = payload['filter']
        if accession_number := filtr.get('accession_number'):
            an_list = [accession_number]
            if accession_number2 := filtr.get('accession_number2'):
                # TODO validate
                an_int1 = int(accession_number)
                an_int2 = int(accession_number2)
                an_list = [str(x) for x in range(an_int1, an_int2+1)]
                if len(an_list) > 1000:
                    an_list = [] # TODO flash

            stmt_unit = select(Unit.collection_id) \
                .where(Unit.accession_number.in_(an_list))
            units = session.execute(stmt_unit)
            collection_ids = [x[0] for x in units]
            stmt = stmt.where(Collection.id.in_(collection_ids))
        if common_name := filtr.get('common_name'): # TODO variable name
            if t := session.get(Taxon, common_name[0]):
                taxa_ids = [x.id for x in t.get_children()]
                stmt = stmt.where(Collection.proxy_taxon_id.in_(taxa_ids))
        if taxa := filtr.get('species'):
            print (taxa, flush=True)
            if t := session.get(Taxon, taxa[0]):
                taxa_ids = [x.id for x in t.get_children()]
                stmt = stmt.where(Collection.proxy_taxon_id.in_(taxa_ids))
            elif taxa := filtr.get('genus'):
                if t := session.get(Taxon, taxa[0]):
                    taxa_ids = [x.id for x in t.get_children()]
                    stmt = stmt.where(Collection.proxy_taxon_id.in_(taxa_ids))
            elif taxa := filtr.get('species'):
                if t := session.get(Taxon, taxa[0]):
                    taxa_ids = [x.id for x in t.get_children()]
        if value := filtr.get('collector'):
            stmt = stmt.where(Collection.collector_id==value[0])
        if value := filtr.get('field_number'):
            if value2 := filtr.get('field_number2'):
                # TODO validate
                int1 = int(value)
                int2 = int(value2)
                fn_list = [str(x) for x in range(int1, int2+1)]
                if len(fn_list) > 1000:
                    fn_list = [] # TODO flash

                many_or = or_()
                for x in fn_list:
                    many_or = or_(many_or, Collection.field_number.ilike(f'{x}%'))
                stmt = stmt.where(many_or)

            else:
                stmt = stmt.where(Collection.field_number.ilike('%{}%'.format(value)))
        if value := filtr.get('collect_date'):
            print(value, 'c', flush=True)
        base_stmt = stmt

        # limit & offset
        start = int(payload['range'][0])
        end = int(payload['range'][1])
        limit = min((end-start), 1000) # max query range
        stmt = stmt.limit(limit)
        if start > 0:
            stmt = stmt.offset(start)

        # =======
        # results
        # =======
        begin_time = time.time()
        result = session.execute(stmt)
        elapsed = time.time() - begin_time

        # -----------
        # count total
        # -----------
        elapsed_count = None
        if total is None:
            begin_time = time.time()
            subquery = base_stmt.subquery()
            count_stmt = select(func.count()).select_from(subquery)
            total = session.execute(count_stmt).scalar()
            elapsed_count = time.time() - begin_time

        # --------------
        # result mapping
        # --------------
        data = []
        begin_time = time.time()
        elapsed_mapping = None
        for r in result.all():
            if c := r[0]: # no collection_id, only unit
                units = []
                for u in c.units:
                    unit = {
                        'id': u.id,
                        'accession_number': u.accession_number,
                    }
                    image_url = ''
                    # TODO
                    try:
                        accession_number_int = int(u.accession_number)
                        instance_id = f'{accession_number_int:06}'
                        first_3 = instance_id[0:3]
                        image_url = f'https://brmas-pub.s3-ap-northeast-1.amazonaws.com/hast/{first_3}/S_{instance_id}_s.jpg'
                    except:
                        pass

                    if image_url:
                        unit['image_url'] = image_url

                    units.append(unit)

                data.append({
                    'id': c.id,
                    'field_number': c.field_number,
                    'collector': c.collector.to_dict() if c.collector else '',
                    'collect_date': c.collect_date.strftime('%Y-%m-%d') if c.collect_date else '',
                    'taxon': c.proxy_taxon_text,
                    'units': units,
                    'named_areas': [x.to_dict() for x in c.named_areas],
                })
            else:
                print(r, flush=True)
        elapsed_mapping = time.time() - begin_time

        resp = jsonify({
            'data': data,
            'total': total,
            'elapsed': elapsed,
            'elapsed_count': elapsed_count,
            'elapsed_mapping': elapsed_mapping,
            'debug': {
                'query': str(stmt),
                'payload': payload,
            }
        })
        resp.headers.add('Access-Control-Allow-Origin', '*')
        resp.headers.add('Access-Control-Allow-Methods', '*')
        return resp

    elif request.method == 'OPTIONS':
        return allow_cors_preflight()

    elif request.method == 'POST':
        collection = Collection()
        changes = collection.update_from_json(request.json)
        session.add(collection)
        session.commit()
        log = LogEntry(
            model='Collection',
            item_id=collection.id,
            action='insert',
            changes=changes)
        session.add(log)
        session.commit()

        return allow_cors(collection.to_dict())


def make_specimen_list_response(req):
    payload = {
        'filter': {},
        'sort': {},
        'range': [0, 10],
    }
    for k in ['range', 'sort', 'filter']:
        if v := req.args.get(k, ''):
            payload.update({
                f'{k}': json.loads(v)
            })

    begin_time = time.time()
    query = Unit.query.join(Unit.collection).join(Collection.collector) #.join(Collection.identifications)
    #stmt = select(Collection.id,Collection.collect_date, Collection.field_number, Unit.id, Person.full_name, Person.id, NamedArea.id).select_from(Person).select_from(NamedArea).join(Collection).join(Unit).limit(80)
    #query = None
    #result = session.execute(stmt)
    #print(stmt, flush=True)
    #for i in result:
    #    print(i, flush=True)

    query = Collection.query.join(Unit.collection).join(Collection.collector)


    print('payload', payload, flush=True)
    '''
    # filter
    if x:= payload['filter'].get('accession_number'):
        query = query.filter(Unit.accession_number.ilike(f'%{x}%'))

    if x:= payload['filter'].get('scientific_name'):
        query = query.filter(Collection.last_taxon_text.ilike(f'%{x}%'))

    has_query_field_number = False
    if collector_id := payload['filter'].get('collector_id'):
        has_query_field_number = False
        query = query.filter(Person.id == collector_id)
    if fn2:= payload['filter'].get('field_number2'):
        if fn1 := payload['filter'].get('field_number'):
            fn1_int = int(fn1)
            fn2_int = int(fn2)
            if fn2_int - fn1_int > 0:
                num_list = list(map(str, list(range(fn1_int, fn2_int+1))))
                has_query_field_number = True
                query = query.filter(Collection.field_numberq.in_(num_list))
    elif x:= payload['filter'].get('field_number'):
        has_query_field_number = True
        query = query.filter(Collection.field_number.ilike(f'%{x}%'))

    if has_query_field_number:
        query = query.order_by(Collection.field_number)

    has_query_collect_date = False
    if cd2 := payload['filter'].get('collect_date2'):
        if cd1 := payload['filter'].get('collect_date'):
            has_query_collect_date =True
            query = query.filter(between(Collection.collect_date, cd1, cd2))
    elif x:= payload['filter'].get('collect_date'):
        has_query_collect_date =True
        query = query.filter(Collection.collect_date==x)
    if x:= payload['filter'].get('collect_date__month'):
        has_query_collect_date =True
        query = query.filter(extract('month', Collection.collect_date) == x)
    if x:= payload['filter'].get('collect_date__year'):
        has_query_collect_date =True
        query = query.filter(extract('year', Collection.collect_date) == x)
    if has_query_collect_date:
        query = query.order_by(desc(Collection.collect_date))

    #TODO
    #if x:= payload['filter'].get('locality'):
    #    query = query.filter(Collection.namedAreas.ilike(f'%{x}%'))
    '''
    total = query.count()
    rows = []

    if 'sort' in payload and len(payload['sort']):
        sort_by = payload['sort'][0]
        #if sort_by == 'accession_number':
        #    sort_by = cast(func.nullif(Unit.accession_number, ''), Integer)
        #elif sort_by == 'unit.id':
        #    sort_by = text('unit.id')
        if sort_by == 'collectionKey':
            sort_by = text('person.full_name, collection.field_number')
        if payload['sort'][1] == 'ASC':
            query = query.order_by(sort_by)
        elif payload['sort'][1] == 'DESC':
            query = query.order_by(desc(sort_by))

    if 'range' in payload and payload['range'] != '':
        try:
            start = int(payload['range'][0])
            end = int(payload['range'][1])+1
        except:
            start = 0
            end = 20

        limit = min((end-start), 1000)
        #print(start, end, limit, flush=True)

        if start > 0:
            query = query.limit(limit).offset(start)
        else:
            query = query.limit(limit)

    rows = []
    for collection in query.all():
        #stmt = select(func.max(Identification.verification_level)).join(Taxon).where(u.collection.id==Identif

        #ids = u.collection.identifications.order_by(Identification.verification_level).all()
        #last_id = None
        #if len(ids) > 0:
        #    last_id = ids[-1]

        #'identification_last': None,#u.collection.rder_by(Identification.verification_level).all()[0].to_dict0() if u.collection.identifications else None, TODO JOIN
        #print(len(rows), collection.id )
        rows.append(collection.to_dict2())
        #print(collection.to_dict2())

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

class CollectionSpecimenMethodView(MethodView):
    RESOURCE_NAME = 'specimens'
    #Collections
    model = Unit

    def get(self, item_id):
        if item_id is None:
            # item_list
            #stmt = select([Unit.id, Unit.accession_number]).join(Unit.collection).join(Collection.collector).join(Collection.identifications)

            #subquery = session.query(Identification.collection_id).filter().subquery()
            #print(query, flush=True)
            #for x in query.all()[:10]:
            #    print(x.to_dict())
            #print(request.args, flush=True)
            #if filter_str := request.args.get('filter', ''):
                #print(filter_str, request.args, flush=True)
            #    filter_dict = json.loads(filter_str)
            #    if keyword := filter_dict.get('q', ''):
            #        query = query.filter(Person.full_name.ilike(f'%{keyword}%'))
                #if keyword := filter_dict.get('q', ''):
                #    query = query.join(Collection.collector).join(Collection.identifications).join(Identification.taxon).filter(Person.full_name.ilike(f'%{keyword}%') | Collection.field_number.ilike(f'%{keyword}%') | Taxon.full_scientific_name.ilike(f'%{keyword}%') | Unit.accession_number.ilike(f'%{keyword}%'))
            #    if collector_id := filter_dict.get('collector_id'):
            #        query = query.filter(Person.id==collector_id)
                #if dataset_ids := filter_dict.get('dataset_id'):
                # TODO, query 順序不對
                #    query = query.join(Unit.collection).filter(Unit.dataset_id.in_(dataset_ids))
            #return jsonify({})
            #return ra_get_list_response('specimens', request, query)
            return make_specimen_list_response(request)
        else:
            # single item
            #obj = session.get(Collection, item_id)
            obj = session.get(Unit, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        obj = self._modify(obj, request.json)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        obj = self._modify(obj, request.json)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()

    def _modify(self, obj, data):
        print(data, flush=True)

        if x:= data.get('accession_number'):
            obj.accession_number = x
        if x:= data.get('duplication_number'):
            obj.duplication_number = x

        c = data['collection']
        # gathering
        if x:= c.get('collector_id'):
            obj.collection.collector_id = x
        if x:= c.get('collect_date'):
            obj.collection.collect_date = x
        if x:= c.get('field_number'):
            obj.collection.field_number = x
        # locality
        if x:= c.get('locality_text'):
            obj.collection.locality_text = x
        if x:= c.get('longitude_decimal'):
            obj.collection.longitude_decimal = x
        if x:= c.get('latitude_decimal'):
            obj.collection.latitude_decimal = x
        if x:= c.get('altitude'):
            obj.collection.altitude = x
        if x:= c.get('altitude2'):
            obj.collection.altitude2 = x


        '''na_list = obj.get_named_area_list()
        print(na_list, flush=True)
        # locality
        for idx, x in enumerate(['country', 'province', 'hsien', 'town', 'park', 'locality']):
            k = f'named_area__{x}_id'
            if v := data.get(k):
                if na_list[idx]['data']:
                    if v != na_list[idx]['data']['id']:
                        cna = CollectionNamedArea.query.filter(CollectionNamedArea.collection_id==obj.id, CollectionNamedArea.named_area_id==v).first()
                        if cna:
                            cna.named_area_id = v
                else:
                    cna = CollectionNamedArea(collection_id=obj.id, named_area_id=v)
                    session.add(cna)
        '''
        if not obj.id:
            session.add(obj)

        session.commit()

        # NamedArea list
        #if len(named_area_list) > 0:
        #    for i in named_area_list:
        #        cna = CollectionNamedArea(collection_nameid=obj.id, named_area_id=i)
        #        session.add(cna)
        #    session.commit()

        return obj

class TaxonMethodView(MethodView):
    RESOURCE_NAME = 'taxon'
    model = Taxon
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                if keyword := filter_dict.get('q', ''):
                    like_key = f'{keyword}%' if len(keyword) == 1 else f'%{keyword}%'
                    query = query.filter(Taxon.full_scientific_name.ilike(like_key) | Taxon.common_name.ilike(like_key))
                if ids := filter_dict.get('id', ''):
                    query = query.filter(Taxon.id.in_(ids))
                if rank := filter_dict.get('rank'):
                    query = query.filter(Taxon.rank==rank)
                if pid := filter_dict.get('parent_id'):
                    if parent := session.get(Taxon, pid):
                        depth = Taxon.RANK_HIERARCHY.index(parent.rank)
                        taxa_ids = [x.id for x in parent.get_children(depth)]
                        query = query.filter(Taxon.id.in_(taxa_ids))

            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        obj = self._modify(obj, request.json)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        obj = self._modify(obj, request.json)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()

    def _modify(self, obj, data):
        for i, v in data.items():
            # available types: str, int, NoneType
            if i != 'id' and isinstance(v, str | int | None) and hasattr(obj, i):
                setattr(obj, i, v)

        if not obj.id:
            session.add(obj)

        session.commit()
        return obj


class UnitMethodView(MethodView):
    RESOURCE_NAME = 'unit'
    model = Unit
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                if unit_ids := filter_dict.get('id'):
                    id_list = []
                    for x in unit_ids:
                        id_list += x
                    print(id_list)
                    query = query.filter(Unit.id.in_(id_list))
                    print(unit_ids, flush=True)
            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                if keyword := filter_dict.get('q', ''):
                    #query = query.filter(ScientificName.full_scientific_name.ilike(f'%{keyword}%'))
                    pass
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        print (request.json, request.args, flush=True)
        #for i, v in request.json.items():
        #    setattr(obj, i, v)
        #session.add(obj)
        #session.commit()
        obj = self._modify(obj, request.json)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        if obj := session.get(self.model, item_id):
            session.delete(obj)
            session.commit()
            return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        if obj := session.get(self.model, item_id):
            obj = self._modify(obj, request.json)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()

    def _modify(self, obj, data):
        if 'accession_number__quick' in data.keys():
            # post from collection ouick button
            obj.collection_id = data.get('id')
            obj.accession_number = data.get('accession_number__quick')
            obj.duplication_number = data.get('duplication_number__quick')
        else:
            for i, v in data.items():
                # available types: str, int, NoneType
                if i != 'id' and isinstance(v, str | int | None) and hasattr(obj, i):
                    setattr(obj, i, v)

        if not obj.id:
            session.add(obj)

        session.commit()
        return obj

class AreaClassMethodView(MethodView):
    RESOURCE_NAME = 'area_class'
    model = AreaClass
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query.order_by('id')
            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()


class NamedAreaMethodView(MethodView):
    RESOURCE_NAME = 'named_area'
    model = NamedArea
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                if keyword := filter_dict.get('q', ''):
                    like_key = f'{keyword}%' if len(keyword) == 1 else f'%{keyword}%'
                    query = query.filter(NamedArea.name.ilike(like_key) | NamedArea.name_en.ilike(like_key))
                if ids := filter_dict.get('id', ''):
                    query = query.filter(NamedArea.id.in_(ids))
                if area_class_id := filter_dict.get('area_class_id', ''):
                    query = query.filter(NamedArea.area_class_id==area_class_id)
                if parent_id := filter_dict.get('parent_id'):
                    query = query.filter(NamedArea.parent_id==parent_id)
                    # print(query, flush=True)

            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()

def collection_mapping(row):
    #print(row, row[0].id, flush=True)
    units = []
    for k, v in enumerate(row[1]):
        unit = {'id': v}
        image_url = ''
        # TODO
        try:
            accession_number_int = int(x)
            instance_id = f'{accession_number_int:06}'
            first_3 = instance_id[0:3]
            image_url = f'https://brmas-pub.s3-ap-northeast-1.amazonaws.com/hast/{first_3}/S_{instance_id}_s.jpg'
        except:
            pass

        if x:= row[2][k]:
            unit['accession_number'] = x
            unit['image_url'] = image_url
        units.append(unit)

    c = row[0]
    #units = [x.to_dict() for x in c.units]
    #print (row, flush=True)

    na_list = [x.name for x in c.named_areas]
    taxon = session.get(Taxon, c.last_taxon_id)
    return {
        'id': c.id,
        #'collector_id': c.collector_id,
        'collector': c.collector.to_dict() if c.collector else '',
        'display_name': c.collector.display_name() if c.collector else '',
        'field_number': c.field_number,
        'collect_date': c.collect_date.strftime('%Y-%m-%d') if c.collect_date else '',
        'last_taxon_text': c.last_taxon_text,
        'last_taxon_id': c.last_taxon_id,
        'last_taxon_common_name': taxon.common_name if taxon and taxon.common_name else '',
        'named_areas': ', '.join(na_list),
        'units': units
    }

class CollectionMethodView(MethodView):
    RESOURCE_NAME = 'collections'
    model = Collection

    def get(self, item_id):
        if item_id is None:
            # item_list
            stmt = select(Collection, func.array_agg(Unit.id), func.array_agg(Unit.accession_number)).select_from(Unit).join(Collection, full=True).group_by(Collection.id) #where(Unit.id>40, Unit.id<50)
            # TODO: full outer join cause slow
            #stmt = select(Collection, func.array_agg(Unit.id), func.array_agg(Unit.accession_number)).select_from(Collection).join(Unit).group_by(Collection.id)

            total = None
            if t := request.args.get('total'):
                total = int(t)
            admin_query = AdminQuery(request, stmt, collection_mapping, total=total)
            #admin_query = AdminQuery(request, stmt, lambda x: x[0].to_dict())

            # print(stmt, flush=True)
            return admin_query.get_result()

        else:
            # single item
            obj = session.get(self.model, item_id)
            data = obj.to_dict()

            resp = jsonify({
                'data': data,
                'form': obj.get_form_layout()
            })
            resp.headers.add('Access-Control-Allow-Origin', '*')
            return resp

    def post(self):
        # create
        collection = Collection()
        changes = collection.update_from_json(request.json)
        log = LogEntry(
            model='Collection',
            item_id=collection.id,
            action='insert',
            changes=changes)
        session.add(log)
        session.commit()

        resp = jsonify(collection.to_dict())
        resp.headers.add('Access-Control-Allow-Origin', '*')
        return resp

    def delete(self, item_id):
        # delete a single user
        if obj := session.get(self.model, item_id):
            session.delete(obj)
            session.commit()
            log = LogEntry(
                model='Collection',
                item_id=item.id,
                action='delete')
            session.add(log)
            session.commit()

            resp = jsonify({})
            resp.headers.add('Access-Control-Allow-Origin', '*')
            return resp

    def put(self, item_id):
        # update
        if obj := session.get(self.model, item_id):
            changes = obj.update_from_json(request.json)
            log = LogEntry(
                model='Collection',
                item_id=item_id,
                action='update',
                changes=changes)
            session.add(log)
            session.commit()

            resp = jsonify(obj.to_dict())
            resp.headers.add('Access-Control-Allow-Origin', '*')
            return resp

    def options(self, item_id):
        return make_cors_preflight_response()


class PersonMethodView(MethodView):

    def get(self, item_id):
        if item_id is None:
            # item_list
            query = Person.query
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                collector_id = None
                if keyword := filter_dict.get('q', ''):
                    like_key = f'{keyword}%' if len(keyword) == 1 else f'%{keyword}%'
                    query = query.filter(Person.full_name.ilike(like_key) | Person.atomized_name['en']['given_name'].astext.ilike(like_key) | Person.atomized_name['en']['inherited_name'].astext.ilike(like_key))
                if is_collector := filter_dict.get('is_collector', ''):
                    query = query.filter(Person.is_collector==True)
                if is_identifier := filter_dict.get('is_identifier', ''):
                    query = query.filter(Person.is_identifier==True)

                if x := filter_dict.get('collector_id', ''):
                    collector_id = x
                if x := filter_dict.get('id', ''):
                    query = query.filter(Person.id.in_(x))
                #if collector_id:
                #    if isinstance(collector_id, list):
                #        collector_id = x[0]
                #query = query.filter(Person.id==collector_id)

            return ra_get_list_response('people', request, query)
        else:
            # single item
            obj = session.get(Person, item_id)
            return ra_item_response('people', obj)

    def post(self, item_id):
        # create
        obj = Person()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response('people', obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(Person, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response('people',  obj)

    def put(self, item_id):
        # update
        #obj = session.get(Person, item_id)
        query = Person.query.filter(Person.id==item_id)
        if obj := query.first():
            query.update(values=request.json)
            session.commit()
            return ra_item_response('people', obj)

    def options(self, item_id):
        return make_cors_preflight_response()

class DatasetMethodView(MethodView):
    RESOURCE_NAME = 'dataset'
    model = Dataset
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()

class OrganizationMethodView(MethodView):
    RESOURCE_NAME = 'organization'
    model = Organization
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()


class IdentificationMethodView(MethodView):
    RESOURCE_NAME = 'identification'
    model = Identification
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create

        data = request.json
        print('post', data, flush=True)
        # quick dialog use post for both edit & new
        if not item_id:
            if 'taxon_id__new' in data.keys():
                obj = Identification()
                obj.collection_id = data['collection']['id']
                obj.taxon_id = data.get('taxon_id__new')
                obj.identifier_id = data.get('identifier_id__new')
                obj.date = data.get('date__new')
                obj.date_text = data.get('date_text__new')
                obj.sequence = data.get('sequence__new')
                session.add(obj)
                session.commit()
            elif iden_id := data.get('id'):
                if obj := Identification.query.filter(Identification.id==iden_id).first():
                    obj.taxon_id = data.get('taxon_id')
                    obj.identifier_id = data.get('identifier_id')
                    obj.date = data.get('date')
                    obj.date_text = data.get('date_text')
                    obj.sequence = data.get('sequence')

                    session.commit()

        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        #return ra_item_response(self.RESOURCE_NAME, obj)
        resp = jsonify({})
        resp.headers.add('Access-Control-Allow-Origin', '*')
        return resp

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        obj = self._modify(obj, request.json)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()

    def _modify(self, obj, data):
        #print ('!!', data, obj.id, flush=True)
        # TODO
        pass
        return obj


class MeasurementOrFactsMethodView(MethodView):
    RESOURCE_NAME = 'measurement_or_facts'
    model = MeasurementOrFact
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            if filter_str := request.argsh.get('filter', ''):
                filter_dict = json.loads(filter_str)
                if collection_id := filter_dict.get('collection_id', ''):
                    query = query.filter(MeasurementOrFact.collection_id==collection_id)
            return ra_get_list_response(self.RESOURCE_NAME, request, query)
        else:
            # single item
            obj = session.get(self.model, item_id)
            return ra_item_response(self.RESOURCE_NAME, obj)

    def post(self, item_id):
        # create
        obj = self.model()
        for i, v in request.json.items():
            setattr(obj, i, v)
        session.add(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def delete(self, item_id):
        # delete a single user
        obj = session.get(self.model, item_id)
        session.delete(obj)
        session.commit()
        return ra_item_response(self.RESOURCE_NAME, obj)

    def put(self, item_id):
        # update
        obj = session.get(self.model, item_id)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()
