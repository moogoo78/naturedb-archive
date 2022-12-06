"""related_link4

Revision ID: 9d1e0b23f0ca
Revises: 7d63d6edea63
Create Date: 2022-12-05 00:54:19.084654

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '9d1e0b23f0ca'
down_revision = '7d63d6edea63'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint('organization_category_id_fkey', 'organization', type_='foreignkey')
    op.drop_column('organization', 'category_id')
    op.add_column('related_link_category', sa.Column('category_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'related_link_category', 'related_link_category', ['category_id'], ['id'], ondelete='SET NULL')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'related_link_category', type_='foreignkey')
    op.drop_column('related_link_category', 'category_id')
    op.add_column('organization', sa.Column('category_id', sa.INTEGER(), autoincrement=False, nullable=True))
    op.create_foreign_key('organization_category_id_fkey', 'organization', 'related_link_category', ['category_id'], ['id'], ondelete='SET NULL')
    # ### end Alembic commands ###
