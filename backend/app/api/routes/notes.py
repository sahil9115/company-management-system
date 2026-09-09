import uuid
from typing import Any

from fastapi import APIRouter, HTTPException
from sqlmodel import col, func, or_, select

from app.api.deps import CurrentUser, SessionDep
from app.models import (
    Message,
    Note,
    NoteCreate,
    NotePublic,
    NotesPublic,
    NoteUpdate,
    get_datetime_utc,
)

router = APIRouter(prefix="/notes", tags=["notes"])


@router.get("/", response_model=NotesPublic)
def read_notes(
    session: SessionDep,
    current_user: CurrentUser,
    skip: int = 0,
    limit: int = 100,
    search: str | None = None,
    tag: str | None = None,
    pinned: bool | None = None,
) -> Any:
    """
     Retrieve notes.Superusers can view all notes, normal users only view their own.
    Supports filtering by search query (title/content), tag, and pinned status.
    Results are ordered with pinned notes first, then by updated_at descending.
    """
    filters = []
    if not current_user.is_superuser:
        filters.append(Note.owner_id == current_user.id)

    if search:
        search_term = f"%{search}%"
        filters.append(
            or_(
                col(Note.title).ilike(search_term),
                col(Note.content).ilike(search_term),
            )
        )

    if tag:
        filters.append(col(Note.tags).ilike(f"%{tag}%"))

    if pinned is not None:
        filters.append(Note.is_pinned == pinned)

    count_statement = select(func.count()).select_from(Note)
    if filters:
        count_statement = count_statement.where(*filters)
    count = session.exec(count_statement).one()

    statement = select(Note)
    if filters:
        statement = statement.where(*filters)

    # Order: pinned first, then by updated_at / created_at desc
    statement = (
        statement.order_by(
            col(Note.is_pinned).desc(),
            col(Note.updated_at).desc(),
            col(Note.created_at).desc(),
        )
        .offset(skip)
        .limit(limit)
    )
    notes = session.exec(statement).all()

    notes_public = [NotePublic.model_validate(note) for note in notes]
    return NotesPublic(data=notes_public, count=count)


@router.get("/{id}", response_model=NotePublic)
def read_note(session: SessionDep, current_user: CurrentUser, id: uuid.UUID) -> Any:
    """
    Get note by ID.
    """
    note = session.get(Note, id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if not current_user.is_superuser and (note.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    return note


@router.post("/", response_model=NotePublic)
def create_note(
    *, session: SessionDep, current_user: CurrentUser, note_in: NoteCreate
) -> Any:
    """
    Create a new note.
    """
    now = get_datetime_utc()
    note = Note.model_validate(
        note_in,
        update={
            "owner_id": current_user.id,
            "created_at": now,
            "updated_at": now,
        },
    )
    session.add(note)
    session.commit()
    session.refresh(note)
    return note


@router.put("/{id}", response_model=NotePublic)
def update_note(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
    note_in: NoteUpdate,
) -> Any:
    """
    Update a note.
    """
    note = session.get(Note, id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if not current_user.is_superuser and (note.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    update_dict = note_in.model_dump(exclude_unset=True)
    update_dict["updated_at"] = get_datetime_utc()
    note.sqlmodel_update(update_dict)
    session.add(note)
    session.commit()
    session.refresh(note)
    return note


@router.patch("/{id}/pin", response_model=NotePublic)
def toggle_pin_note(
    *,
    session: SessionDep,
    current_user: CurrentUser,
    id: uuid.UUID,
) -> Any:
    """
    Toggle pinned status of a note.
    """
    note = session.get(Note, id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if not current_user.is_superuser and (note.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")

    note.is_pinned = not note.is_pinned
    note.updated_at = get_datetime_utc()
    session.add(note)
    session.commit()
    session.refresh(note)
    return note


@router.delete("/{id}")
def delete_note(
    session: SessionDep, current_user: CurrentUser, id: uuid.UUID
) -> Message:
    """
    Delete a note.
    """
    note = session.get(Note, id)
    if not note:
        raise HTTPException(status_code=404, detail="Note not found")
    if not current_user.is_superuser and (note.owner_id != current_user.id):
        raise HTTPException(status_code=403, detail="Not enough permissions")
    session.delete(note)
    session.commit()
    return Message(message="Note deleted successfully")
