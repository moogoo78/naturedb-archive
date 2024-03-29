"""related_link5

Revision ID: 75ce9a06e716
Revises: 9d1e0b23f0ca
Create Date: 2022-12-05 00:55:37.174499

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '75ce9a06e716'
down_revision = '9d1e0b23f0ca'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('related_link_category', sa.Column('organization_id', sa.Integer(), nullable=True))
    op.drop_constraint('related_link_category_category_id_fkey', 'related_link_category', type_='foreignkey')
    op.create_foreign_key(None, 'related_link_category', 'organization', ['organization_id'], ['id'], ondelete='SET NULL')
    op.drop_column('related_link_category', 'category_id')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('related_link_category', sa.Column('category_id', sa.INTEGER(), autoincrement=False, nullable=True))
    op.drop_constraint(None, 'related_link_category', type_='foreignkey')
    op.create_foreign_key('related_link_category_category_id_fkey', 'related_link_category', 'related_link_category', ['category_id'], ['id'], ondelete='SET NULL')
    op.drop_column('related_link_category', 'organization_id')
    # ### end Alembic commands ###
