from sqlalchemy import create_engine
from sqlalchemy.orm import scoped_session, sessionmaker, Session
from sqlalchemy.ext.declarative import declarative_base

#engine = create_engine('sqlite:////tmp/test.db', convert_unicode=True)
engine = create_engine('postgresql+psycopg2://postgres:example@postgres:5432/naturedb', convert_unicode=True)
session = scoped_session(sessionmaker(autocommit=False,
                                         autoflush=False,
                                         bind=engine))
Base = declarative_base()
Base.query = session.query_property()

#session = Session(engine, future=True)
