from typing import Annotated
from fastapi import Depends
import src.database as database
from sqlalchemy.ext.asyncio import AsyncSession

SessionDep = Annotated[AsyncSession, Depends(database.get_db)]
