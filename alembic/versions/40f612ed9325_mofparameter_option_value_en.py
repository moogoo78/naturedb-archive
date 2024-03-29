"""mofparameter-option-value-en

Revision ID: 40f612ed9325
Revises: b2c3f3ba4a3c
Create Date: 2022-09-05 09:47:30.602092

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '40f612ed9325'
down_revision = 'b2c3f3ba4a3c'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_column('measurement_or_fact_parameter_option', 'value_en')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('measurement_or_fact_parameter_option', sa.Column('value_en', sa.VARCHAR(length=500), autoincrement=False, nullable=True))
    # ### end Alembic commands ###
