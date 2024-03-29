from sqlalchemy import (
    Column,
    Integer,
    Numeric,
    String,
    Text,
    DateTime,
    Date,
    Boolean,
    ForeignKey,
    desc,
    Table,
    update,
    insert,
)
from sqlalchemy.orm import (
    relationship,
    backref,
    validates,
)
from sqlalchemy.dialects.postgresql import JSONB
from flask_login import UserMixin

from app.utils import (
    get_time,
    dd2dms,
)
from app.utils import (
     SAModelLog,
 )
from app.database import (
    Base,
    session,
)
from app.taxon.models import Taxon


def get_structed_list(options, value_dict={}):
    '''structed_list
    dict key must use id (str)
    '''
    res = []
    for i, option in enumerate(options):
        name = option.get('name')
        res.append({
            'id': option.get('id', ''),
            'name': name,
            'label': option.get('label', ''),
            'value': value_dict.get(name),
        })
    return res

def get_structed_map(options, value_dict={}):
    '''structed_list
    dict key must use id (str)
    '''
    res = {}
    for opt in options:
        key = opt['name']
        res[key] = {
            'field': opt,
            'value': value_dict.get(key, '')
        }
    return res

#class UnitAnnotation(Base):
#    __tablename__ = 'unit_annotation'
    #id = Column(Integer, primary_key=True)
#    unit_id = Column(Integer, ForeignKey('unit.id', ondelete='SET NULL'), nullable=True, primary_key=True)
#    annotation_id =  Column(Integer, ForeignKey('annotation.id', ondelete='SET NULL'), nullable=True, primary_key=True)

class LogEntry(Base):
    __tablename__ = 'log_entry'
    id = Column(Integer, primary_key=True)
    # user = models.ForeignKey(settings.AUTH_USER_MODEL)
    model = Column(String(500))
    item_id = Column(String(500))
    action = Column(String(500))
    changes = Column(JSONB)
    created = Column(DateTime, default=get_time)
    remarks = Column(String(500))

class MeasurementOrFactParameter(Base):
    __tablename__ = 'measurement_or_fact_parameter'
    id = Column(Integer, primary_key=True)
    dataset_id = Column(Integer, ForeignKey('dataset.id', ondelete='SET NULL'), nullable=True)
    name = Column(String(500))
    label = Column(String(500))

    def __repr__(self):
        return '<MeasurementOrFactParameter name="{}" label="{}">'.format(self.name, self.label)
    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'label': self.label if self.label else self.name,
            'dataset_id': self.dataset_id,
        }

class MeasurementOrFactParameterOptionGroup(Base):
    __tablename__ = 'measurement_or_fact_parameter_option_group'
    id = Column(Integer, primary_key=True)
    name = Column(String(500))


class MeasurementOrFactParameterOption(Base):
    __tablename__ = 'measurement_or_fact_parameter_option'
    id = Column(Integer, primary_key=True)
    parameter_id = Column(ForeignKey('measurement_or_fact_parameter.id', ondelete='SET NULL'))
    group_id = Column(ForeignKey('measurement_or_fact_parameter_option_group.id', ondelete='SET NULL'), nullable=True)
    value = Column(String(500))
    description = Column(String(500))
    parameter = relationship('MeasurementOrFactParameter')
    group = relationship('MeasurementOrFactParameterOptionGroup')

    def to_dict(self):
        return {
            'id': self.id,
            'value': self.value,
            'description': self.description,
        }


class MeasurementOrFact(Base):
    __tablename__ = 'measurement_or_fact'

    PARAMETER_CHOICES = (
        ('habitat', '微棲地'),
        ('veget','植群型'),
        ('topography', '地形位置'),
        ('naturalness','自然度'),
        ('light-intensity','環境光度'),
        ('humidity','環境濕度'),
        ('abundance','豐富度'),
        ('life-form', '生長型'),
        ('flower', '花'),
        ('fruit', '果'),
        ('flower-color', '花色'),
        ('fruit-color', 'd果色'),
    )

    #PARAMETER_FOR_COLLECTION = ('habitat', 'veget', 'topography', 'naturalness', 'light-intensity', 'humidity', 'abundance')
    UNIT_OPTIONS = (
        {'id': 10, 'name': 'life-form', 'label': '生長型'},
        {'id': 8, 'name': 'plant-h', 'label': '植株高度'},
        {'id': 11, 'name': 'flower', 'label': '花期'},
        {'id': 13, 'name': 'flower-color', 'label': '花色'},
        {'id': 12, 'name': 'fruit', 'label': '果期'},
        {'id': 14, 'name': 'fruit-color', 'label': '果色'},
        {'id': 9, 'name': 'sex-char', 'label': '性狀描述'},
    )
    BIOTOPE_OPTIONS = (
        {'id': 7, 'name': 'veget', 'label': '植群型'},
        {'id': 6, 'name': 'topography', 'label': '地形位置'},
        {'id': 2, 'name': 'habitat', 'label': '微生育地'},
        {'id': 5, 'name': 'naturalness', 'label': '自然度'},
        {'id': 4, 'name': 'light-intensity', 'label': '環境光度'},
        {'id': 3, 'name': 'humidity', 'label': '環境濕度'},
        {'id': 1, 'name': 'abundance', 'label': '豐富度'},
    )
    id = Column(Integer, primary_key=True)
    collection_id = Column(ForeignKey('collection.id', ondelete='SET NULL'))
    option_id = Column(ForeignKey('measurement_or_fact_parameter_option.id', ondelete='SET NULL'))
    unit_id = Column(ForeignKey('unit.id', ondelete='SET NULL'))
    parameter_id = Column(ForeignKey('measurement_or_fact_parameter.id', ondelete='SET NULL'))
    parameter = relationship('MeasurementOrFactParameter')
    option = relationship('MeasurementOrFactParameterOption')
    #parameter = Column(String(500))
    #text = Column(String(500))
    value = Column(String(500)) # TODO: rename to description
    # value_en = Column(String(500)) # TODO real value
    #lower_value
    #upper_value
    #accuracy
    #measured_by
    #unit_of_measurement
    #applies_to

    def __repr__(self):
        if self.parameter:
            return '<MeasurementOrFact parameter="{}" value="{}">'.format(self.parameter, self.value)
        return '<MeasurementOrFact value="{}">'.format(self.value)

    def to_dict(self):
        #item = [x for x in self.PARAMETER_CHOICES if x[0] == self.parameter][0]
        return {
            'id': self.id,
            'option_id': self.option_id if self.option_id else None,
            #'label': item[1],
            #'parameter': self.parameter.to_dict(),
            'value': self.value,
            #'collection_id': self.collection_id,
        }
    def to_dict(self):
        #item = [x for x in self.PARAMETER_CHOICES if x[0] == self.parameter][0]
        return {
            'id': self.id,
            'option_id': self.option_id if self.option_id else None,
            #'label': item[1],
            #'parameter': self.parameter.to_dict(),
            'value': self.value,
            # 'value_en': self.value_en,
            #'collection_id': self.collection_id,
        }

class Annotation(Base):

    CATEGORY_MAP = {
        'add-char': '特徵',
        'name-comment': '分類評註',
        'is-greenhouse': '溫室標本',
    }
    __tablename__ = 'annotation'

    id = Column(Integer, primary_key=True)
    unit_id = Column(Integer, ForeignKey('unit.id', ondelete='SET NULL'), nullable=True)
    category = Column(String(500))
    text = Column(String(500))
    created = Column(DateTime, default=get_time)
    memo = Column(String(500))
    # todo: english
    # abcd: Annotator
    # abcd: Date

    def display_category(self):
        return self.CATEGORY_MAP.get(self.category, '--')

    def to_dict(self):
        return {
            'category': self.category,
            'text': self.text,
        }

# Geospatial
class AreaClass(Base):

#HAST: country (249), province (142), hsienCity (97), hsienTown (371), additionalDesc(specimen.locality_text): ref: hast_id: 144954

    __tablename__ = 'area_class'
    DEFAULT_OPTIONS = [
        {'id': 1, 'name': 'country', 'label': '國家'},
        {'id': 2, 'name': 'stateProvince', 'label': '省/州', 'parent': 'country', 'root': 'country'},
        {'id': 3, 'name': 'county', 'label': '縣/市', 'parent': 'stateProvince', 'root': 'country'},
        {'id': 4, 'name': 'municipality', 'label': '鄉/鎮', 'parent': 'county', 'root': 'country'},
        {'id': 5, 'name': 'national_park', 'label': '國家公園'},
        {'id': 6, 'name': 'locality', 'label': '地名'},
    ]

    id = Column(Integer, primary_key=True)
    name = Column(String(500))
    label = Column(String(500))
    #org = models.ForeignKey(on_delete=models.SET_NULL, null=True, blank=True)

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'label': self.label,
        }
#class AreaClassSystem(models.Model):
#    ancestor = models.ForeignKey(AreaClass, on_delete=models.SET_NULL, null=True, blank=True, related_name='descendant_nodes')
#    descendant = models.ForeignKey(AreaClass, on_delete=models.SET_NULL, null=True, blank=True, related_name='ancestor_nodes')
#    depth = models.PositiveSmallIntegerField(default=0)

class NamedArea(Base):
    __tablename__ = 'named_area'

    id = Column(Integer, primary_key=True)
    name = Column(String(500))
    name_en = Column(String(500))
    code = Column(String(500))
    #code_standard = models.CharField(max_length=1000, null=True)
    area_class_id = Column(Integer, ForeignKey('area_class.id', ondelete='SET NULL'), nullable=True)
    area_class = relationship('AreaClass', backref=backref('named_area'))
    source_data = Column(JSONB)
    parent_id = Column(Integer, ForeignKey('named_area.id', ondelete='SET NULL'), nullable=True)

    def display_name(self):
        return '{}{}'.format(
            self.name_en if self.name_en else '',
            f' ({self.name})' if self.name.strip() else ''
        )

    @property
    def name_best(self):
        if name := self.name:
            return name
        elif name := self.name_en:
            return name
        return ''

    def to_dict(self):
        return {
            'id': self.id,
            'parent_id': self.parent_id,
            'name': self.name,
            'name_en': self.name_en,
            'area_class_id': self.area_class_id,
            'area_class': self.area_class.to_dict(),
            #'name_mix': '/'.join([self.name, self.name_en]),
            'display_name': self.display_name(),
            #'name_best': self.name_best,
        }


collection_named_area = Table(
    'collection_named_area',
    Base.metadata,
    Column('collection_id', ForeignKey('collection.id'), primary_key=True),
    Column('named_area_id', ForeignKey('named_area.id'), primary_key=True)
)

'''
class CollectionNamedArea(Base):
    __tablename__ = 'collection_named_area'

    id = Column(Integer, primary_key=True)
    collection_id = Column(Integer, ForeignKey('collection.id', ondelete='SET NULL'), nullable=True)
    named_area_id = Column(Integer, ForeignKey('named_area.id', ondelete='SET NULL'), nullable=True)
    named_area = relationship('NamedArea')
    #units = relationship('Unit')

    def to_dict(self):
        return {
            'id': self.id,
            'named_area': self.named_area.to_dict(),
        }
'''

class Identification(Base):

    # VER_LEVEL_CHOICES = (
    #     ('0', '初次鑑定'),
    #     ('1', '二次鑑定'),
    #     ('2', '三次鑑定'),
    #     ('3', '四次鑑定'),
    #)

    __tablename__ = 'identification'

    id = Column(Integer, primary_key=True)
    collection_id = Column(Integer, ForeignKey('collection.id', ondelete='SET NULL'), nullable=True)
    collection = relationship('Collection', back_populates='identifications')
    identifier_id = Column(Integer, ForeignKey('person.id', ondelete='SET NULL'), nullable=True)
    identifier = relationship('Person')
    taxon_id = Column(Integer, ForeignKey('taxon.id', ondelete='set NULL'), nullable=True, index=True)
    taxon = relationship('Taxon', backref=backref('taxon'))
    date = Column(DateTime)
    date_text = Column(String(50)) #格式不完整的鑑訂日期, helper: ex: 1999-1
    created = Column(DateTime, default=get_time)
    changed = Column(DateTime, default=get_time, onupdate=get_time) # abcd: DateModified
    verification_level = Column(String(50))
    sequence = Column(Integer)

    # abcd: IdentificationSource
    reference = Column(Text)
    note = Column(Text)
    source_data = Column(JSONB)

    def __repr__(self):
        if self.taxon:
            return '<Identification id="{}" taxon="{}">'.format(self.id, self.taxon.display_name())
        return '<Identification id="{}">'.format(self.id)

    @validates('date')
    def validate_date(self, key, date):
        if date == '':
            raise ValueError('date is empty str')
        return date

    def to_dict(self):

        data = {
            'id': self.id,
            #'identification_id': self.id,
            #'collection_id': self.collection_id,
            #'identifier_id': self.identifier_id or '',
            'taxon_id': self.taxon_id or '',
            'date': self.date.strftime('%Y-%m-%d') if self.date else '',
            'date_text': self.date_text or '',
            'verification_level': self.verification_level or '',
            'sequence': self.sequence or '',
        }
        if self.taxon:
            data['taxon'] =  {'id': self.taxon_id, 'text': self.taxon.display_name()}
        if self.identifier:
            data['identifier'] = self.identifier.to_dict()

        return data

#class UnitSpecimenMark(Base):
#    __tablename__ = 'unit_specimen_mark'
#    id = Column(Integer, primary_key=True)
#    unit_id = Column(Integer, ForeignKey('unit.id', ondelete='SET NULL'), nullable=True)
#    specimen_mark_id = Column(Integer, ForeignKey('specimen_mark.id', ondelete='SET NULL'), nullable=True)

class SpecimenMark(Base):
    __tablename__ = 'unit_mark'

    id = Column(Integer, primary_key=True)
    unit_id = Column(Integer, ForeignKey('unit.id', ondelete='SET NULL'), nullable=True)
    mark_type = Column(String(50)) # qrcode, rfid
    mark_text = Column(String(500))
    mark_author = Column(Integer, ForeignKey('person.id'))

class CollectionPerson(Base):
    # other collector
    __tablename__ = 'collection_person'

    id = Column(Integer, primary_key=True)
    collection_id = Column(ForeignKey('collection.id', ondelete='CASCADE'))
    #gathering = relationship('gathering')
    person_id = Column(ForeignKey('person.id', ondelete='SET NULL'))
    role = Column(String(50))
    sequence = Column(Integer)

#class Entity(Base):
#    pass

class Collection(Base):
    __tablename__ = 'collection'

    # DEPRICATED
    validations = [
        ('collect_date', 'datetime'),
        ('collector_id', 'fk'),
        ('field_number', 'str'),
        ('companion_text', 'str'),
        ('companion_text_en', 'str'),
        ('named_areas', 'm2m', 'NamedArea'),
        ('identifications', 'o2m', 'Identification'),
        ('identifications.taxon', 'fk', 'Taxon'),
        ('identifications.identifier', 'fk', 'Person'),
        ('units', 'o2m', 'Unit')
    ]

    id = Column(Integer, primary_key=True)
    collect_date = Column(DateTime) # abcd: Date
    collect_date_text = Column(String(500)) # DEPRECATED
    # abcd: GatheringAgent, DiversityCollectinoModel: CollectionAgent
    collector_id = Column(Integer, ForeignKey('person.id'))
    field_number = Column(String(500), index=True)
    collector = relationship('Person')
    companions = relationship('CollectionPerson') # companion
    companion_text = Column(String(500)) # unformatted value, # HAST:companions
    companion_text_en = Column(String(500))

    #biotope = Column(String(500))
    biotope_measurement_or_facts = relationship('MeasurementOrFact')
    sex = Column(String(500))
    age = Column(String(500))

    # Locality
    locality_text = Column(String(1000))
    locality_text_en = Column(String(1000))

    #country
    #named_area_relations = relationship('CollectionNamedArea')
    named_areas = relationship('NamedArea', secondary=collection_named_area, backref='collections')

    altitude = Column(Integer)
    altitude2 = Column(Integer)
    #depth

    # Coordinate
    latitude_decimal = Column(Numeric(precision=9, scale=6))
    longitude_decimal = Column(Numeric(precision=9, scale=6))
    latitude_text = Column(String(50)) # verbatim
    longitude_text = Column(String(50))

    field_note = Column(Text)
    field_note_en = Column(Text)
    other_field_numbers = relationship('FieldNumber')
    identifications = relationship('Identification', back_populates='collection', lazy='dynamic')
    proxy_taxon_text = Column(Text)
    proxy_taxon_id = Column(Integer, ForeignKey('taxon.id'))
    proxy_unit_accession_numbers = Column(String(1000))
    # proxy_units = Column(JSONB)
    units = relationship('Unit')
    created = Column(DateTime, default=get_time)
    changed = Column(DateTime, default=get_time, onupdate=get_time) # abcd: DateModified
    project_id = Column(Integer, ForeignKey('project.id'))
    project = relationship('Project')

    '''
    @validates('altitude')
    def validate_altitude(self, key, value):
        try:
            value_int = int(value)
        except ValueError:
            return None

        return value_int

    @validates('altitude2')
    def validate_altitude2(self, key, value):
        try:
            value_int = int(value)
        except ValueError:
            return None

        return value_int
    '''

    @property
    def key(self):
        unit_keys = [x.key for x in self.units]
        if len(unit_keys):
            return ','.join(unit_keys)
        else:
            return '--'

    def get_parameters(self, parameter_list=[]):
        params = {f'{x.parameter.name}': x for x in self.biotope_measurement_or_facts}
        items = []
        if len(parameter_list) == 0:
            parameter_list = [x for x in params]
        for name in parameter_list:
            if p := params.get(name, ''):
                item = p.to_dict()
                item['name'] = name
                items.append(item)
        return items

    @property
    def latest_scientific_name(self):
        latest_id = self.identifications.order_by(desc(Identification.verification_level)).first()
        if taxon := latest_id.taxon:
            return taxon.full_scientific_name
        return ''

    def to_dict2(self):

        data = {
            'id': self.id,
            'collect_date': self.collect_date.strftime('%Y-%m-%d') if self.collect_date else '',
            'collector_id': self.collector_id,
            'collector': self.collector.to_dict() if self.collector else '',
            'field_number': self.field_number,
            'last_taxon_text': self.last_taxon_text,
            'last_taxon_id': self.last_taxon_id,
            #'named_area_map': self.get_named_area_map(),
        }
        data['units'] = [x.to_dict() for x in self.units]
        return data

    def update_from_json(self, data):
        changes = {}
        collection_log = SAModelLog(self)
        for name, value in data.items():
            # print('--', name, value, flush=True)
            if name == 'biotopes':
                biotope_list = []
                changes['biotopes'] = {}
                for k, v in value.items():
                    # find origin
                    origin = ''
                    for x in self.biotope_measurement_or_facts:
                        if x.parameter.name == k:
                            origin = x.value
                    changes['biotopes'][k] = f'{origin}=>{v}'
                    biotope = MeasurementOrFact(collection_id=self.id, value=v)
                    if p := MeasurementOrFactParameter.query.filter(MeasurementOrFactParameter.name==k).first():
                        biotope.parameter_id = p.id
                    #if o := MeasurementOrFactParameterOption.query.filter(MeasurementOrFactParameter.name==v).first():
                    # 不管 option 了
                    biotope_list.append(biotope)

                self.biotope_measurement_or_facts = biotope_list

            elif name == 'identifications':
                changes['identifications'] = []
                # 全部檢查 (dirtyFields 看不出是那一個 index 改的?)
                for id_ in value:
                    id_obj = None
                    if iid := id_.get('id'):
                        id_obj = session.get(Identification, iid)
                    else:
                        id_obj = Identification(collection_id=self.id)
                        session.add(id_obj)
                        session.commit()

                    id_log = SAModelLog(id_obj)

                    id_obj.date = id_['date'] if id_.get('date') else None
                    id_obj.date_text = id_.get('date_text', '')
                    id_obj.sequence = id_.get('sequence', '')
                    if x := id_.get('taxon'):
                        id_obj.taxon_id = x['id']
                    if x := id_.get('identifier'):
                        id_obj.identifier_id = x['id']

                    changes['identifications'].append(id_log.check())

            elif name == 'units':
                changes['units'] = []
                # 全部檢查 (dirtyFields 看不出是那一個 index 改的?)
                units = []
                for unit in value:
                    if unit_id := unit.get('id'):
                        unit_obj = session.get(Unit, unit_id)
                    else:
                        # TODO: dataset hard-code to HAST
                        unit_obj = Unit(collection_id=self.id, dataset_id=1) 
                        session.add(unit_obj)
                        session.commit()

                    unit_log = SAModelLog(unit_obj)
                    unit_obj.accession_number = unit.get('accession_number')
                    unit_obj.preparation_date = unit['preparation_date'] if unit.get('preparation_date') else None

                    mof_list = []
                    # 用 SAModelLog 就可以了
                    for k, v in unit['measurement_or_facts'].items():
                        mof = MeasurementOrFact(unit_id=unit_obj.id, value=v)
                        #mof_log = SAModelChange(mof)
                        if p := MeasurementOrFactParameter.query.filter(MeasurementOrFactParameter.name==k).first():
                            mof.parameter_id = p.id
                        #if o := MeasurementOrFactParameterOption.query.filter(MeasurementOrFactParameter.name==v).first():
                        # 不管 option 了
                        mof_list.append(mof)

                    unit_obj.measurement_or_facts = mof_list
                    units.append(unit_obj)

                    unit_changes = unit_log.check()
                    #unit_changes['measurement_or_facts'] = 
                    changes['units'].append(unit_changes)

            else:
                if name in ['field_number', 'collect_date', 'altitude', 'altitude2', 'longitude_decimal', 'latitude_decimal', 'longitude_text', 'latitude_text', 'locality_text', 'companion_text', 'companion_text_en']:
                    origin = getattr(self, name, '')
                    changes[name] = f'{origin}=>{value}'
                    setattr(self, name, value)
                elif name == 'collector':
                    if value and value.get('id'):
                        self.collector_id = value['id']
                    else:
                        self.collector_id = None

                    origin = getattr(self, name, '')
                    changes[name] = f'{origin}=>{value}'

        #print('log_entries', log_entries, flush=True)
        # collection_changes = collection_log.check() # 不好用, units, identifications... 會混成同一層
        #changes.update(collection_changes)
        # print('col', collection_changes, flush=True)
        # print('cus', changes, flush=True)
        session.commit()

        return changes

    # collection.to_dict
    def to_dict(self, include_units=True):
        ids = []
        if self.identifications.count() > 0:
            ids = [x.to_dict() for x in self.identifications.order_by(Identification.sequence).all()]
        taxon = Taxon.query.filter(Taxon.id==self.proxy_taxon_id).first()
        # named_area_map = self.get_named_area_map()
        # named_area_list = self.get_named_area_list()
        named_areas = {f'{x.area_class.name}': x.to_dict() for x in self.named_areas}

        biotope_map = {f'{x.parameter.name}': x.to_dict() for x in self.biotope_measurement_or_facts}
        biotopes = get_structed_list(MeasurementOrFact.BIOTOPE_OPTIONS, biotope_map)
        #biotope_values = {f'{x.parameter.name}': x.value for x in self.biotope_measurement_or_facts}

        data = {
            'id': self.id,
            'key': self.key,
            'collect_date': self.collect_date.strftime('%Y-%m-%d') if self.collect_date else '',
            'display_collect_date': self.collect_date.strftime('%Y-%m-%d') if self.collect_date else '',
            # 'collector_id': self.collector_id,
            'collector': self.collector.to_dict() if self.collector else '',
            'companion_text': self.companion_text or '',
            'companion_text_en': self.companion_text_en or '',
            #'named_area_list': na_list,
            'named_areas': named_areas,
            'altitude': self.altitude or '',
            'altitude2':self.altitude2 or '',
            'longitude_decimal': self.longitude_decimal or '',
            'latitude_decimal': self.latitude_decimal or '',
            'longitude_text': self.longitude_text or '',
            'latitude_text': self.latitude_text or '',
            'locality_text': self.locality_text or '',
            #'biotope_measurement_or_facts': {x.parameter.name: x.to_dict() for x in self.biotope_measurement_or_facts},
            'biotopes': biotopes,
            #'biotopes': biotope_values,
            #'measurement_or_facts': get_hast_parameters(self.biotope_measurement_or_facts),
            #'params': get_structed_list(MeasurementOrFact.PARAMETER_FOR_COLLECTION),
            #'field_number_list': [x.todict() for x in self.field_numbers],
            'field_number': self.field_number or '',
            'identifications': ids,
            'proxy_unit_accession_numbers': self.proxy_unit_accession_numbers,
            'proxytaxon_text': self.proxy_taxon_text,
            'proxy_taxon_id': self.proxy_taxon_id,
            'proxy_taxon': taxon.to_dict() if taxon else None,
            'units': [x.to_dict() for x in self.units],
        }
        if self.project_id:
            data['project'] = self.project.to_dict()

        return data

    def display_altitude(self):
        alt = []
        if x := self.altitude:
            alt.append(str(x))
        if x := self.altitude2:
            alt.append(str(x))

        if len(alt) == 1:
            return alt[0]
        elif len(alt) > 1:
            return '-'.join(alt)

    def get_coordinates(self, type_=''):
        if self.longitude_decimal and self.latitude_decimal:
            if type_ == '' or type_ == 'dd':
                return {
                    'x': self.longitude_decimal,
                    'y': self.latitude_decimal
                }
            elif type_ == 'dms':
                dms_lng = dd2dms(self.longitude_decimal)
                dms_lat = dd2dms(self.latitude_decimal)
                x_label = '{}{}\u00b0{:02d}\'{:02d}"'.format('N' if dms_lng[0] > 0 else 'S', dms_lng[0], dms_lng[1], round(dms_lng[2]))
                y_label = '{}{}\u00b0{}\'{:02d}"'.format('E' if dms_lat[0] > 0 else 'W', dms_lat[0], dms_lat[1], round(dms_lat[2]))
                return {
                    'x': dms_lng,
                    'y': dms_lat,
                    'x_label': x_label,
                    'y_label': y_label,
                    'simple': f'{x_label}, {y_label}'
                }
        else:
            return None

    def get_named_area_map(self):
        #named_area_map = {f'{x.named_area.area_class.name}': x.named_area.to_dict() for x in self.named_area_relations}
        named_area_map = {f'{x.area_class.name}': x.to_dict() for x in self.named_areas}
        return get_structed_map(AreaClass.DEFAULT_OPTIONS, named_area_map)

    def get_named_area_list(self):
        named_area_map = {f'{x.area_class.name}': x.to_dict() for x in self.named_areas}
        return get_structed_list(AreaClass.DEFAULT_OPTIONS, named_area_map)


    def get_biotope_list(self):
        biotope_map = {f'{x.parameter.name}': x.to_dict() for x in self.biotope_measurement_or_facts}
        biotopes = get_structed_list(MeasurementOrFact.BIOTOPE_OPTIONS, biotope_map)
        return biotopes

    def get_form_layout(self):
        named_areas = []
        for x in AreaClass.DEFAULT_OPTIONS:
            data = {
                'id': x['id'],
                'label': x['label'],
                'name': x['name'],
                'options': [],
            }
            for na in NamedArea.query.filter(NamedArea.area_class_id==x['id']).order_by('id').all():
                data['options'].append(na.to_dict())

            named_areas.append(data)

        biotopes = []
        for param in MeasurementOrFact.BIOTOPE_OPTIONS:
            data = {
                'id': param['id'],
                'label': param['label'],
                'name':  param['name'],
                'options': []
            }
            for row in MeasurementOrFactParameterOption.query.filter(MeasurementOrFactParameterOption.parameter_id==param['id']).all():
                data['options'].append(row.to_dict())
            biotopes.append(data)

        unit_mofs = []
        for param in MeasurementOrFact.UNIT_OPTIONS:
            data = {
                'id': param['id'],
                'label': param['label'],
                'name':  param['name'],
                'options': []
            }
            for row in MeasurementOrFactParameterOption.query.filter(MeasurementOrFactParameterOption.parameter_id==param['id']).all():
                data['options'].append(row.to_dict())
            unit_mofs.append(data)

        projects = [x.to_dict() for x in Project.query.all()]

        return {
            'biotopes': biotopes,
            'unit_measurement_or_facts': unit_mofs,
            'named_areas': named_areas,
            'projects': projects,
        }

    def get_first_id_taxon(self):
        if len(self.identifications.all()) > 0:
            return self.identifications[0].taxon
        else:
            return None

    @property
    def companion_list(self):
        items = []
        if x:= self.companion_text:
            items.append(x)
        if x:= self.companion_text_en:
            items.append(x)
        return items

class FieldNumber(Base):
    __tablename__ = 'other_field_number'

    id = Column(Integer, primary_key=True)
    collection_id = Column(Integer, ForeignKey('collection.id', ondelete='SET NULL'), nullable=True)
    value = Column(String(500)) # dwc: recordNumber
    #record_number2 = Column(String(500)) # for HAST dupNo.
    collector_id = Column(Integer, ForeignKey('person.id'))
    collector = relationship('Person')
    collector_name = Column(String(500), nullable=True) # abbr. collector's name

    def to_dict(self):
        return {
            'pk': self.id,
            'value': self.value,
            'collector': self.collector.to_dict(),
        }

class Unit(Base):
    '''mixed abcd: SpecimenUnit/ObservationUnit (phycal state-specific subtypes of the unit reocrd)
    BotanicalGardenUnit/HerbariumUnit/ZoologicalUnit/PaleontologicalUnit
    '''
    KIND_OF_UNIT_MAP = {'HS': 'Herbarium Sheet'}

    TYPE_STATUS_CHOICES = (
        ('holotype', 'holotype'),
        ('lectotype', 'lectotype'),
        ('isotype', 'isotype'),
        ('syntype', 'syntype'),
        ('paratype', 'paratype'),
        ('neotype', 'neotype'),
        ('epitype', 'epitype'),
    )

    __tablename__ = 'unit'

    id = Column(Integer, primary_key=True)
    #guid =
    dataset_id = Column(Integer, ForeignKey('dataset.id', ondelete='SET NULL'), nullable=True, index=True)
    created = Column(DateTime, default=get_time)
    changed = Column(DateTime, default=get_time, onupdate=get_time) # abcd: DateModified
    #last_editor = Column(String(500))
    #owner
    #identifications = relationship('Identification', back_populates='unit')
    kind_of_unit = Column(String(500)) # herbarium sheet (HS), leaf, muscle, leg, blood, ..., ref: https://arctos.database.museum/info/ctDocumentation.cfm?table=ctspecimen_part_name#whole_organism

    # assemblages
    # associations
    # sequences
    collection_id = Column(Integer, ForeignKey('collection.id', ondelete='SET NULL'), nullable=True)
    measurement_or_facts = relationship('MeasurementOrFact')
    #planting_date
    #propagation

    # abcd: SpecimenUnit
    accession_number = Column(String(500), index=True)
    #accession_uri = Column(String(500)) ark?
    #accession_catalogue = Column(String(500))
    # accession_date
    duplication_number = Column(String(500)) # ==Think==
    #abcd:preparations
    preparation_type = Column(String(500)) #specimens (S), tissues, DNA
    preparation_date = Column(Date)
    # abcd: Acquisition
    acquisition_type = Column(String(500)) # bequest, purchase, donation
    acquisition_date = Column(DateTime)
    acquired_from = Column(Integer, ForeignKey('person.id'), nullable=True)
    acquisition_source_text = Column(Text) # hast: provider
    #verified
    #reference

    #NomenclaturalTypeDesignation
    type_status = Column(String(50))
    typified_name = Column(String(500)) # The name based on the specimen.
    type_reference = Column(String(500)) # NomenclaturalReference: Published reference
    type_reference = Column(String(500))
    type_reference_link = Column(String(500))
    type_note = Column(String(500))

    # type_code = Column(String(100)) # CodeAssessment: ?
    type_identification_id = Column(Integer, ForeignKey('identification.id', ondelete='SET NULL'), nullable=True)

    specimen_marks = relationship('SpecimenMark')
    dataset = relationship('Dataset')
    collection = relationship('Collection', overlaps='units') # TODO warning
    transactions = relationship('Transaction')
    # abcd: Disposition (in collection/missing...)

    # observation
    source_data = Column(JSONB)
    information_withheld = Column(Text)
    annotations = relationship('Annotation')
    multimedia_objects = relationship('MultimediaObject')

    def display_kind_of_unit(self):
        if self.kind_of_unit:
            return self.KIND_OF_UNIT_MAP.get(self.kind_of_unit, 'error')
        return ''

    @property
    def key(self):
        pre = []
        seperator = '/'
        if self.accession_number:
            if self.dataset.organization.abbreviation == self.dataset.name:
                # ignore double display
                pre.append(self.dataset.organization.abbreviation)
            else:
                pre.append(self.dataset.organization.abbreviation)
                pre.append(self.dataset.name)
            pre.append(self.accession_number)
        else:
            # use field_number
            p = '--'
            if person := self.collection.collector:
                p = person.full_name
            if fn := self.collection.field_number:
                p = '{} {}'.format(p, fn)
            pre.append(p)

        if self.duplication_number:
            pre.append(self.duplication_number)
        return f'{seperator}'.join(pre)

    # unit.to_dict
    def to_dict(self, mode='with-collection'):
        mof_map = {f'{x.parameter.name}': x.to_dict() for x in self.measurement_or_facts}
        mofs = get_structed_list(MeasurementOrFact.UNIT_OPTIONS, mof_map)
        #mof_values = {f'{x.parameter.name}': x.value for x in self.measurement_or_facts}
        data = {
            'id': self.id,
            'key': self.key,
            'accession_number': self.accession_number or '',
            'duplication_number': self.duplication_number or '',
            #'collection_id': self.collection_id,
            'kind_of_unit': self.kind_of_unit or '',
            'preparation_type': self.preparation_type or '',
            'preparation_date': self.preparation_date.strftime('%Y-%m-%d') if self.preparation_date else '',
            'measurement_or_facts': mofs,
            'image_url': self.get_image(),
            'transactions': [x.to_dict() for x in self.transactions],
            #'dataset': self.dataset.to_dict(), # too man
        }
        #if mode == 'with-collection':
        #    data['collection'] = self.collection.to_dict(include_units=False)

        return data

    def get_parameters(self, parameter_list=[]):
        params = {f'{x.parameter.name}': x for x in self.measurement_or_facts}

        items = []
        if len(parameter_list) == 0:
            parameter_list = [x for x in params]
        for name in parameter_list:
            if p := params.get(name, ''):
                item = p.to_dict()
                item['name'] = name
                items.append(item)
        return items

    def get_measurement_or_fact_list(self):
        mof_map = {f'{x.parameter.name}': x.to_dict() for x in self.measurement_or_facts}
        mofs = get_structed_list(MeasurementOrFact.UNIT_OPTIONS, mof_map)
        return mofs

    def get_annotations(self, parameter_list=[]):
        params = {f'{x.category}': x for x in self.annotations}

        rows = []
        if len(parameter_list) == 0:
            parameter_list = [x for x in params]
        for key in parameter_list:
            if p := params.get(key, ''):
                rows.append(p.to_dict())
        return rows

    def get_image(self, thumbnail='_s'):
        if self.accession_number:
            try:
                # TODO: int error exception
                accession_number_int = int(self.accession_number)
                instance_id = f'{accession_number_int:06}'
                first_3 = instance_id[0:3]
                img_url = f'http://brmas-pub.s3-ap-northeast-1.amazonaws.com/hast/{first_3}/S_{instance_id}{thumbnail}.jpg'
                return img_url
            except:
                return ''
        else:
            return ''

    def __str__(self):
        collector = ''
        if p := self.collection.collector:
            collector = p.display_name()

        record_number = f'{collector} | {self.collection.field_number}::{self.duplication_number}'
        taxon = '--'
        return f'<Unit #{self.id} {record_number} | {self.collection.latest_scientific_name}>'

class Person(Base):
    '''
    full_name => original name
    atomized_name => by language (en, ...), contains: given_name, inherited_name
    '''
    __tablename__ = 'person'

    id = Column(Integer, primary_key=True)
    full_name = Column(String(500)) # abcd: FullName
    full_name_en = Column(String(500))
    atomized_name = Column(JSONB)
    sorting_name = Column(JSONB)
    abbreviated_name = Column(String(500))
    preferred_name = Column(String(500))
    is_collector = Column(Boolean, default=False)
    is_identifier = Column(Boolean, default=False)
    source_data = Column(JSONB)
    organization_id = Column(Integer, ForeignKey('organization.id', ondelete='SET NULL'), nullable=True)
    organization = Column(String(500))

    def __repr__(self):
        return '<Person(id="{}", display_name="{}")>'.format(self.id, self.display_name())

    @property
    def english_name(self):
        if self.atomized_name and len(self.atomized_name):
            if en_name := self.atomized_name.get('en', ''):
                return '{} {}'.format(en_name['inherited_name'], en_name['given_name'])
        return ''

    def display_name(self, type_=None):
        name = ''
        if name := self.english_name:
            if fname := self.full_name:
                name = '{} ({})'.format(name, fname)
        elif self.full_name:
            name =  self.full_name

        if type_ == 'label':
            return name

        return name or ''

    def to_dict(self):
        data = {
            'id': self.id,
            'display_name': self.display_name(),
            'full_name': self.full_name,
            #'atomized_name': self.atomized_name,
            #'full_name_en': self.full_name_en,
            'english_name': self.english_name,
            'abbreviated_name': self.abbreviated_name,
            'preferred_name': self.preferred_name,
            'is_collector': self.is_collector,
            'is_identifier': self.is_identifier,
        }
        return data

class Organization(Base):
    __tablename__ = 'organization'

    id = Column(Integer, primary_key=True)
    name = Column(String(500))
    abbreviation = Column(String(500))
    related_link_categories = relationship('RelatedLinkCategory')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'abbreviation': self.abbreviation,
        }


class Dataset(Base):
    __tablename__ = 'dataset'

    id = Column(Integer, primary_key=True)
    name = Column(String(500), unique=True)
    organization_id = Column(Integer, ForeignKey('organization.id', ondelete='SET NULL'), nullable=True)
    organization = relationship('Organization')
    # code ?

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'organization': self.organization.to_dict(),
        }

class Transaction(Base):
    __tablename__ = 'transaction'

    EXCHANGE_TYPE_CHOICES = (
        ('0', '無'),
        ('1', 'Exchange to (交換出去)'),
        ('2', 'Exchange from (交換來的)'),
        ('3', 'From (贈送來的)'),
        ('4' ,'To (贈送給)'),
    )

    id = Column(Integer, primary_key=True)
    title = Column(String(500))
    unit_id = Column(ForeignKey('unit.id', ondelete='SET NULL'))
    transaction_type = Column(String(500)) #  (DiversityWorkbench) e.g. gift in or out, exchange in or out, purchase in or out
    organization_id = Column(Integer, ForeignKey('organization.id', ondelete='SET NULL'), nullable=True)
    organization_text = Column(String(500))

    def to_dict(self):
        display_type = list(filter(lambda x: str(self.transaction_type) == x[0], self.EXCHANGE_TYPE_CHOICES))
        return {
            'title': self.title,
            'transaction_type': self.transaction_type,
            'display_transaction_type': display_type[0][1] if len(display_type) else '',
            # 'organization_id': self.organization_id,
            'organization_text': self.organization_text,
        }


class Project(Base):
    __tablename__ = 'project'

    id = Column(Integer, primary_key=True)
    name = Column(String(500))

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
        }

class ArticleCategory(Base):
    __tablename__ = 'article_category'

    id = Column(Integer, primary_key=True)
    name = Column(String(500))
    label = Column(String(500))
    organization_id = Column(Integer, ForeignKey('organization.id', ondelete='SET NULL'), nullable=True)

    def to_dict(self):
        return {
            'id': self.id, 
            'name': self.name,
            'label': self.label,
        }

class Article(Base):
    __tablename__ = 'article'

    id = Column(Integer, primary_key=True)
    subject = Column(String(500))
    content = Column(Text)
    organization_id = Column(Integer, ForeignKey('organization.id', ondelete='SET NULL'), nullable=True)
    category_id = Column(Integer, ForeignKey('article_category.id', ondelete='SET NULL'), nullable=True)
    category = relationship('ArticleCategory')
    publish_date = Column(Date)
    # published_by = Column(String(500))
    data = Column(JSONB) # language, url, published_by
    is_markdown = Column(Boolean, default=True)
    created = Column(DateTime, default=get_time)

    def to_dict(self):
        return {
            'id': self.id or '',
            'subject': self.subject or '',
            'content': self.content or '',
            'category_id': self.category_id or '',
            'publish_date': self.publish_date.strftime('%Y-%m-%d') if self.publish_date else'',
            'created': self.created or '',
            'category': self.category.to_dict() if self.category else None,
        }

    def get_form_layout(self):
        return {
            'categories': [x.to_dict() for x in ArticleCategory.query.all()]
        }

class MultimediaObject(Base):
    __tablename__ = 'multimedia_object'

    id = Column(Integer, primary_key=True)
    #collection_id = Column(ForeignKey('collection.id', ondelete='SET NULL'))

    unit_id = Column(ForeignKey('unit.id', ondelete='SET NULL'))
    multimedia_type = Column(String(500), default='StillImage') # DC term. Recommended terms are Collection, StillImage, Sound, MovingImage, InteractiveResource, Text.
    title = Column(String(500))
    source = Column(String(500))
    provider = Column(String(500))
    file_url = Column(String(500))
    # product_url
    created = Column(DateTime, default=get_time)
    note = Column(Text)
    source_data = Column(JSONB)


class RelatedLinkCategory(Base):
    __tablename__ = 'related_link_category'

    id = Column(Integer, primary_key=True)
    label = Column(String(500))
    name = Column(String(500))
    sort = Column(Integer, nullable=True)
    organization_id = Column(ForeignKey('organization.id', ondelete='SET NULL'))
    related_links = relationship('RelatedLink')

class RelatedLink(Base):
    __tablename__ = 'related_link'

    id = Column(Integer, primary_key=True)
    category_id = Column(ForeignKey('related_link_category.id', ondelete='SET NULL'))
    title = Column(String(500))
    url = Column(String(1000))
    note = Column(String(1000))
    status = Column(String(4), default='P')
    organization_id = Column(Integer, ForeignKey('organization.id', ondelete='SET NULL'), nullable=True)

    category = relationship('RelatedLinkCategory', back_populates='related_links')

class User(Base, UserMixin):
    __tablename__ = 'user'

    id = Column(Integer, primary_key=True)
    username = Column(String(500))
    passwd = Column(String(500))
    created = Column(DateTime, default=get_time)
    status = Column(String(1), default='P')
    organization_id = Column(Integer, ForeignKey('organization.id', ondelete='SET NULL'), nullable=True)
