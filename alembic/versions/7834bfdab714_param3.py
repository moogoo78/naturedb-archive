"""param3

Revision ID: 7834bfdab714
Revises: c2a9cbe335ee
Create Date: 2022-01-10 03:29:01.096466

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '7834bfdab714'
down_revision = 'c2a9cbe335ee'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('measurement_or_fact', sa.Column('parameter_id', sa.Integer(), nullable=True))
    op.drop_constraint('measurement_or_fact_paremeter_id_fkey', 'measurement_or_fact', type_='foreignkey')
    op.create_foreign_key(None, 'measurement_or_fact', 'measurement_or_fact_parameter', ['parameter_id'], ['id'], ondelete='SET NULL')
    op.drop_column('measurement_or_fact', 'paremeter_id')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('measurement_or_fact', sa.Column('paremeter_id', sa.INTEGER(), autoincrement=False, nullable=True))
    op.drop_constraint(None, 'measurement_or_fact', type_='foreignkey')
    op.create_foreign_key('measurement_or_fact_paremeter_id_fkey', 'measurement_or_fact', 'measurement_or_fact_parameter', ['paremeter_id'], ['id'], ondelete='SET NULL')
    op.drop_column('measurement_or_fact', 'parameter_id')
    # ### end Alembic commands ###