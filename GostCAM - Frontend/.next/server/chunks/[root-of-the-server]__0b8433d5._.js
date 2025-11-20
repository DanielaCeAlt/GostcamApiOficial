module.exports = [
"[project]/.next-internal/server/app/api/posiciones/route/actions.js [app-rsc] (server actions loader, ecmascript)", ((__turbopack_context__, module, exports) => {

}),
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/action-async-storage.external.js [external] (next/dist/server/app-render/action-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/action-async-storage.external.js", () => require("next/dist/server/app-render/action-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/events [external] (events, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("events", () => require("events"));

module.exports = mod;
}),
"[externals]/process [external] (process, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("process", () => require("process"));

module.exports = mod;
}),
"[externals]/net [external] (net, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("net", () => require("net"));

module.exports = mod;
}),
"[externals]/tls [external] (tls, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("tls", () => require("tls"));

module.exports = mod;
}),
"[externals]/timers [external] (timers, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("timers", () => require("timers"));

module.exports = mod;
}),
"[externals]/stream [external] (stream, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("stream", () => require("stream"));

module.exports = mod;
}),
"[externals]/buffer [external] (buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("buffer", () => require("buffer"));

module.exports = mod;
}),
"[externals]/string_decoder [external] (string_decoder, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("string_decoder", () => require("string_decoder"));

module.exports = mod;
}),
"[externals]/crypto [external] (crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("crypto", () => require("crypto"));

module.exports = mod;
}),
"[externals]/zlib [external] (zlib, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("zlib", () => require("zlib"));

module.exports = mod;
}),
"[externals]/util [external] (util, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("util", () => require("util"));

module.exports = mod;
}),
"[externals]/url [external] (url, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("url", () => require("url"));

module.exports = mod;
}),
"[project]/src/lib/database.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// =============================================
// CONFIGURACIÓN DE BASE DE DATOS MYSQL
// =============================================
__turbopack_context__.s([
    "callStoredProcedure",
    ()=>callStoredProcedure,
    "closePool",
    ()=>closePool,
    "default",
    ()=>__TURBOPACK__default__export__,
    "executeQuery",
    ()=>executeQuery,
    "getCatalogos",
    ()=>getCatalogos,
    "getConnection",
    ()=>getConnection,
    "getEquiposCompletos",
    ()=>getEquiposCompletos,
    "getHistorialMovimientos",
    ()=>getHistorialMovimientos,
    "getInventarioPorEstatus",
    ()=>getInventarioPorEstatus,
    "getMovimientosDetallados",
    ()=>getMovimientosDetallados,
    "testConnection",
    ()=>testConnection
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/mysql2/promise.js [app-route] (ecmascript)");
;
// Configuración de la conexión a la base de datos
const dbConfig = {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'GostCAM',
    charset: 'utf8mb4',
    timezone: '+00:00'
};
// Pool de conexiones para mejor performance
const pool = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$mysql2$2f$promise$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["default"].createPool({
    ...dbConfig,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
const getConnection = async ()=>{
    try {
        const connection = await pool.getConnection();
        return connection;
    } catch (error) {
        console.error('Error connecting to the database:', error);
        throw new Error('Failed to connect to database');
    }
};
const executeQuery = async (query, params = [])=>{
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute(query, params);
        return rows;
    } catch (error) {
        console.error('Database query error:', error);
        console.error('Query:', query);
        console.error('Params:', params);
        throw error;
    } finally{
        if (connection) {
            connection.release();
        }
    }
};
const callStoredProcedure = async (procedureName, params = [])=>{
    const placeholders = params.map(()=>'?').join(', ');
    const query = `CALL ${procedureName}(${placeholders})`;
    let connection;
    try {
        connection = await getConnection();
        const [rows] = await connection.execute(query, params);
        // Los procedimientos almacenados devuelven arrays anidados
        return Array.isArray(rows) && Array.isArray(rows[0]) ? rows[0] : rows;
    } catch (error) {
        console.error('Stored procedure error:', error);
        console.error('Procedure:', procedureName);
        console.error('Params:', params);
        throw error;
    } finally{
        if (connection) {
            connection.release();
        }
    }
};
const testConnection = async ()=>{
    try {
        const result = await executeQuery('SELECT 1 as test');
        return result.length > 0;
    } catch (error) {
        console.error('Database connection test failed:', error);
        return false;
    }
};
const closePool = async ()=>{
    try {
        await pool.end();
        console.log('Database pool closed');
    } catch (error) {
        console.error('Error closing database pool:', error);
    }
};
const getEquiposCompletos = async (filters)=>{
    // Usar directamente la tabla equipo con una consulta simple
    return getEquiposFromTable(filters);
};
// Función fallback para consultar tabla equipos directamente
const getEquiposFromTable = async (filters)=>{
    let query = `
    SELECT 
      e.no_serie,
      e.nombreEquipo,
      e.numeroActivo,
      e.modelo,
      e.fechaAlta,
      e.idPosicion,
      te.nombreTipo as TipoEquipo,
      ee.estatus as EstatusEquipo,
      'Centro Principal' as SucursalActual,
      u.NombreUsuario as UsuarioAsignado
    FROM equipo e
    LEFT JOIN tipoequipo te ON e.idTipoEquipo = te.idTipoEquipo
    LEFT JOIN estatusequipo ee ON e.idEstatus = ee.idEstatus
    LEFT JOIN usuarios u ON e.idUsuarios = u.idUsuarios
  `;
    const params = [];
    const conditions = [];
    // ✅ Filtrar equipos eliminados lógicamente
    conditions.push('(e.eliminado IS NULL OR e.eliminado = 0)');
    if (filters) {
        if (filters.tipoEquipo) {
            conditions.push('te.nombreTipo = ?');
            params.push(filters.tipoEquipo);
        }
        if (filters.estatus) {
            conditions.push('ee.estatus = ?');
            params.push(filters.estatus);
        }
        if (filters.usuario) {
            conditions.push('u.NombreUsuario LIKE ?');
            params.push(`%${filters.usuario}%`);
        }
        if (filters.busqueda) {
            // Búsqueda global en todos los campos principales (función fallback)
            conditions.push(`(
        e.nombreEquipo LIKE ? OR 
        e.no_serie LIKE ? OR 
        e.numeroActivo LIKE ? OR
        e.modelo LIKE ? OR
        te.nombreTipo LIKE ? OR
        ee.estatus LIKE ? OR
        u.NombreUsuario LIKE ?
      )`);
            // Repetir el término de búsqueda para cada campo
            const termino = `%${filters.busqueda}%`;
            params.push(termino, termino, termino, termino, termino, termino, termino);
        }
    }
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY e.fechaAlta DESC';
    const result = await executeQuery(query, params);
    return result;
};
const getMovimientosDetallados = async (filters)=>{
    let query = 'SELECT * FROM VistaMovimientosDetallados';
    const params = [];
    const conditions = [];
    if (filters) {
        if (filters.sucursalOrigen) {
            conditions.push('SucursalOrigen = ?');
            params.push(filters.sucursalOrigen);
        }
        if (filters.sucursalDestino) {
            conditions.push('SucursalDestino = ?');
            params.push(filters.sucursalDestino);
        }
        if (filters.tipoMovimiento) {
            conditions.push('tipoMovimiento = ?');
            params.push(filters.tipoMovimiento);
        }
        if (filters.estatusMovimiento) {
            conditions.push('estatusMovimiento = ?');
            params.push(filters.estatusMovimiento);
        }
        if (filters.fechaDesde) {
            conditions.push('fecha >= ?');
            params.push(filters.fechaDesde);
        }
        if (filters.fechaHasta) {
            conditions.push('fecha <= ?');
            params.push(filters.fechaHasta);
        }
    }
    if (conditions.length > 0) {
        query += ' WHERE ' + conditions.join(' AND ');
    }
    query += ' ORDER BY fecha DESC';
    return executeQuery(query, params);
};
const getInventarioPorEstatus = async ()=>{
    return executeQuery('SELECT * FROM VistaInventarioPorEstatus ORDER BY estatus, TipoEquipo');
};
const getCatalogos = async ()=>{
    try {
        console.log('Obteniendo catálogos...');
        // Función auxiliar para ejecutar consultas con fallback
        const executeWithFallback = async (query, fallback = [])=>{
            try {
                return await executeQuery(query);
            } catch (error) {
                console.warn(`Query failed: ${query}`, error);
                return fallback;
            }
        };
        // Obtener catálogos básicos que probablemente existan
        const usuarios = await executeWithFallback('SELECT * FROM usuarios', []);
        // Para tipos de equipo, intentar múltiples variantes
        const tiposEquipo = await executeWithFallback('SELECT * FROM tipoequipo', []);
        // Para estatus, intentar múltiples variantes  
        const estatusEquipos = await executeWithFallback('SELECT * FROM estatusequipo', []);
        // Para posiciones, usar valores por defecto si no existe
        const posiciones = await executeWithFallback('SELECT * FROM posiciones', [
            {
                id: 1,
                nombre: 'Entrada Principal'
            },
            {
                id: 2,
                nombre: 'Recepción'
            },
            {
                id: 3,
                nombre: 'Oficina'
            }
        ]);
        // Para sucursales, intentar obtener de la tabla de equipos o crear por defecto
        const sucursales = await executeWithFallback('SELECT DISTINCT SucursalActual as nombre, SucursalActual as id FROM equipos WHERE SucursalActual IS NOT NULL AND SucursalActual != ""', [
            {
                id: 'SUC001',
                nombre: 'Sucursal Principal'
            },
            {
                id: 'SUC002',
                nombre: 'Sucursal Norte'
            },
            {
                id: 'SUC003',
                nombre: 'Sucursal Sur'
            }
        ]);
        return {
            tiposEquipo,
            estatusEquipos,
            usuarios,
            posiciones,
            sucursales,
            // Catálogos adicionales vacíos por ahora
            estados: [],
            municipios: [],
            zonas: []
        };
    } catch (error) {
        console.error('Error obteniendo catálogos:', error);
        throw error;
    }
};
const getHistorialMovimientos = async (no_serie)=>{
    if (no_serie) {
        return executeQuery('SELECT * FROM VistaHistorialMovimientos WHERE no_serie = ? ORDER BY fecha DESC', [
            no_serie
        ]);
    }
    return executeQuery('SELECT * FROM VistaHistorialMovimientos ORDER BY fecha DESC LIMIT 100');
};
const __TURBOPACK__default__export__ = pool;
}),
"[project]/src/app/api/posiciones/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/database.ts [app-route] (ecmascript)");
;
;
async function GET() {
    try {
        let posiciones = [];
        try {
            // Intentar obtener posiciones de la tabla posiciones que creamos
            posiciones = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$database$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["executeQuery"])(`
        SELECT id, nombre, sucursalId, descripcion, tipo
        FROM posiciones 
        WHERE activa = true
        ORDER BY sucursalId, nombre
      `);
        } catch (error) {
            console.warn('Tabla posiciones no encontrada, usando valores por defecto:', error);
            // Si la tabla no existe, usar valores por defecto
            posiciones = [
                {
                    id: 1,
                    nombre: 'Recepción Principal',
                    sucursalId: 'Centro Principal',
                    descripcion: 'Área de recepción principal',
                    tipo: 'Oficina'
                },
                {
                    id: 2,
                    nombre: 'Oficina Administrativa',
                    sucursalId: 'Centro Principal',
                    descripcion: 'Área administrativa principal',
                    tipo: 'Oficina'
                },
                {
                    id: 3,
                    nombre: 'Almacén General',
                    sucursalId: 'Centro Principal',
                    descripcion: 'Almacén principal de equipos',
                    tipo: 'Almacen'
                },
                {
                    id: 4,
                    nombre: 'Área de Desarrollo',
                    sucursalId: 'Centro Principal',
                    descripcion: 'Área de desarrollo y testing',
                    tipo: 'Laboratorio'
                },
                {
                    id: 5,
                    nombre: 'Sala de Servidores',
                    sucursalId: 'Centro Principal',
                    descripcion: 'Centro de datos y servidores',
                    tipo: 'Datacenter'
                },
                {
                    id: 6,
                    nombre: 'Sucursal Norte - Recepción',
                    sucursalId: 'Sucursal Norte',
                    descripcion: 'Recepción sucursal norte',
                    tipo: 'Oficina'
                },
                {
                    id: 7,
                    nombre: 'Sucursal Norte - Almacén',
                    sucursalId: 'Sucursal Norte',
                    descripcion: 'Almacén sucursal norte',
                    tipo: 'Almacen'
                },
                {
                    id: 8,
                    nombre: 'Sucursal Sur - Recepción',
                    sucursalId: 'Sucursal Sur',
                    descripcion: 'Recepción sucursal sur',
                    tipo: 'Oficina'
                },
                {
                    id: 9,
                    nombre: 'Sucursal Sur - Almacén',
                    sucursalId: 'Sucursal Sur',
                    descripcion: 'Almacén sucursal sur',
                    tipo: 'Almacen'
                },
                {
                    id: 10,
                    nombre: 'Sin Asignar',
                    sucursalId: 'General',
                    descripcion: 'Ubicación temporal sin asignar',
                    tipo: 'Temporal'
                }
            ];
        }
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: true,
            data: posiciones,
            message: 'Posiciones disponibles obtenidas'
        });
    } catch (error) {
        console.error('Error obteniendo posiciones:', error);
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido'
        }, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__0b8433d5._.js.map