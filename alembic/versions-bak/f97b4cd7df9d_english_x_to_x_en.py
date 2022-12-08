"""english_x to x_en

Revision ID: f97b4cd7df9d
Revises: 9a5c0c705a77
Create Date: 2021-12-28 14:51:15.120527

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'f97b4cd7df9d'
down_revision = '9a5c0c705a77'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('person', sa.Column('full_name_en', sa.String(length=500), nullable=True))
    op.drop_column('person', 'english_full_name')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('person', sa.Column('english_full_name', sa.VARCHAR(length=500), autoincrement=False, nullable=True))
    op.drop_column('person', 'full_name_en')
    # ### end Alembic commands ###