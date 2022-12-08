"""add-annotation

Revision ID: 4a056dcb1cd7
Revises: 9ed1d42c0d4b
Create Date: 2021-12-24 19:27:21.281135

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '4a056dcb1cd7'
down_revision = '9ed1d42c0d4b'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('annotation',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('unit_id', sa.Integer(), nullable=True),
    sa.Column('category', sa.String(length=500), nullable=True),
    sa.Column('text', sa.String(length=500), nullable=True),
    sa.Column('created', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['unit_id'], ['unit.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id', 'unit_id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('annotation')
    # ### end Alembic commands ###