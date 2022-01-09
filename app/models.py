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
    for i, v in enumerate(options):
        res.append({
            'id': v['id'],
            'name': v['name'],
            'label': v['label'],
            'data': value_dict.get(str(v['id']))
        })
    return res

def get_hast_parameters(obj=None):
    '''obj is Collection.biotope_measurement_or_facts
    '''
    rows = []
    if obj:
        mof_dict = {f'{x.parameter}': x for x in obj}

    for param in MeasurementOrFact.PARAMETER_FOR_COLLECTION:
        mof_id = None
        mof_text = ''
        if obj:
            if x := mof_dict.get(param):
                mof_id = x.id
                mof_text = x.text
        rows.append({
            'id': mof_id,
            'parameter': param,
            'label': MeasurementOrFact.find_label(param),
            'text': mof_text,
        })

    return rows

#class UnitAnnotation(Base):
#    __tablename__ = 'unit_annotation'
    #id = Column(Integer, primary_key=True)
#    unit_id = Column(Integer, ForeignKey('unit.id', ondelete='SET NULL'), nullable=True, primary_key=True)
#    annotation_id =  Column(Integer, ForeignKey('annotation.id', ondelete='SET NULL'), nullable=True, primary_key=True)

#class MeasurementOrFactParamenter
# dataset_id
# parameter_choices


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

    PARAMETER_FOR_COLLECTION = ('habitat', 'veget', 'topography', 'naturalness', 'light-intensity', 'humidity', 'abundance')
    PARAMETER_FOR_UNIT = ('life-form', 'flower', 'fruit', 'flower-color', 'fruit-color')

    id = Column(Integer, primary_key=True)
    collection_id = Column(ForeignKey('collection.id', ondelete='SET NULL'))
    unit_id = Column(ForeignKey('unit.id', ondelete='SET NULL'))
    parameter = Column(String(500))
    text = Column(String(500))
    #lower_value
    #upper_value
    #accuracy
    #measured_by
    #unit_of_measurement
    #applies_to
    def to_dict(self):
        item = [x for x in self.PARAMETER_CHOICES if x[0] == self.parameter][0]
        return {
            'id': self.id,
            'label': item[1],
            'parameter': self.parameter,
            'text': self.text,
            'collection_id': self.collection_id,
        }


    @staticmethod
    def find_label(param):
        for i in MeasurementOrFact.PARAMETER_CHOICES:
            if i[0] == param:
                return i[1]
        return ''

class Annotation(Base):

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



# Geospatial
class AreaClass(Base):

#HAST: country (249), province (142), hsienCity (97), hsienTown (371), additionalDesc(specimen.locality_text): ref: hast_id: 144954

    __tablename__ = 'area_class'
    DEFAULT_OPTIONS = [
        {'id': 1, 'name': 'country', 'label': '國家'},
        {'id': 2, 'name': 'province', 'label': '省/州'},
        {'id': 3, 'name': 'hsien', 'label': '縣/市'},
        {'id': 4, 'name': 'town', 'label': '鄉/鎮'},
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
    #parent = models.ForeignKey('self', on_delete=models.SET_NULL, null=True)

    @property
    def display_name(self):
        return '{}{}'.format(
            self.name if self.name else '',
            f' ({self.name_en})' if self.name_en else ''
        )

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'name_en': self.name_en,
            'area_class_id': self.area_class_id,
            'area_class': self.area_class.to_dict(),
            'name_mix': '/'.join([self.name, self.name_en]),
        }

class CollectionNamedArea(Base):
    __tablename__ = 'collection_named_area'

    id = Column(Integer, primary_key=True)
    collection_id = Column(Integer, ForeignKey('collection.id', ondelete='SET NULL'), nullable=True)
    named_area_id = Column(Integer, ForeignKey('named_area.id', ondelete='SET NULL'), nullable=True)
    named_area = relationship('NamedArea')
    #units = relationship('Unit')


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
    taxon_id = Column(Integer, ForeignKey('taxon.id', ondelete='set NULL'), nullable=True)
    taxon = relationship('Taxon', backref=backref('taxon'))
    date = Column(DateTime)
    date_text = Column(String(50)) #格式不完整的鑑訂日期, helper: ex: 1999-1
    created = Column(DateTime, default=get_time)
    changed = Column(DateTime, default=get_time, onupdate=get_time) # abcd: DateModified
    verification_level = Column(String(50)) # hast: verificationNo.

    # abcd: IdentificationSource
    reference = Column(Text)
    note = Column(Text)
    source_data = Column(JSONB)

    def to_dict(self):
        return {
            'id': self.id,
            'identification_id': self.id,
            'collection_id': self.collection_id,
            'identifier_id': self.identifier_id,
            'identifier': self.identifier.to_dict() if self.identifier else None,
            'taxon_id': self.taxon_id,
            'taxon': self.taxon.to_dict() if self.taxon else None,
            'date': self.date,
            'date_text': self.date_text,
            'verification_level': self.verification_level,
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
    #project
    #method

    collect_date = Column(DateTime) # abcd: Date
    collect_date_text = Column(String(500)) # DEPRECATED
    # abcd: GatheringAgent, DiversityCollectinoModel: CollectionAgent
    collector_id = Column(Integer, ForeignKey('person.id'))
    field_number = Column(String(500))
    collector = relationship('Person')
    companions = relationship('CollectionPerson') # companion
    companion_text = Column(String(500)) # unformatted value, # HAST:companions

    #biotope = Column(String(500))
    biotope_measurement_or_facts = relationship('MeasurementOrFact')
    sex = Column(String(500))
    age = Column(String(500))

    # Locality
    locality_text = Column(String(1000))
    locality_text2 = Column(String(1000)) #DEPRICATED

    #country
    named_area_relations = relationship('CollectionNamedArea')

    altitude = Column(Integer)
    altitude2 = Column(Integer)
    #depth

    # Coordinate
    latitude_decimal = Column(Numeric(precision=9, scale=6))
    longitude_decimal = Column(Numeric(precision=9, scale=6))
    latitude_text = Column(String(50))
    longitude_text = Column(String(50))

    note = Column(Text)
    other_field_numbers = relationship('FieldNumber')
    identifications = relationship('Identification', back_populates='collection', lazy='dynamic')
    units = relationship('Unit')
    created = Column(DateTime, default=get_time)
    changed = Column(DateTime, default=get_time, onupdate=get_time) # abcd: DateModified

    # collection.to_dict
    def to_dict(self):
        ids = [x.to_dict() for x in self.identifications.order_by(Identification.verification_level).all()]

        data = {
            'id': self.id,
            'collect_date': self.collect_date,
            'collector_id': self.collector_id,
            'collector': self.collector.to_dict() if self.collector else '',
            'named_area_list': self.get_named_area_list(),
            'altitude': self.altitude,
            'altitude2':self.altitude2,
            'longitude_decimal': self.longitude_decimal,
            'latitude_decimal': self.latitude_decimal,
            'locality_text': self.locality_text,
            #'measurement_or_facts': [x.to_dict() for x in self.biotope_measurement_or_facts],
            'measurement_or_facts': get_hast_parameters(self.biotope_measurement_or_facts),
            'params': get_structed_list(MeasurementOrFact.PARAMETER_FOR_COLLECTION),
            #'field_number_list': [x.todict() for x in self.field_numbers],
            'field_number': self.field_number,
            'units': [x.to_dict() for x in self.units],
            'identifications': ids,
            'identification_last': ids[-1], # React-Admin cannot read identifications[-1]
        }

        return data


    def get_parameter(self, parameter_list=[]):
        pass

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
                }
        else:
            return None

    def get_named_area_list(self, key=''):
        if key == '':
            named_area_dict = {f'{x.named_area.area_class_id}': x.named_area.to_dict() for x in self.named_area_relations}
            data = get_structed_list(AreaClass.DEFAULT_OPTIONS,  named_area_dict)
            print(data, flush=True)
            return data
        else:
            for x in self.named_area_relations:
                na = x.named_area
                if na.area_class.name == key:
                    return na.to_dict()

    def display_field_number(self, delimeter='', is_list=False):
        '''DEPRICATED'''
        fn_list = []
        for fn in self.field_numbers:
            x = fn.todict()

            if is_list == True:
                fn_list.append((x['collector']['other_name'], x['value']))

            else:
                if delimeter == '':
                    delimeter = ' '
                    fn_list.append('{}{}{}'.format(x['collector']['other_name'], delimeter, x['value']))
        if is_list == True:
            return fn_list
        else:
            return ','.join(fn_list)

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
    __tablename__ = 'unit'

    id = Column(Integer, primary_key=True)
    #guid =
    dataset_id = Column(Integer, ForeignKey('dataset.id', ondelete='SET NULL'), nullable=True)
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
    accession_number = Column(String(500))
    duplication_number = Column(String(500)) # ==Think==
    #abcd:preparations
    preparation_type = Column(String(500)) #specimens (S), tissues, DNA
    preparation_date = Column(Date)
    # abcd: Acquisition
    acquisition_type = Column(String(500)) # bequest, purchase, donation
    acquisition_date = Column(DateTime)
    acquired_from = Column(Integer, ForeignKey('person.id'), nullable=True)
    acquisition_source_text = Column(Text)
    specimen_marks = relationship('SpecimenMark')

    collection = relationship('Collection', overlaps='units') # TODO warning
    # abcd: Disposition (in collection/missing...)

    # observation
    source_data = Column(JSONB)
    information_withheld = Column(Text)
    annotations = relationship('Annotation')

    def to_dict(self):
        return {
            'id': self.id,
            'accession_number': self.accession_number,
            'collection_id': self.collection_id,
            'preparation_type': self.preparation_type,
            'preparation_date': self.preparation_date,
            'mof_list': [x.to_dict() for x in self.measurement_or_facts],
        }

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

        return name

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
