from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
)
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import JSONB

from app.database import Base


class Taxon(Base):
    '''abcd: TaxonIdentified
    '''
    RANK_HIERARCHY = ['family', 'genus', 'species']

    __tablename__ = 'taxon'
    id = Column(Integer, primary_key=True)
    rank = Column(String(50))
    full_scientific_name = Column(String(500))
    # Botanical
    first_epithet = Column(String(500))
    infraspecific_epithet = Column(String(500)) # final epithet
    author = Column(String(500))
    canonical_name = Column(String(500))
    status = Column(String(50))
    common_name = Column(String(500)) # abcd: InformalName
    code = Column(String(500))
    #hybrid_flag =
    #author_team_parenthesis
    #author_team
    #cultivar_group_name
    #cultivar_ame
    #trade_designation_names


    # abcd: Zoological
    #Subgenus
    #SubspeciesEpithet
    #Breed
    source_data = Column(JSONB)

    @property
    def display_name(self):
        s = '[{}] {}'.format(self.rank, self.full_scientific_name)
        if self.common_name:
            s = '{} ({})'.format(s, self.common_name)
        return s


    #def taxon(self):

    #print (map((lambda x: ), self.RANK_HIERARCHY))
    #    if self.rank ==

    def to_dict(self):
        return {
            'id': self.id,
            'full_scientific_name': self.full_scientific_name,
            'rank': self.rank,
            'common_name': self.common_name,
            'display_name': self.display_name,
        }
