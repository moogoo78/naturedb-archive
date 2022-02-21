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
    CollectionNamedArea,
)
from app.taxon.models import (
    Taxon,
)
from app.api import api
from .helpers import (
    ra_get_list_response,
    ra_item_response,
    make_cors_preflight_response,
    make_react_admin_response,
    ra_get_specimen_list_response,
)


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
    query = Unit.query.join(Unit.collection).join(Collection.collector).join(Collection.identifications)

    print('payload', payload, flush=True)

    # filter
    if x:= payload['filter'].get('accession_number'):
        query = query.filter(Unit.accession_number.ilike(f'%{x}%'))

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
    if x:= payload['filter'].get('collect_date_month'):
        has_query_collect_date =True
        query = query.filter(extract('month', Collection.collect_date) == x)
    if has_query_collect_date:
        query = query.order_by(desc(Collection.collect_date))
    #if x:= payload['filter'].get('field_number'):
    #    query = query.filter(Collection.field_number.ilike(f'%{x}%'))

    total = query.count()

    if 'sort' in payload and len(payload['sort']):
        sort_by = payload['sort'][0]
        if sort_by == 'accession_number':
            sort_by = cast(func.nullif(Unit.accession_number, ''), Integer)
        elif sort_by == 'unit.id':
            sort_by = text('unit.id')
        if payload['sort'][1] == 'ASC':
            query = query.order_by(sort_by)
        elif payload['sort'][1] == 'DESC':
            query = query.order_by(desc(sort_by))

    if 'range' in payload and payload['range'] != '':
        try:
            start = int(payload['range'][0])
            end = int(payload['range'][1])
        except:
            start = 0
            end = 10

        limit = min(((end-start)+1), 1000)
        query = query.limit(limit).offset(start)

    rows = []
    for u in query.all():
        #stmt = select(func.max(Identification.verification_level)).join(Taxon).where(u.collection.id==Identif
        ids = u.collection.identifications.order_by(Identification.verification_level).all()
        last_id = None
        if len(ids) > 0:
            last_id = ids[-1]
        #'identification_last': None,#u.collection.rder_by(Identification.verification_level).all()[0].to_dict0() if u.collection.identifications else None, TODO JOIN
        '''
        item = {
            'id': u.id,
            'accession_number': u.accession_number,
            'image_url': u.get_image(),
            'collection': {
                #'identification_last': last_id.to_dict(),
                'last_taxon_id': u.collection.last_taxon_id,
                'last_taxon_text': u.collection.last_taxon_text,
                'field_number': u.collection.field_number,
                'collector': u.collection.collector.to_dict(),
                'collect_date': u.collection.collect_date.strftime('%Y-%m-%d') if u.collection.collect_date else '',
                #'named_area_map': u.collection.get_named_area_map() #TODO
                'named_area_list': u.collection.get_named_area_list()
            },
        }
        '''
        rows.append(u.to_dict())

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
    model = Collection

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

        for x in ['collect_date', 'altitude', 'altitude2', 'collector_id', 'field_number', 'longitude_decimal', 'latitude_decimal', 'locality_text']:
            setattr(obj, x, data.get(x))

        na_list = obj.get_named_area_list()
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
        if not obj.id:
            session.add(obj)

        session.commit()

        # NamedArea list
        #if len(named_area_list) > 0:
        #    for i in named_area_list:
        #        cna = CollectionNamedArea(collection_id=obj.id, named_area_id=i)
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


class CollectionMethodView(MethodView):
    RESOURCE_NAME = 'collections'
    model = Collection

    def get(self, item_id):
        if item_id is None:
            # item_list
            #query = Collection.query.join(Person).join(Identification).join(ScientificName)
            #query = Collection.query.join(Person)
            query = Collection.query
            if filter_str := request.args.get('filter', ''):
                filter_dict = json.loads(filter_str)
                if keyword := filter_dict.get('q', ''):
                    query = query.join(Collection.collector).join(Collection.identifications).join(Identification.taxon).filter(Person.full_name.ilike(f'%{keyword}%') | Collection.field_number.ilike(f'%{keyword}%') | Taxon.full_scientific_name.ilike(f'%{keyword}%') | Unit.accession_number.ilike(f'%{keyword}%'))
                if collector_id := filter_dict.get('collector_id'):
                    query = query.filter(Person.id==collector_id)
            return ra_get_list_response('collections', request, query)
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
        #print(data, flush=True)
        named_area_list = []
        for i, v in data.items():
            # available types: str, int, NoneType
            if 'named_area_' in i and i != 'named_area_list':
                named_area_list.append(v)
            elif i != 'id' and isinstance(v, str | int | None):
                setattr(obj, i, v)

        if not obj.id:
            session.add(obj)

        session.commit()

        # NamedArea list
        if len(named_area_list) > 0:
            for i in named_area_list:
                cna = CollectionNamedArea(collection_id=obj.id, named_area_id=i)
                session.add(cna)
            session.commit()

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
                    collector_id = x
                if collector_id:
                    if isinstance(collector_id, list):
                        collector_id = x[0]
                    query = query.filter(Person.id==collector_id)

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
        if 'scientific_name_id__quick' in data.keys():
            # post from collection ouick button
            print (data, flush=True)
            obj.collection_id = data.get('id')
            obj.taxon_id = data.get('taxon_id__quick')
            obj.identifier_id = data.get('identifier_id__quick')
            obj.date = data.get('date__quick')
            obj.date_text = data.get('date_text__quick')
            obj.verification_level = data.get('verification_level__quick')
        else:
            for i, v in data.items():
                # available types: str, int, NoneType
                if i != 'id' and isinstance(v, str | int | None) and hasattr(obj, i):
                    setattr(obj, i, v)

        if not obj.id:
            session.add(obj)

        session.commit()
        return obj


class MeasurementOrFactsMethodView(MethodView):
    RESOURCE_NAME = 'measurement_or_facts'
    model = MeasurementOrFact
    def get(self, item_id):
        if item_id is None:
            # item_list
            query = self.model.query
            if filter_str := request.args.get('filter', ''):
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
