"""mm-to

Revision ID: 69e2521aa765
Revises: 00effdeca18e
Create Date: 2022-10-23 17:21:12.356686

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '69e2521aa765'
down_revision = '00effdeca18e'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('multimedia_object', sa.Column('unit_id', sa.Integer(), nullable=True))
    op.drop_constraint('multimedia_object_collection_id_fkey', 'multimedia_object', type_='foreignkey')
    op.create_foreign_key(None, 'multimedia_object', 'unit', ['unit_id'], ['id'], ondelete='SET NULL')
    op.drop_column('multimedia_object', 'collection_id')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('multimedia_object', sa.Column('collection_id', sa.INTEGER(), autoincrement=False, nullable=True))
    op.drop_constraint(None, 'multimedia_object', type_='foreignkey')
    op.create_foreign_key('multimedia_object_collection_id_fkey', 'multimedia_object', 'collection', ['collection_id'], ['id'], ondelete='SET NULL')
    op.drop_column('multimedia_object', 'unit_id')
    # ### end Alembic commands ###