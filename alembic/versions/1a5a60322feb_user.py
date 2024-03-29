"""user

Revision ID: 1a5a60322feb
Revises: 75ce9a06e716
Create Date: 2022-12-06 09:05:52.310346

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '1a5a60322feb'
down_revision = '75ce9a06e716'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('user',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('username', sa.String(length=500), nullable=True),
    sa.Column('passwd', sa.String(length=500), nullable=True),
    sa.Column('created', sa.DateTime(), nullable=True),
    sa.Column('status', sa.String(length=1), nullable=True),
    sa.Column('organization_id', sa.Integer(), nullable=True),
    sa.ForeignKeyConstraint(['organization_id'], ['organization.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('user')
    # ### end Alembic commands ###
