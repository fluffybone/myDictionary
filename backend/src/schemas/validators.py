from pydantic_core import PydanticCustomError


def validate_not_empty(v: str, field_name: str, min_length: int = 2) -> str:
    """Проверка на пустоту и минимальную длину"""
    v = v.strip()

    if not v:
        raise PydanticCustomError("value_error", f"{field_name} не может быть пустым")

    if len(v) < min_length:
        raise PydanticCustomError(
            "value_error", f"{field_name} должно содержать минимум {min_length} символа"
        )

    return v
