"""article_add_org_id

Revision ID: 27ddcefbc1e2
Revises: 961e4ff9c010
Create Date: 2022-09-29 19:41:50.672869

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '27ddcefbc1e2'
down_revision = '961e4ff9c010'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('article', sa.Column('organization_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'article', 'organization', ['organization_id'], ['id'], ondelete='SET NULL')
    op.add_column('article_category', sa.Column('organization_id', sa.Integer(), nullable=True))
    op.create_foreign_key(None, 'article_category', 'organization', ['organization_id'], ['id'], ondelete='SET NULL')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_constraint(None, 'article_category', type_='foreignkey')
    op.drop_column('article_category', 'organization_id')
    op.drop_constraint(None, 'article', type_='foreignkey')
    op.drop_column('article', 'organization_id')
    # ### end Alembic commands ###
