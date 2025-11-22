from dao.base_datos import obtener_sesion
from sqlalchemy import text

def verificar_usuarios():
    sesion = next(obtener_sesion())
    try:
        resultado = sesion.execute(text("""
            SELECT Correo, Contraseña, NombreUsuario 
            FROM GostCAM.Usuarios 
            ORDER BY Correo
        """))
        
        for fila in resultado:
            print(f"Usuario: {fila.NombreUsuario}")
            print(f"Email: {fila.Correo}")
            print(f"Password: {fila.Contraseña}")
            print("-" * 40)
    finally:
        sesion.close()

if __name__ == "__main__":
    verificar_usuarios()