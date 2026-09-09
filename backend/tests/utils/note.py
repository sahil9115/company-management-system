import uuid

from sqlmodel import Session

from app import crud
from app.models import Note, NoteCreate
from tests.utils.user import create_random_user
from tests.utils.utils import random_lower_string


def create_random_note(db: Session, owner_id: uuid.UUID | None = None) -> Note:
    if owner_id is None:
        user = create_random_user(db)
        owner_id = user.id
    assert owner_id is not None
    title = random_lower_string()
    content = random_lower_string()
    note_in = NoteCreate(
        title=title,
        content=content,
        tags="work,general",
        is_pinned=False,
    )
    return crud.create_note(session=db, note_in=note_in, owner_id=owner_id)
