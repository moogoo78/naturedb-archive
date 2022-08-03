import json
import time

from flask import (
    render_template,
    jsonify,
    request,
    current_app,
    abort,
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
    collection_named_area,
    #CollectionNamedArea,
)
from app.taxon.models import (
    Taxon,
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
# from app.utils import (
#    update_or_create,
# )


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
                query = query.filter(Collection.field_number.in_(num_list))
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
                    query = query.filter(Taxon.full_scientific_name.ilike(f'%{keyword}%') | Taxon.common_name.ilike(f'%{keyword}%'))
                if ids := filter_dict.get('id', ''):
                    query = query.filter(Taxon.id.in_(ids))
                if rank := filter_dict.get('rank'):
                    query = query.filter(Taxon.rank==rank)

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
        #print (item_id, request.args)
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
                    query = query.filter(NamedArea.name.ilike(f'%{keyword}%') | NamedArea.name_en.ilike(f'%{keyword}%'))
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
        if x:= row[2][k]:
            unit['accession_number'] = x
            accession_number_int = int(x)
            instance_id = f'{accession_number_int:06}'
            first_3 = instance_id[0:3]
            image_url = f'https://brmas-pub.s3-ap-northeast-1.amazonaws.com/hast/{first_3}/S_{instance_id}_s.jpg'
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
            # default options
            data['form_options'] = obj.get_form_options()
            resp = jsonify(data)
            resp.headers.add('Access-Control-Allow-Origin', '*')
            return resp

    def post(self, item_id):
        # create
        obj = Collection()
        obj = self._update_or_create(obj, request.json)
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
        obj = self._update_or_create(obj, request.json)
        return ra_item_response(self.RESOURCE_NAME, obj)

    def options(self, item_id):
        return make_cors_preflight_response()

    def _update_or_create(self, obj, params):
        ret = {}
        # print(params, obj, obj.id, flush=True)

        if not obj.id:
            session.add(obj)
            session.commit()

        for k, v in params.items():
            if k == 'named_areas':
                new_named_area_ids = [x[1] for x in v if x[1]]
                obj.named_areas = NamedArea.query.filter(NamedArea.id.in_(new_named_area_ids)).all()
            elif k == 'biotopes':
                biotopes = []
                for parameter_id, values in v:
                    mof = None
                    if values and len(values) > 0:
                        if mof_id := values[0]:
                            mof = session.get(MeasurementOrFact, mof_id)
                        else:
                            mof = MeasurementOrFact(
                                collection_id=obj.id,
                            )
                            session.add(mof)

                        mof.option_id = values[2]
                        mof.value_en = values[1]
                        mof.parameter_id = parameter_id

                        if mof.value_en != '':
                            biotopes.append(mof)

                # update by relations
                obj.biotope_measurement_or_facts = biotopes

            elif k == 'units':
                units = []
                for unit in v:
                    if unit_id := unit.get('id'):
                        unit_obj = session.get(Unit, unit_id)
                    else:
                        unit_obj = Unit(collection_id=obj.id, dataset_id=1) # TODO: default HAST
                        session.add(unit_obj)
                        session.commit()

                    unit_obj.accession_number = unit.get('accession_number')
                    unit_obj.preparation_date = unit.get('preparation_date')

                    mofs = []
                    for parameter_id, values in unit['measurement_or_facts']:
                        if values and len(values) > 0:
                            if mof_id := values[0]:
                                mof = session.get(MeasurementOrFact, mof_id)
                            else:
                                mof = MeasurementOrFact(
                                    unit_id=unit_obj.id,
                                )
                                session.add(mof)

                            mof.option_id = values[2]
                            mof.value_en = values[1]
                            mof.parameter_id = parameter_id

                            if mof.value_en != '':
                                mofs.append(mof)

                    unit_obj.measurement_or_facts = mofs
                    units.append(unit_obj)

                obj.units = units

            elif k == 'identifications':
                ids = []
                for id_ in v:
                    id_obj = None
                    if iid := id_.get('id'):
                        id_obj = session.get(Identification, iid)
                    else:
                        id_obj = Identification(collection_id=obj.id)
                        session.add(id_obj)

                    id_obj.identifier_id = id_.get('identifier_id')
                    id_obj.date = id_.get('date')
                    id_obj.date_text = id_.get('date_text')
                    id_obj.sequence = id_.get('sequence')
                    id_obj.taxon_id = id_.get('taxon_id')

            elif k == 'collect_date':
                # 手動判斷是不是同一天
                if collect_date := obj.collect_date:
                    ymd = collect_date.strftime('%Y-%m-%d')
                    if ymd != v:
                        obj.collect_date = v
            else:
                # print(k, v, flush=True)
                setattr(obj, k, v)

        session.commit()
        '''
        # Identifications
        id_map = {x['id']: x for x in data['identifications'] if x.get('id')}
        orig_obj_map = {x.id: x for x in obj.identifications.order_by(Identification.sequence).all()}

        for value in data['identifications'] :
            is_new_id = True
            id_obj = None
            if iid := value.get('id'):
                if orig_obj_map[iid]:
                    id_obj = orig_obj_map[iid]
                    is_new_id = False

            if not id_obj:
                id_obj = Identification(collection_id=obj.id)

            print(value, id_obj, is_new_id, flush=True)
            if identifier := value.get('identifier', ''):
                if id_obj.identifier_id != identifier['id']:
                    id_obj.identifier_id = identifier['id']
            else:
                id_obj.identifier_id = None

            if taxon := value.get('taxon', ''):
                if id_obj.taxon_id != taxon['id']:
                    id_obj.taxon_id = taxon['id']
            else:
                id_obj.taxon_id = None

            if date := value.get('date', ''):
                if id_obj.date != date:
                    id_obj.date = date
                else:
                    id_obj.date = None

            if date_text := value.get('date_text', ''):
                if id_obj.date_text != date_text:
                    id_obj.date_text = date_text
                else:
                    id_obj.date_text = ''

            if sequence := value.get('sequence', ''):
                if id_obj.sequence != sequence:
                    id_obj.sequence = sequence
                else:
                    id_obj.sequence = ''

            if is_new_id is True:
                session.add(id_obj)
                print(is_new_id,id_obj, '-----', flush=True)
        '''
        return obj


class PersonMethodView(MethodView):

    def get(self, item_id):
        if item_id is None:
            # item_list
            query = Person.query
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                collector_id = None
                if keyword := filter_dict.get('q', ''):
                    query = query.filter(Person.full_name.ilike(f'%{keyword}%') | Person.atomized_name['en']['given_name'].astext.ilike(f'%{keyword}%') | Person.atomized_name['en']['inherited_name'].astext.ilike(f'%{keyword}%'))
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
