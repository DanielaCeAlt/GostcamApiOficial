from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class AltaEntrada(BaseModel):
    idEquipo: str
    nombreEquipo: str
    modelo: str
    idTipoEquipo: Optional[int] = None
    numeroActivo: Optional[str] = None
    idUsuario: Optional[int] = None
    idPosicion: Optional[int] = None
    idEstatus: Optional[int] = 1
    idSucursal: str

class AltaSalida(BaseModel):
    estado: str
    mensaje: str
    equipo: Dict[str, Any]

class BajaEntrada(BaseModel):
    idEquipo: str
    idSucursal: Optional[str] = None
    motivo: Optional[str] = None

class SalidaSimple(BaseModel):
    exito: bool
    mensaje: str

class EstadoEquipoEntrada(BaseModel):
    idEquipo: str
    idEstatus: Optional[int] = None
    textoEstatus: Optional[str] = None

class MovimientoActualizarEntrada(BaseModel):
    idMovimiento: int
    idTipoMov: Optional[int] = None
    origen_idCentro: Optional[str] = None
    destino_idCentro: Optional[str] = None
    fechaMovimiento: Optional[str] = None
    fechaFin: Optional[str] = None
    estatusMovimiento: Optional[str] = None
    descripcion: Optional[str] = None

class MovimientoActualizarSalida(BaseModel):
    estado: str
    mensaje: str
    movimiento: Dict[str, Any]

class MantenimientoEntrada(BaseModel):
    idEquipo: str
    idSucursal: str
    descripcion: Optional[str] = None

class EquiposPorTipoSalida(BaseModel):
    estado: str
    equipos: List[Dict[str, Any]]

class MovimientosEquipoSalida(BaseModel):
    exito: bool
    mensaje: str
    movimientos: List[Dict[str, Any]]