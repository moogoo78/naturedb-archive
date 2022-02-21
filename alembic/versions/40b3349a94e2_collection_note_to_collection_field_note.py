"""collection.note to collection.field_note

Revision ID: 40b3349a94e2
Revises: a12f7cd17742
Create Date: 2022-01-15 21:52:48.877314

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '40b3349a94e2'
down_revision = 'a12f7cd17742'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('collection', sa.Column('field_note', sa.Text(), nullable=True))
    op.add_column('collection', sa.Column('field_note_en', sa.Text(), nullable=True))
    op.drop_column('collection', 'note_en')
    op.drop_column('collection', 'note')
    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    op.add_column('collection', sa.Column('note', sa.TEXT(), autoincrement=False, nullable=True))
    op.add_column('collection', sa.Column('note_en', sa.TEXT(), autoincrement=False, nullable=True))
    op.drop_column('collection', 'field_note_en')
    op.drop_column('collection', 'field_note')
    # ### end Alembic commands ###