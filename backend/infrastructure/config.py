import os


def build_database_url() -> str:
    database_url = os.environ.get(
        "DATABASE_URL",
        "postgresql://postgres:admin@db:5432/movilwest_db",
    )

    if database_url.startswith("postgres://"):
        database_url = database_url.replace("postgres://", "postgresql://", 1)

    return database_url
