from pydantic import BaseModel

class Salida(BaseModel):
    mensaje: str
    exito: bool