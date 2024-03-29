"""add article

Revision ID: 961e4ff9c010
Revises: 35396ab427c1
Create Date: 2022-09-29 14:47:46.575472

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '961e4ff9c010'
down_revision = '35396ab427c1'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.create_table('article_category',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('name', sa.String(length=500), nullable=True),
    sa.Column('label', sa.String(length=500), nullable=True),
    sa.PrimaryKeyConstraint('id')
    )
    op.create_table('article',
    sa.Column('id', sa.Integer(), nullable=False),
    sa.Column('subject', sa.String(length=500), nullable=True),
    sa.Column('content', sa.Text(), nullable=True),
    sa.Column('category_id', sa.Integer(), nullable=True),
    sa.Column('publish_date', sa.Date(), nullable=True),
    sa.Column('created', sa.DateTime(), nullable=True),
    sa.ForeignKeyConstraint(['category_id'], ['article_category.id'], ondelete='SET NULL'),
    sa.PrimaryKeyConstraint('id')
    )
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.drop_table('article')
    op.drop_table('article_category')
    # ### end Alembic commands ###
