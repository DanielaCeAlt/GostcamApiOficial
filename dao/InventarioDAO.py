from sqlalchemy.orm import Session
from sqlalchemy import text
from sqlalchemy.exc import IntegrityError, OperationalError, ProgrammingError
from typing import Optional
from modelos.InventarioModel import *
from utils.logger import log_performance, log_audit_change, gostcam_logger
from utils.validaciones import ValidacionesNegocio
from utils.cache import cached

class DAOInventario:
    def __init__(self, sesion: Session):
        self.sesion = sesion

    # Utilidad para obtener el ID recién insertado de forma segura
    def _last_id(self, cursor_result):
        movimiento_id = getattr(cursor_result, "lastrowid", None)
        if not movimiento_id:
            # Fallback cuando el driver no expone lastrowid
            movimiento_id = self.sesion.execute(text("SELECT LAST_INSERT_ID()")).scalar_one()
        return movimiento_id

    @log_performance("registrar_alta_equipo", include_args=True)
    @log_audit_change("registrar_alta")
    def registrar_alta(self, datos: dict):
        try:
            # 1. VALIDACIONES DE NEGOCIO
            es_valido, mensaje_error = ValidacionesNegocio.validar_alta_equipo(datos)
            if not es_valido:
                raise ValueError(f"Validación fallida: {mensaje_error}")
            
            # Aplicar reglas de negocio automáticas
            datos = ValidacionesNegocio.aplicar_reglas_negocio_alta(datos)
            
            # 2. Verificar si el equipo ya existe
            consulta_verificar = text("""
                SELECT no_serie FROM GostCAM.Equipo WHERE no_serie = :no_serie
            """)
            existe = self.sesion.execute(
                consulta_verificar, {"no_serie": datos['idEquipo']}
            ).first()
            if existe:
                raise ValueError("El número de serie ya existe")

            # 2. Insertar equipo
            consulta_equipo = text("""
                INSERT INTO GostCAM.Equipo 
                (no_serie, nombreEquipo, modelo, idTipoEquipo, numeroActivo, idUsuarios, idPosicion, idEstatus)
                VALUES (:no_serie, :nombre, :modelo, :id_tipo, :numero_activo, :id_usuario, :id_posicion, :id_estatus)
            """)
            # Validar que numeroActivo no sea None y asignar un valor por defecto si es necesario
            numero_activo = datos.get('numeroActivo')
            if numero_activo is None:
                numero_activo = f"ACT-{datos['idEquipo']}"  # Generar número de activo único

            self.sesion.execute(
                consulta_equipo,
                {
                    "no_serie": datos['idEquipo'],
                    "nombre": datos['nombreEquipo'],
                    "modelo": datos['modelo'],
                    "id_tipo": datos.get('idTipoEquipo'),
                    "numero_activo": numero_activo,  # Usar el valor validado
                    "id_usuario": datos.get('idUsuario'),
                    "id_posicion": datos.get('idPosicion'),
                    "id_estatus": datos.get('idEstatus', 1),
                },
            )

            # 3. Registrar movimiento de alta (idTipoMov = 1)
            res_mov = self.sesion.execute(
                text("""
                    INSERT INTO GostCAM.MovimientoInventario 
                    (origen_idCentro, destino_idCentro, idTipoMov, estatusMovimiento)
                    VALUES (:origen, :destino, 1, 'CERRADO')
                """),
                {"origen": datos['idSucursal'], "destino": datos['idSucursal']},
            )
            movimiento_id = self._last_id(res_mov)

            # 4. Registrar detalle del movimiento (usando el id obtenido)
            self.sesion.execute(
                text("""
                    INSERT INTO GostCAM.DetMovimiento (idMovimientoInv, no_serie, cantidad)
                    VALUES (:movimiento_id, :no_serie, 1)
                """),
                {"movimiento_id": movimiento_id, "no_serie": datos['idEquipo']},
            )

            self.sesion.commit()

            # 5. Obtener equipo recién insertado para respuesta
            consulta_equipo_completo = text("""
                SELECT 
                    e.no_serie, e.nombreEquipo, e.modelo, te.nombreTipo, e.fechaAlta,
                    s.Sucursal, s.idCentro, ee.estatus, u.NombreUsuario,
                    p.NombrePosicion, z.Zona, est.Estado, m.Municipio
                FROM GostCAM.Equipo e
                JOIN GostCAM.TipoEquipo te ON te.idTipoEquipo = e.idTipoEquipo
                JOIN GostCAM.Usuarios u ON u.idUsuarios = e.idUsuarios
                JOIN GostCAM.EstatusEquipo ee ON ee.idEstatus = e.idEstatus
                JOIN GostCAM.PosicionEquipo p ON p.idPosicion = e.idPosicion
                JOIN GostCAM.Sucursales s ON s.idCentro = p.idCentro
                JOIN GostCAM.Zonas z ON z.idZona = s.idZona
                JOIN GostCAM.Estados est ON est.idEstado = s.idEstado
                JOIN GostCAM.Municipios m ON m.idMunicipios = s.idMunicipios
                WHERE e.no_serie = :no_serie
            """)
            fila = self.sesion.execute(
                consulta_equipo_completo, {"no_serie": datos['idEquipo']}
            ).first()
            if not fila:
                raise RuntimeError("No se encontró el equipo recién insertado")

            return {
                "estado": "success",
                "mensaje": "Equipo creado exitosamente",
                "equipo": {
                    "idEquipo": getattr(fila, "no_serie"),
                    "nombreEquipo": getattr(fila, "nombreEquipo"),
                    "tipoEquipo": getattr(fila, "nombreTipo"),
                    "modelo": getattr(fila, "modelo"),
                    "fechaCompra": str(getattr(fila, "fechaAlta"))[:10],
                    "ubicacion": getattr(fila, "Sucursal"),
                    "estatusEquipo": getattr(fila, "estatus"),
                    "idSucursal": getattr(fila, "idCentro"),
                    "usuarioAsignado": getattr(fila, "NombreUsuario"),
                    "area": getattr(fila, "NombrePosicion"),
                    "zona": getattr(fila, "Zona"),
                    "estado": getattr(fila, "Estado"),
                    "municipio": getattr(fila, "Municipio"),
                },
            }

        except IntegrityError as error:
            self.sesion.rollback()
##           mensaje = str(error.orig) if hasattr(error, "orig") else str(error)
##            if "duplicate" in mensaje.lower():
##                raise ValueError("El ID del equipo ya existe")
##            if "foreign key" in mensaje.lower():
##               raise ValueError("Error de clave foránea: verifique los IDs proporcionados")
            print(error)
            raise ValueError(error)
        except (OperationalError, ProgrammingError) as error_bd:
            self.sesion.rollback()
            raise ValueError(str(error_bd))
        except Exception as error:
            self.sesion.rollback()
            raise ValueError(f"Error al registrar equipo: {str(error)}")

    @log_performance("registrar_baja_equipo", include_args=True)
    @log_audit_change("registrar_baja")
    def registrar_baja(self, datos: dict):
        try:
            # 1. Verificar que el equipo existe y obtener estado actual
            consulta_verificar = text("""
                SELECT idEstatus FROM GostCAM.Equipo 
                WHERE no_serie = :no_serie
            """)
            resultado = self.sesion.execute(
                consulta_verificar, {"no_serie": datos['idEquipo']}
            ).first()
            if not resultado:
                raise ValueError("Equipo no encontrado")

            estatus_actual = getattr(resultado, "idEstatus")
            
            # 2. VALIDACIONES DE NEGOCIO
            es_valido, mensaje_error = ValidacionesNegocio.validar_baja_equipo(datos, estatus_actual)
            if not es_valido:
                raise ValueError(f"Validación fallida: {mensaje_error}")

            # 2. Registrar movimiento de baja (idTipoMov = 2)
            res_mov = self.sesion.execute(
                text("""
                    INSERT INTO GostCAM.MovimientoInventario 
                    (origen_idCentro, destino_idCentro, idTipoMov, estatusMovimiento)
                    VALUES (:centro, :centro, 2, 'CERRADO')
                """),
                {"centro": datos.get('idSucursal', 'CENT')},
            )
            movimiento_id = self._last_id(res_mov)

            # 3. Registrar detalle del movimiento
            self.sesion.execute(
                text("""
                    INSERT INTO GostCAM.DetMovimiento (idMovimientoInv, no_serie, cantidad)
                    VALUES (:movimiento_id, :no_serie, 1)
                """),
                {"movimiento_id": movimiento_id, "no_serie": datos['idEquipo']},
            )

            # 4. Actualizar estatus del equipo a Baja (4)
            self.sesion.execute(
                text("""
                    UPDATE GostCAM.Equipo 
                    SET idEstatus = 4 
                    WHERE no_serie = :no_serie
                """),
                {"no_serie": datos['idEquipo']},
            )

            self.sesion.commit()
            return {"exito": True, "mensaje": "Baja registrada correctamente"}

        except Exception as error:
            self.sesion.rollback()
            raise ValueError(f"Error al registrar baja: {str(error)}")

    @log_performance("actualizar_estado_equipo", include_args=True)
    @log_audit_change("actualizar_estado")
    def actualizar_estado(self, datos: dict):
        try:
            # 1. Verificar que el equipo existe y obtener estado actual
            consulta_verificar = text("""
                SELECT idEstatus FROM GostCAM.Equipo 
                WHERE no_serie = :no_serie
            """)
            resultado = self.sesion.execute(
                consulta_verificar, {"no_serie": datos['idEquipo']}
            ).first()
            if not resultado:
                raise ValueError("Equipo no encontrado")
            
            estado_actual = getattr(resultado, "idEstatus")
            estado_nuevo = datos.get('idEstatus')
            
            if estado_nuevo is None:
                raise ValueError("El estatus es requerido")
            
            # 2. VALIDACIONES DE NEGOCIO
            es_valida, mensaje_error = ValidacionesNegocio.validar_transicion_estado(estado_actual, estado_nuevo)
            if not es_valida:
                raise ValueError(f"Transición inválida: {mensaje_error}")
                raise ValueError("Equipo no encontrado")

            # 2. Actualizar estatus del equipo
            self.sesion.execute(
                text("""
                    UPDATE GostCAM.Equipo 
                    SET idEstatus = :nuevo_estatus
                    WHERE no_serie = :no_serie
                """),
                {"nuevo_estatus": datos.get('idEstatus'), "no_serie": datos['idEquipo']},
            )

            # 3. Si es mantenimiento o reparación, registrar movimiento
            if datos.get('idEstatus') in [3, 7]:  # 3=Mantenimiento, 7=En reparación
                # Obtener el centro actual del equipo
                consulta_centro = text("""
                    SELECT s.idCentro 
                    FROM GostCAM.Equipo e
                    JOIN GostCAM.PosicionEquipo p ON p.idPosicion = e.idPosicion
                    JOIN GostCAM.Sucursales s ON s.idCentro = p.idCentro
                    WHERE e.no_serie = :no_serie
                """)
                centro = self.sesion.execute(
                    consulta_centro, {"no_serie": datos['idEquipo']}
                ).first()

                if centro:
                    id_centro = getattr(centro, "idCentro")
                    tipo_movimiento = 4 if datos.get('idEstatus') == 3 else 5  # 4=Mant., 5=Reparación

                    res_mov = self.sesion.execute(
                        text("""
                            INSERT INTO GostCAM.MovimientoInventario 
                            (origen_idCentro, destino_idCentro, idTipoMov, estatusMovimiento)
                            VALUES (:centro, :centro, :tipo_movimiento, 'CERRADO')
                        """),
                        {"centro": id_centro, "tipo_movimiento": tipo_movimiento},
                    )
                    movimiento_id = self._last_id(res_mov)

                    self.sesion.execute(
                        text("""
                            INSERT INTO GostCAM.DetMovimiento (idMovimientoInv, no_serie, cantidad)
                            VALUES (:movimiento_id, :no_serie, 1)
                        """),
                        {"movimiento_id": movimiento_id, "no_serie": datos['idEquipo']},
                    )

            self.sesion.commit()
            return {"exito": True, "mensaje": "Estado actualizado correctamente"}

        except Exception as error:
            self.sesion.rollback()
            raise ValueError(f"Error al actualizar estado: {str(error)}")

    def actualizar_movimiento(self, datos: dict):
        try:
            # 1. Verificar que el movimiento existe
            consulta_verificar = text("""
                SELECT idMovimientoInv FROM GostCAM.MovimientoInventario 
                WHERE idMovimientoInv = :id_movimiento
            """)
            existe = self.sesion.execute(
                consulta_verificar, {"id_movimiento": datos['idMovimiento']}
            ).first()
            if not existe:
                raise ValueError("Movimiento no encontrado")

            # 2. Construir consulta dinámica de actualización
            campos_actualizar = []
            parametros = {"id_movimiento": datos['idMovimiento']}

            if datos.get('idTipoMov') is not None:
                campos_actualizar.append("idTipoMov = :id_tipo_mov")
                parametros["id_tipo_mov"] = datos['idTipoMov']

            if datos.get('origen_idCentro') is not None:
                campos_actualizar.append("origen_idCentro = :origen")
                parametros["origen"] = datos['origen_idCentro']

            if datos.get('destino_idCentro') is not None:
                campos_actualizar.append("destino_idCentro = :destino")
                parametros["destino"] = datos['destino_idCentro']

            if datos.get('estatusMovimiento') is not None:
                campos_actualizar.append("estatusMovimiento = :estatus")
                parametros["estatus"] = datos['estatusMovimiento']

            if datos.get('fechaMovimiento') is not None:
                campos_actualizar.append("fecha = :fecha")
                parametros["fecha"] = datos['fechaMovimiento']

            if datos.get('fechaFin') is not None:
                campos_actualizar.append("fechaFin = :fecha_fin")
                parametros["fecha_fin"] = datos['fechaFin']

            if not campos_actualizar:
                raise ValueError("No se proporcionaron campos para actualizar")

            self.sesion.execute(
                text(f"""
                    UPDATE GostCAM.MovimientoInventario 
                    SET {', '.join(campos_actualizar)}
                    WHERE idMovimientoInv = :id_movimiento
                """),
                parametros,
            )
            self.sesion.commit()

            # 3. Obtener movimiento actualizado
            fila = self.sesion.execute(
                text("""
                    SELECT m.idMovimientoInv, m.fecha, m.fechaFin, m.destino_idCentro, tm.tipoMovimiento
                    FROM GostCAM.MovimientoInventario m
                    JOIN GostCAM.TipoMovimiento tm ON tm.idTipoMov = m.idTipoMov
                    WHERE m.idMovimientoInv = :id_movimiento
                """),
                {"id_movimiento": datos['idMovimiento']},
            ).first()

            return {
                "estado": "success",
                "mensaje": "Movimiento actualizado exitosamente",
                "movimiento": {
                    "idMovimiento": getattr(fila, "idMovimientoInv"),
                    "idEquipo": datos.get("idEquipo"),
                    "fechaMovimiento": str(getattr(fila, "fecha")),
                    "tipoMovimiento": getattr(fila, "tipoMovimiento"),
                    "descripcion": datos.get("descripcion", ""),
                    "idSucursalDestino": getattr(fila, "destino_idCentro"),
                },
            }

        except Exception as error:
            self.sesion.rollback()
            raise ValueError(f"Error al actualizar movimiento: {str(error)}")

    def listar_por_tipo(self, tipo_movimiento: str):
        """Método legacy - usar listar_por_tipo_paginado para mejor rendimiento"""
        return self.listar_por_tipo_paginado(tipo_movimiento, 1, 1000)

    def registrar_mantenimiento(self, datos: dict):
        try:
            # 1. Actualizar estatus a Mantenimiento (3)
            self.sesion.execute(
                text("""
                    UPDATE GostCAM.Equipo 
                    SET idEstatus = 3 
                    WHERE no_serie = :no_serie
                """),
                {"no_serie": datos['idEquipo']},
            )

            # 2. Registrar movimiento de mantenimiento (idTipoMov = 4)
            res_mov = self.sesion.execute(
                text("""
                    INSERT INTO GostCAM.MovimientoInventario 
                    (origen_idCentro, destino_idCentro, idTipoMov, estatusMovimiento)
                    VALUES (:centro, :centro, 4, 'CERRADO')
                """),
                {"centro": datos['idSucursal']},
            )
            movimiento_id = self._last_id(res_mov)

            # 3. Registrar detalle del movimiento
            self.sesion.execute(
                text("""
                    INSERT INTO GostCAM.DetMovimiento (idMovimientoInv, no_serie, cantidad)
                    VALUES (:movimiento_id, :no_serie, 1)
                """),
                {"movimiento_id": movimiento_id, "no_serie": datos['idEquipo']},
            )

            self.sesion.commit()
            return {"exito": True, "mensaje": "Mantenimiento registrado correctamente"}

        except Exception as error:
            self.sesion.rollback()
            raise ValueError(f"Error al registrar mantenimiento: {str(error)}")

    def consultar_movimientos_equipo(self, id_equipo: str):
        try:
            resultados = self.sesion.execute(
                text("""
                    SELECT * FROM VistaMovimientosDetallados 
                    WHERE no_serie = :no_serie
                    ORDER BY fecha DESC
                """),
                {"no_serie": id_equipo},
            )

            movimientos = []
            for fila in resultados:
                movimientos.append({
                    "tipo": getattr(fila, "tipoMovimiento"),
                    "sucursal_origen": getattr(fila, "SucursalOrigen"),
                    "sucursal_destino": getattr(fila, "SucursalDestino"),
                    "fecha": str(getattr(fila, "fecha")) if getattr(fila, "fecha") else None,
                    "estatus": getattr(fila, "estatusMovimiento"),
                    "equipo": getattr(fila, "nombreEquipo"),
                })

            return {"exito": True, "mensaje": "Consulta realizada correctamente", "movimientos": movimientos}

        except Exception as error:
            raise ValueError(f"Error al consultar movimientos: {str(error)}")

    @cached("posiciones_sucursal_{id_centro}", ttl=1800)  # 30 minutos de cache
    def obtener_posiciones_sucursal(self, id_centro: str):
        """Obtiene todas las posiciones de una sucursal"""
        try:
            resultados = self.sesion.execute(
                text("""
                    SELECT idPosicion, NombrePosicion, Descripcion, TipoArea
                    FROM GostCAM.PosicionEquipo 
                    WHERE idCentro = :id_centro
                    ORDER BY NombrePosicion
                """),
                {"id_centro": id_centro}
            )

            posiciones = []
            for fila in resultados:
                posiciones.append({
                    "idPosicion": getattr(fila, "idPosicion"),
                    "nombre": getattr(fila, "NombrePosicion"),
                    "descripcion": getattr(fila, "Descripcion", ""),
                    "tipoArea": getattr(fila, "TipoArea")
                })

            return {"exito": True, "posiciones": posiciones}

        except Exception as error:
            raise ValueError(f"Error al obtener posiciones: {str(error)}")

    @cached("tipos_equipo", ttl=7200)  # 2 horas de cache
    def obtener_tipos_equipo(self):
        """Obtiene todos los tipos de equipo"""
        try:
            resultados = self.sesion.execute(
                text("""
                    SELECT idTipoEquipo, nombreTipo, descripcion
                    FROM GostCAM.TipoEquipo 
                    ORDER BY nombreTipo
                """)
            )

            tipos = []
            for fila in resultados:
                tipos.append({
                    "idTipoEquipo": getattr(fila, "idTipoEquipo"),
                    "nombre": getattr(fila, "nombreTipo"),
                    "descripcion": getattr(fila, "descripcion")
                })

            return {"exito": True, "tipos": tipos}

        except Exception as error:
            raise ValueError(f"Error al obtener tipos de equipo: {str(error)}")

    @cached("estatus_equipo", ttl=7200)  # 2 horas de cache
    def obtener_estatus_equipo(self):
        """Obtiene todos los estatus de equipo"""
        try:
            resultados = self.sesion.execute(
                text("""
                    SELECT idEstatus, estatus
                    FROM GostCAM.EstatusEquipo 
                    ORDER BY idEstatus
                """)
            )

            estatus_list = []
            for fila in resultados:
                estatus_list.append({
                    "idEstatus": getattr(fila, "idEstatus"),
                    "nombre": getattr(fila, "estatus")
                })

            return {"exito": True, "estatus": estatus_list}

        except Exception as error:
            raise ValueError(f"Error al obtener estatus: {str(error)}")

    def obtener_sucursales(self):
        """Obtiene todas las sucursales"""
        try:
            resultados = self.sesion.execute(
                text("""
                    SELECT s.idCentro, s.Sucursal, s.Direccion,
                           z.Zona, e.Estado, m.Municipio
                    FROM GostCAM.Sucursales s
                    JOIN GostCAM.Zonas z ON z.idZona = s.idZona
                    JOIN GostCAM.Estados e ON e.idEstado = s.idEstado
                    JOIN GostCAM.Municipios m ON m.idMunicipios = s.idMunicipios
                    ORDER BY s.Sucursal
                """)
            )

            sucursales = []
            for fila in resultados:
                sucursales.append({
                    "idCentro": getattr(fila, "idCentro"),
                    "nombre": getattr(fila, "Sucursal"),
                    "direccion": getattr(fila, "Direccion", ""),
                    "zona": getattr(fila, "Zona"),
                    "estado": getattr(fila, "Estado"),
                    "municipio": getattr(fila, "Municipio")
                })

            return {"exito": True, "sucursales": sucursales}

        except Exception as error:
            raise ValueError(f"Error al obtener sucursales: {str(error)}")

    @log_performance("listar_equipos_paginado")
    def listar_equipos_paginado(self, page: int, limit: int, tipo_equipo: Optional[str] = None, estatus: Optional[int] = None, sucursal: Optional[str] = None):
        """Lista equipos con paginación y filtros opcionales"""
        try:
            # VALIDACIONES DE NEGOCIO
            es_valida, mensaje_error = ValidacionesNegocio.validar_paginacion(page, limit)
            if not es_valida:
                raise ValueError(f"Parámetros de paginación inválidos: {mensaje_error}")
            
            offset = (page - 1) * limit
            
            # Construir consulta dinámica con filtros
            where_conditions = []
            params: dict = {"limit": limit, "offset": offset}
            
            if tipo_equipo:
                where_conditions.append("te.nombreTipo = :tipo_equipo")
                params["tipo_equipo"] = tipo_equipo
            
            if estatus is not None:
                where_conditions.append("e.idEstatus = :estatus")
                params["estatus"] = estatus
                
            if sucursal:
                where_conditions.append("s.idCentro = :sucursal")
                params["sucursal"] = sucursal
            
            where_clause = ""
            if where_conditions:
                where_clause = "WHERE " + " AND ".join(where_conditions)
            
            # Consulta principal con paginación
            consulta_equipos = text(f"""
                SELECT 
                    e.no_serie, e.nombreEquipo, e.modelo, te.nombreTipo, e.fechaAlta,
                    s.Sucursal, s.idCentro, ee.estatus, u.NombreUsuario,
                    p.NombrePosicion, z.Zona, est.Estado, m.Municipio
                FROM GostCAM.Equipo e
                JOIN GostCAM.TipoEquipo te ON te.idTipoEquipo = e.idTipoEquipo
                LEFT JOIN GostCAM.Usuarios u ON u.idUsuarios = e.idUsuarios
                JOIN GostCAM.EstatusEquipo ee ON ee.idEstatus = e.idEstatus
                JOIN GostCAM.PosicionEquipo p ON p.idPosicion = e.idPosicion
                JOIN GostCAM.Sucursales s ON s.idCentro = p.idCentro
                JOIN GostCAM.Zonas z ON z.idZona = s.idZona
                JOIN GostCAM.Estados est ON est.idEstado = s.idEstado
                JOIN GostCAM.Municipios m ON m.idMunicipios = s.idMunicipios
                {where_clause}
                ORDER BY e.fechaAlta DESC
                LIMIT :limit OFFSET :offset
            """)
            
            # Consulta de total para paginación
            consulta_total = text(f"""
                SELECT COUNT(*) as total
                FROM GostCAM.Equipo e
                JOIN GostCAM.TipoEquipo te ON te.idTipoEquipo = e.idTipoEquipo
                LEFT JOIN GostCAM.Usuarios u ON u.idUsuarios = e.idUsuarios
                JOIN GostCAM.EstatusEquipo ee ON ee.idEstatus = e.idEstatus
                JOIN GostCAM.PosicionEquipo p ON p.idPosicion = e.idPosicion
                JOIN GostCAM.Sucursales s ON s.idCentro = p.idCentro
                {where_clause}
            """)
            
            # Ejecutar consultas
            equipos_result = self.sesion.execute(consulta_equipos, params)
            total_result = self.sesion.execute(consulta_total, {k: v for k, v in params.items() if k not in ['limit', 'offset']})
            
            total_equipos = total_result.scalar() or 0
            total_pages = (total_equipos + limit - 1) // limit  # Ceil division
            
            equipos = []
            for fila in equipos_result:
                equipos.append({
                    "idEquipo": getattr(fila, "no_serie"),
                    "nombreEquipo": getattr(fila, "nombreEquipo"),
                    "tipoEquipo": getattr(fila, "nombreTipo"),
                    "modelo": getattr(fila, "modelo"),
                    "fechaCompra": str(getattr(fila, "fechaAlta"))[:10] if getattr(fila, "fechaAlta") else None,
                    "ubicacion": getattr(fila, "Sucursal"),
                    "estatusEquipo": getattr(fila, "estatus"),
                    "idSucursal": getattr(fila, "idCentro"),
                    "usuarioAsignado": getattr(fila, "NombreUsuario") or "No asignado",
                    "area": getattr(fila, "NombrePosicion"),
                    "zona": getattr(fila, "Zona"),
                    "estado": getattr(fila, "Estado"),
                    "municipio": getattr(fila, "Municipio")
                })
            
            return {
                "estado": "success",
                "equipos": equipos,
                "paginacion": {
                    "page": page,
                    "limit": limit,
                    "total": total_equipos,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_prev": page > 1
                }
            }

        except Exception as error:
            raise ValueError(f"Error al listar equipos: {str(error)}")

    def listar_por_tipo_paginado(self, tipo_movimiento: str, page: int, limit: int):
        """Lista movimientos por tipo con paginación"""
        try:
            offset = (page - 1) * limit
            
            # Consulta principal con paginación
            consulta_movimientos = text("""
                SELECT * FROM VistaMovimientosDetallados 
                WHERE tipoMovimiento = :tipo
                ORDER BY fecha DESC
                LIMIT :limit OFFSET :offset
            """)
            
            # Consulta de total
            consulta_total = text("""
                SELECT COUNT(*) as total FROM VistaMovimientosDetallados 
                WHERE tipoMovimiento = :tipo
            """)
            
            params = {"tipo": tipo_movimiento, "limit": limit, "offset": offset}
            
            resultados = self.sesion.execute(consulta_movimientos, params)
            total_result = self.sesion.execute(consulta_total, {"tipo": tipo_movimiento})
            
            total_movimientos = total_result.scalar() or 0
            total_pages = (total_movimientos + limit - 1) // limit
            
            equipos = []
            for fila in resultados:
                equipos.append({
                    "idEquipo": getattr(fila, "no_serie", None),
                    "nombreEquipo": getattr(fila, "nombreEquipo", "") or "",
                    "tipoEquipo": getattr(fila, "TipoEquipo", "") or "",
                    "fechaMovimiento": str(getattr(fila, "fecha", "")) if getattr(fila, "fecha", None) else None,
                    "tipoMovimiento": getattr(fila, "tipoMovimiento", None),
                    "idSucursalDestino": getattr(fila, "CentroDestino", None),
                    "sucursalOrigen": getattr(fila, "SucursalOrigen", None),
                    "sucursalDestino": getattr(fila, "SucursalDestino", None),
                })

            return {
                "estado": "success", 
                "equipos": equipos,
                "paginacion": {
                    "page": page,
                    "limit": limit,
                    "total": total_movimientos,
                    "total_pages": total_pages,
                    "has_next": page < total_pages,
                    "has_prev": page > 1
                }
            }

        except Exception as error:
            raise ValueError(f"Error al listar equipos: {str(error)}")
