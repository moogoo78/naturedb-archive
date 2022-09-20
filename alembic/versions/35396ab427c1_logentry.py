"""logentry

Revision ID: 35396ab427c1
Revises: 1ad2f86e9b14
Create Date: 2022-09-06 08:25:57.125881

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '35396ab427c1'
down_revision = '1ad2f86e9b14'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('log_entry',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('model', sa.String(length=500), nullable=True),
    sa.Column('item_id', sa.String(length=500), nullable=True),
    sa.Column('action', sa.String(length=500), nullable=True),
    sa.Column('changes', postgresql.JSONB(astext_type=sa.Text()), nullable=True),
    sa.Column('created', sa.DateTime(), nullable=True),
    sa.Column('remarks', sa.String(length=500), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('log_entry')
    # ### end Alembic commands ###
