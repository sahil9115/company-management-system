import uuid

from fastapi.testclient import TestClient
from sqlmodel import Session

from app.core.config import settings
from tests.utils.note import create_random_note


def test_create_note(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {
        "title": "Meeting Notes",
        "content": "Discuss quarterly targets and team goals",
        "tags": "work,quarterly",
        "is_pinned": True,
    }
    response = client.post(
        f"{settings.API_V1_STR}/notes/",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["content"] == data["content"]
    assert content["tags"] == data["tags"]
    assert content["is_pinned"] is True
    assert "id" in content
    assert "owner_id" in content
    assert "created_at" in content
    assert "updated_at" in content


def test_read_note(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    note = create_random_note(db)
    response = client.get(
        f"{settings.API_V1_STR}/notes/{note.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == note.title
    assert content["content"] == note.content
    assert content["id"] == str(note.id)
    assert content["owner_id"] == str(note.owner_id)


def test_read_note_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.get(
        f"{settings.API_V1_STR}/notes/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Note not found"


def test_read_note_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    note = create_random_note(db)
    response = client.get(
        f"{settings.API_V1_STR}/notes/{note.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 403
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_read_notes(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    create_random_note(db)
    create_random_note(db)
    response = client.get(
        f"{settings.API_V1_STR}/notes/",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert len(content["data"]) >= 2
    assert content["count"] >= 2


def test_read_notes_filtering(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    unique_tag = f"tag-{uuid.uuid4().hex[:8]}"
    client.post(
        f"{settings.API_V1_STR}/notes/",
        headers=superuser_token_headers,
        json={"title": "Alpha Note", "content": "Special query text", "tags": unique_tag, "is_pinned": True},
    )
    client.post(
        f"{settings.API_V1_STR}/notes/",
        headers=superuser_token_headers,
        json={"title": "Beta Note", "content": "Other text", "tags": "other", "is_pinned": False},
    )

    # Filter by search
    res = client.get(
        f"{settings.API_V1_STR}/notes/?search=Special",
        headers=superuser_token_headers,
    )
    assert res.status_code == 200
    assert any("Special query text" in n["content"] for n in res.json()["data"])

    # Filter by tag
    res_tag = client.get(
        f"{settings.API_V1_STR}/notes/?tag={unique_tag}",
        headers=superuser_token_headers,
    )
    assert res_tag.status_code == 200
    assert len(res_tag.json()["data"]) == 1
    assert res_tag.json()["data"][0]["title"] == "Alpha Note"

    # Filter by pinned
    res_pinned = client.get(
        f"{settings.API_V1_STR}/notes/?pinned=true",
        headers=superuser_token_headers,
    )
    assert res_pinned.status_code == 200
    assert all(n["is_pinned"] is True for n in res_pinned.json()["data"])


def test_update_note(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    note = create_random_note(db)
    data = {"title": "Updated Title", "content": "Updated Content", "tags": "new,tags"}
    response = client.put(
        f"{settings.API_V1_STR}/notes/{note.id}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["title"] == data["title"]
    assert content["content"] == data["content"]
    assert content["tags"] == data["tags"]
    assert content["id"] == str(note.id)
    assert content["owner_id"] == str(note.owner_id)


def test_update_note_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    data = {"title": "Updated Title", "content": "Updated Content"}
    response = client.put(
        f"{settings.API_V1_STR}/notes/{uuid.uuid4()}",
        headers=superuser_token_headers,
        json=data,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Note not found"


def test_update_note_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    note = create_random_note(db)
    data = {"title": "Updated Title"}
    response = client.put(
        f"{settings.API_V1_STR}/notes/{note.id}",
        headers=normal_user_token_headers,
        json=data,
    )
    assert response.status_code == 403
    content = response.json()
    assert content["detail"] == "Not enough permissions"


def test_toggle_pin_note(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    note = create_random_note(db)
    initial_pin = note.is_pinned
    response = client.patch(
        f"{settings.API_V1_STR}/notes/{note.id}/pin",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["is_pinned"] == (not initial_pin)


def test_delete_note(
    client: TestClient, superuser_token_headers: dict[str, str], db: Session
) -> None:
    note = create_random_note(db)
    response = client.delete(
        f"{settings.API_V1_STR}/notes/{note.id}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 200
    content = response.json()
    assert content["message"] == "Note deleted successfully"


def test_delete_note_not_found(
    client: TestClient, superuser_token_headers: dict[str, str]
) -> None:
    response = client.delete(
        f"{settings.API_V1_STR}/notes/{uuid.uuid4()}",
        headers=superuser_token_headers,
    )
    assert response.status_code == 404
    content = response.json()
    assert content["detail"] == "Note not found"


def test_delete_note_not_enough_permissions(
    client: TestClient, normal_user_token_headers: dict[str, str], db: Session
) -> None:
    note = create_random_note(db)
    response = client.delete(
        f"{settings.API_V1_STR}/notes/{note.id}",
        headers=normal_user_token_headers,
    )
    assert response.status_code == 403
    content = response.json()
    assert content["detail"] == "Not enough permissions"
