from sqlalchemy.orm import Session
from sqlalchemy import text
from modelos.UsuariosModel import UsuarioSalida, UsuarioDTO

def _nivel_a_tipo(nivel: int) -> str:
    return {1: "Administrador", 2: "Operador", 3: "Tecnico", 4: "Consulta"}.get(nivel, "Consulta")

def _verificar_contraseña(contraseña_plana: str, contraseña_almacenada: str) -> bool:
    if contraseña_almacenada is None:
        return False
    contraseña = contraseña_almacenada.strip()
    
    # Verificar si es hash bcrypt
    if contraseña.startswith(("$2a$", "$2b$", "$2y$")):
        try:
            import bcrypt
            return bcrypt.checkpw(contraseña_plana.encode("utf-8"), contraseña.encode("utf-8"))
        except Exception:
            return False
    
    return contraseña_plana == contraseña

class DAOUsuarios:
    def __init__(self, sesion: Session):
        self.sesion = sesion

    def autenticar(self, correo: str, contraseña: str) -> UsuarioSalida:
        resultado = UsuarioSalida(exito=False, mensaje="", usuario=None)

        try:
            # Consultar usuario por correo
            consulta = text("""
                SELECT idUsuarios, NombreUsuario, NivelUsuario, Correo, Contraseña, Estatus
                FROM GostCAM.Usuarios
                WHERE Correo = :correo
                LIMIT 1
            """)
            
            fila = self.sesion.execute(consulta, {"correo": correo}).first()

            if not fila:
                resultado.mensaje = "Usuario no encontrado"
                return resultado

            if getattr(fila, "Estatus", 0) == 0:
                resultado.mensaje = "Usuario inactivo"
                return resultado

            if not _verificar_contraseña(contraseña, getattr(fila, "Contraseña", "")):
                resultado.mensaje = "Usuario o contraseña incorrectos"
                return resultado

            # Crear DTO de usuario
            usuario_dto = UsuarioDTO(
                id=getattr(fila, "idUsuarios"),
                nombre=getattr(fila, "NombreUsuario"),
                correo=getattr(fila, "Correo"),
                nivel=getattr(fila, "NivelUsuario"),
                tipo=_nivel_a_tipo(getattr(fila, "NivelUsuario")),
                estatus=getattr(fila, "Estatus")
            )

            resultado.exito = True
            resultado.mensaje = "Autenticación correcta"
            resultado.usuario = usuario_dto

        except Exception as error:
            resultado.mensaje = f"Error en autenticación: {str(error)}"

        return resultado