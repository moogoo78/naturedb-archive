"""mof option_id

Revision ID: 5cca180175e4
Revises: 9a4457f54d94
Create Date: 2022-05-01 09:03:52.751811

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '5cca180175e4'
down_revision = '9a4457f54d94'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('measurement_or_fact', sa.Column('option_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'measurement_or_fact', 'measurement_or_fact_parameter_option', ['option_id'], ['id'], ondelete='SET NULL')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'measurement_or_fact', type_='foreignkey')
    op.drop_column('measurement_or_fact', 'option_id')
    # ### end Alembic commands ###
