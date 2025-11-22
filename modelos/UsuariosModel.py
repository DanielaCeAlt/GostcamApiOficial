from pydantic import BaseModel, EmailStr
from typing import Optional

class UsuarioAutenticar(BaseModel):
    correo: EmailStr
    contraseña: str

class UsuarioDTO(BaseModel):
    id: int
    nombre: str
    correo: str
    nivel: int
    tipo: str
    estatus: int

    class Config:
        from_attributes = True  # Para Pydantic v2

class UsuarioSalida(BaseModel):
    exito: bool
    mensaje: str
    usuario: Optional[UsuarioDTO] = None

    class Config:
        from_attributes = True