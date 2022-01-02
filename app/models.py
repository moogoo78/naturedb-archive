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

from app.utils import get_time
from app.database import Base
from app.taxon.models import ScientificName

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
        return {
            'id': self.id,
            'parameter': self.parameter,
            'text': self.text,
        }

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
    scientific_name_id = Column(Integer, ForeignKey('scientific_name.id', ondelete='set NULL'), nullable=True)
    scientific_name = relationship('ScientificName', backref=backref('scientific_name'))
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
            'collection_id': self.collection_id,
            'identifier_id': self.identifier_id,
            'identifier': self.identifier.to_dict() if self.identifier else None,
            'scientific_name_id': self.scientific_name_id,
            #'scientific_name': self.scientifi
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
    locality_text = Column(String(500))
    locality_text2 = Column(String(500)) #DEPRICATED

    #country
    named_areas = relationship('CollectionNamedArea')

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

    def to_dict(self):
        # geospatial = {
        #     'named_area_list': [x.named_area.todict() for x in self.named_areas],
        #     'altitude': (self.altitude, self.altitude2),
        #     'longitude': self.longitude_decimal,
        #     'latitude': self.latitude_decimal,
        #     'locality': self.locality_text,
        # }

        data = {
            'id': self.id,
            'collect_date': self.collect_date,
            'collector_id': self.collector_id,
            'collector__full_name': self.collector.full_name,
            #'geospatial': geospatial,
            'named_area_list': [x.named_area.to_dict() for x in self.named_areas],
            'altitude': (self.altitude, self.altitude2),
            'longitude': self.longitude_decimal,
            'latitude': self.latitude_decimal,
            'locality': self.locality_text,
            'mof_list': [x.to_dict() for x in self.biotope_measurement_or_facts],
            #'field_number_list': [x.todict() for x in self.field_numbers],
            'field_number': self.field_number,
            'units': [x.to_dict() for x in self.units],
        }
        if last_taxon := self.last_taxon:
            data['latest_scientific_name'] = last_taxon
        for i in data['named_area_list']:
            if i['area_class_id'] == 1:
                data['named_area_country_id'] = i['id']
            elif i['area_class_id'] == 2:
                data['named_area_province_id'] = i['id']
            elif i['area_class_id'] == 3:
                data['named_area_hsien_id'] = i['id']
            elif i['area_class_id'] == 4:
                data['named_area_town_id'] = i['id']
            elif i['area_class_id'] == 5:
                data['named_area_park_id'] = i['id']
            elif i['area_class_id'] == 6:
                data['named_area_locality_id'] = i['id']
        return data

    @property
    def last_taxon(self):
        if last_id := self.identifications.order_by(desc('verification_level')).first():
            if taxon := last_id.scientific_name:
                return last_id.scientific_name.full_scientific_name
        return ''

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
        if len(self.atomized_name):
            if en_name := self.atomized_name.get('en', ''):
                return '{} {}'.format(en_name['inherited_name'], en_name['given_name'])
        return ''

    def to_dict(self):
        data = {
            'id': self.id,
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
