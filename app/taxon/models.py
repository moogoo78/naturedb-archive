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


class ScientificName(Base):
    __tablename__ = 'scientific_name'
    id = Column(Integer, primary_key=True)
    rank = Column(String(50))
    full_scientific_name = Column(String(500))
    # Botanical
    first_epithet = Column(String(500))
    infraspecific_epithet = Column(String(500)) # final epithet
    author = Column(String(500))
    canonical_name = Column(String(500))
    status = Column(String(50))
    common_name = Column(String(500))
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
