"""related_link2

Revision ID: 961aeef7b746
Revises: 96dd49f18414
Create Date: 2022-12-05 00:31:19.017064

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '961aeef7b746'
down_revision = '96dd49f18414'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('related_link', sa.Column('category_id', sa.Integer(), nullable=True))
    op.add_column('related_link', sa.Column('status', sa.String(length=4), nullable=True))
    op.drop_constraint('related_link_related_link_category_id_fkey', 'related_link', type_='foreignkey')
    op.create_foreign_key(None, 'related_link', 'related_link_category', ['category_id'], ['id'], ondelete='SET NULL')
    op.drop_column('related_link', 'related_link_category_id')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('related_link', sa.Column('related_link_category_id', sa.INTEGER(), autoincrement=False, nullable=True))
    op.drop_constraint(None, 'related_link', type_='foreignkey')
    op.create_foreign_key('related_link_related_link_category_id_fkey', 'related_link', 'related_link_category', ['related_link_category_id'], ['id'], ondelete='SET NULL')
    op.drop_column('related_link', 'status')
    op.drop_column('related_link', 'category_id')
    # ### end Alembic commands ###
