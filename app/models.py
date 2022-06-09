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
)
from sqlalchemy.orm import (
    relationship,
    backref
)
from sqlalchemy.dialects.postgresql import JSONB

from app.utils import (
    get_time,
    dd2dms,
)
from app.database import Base
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

class MeasurementOrFactParameter(Base):
    __tablename__ = 'measurement_or_fact_parameter'
    id = Column(Integer, primary_key=True)
    dataset_id = Column(Integer, ForeignKey('dataset.id', ondelete='SET NULL'), nullable=True)
    name = Column(String(500))
    label = Column(String(500))

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
    value_en = Column(String(500))
    parameter = relationship('MeasurementOrFactParameter')
    group = relationship('MeasurementOrFactParameterOptionGroup')

    def to_dict(self):
        return {
            'id': self.id,
            'value': self.value,
            'value_en': self.value_en,
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
        ('fruit-color', '果色'),
    )

    #PARAMETER_FOR_COLLECTION = ('habitat', 'veget', 'topography', 'naturalness', 'light-intensity', 'humidity', 'abundance')
    UNIT_OPTIONS = (
        {'id': 10, 'name': 'life-form', 'label': '生長型'},
        {'id': 11, 'name': 'flower', 'label': '花'},
        {'id': 12, 'name': 'fruit', 'label': '果'},
        {'id': 13, 'name': 'flower-color', 'label': '花色'},
        {'id': 14, 'name': 'fruit-color', 'label': '果色'}
    )
    BIOTOPE_OPTIONS = (
        {'id': 7, 'name': 'veget', 'label': '植群型'},
        {'id': 6, 'name': 'topography', 'label': '地形位置'},
        {'id': 2, 'name': 'habitat', 'label': '微棲地'},
        {'id': 5 , 'name': 'naturalness', 'label': '自然度'},
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
    value = Column(String(500))
    value_en = Column(String(500))
    #lower_value
    #upper_value
    #accuracy
    #measured_by
    #unit_of_measurement
    #applies_to

    def get_value(self):
        return (
            self.option.id if self.option else None,
            self.value if self.value else '',
            self.value_en if self.value_en else '',
        )

    def to_dict(self):
        #item = [x for x in self.PARAMETER_CHOICES if x[0] == self.parameter][0]
        return {
            'id': self.id,
            'option_id': self.option_id if self.option_id else None,
            #'label': item[1],
            #'parameter': self.parameter.to_dict(),
            'value': self.value,
            'value_en': self.value_en,
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
            #'area_class': self.area_class.to_dict(),
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

    # code: International Code of Botanical Nomenclature
    TYPE_STATUS_CHOICES = (
        ('holotype', 'holotype'),
        ('lectotype', 'lectotype'),
        ('isotype', 'isotype'),
        ('syntype', 'syntype'),
        ('paratype', 'paratype'),
        ('neotype', 'neotype'),
        ('epitype', 'epitype'),
    )

    __tablename__ = 'identification'

    id = Column(Integer, primary_key=True)
    collection_id = Column(Integer, ForeignKey('collection.id', ondelete='SET NULL'), nullable=True)
    collection = relationship('Collection', back_populates='identifications')
    identifier_id = Column(Integer, ForeignKey('person.id', ondelete='SET NULL'), nullable=True)
    identifier = relationship('Person')
    taxon_id = Column(Integer, ForeignKey('taxon.id', ondelete='set NULL'), nullable=True, index=True)
    taxon = relationship('Taxon', backref=backref('taxon'))
    type_status = Column(String(50), nullable=True)
    type_text = Column(String(1000))
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

    def to_dict(self):
        return {
            'id': self.id,
            #'identification_id': self.id,
            #'collection_id': self.collection_id,
            'identifier_id': self.identifier_id,
            'identifier': self.identifier.to_dict() if self.identifier else None,
            'taxon_id': self.taxon_id,
            'taxon': self.taxon.to_dict() if self.taxon else None,
            'date': self.date.strftime('%Y-%m-%d') if self.date else '',
            'date_text': self.date_text,
            'verification_level': self.verification_level,
            'sequence': self.sequence,
        }
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


class Collection(Base):
    __tablename__ = 'collection'

    #NAMED_AREA_LIST = ['country', 'province', 'hsien', 'town', 'national_park', 'locality']

    id = Column(Integer, primary_key=True)
    #method

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
    latitude_text = Column(String(50))
    longitude_text = Column(String(50))

    field_note = Column(Text)
    field_note_en = Column(Text)
    other_field_numbers = relationship('FieldNumber')
    identifications = relationship('Identification', back_populates='collection', lazy='dynamic')
    last_taxon_text = Column(Text)
    last_taxon_id = Column(Integer, ForeignKey('taxon.id'))
    units = relationship('Unit')
    created = Column(DateTime, default=get_time)
    changed = Column(DateTime, default=get_time, onupdate=get_time) # abcd: DateModified
    project_id = Column(Integer, ForeignKey('project.id'))

    @property
    def key(self):
        unit_keys = [x.key for x in self.units]
        if len(unit_keys):
            return ','.join(unit_keys)
        else:
            return '--'

    def get_parameters(self, parameter_list=[]):
        params = {f'{x.parameter.name}': x for x in self.biotope_measurement_or_facts}

        rows = []
        if len(parameter_list) == 0:
            parameter_list = [x for x in params]
        for key in parameter_list:
            if p := params.get(key, ''):
                rows.append(p.to_dict())
        return rows

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

    # collection.to_dict
    def to_dict(self, include_units=True):
        ids = [x.to_dict() for x in self.identifications.order_by(Identification.verification_level).all()]
        taxon = Taxon.query.filter(Taxon.id==self.last_taxon_id).first()
        # named_area_map = self.get_named_area_map()
        named_area_list = self.get_named_area_list()
        biotope_map = {f'{x.parameter.name}': x.to_dict() for x in self.biotope_measurement_or_facts}
        biotopes = get_structed_list(MeasurementOrFact.BIOTOPE_OPTIONS, biotope_map)

        data = {
            'id': self.id,
            'key': self.key,
            'collect_date': self.collect_date.strftime('%Y-%m-%d') if self.collect_date else '',
            'display_collect_date': self.collect_date.strftime('%Y-%m-%d') if self.collect_date else '',
            'collector_id': self.collector_id,
            'collector': self.collector.to_dict() if self.collector else '',
            #'named_area_list': na_list,
            'named_areas': named_area_list,
            'altitude': self.altitude,
            'altitude2':self.altitude2,
            'longitude_decimal': self.longitude_decimal,
            'latitude_decimal': self.latitude_decimal,
            'locality_text': self.locality_text,
            #'biotope_measurement_or_facts': {x.parameter.name: x.to_dict() for x in self.biotope_measurement_or_facts},
            'biotopes': biotopes,
            #'measurement_or_facts': get_hast_parameters(self.biotope_measurement_or_facts),
            #'params': get_structed_list(MeasurementOrFact.PARAMETER_FOR_COLLECTION),
            #'field_number_list': [x.todict() for x in self.field_numbers],
            'field_number': self.field_number,
            'identifications': ids,
            #'identification_last': ids[-1] if len(ids) else None, # React-Admin cannot read identifications[-1]
            'last_taxon_text': self.last_taxon_text,
            'last_taxon_id': self.last_taxon_id,
            'last_taxon': taxon.to_dict() if taxon else None,
            'units': [x.to_dict() for x in self.units],
        }
        #for i,v in named_area_map.items():
        #    data[f'named_area__{i}_id'] = v['value']['id'] if v['value'] else None

        #for x in self.biotope_measurement_or_facts:
        #    data[f'biotope__{x.parameter.name}'] = x.get_value()

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
                x_label = '{}{}\u00b0{:02d}\'{:02d}"'.format('N' if dms_lng[0] > 0 else 'S', dms_lng[0], dms_lng[1], int(dms_lng[2]))
                y_label = '{}{}\u00b0{}\'{:02d}"'.format('E' if dms_lat[0] > 0 else 'W', dms_lat[0], dms_lat[1], int(dms_lat[2]))
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
        print(named_area_map, '---',flush=True)
        return get_structed_map(AreaClass.DEFAULT_OPTIONS, named_area_map)

    def get_named_area_list(self):
        named_area_map = {f'{x.area_class.name}': x.to_dict() for x in self.named_areas}
        return get_structed_list(AreaClass.DEFAULT_OPTIONS, named_area_map)

    def get_form_options(self):
        rows_by_area_class = {}
        for x in AreaClass.DEFAULT_OPTIONS:
            rows_by_area_class[x['name']] = []
            for na in NamedArea.query.filter(NamedArea.area_class_id==x['id']).order_by('id').all():
                rows_by_area_class[x['name']].append(na.to_dict())

        rows_by_parameter = {}
        for param in MeasurementOrFact.BIOTOPE_OPTIONS:
            rows_by_parameter[param['name']] = []
            for row in MeasurementOrFactParameterOption.query.filter(MeasurementOrFactParameterOption.parameter_id==param['id']).all():
                rows_by_parameter[param['name']].append(row.to_dict())

        rows_by_parameter2 = {}
        for param in MeasurementOrFact.UNIT_OPTIONS:
            rows_by_parameter2[param['name']] = []
            for row in MeasurementOrFactParameterOption.query.filter(MeasurementOrFactParameterOption.parameter_id==param['id']).all():
                rows_by_parameter2[param['name']].append(row.to_dict())

        data = {
            'named_areas': rows_by_area_class,
            'biotopes': rows_by_parameter,
            'measurement_or_facts': rows_by_parameter2,
        }
        return data

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

    __tablename__ = 'unit'

    id = Column(Integer, primary_key=True)
    #guid =
    dataset_id = Column(Integer, ForeignKey('dataset.id', ondelete='SET NULL'), nullable=True, index=True)
    created = Column(DateTime, default=get_time)
    changed = Column(DateTime, default=get_time, onupdate=get_time) # abcd: DateModified
    #last_editor = Column(String(500))
    #owner
    #identifications = relationship('Identification', back_populates='unit')
    kind_of_unit = Column(String(500)) # herbarium sheet (HS), leaf, muscle, leg, blood, ...
    # multimedia_objects
    # assemblages
    # associations
    # sequences
    collection_id = Column(Integer, ForeignKey('collection.id', ondelete='SET NULL'), nullable=True)
    measurement_or_facts = relationship('MeasurementOrFact')
    #planting_date
    #propagation

    # abcd: SpecimenUnit
    accession_number = Column(String(500), index=True)
    duplication_number = Column(String(500)) # ==Think==
    #abcd:preparations
    preparation_type = Column(String(500)) #specimens (S), tissues, DNA
    preparation_date = Column(Date)
    # abcd: Acquisition
    acquisition_type = Column(String(500)) # bequest, purchase, donation
    acquisition_date = Column(DateTime)
    acquired_from = Column(Integer, ForeignKey('person.id'), nullable=True)
    acquisition_source_text = Column(Text) # hast: provider

    specimen_marks = relationship('SpecimenMark')
    dataset = relationship('Dataset')
    collection = relationship('Collection', overlaps='units') # TODO warning
    transactions = relationship('Transaction')
    # abcd: Disposition (in collection/missing...)

    # observation
    source_data = Column(JSONB)
    information_withheld = Column(Text)
    annotations = relationship('Annotation')

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

        data = {
            'id': self.id,
            'key': self.key,
            'accession_number': self.accession_number,
            'duplication_number': self.duplication_number,
            #'collection_id': self.collection_id,
            'preparation_type': self.preparation_type,
            'preparation_date': self.preparation_date,
            'measurement_or_facts': mofs,
            'image_url': self.get_image(),
            'transactions': [x.to_dict() for x in self.transactions],
            #'dataset': self.dataset.to_dict(), # too many
        }
        #if mode == 'with-collection':
        #    data['collection'] = self.collection.to_dict(include_units=False)

        return data

    def get_parameters(self, parameter_list=[]):
        params = {f'{x.parameter.name}': x for x in self.measurement_or_facts}

        rows = []
        if len(parameter_list) == 0:
            parameter_list = [x for x in params]
        for key in parameter_list:
            if p := params.get(key, ''):
                rows.append(p.to_dict())
        return rows

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
            accession_number_int = int(self.accession_number)
            instance_id = f'{accession_number_int:06}'
            first_3 = instance_id[0:3]
            img_url = f'http://brmas-pub.s3-ap-northeast-1.amazonaws.com/hast/{first_3}/S_{instance_id}{thumbnail}.jpg'
            return img_url
        else:
            return None

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
            'full_name_en': self.full_name_en,
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
            'organization_id': self.organization_id,
            'organization_text': self.organization_text,
        }


class Project(Base):
    __tablename__ = 'project'

    id = Column(Integer, primary_key=True)
    name = Column(String(500))
