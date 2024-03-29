"""add annotation back

Revision ID: c47b089e9db7
Revises: aa1922050156
Create Date: 2021-12-24 20:04:17.779656

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c47b089e9db7'
down_revision = 'aa1922050156'
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
    sa.Column('memo', sa.String(length=500), nullable=True),
    sa.ForeignKeyConstraint(['unit_id'], ['unit.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('annotation')
    # ### end Alembic commands ###
