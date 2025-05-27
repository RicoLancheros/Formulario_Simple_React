const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

function parseRolesSafely(rolesData, empleadoIdParaLog) {
    let parsedRoles = [];
    if (rolesData && typeof rolesData === 'string' && rolesData.trim() !== '') {
        try {
            parsedRoles = JSON.parse(rolesData);
            if (!Array.isArray(parsedRoles)) {
                console.warn(`Roles para empleado ID ${empleadoIdParaLog} (valor: '${rolesData}') no se parseó como array, se recibió:`, parsedRoles, ". Se usará un array vacío.");
                parsedRoles = [];
            }
        } catch (parseError) {
            console.error(`Error al parsear roles para empleado ID ${empleadoIdParaLog}. Valor original: '${rolesData}'. Error: ${parseError.message}. Se usará un array vacío.`);
            parsedRoles = [];
        }
    } else if (Array.isArray(rolesData)) {
        parsedRoles = rolesData;
    } else if (rolesData) {
        console.warn(`Roles para empleado ID ${empleadoIdParaLog} no es un string parseable (valor: '${rolesData}', tipo: ${typeof rolesData}). Se usará un array vacío.`);
        parsedRoles = [];
    }
    return parsedRoles;
}

const validateEmpleadoInput = (data, isUpdate = false) => {
    const errors = {};
    if (!data.nombre_completo?.trim()) errors.nombre_completo = "El nombre completo es obligatorio.";
    if (!data.correo_electronico?.trim()) {
        errors.correo_electronico = "El correo electrónico es obligatorio.";
    } else if (!/\S+@\S+\.\S+/.test(data.correo_electronico)) {
        errors.correo_electronico = "El correo electrónico no es válido.";
    }
    if (!data.sexo) errors.sexo = "El sexo es obligatorio.";
    if (!data.area) errors.area = "El área es obligatoria.";
    if (!Array.isArray(data.roles) || data.roles.length === 0) errors.roles = "Debe seleccionar al menos un rol.";

    return {
        errors,
        isValid: Object.keys(errors).length === 0
    };
};

app.post('/api/empleados', async (req, res) => {
    const { errors, isValid } = validateEmpleadoInput(req.body);
    if (!isValid) return res.status(400).json({ message: "Errores de validación", errors });

    const { nombre_completo, correo_electronico, sexo, area, descripcion, acepta_boletin, roles } = req.body;
    try {
        const rolesJson = JSON.stringify(roles || []);
        const query = 'INSERT INTO empleados (nombre_completo, correo_electronico, sexo, area, descripcion, acepta_boletin, roles) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const [result] = await db.execute(query, [nombre_completo, correo_electronico, sexo, area, descripcion || null, acepta_boletin || false, rolesJson]);
        res.status(201).json({ id: result.insertId, message: 'Empleado creado exitosamente' });
    } catch (error) {
        console.error("Error al crear empleado:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El correo electrónico ya está registrado.', errors: { correo_electronico: 'Este correo ya existe.' } });
        }
        res.status(500).json({ message: 'Error interno del servidor al crear empleado' });
    }
});

app.get('/api/empleados', async (req, res) => {
    try {
        const [rows] = await db.execute('SELECT id, nombre_completo, correo_electronico, sexo, area, roles FROM empleados ORDER BY nombre_completo ASC');

        const empleados = rows.map(emp => {
            let parsedRoles = [];
            if (emp.roles && typeof emp.roles === 'string' && emp.roles.trim() !== '') {
                try {
                    parsedRoles = JSON.parse(emp.roles);
                    if (!Array.isArray(parsedRoles)) {
                        console.warn(`Roles para empleado ID ${emp.id} (valor: '${emp.roles}') no se parseó como array, se recibió:`, parsedRoles, ". Se usará un array vacío.");
                        parsedRoles = [];
                    }
                } catch (parseError) {
                    console.error(`Error al parsear roles para empleado ID ${emp.id}. Valor original: '${emp.roles}'. Error: ${parseError.message}. Se usará un array vacío.`);
                    parsedRoles = [];
                }
            } else if (Array.isArray(emp.roles)) {
                parsedRoles = emp.roles;
            } else if (emp.roles) {
                console.warn(`Roles para empleado ID ${emp.id} no es un string parseable (valor: '${emp.roles}', tipo: ${typeof emp.roles}). Se usará un array vacío.`);
                parsedRoles = [];
            }

            return {
                ...emp,
                roles: parsedRoles
            };
        });
        res.json(empleados);
    } catch (error) {
        console.error("Error general al obtener empleados:", error);
        res.status(500).json({ message: 'Error interno del servidor al obtener empleados' });
    }
});

app.get('/api/empleados/:id', async (req, res) => {
    try {
        const empleadoId = req.params.id;
        const [rows] = await db.execute('SELECT * FROM empleados WHERE id = ?', [empleadoId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: 'Empleado no encontrado' });
        }

        const empleado = rows[0];
        empleado.roles = parseRolesSafely(empleado.roles, empleado.id);
        empleado.acepta_boletin = Boolean(empleado.acepta_boletin);

        res.json(empleado);
    } catch (error) {
        console.error(`Error al obtener empleado con ID ${req.params.id}:`, error);
        res.status(500).json({ message: 'Error interno del servidor al obtener empleado' });
    }
});

app.put('/api/empleados/:id', async (req, res) => {
    const { errors, isValid } = validateEmpleadoInput(req.body, true);
    if (!isValid) return res.status(400).json({ message: "Errores de validación", errors });

    const { nombre_completo, correo_electronico, sexo, area, descripcion, acepta_boletin, roles } = req.body;
    try {
        const rolesJson = JSON.stringify(roles || []);
        const query = 'UPDATE empleados SET nombre_completo = ?, correo_electronico = ?, sexo = ?, area = ?, descripcion = ?, acepta_boletin = ?, roles = ? WHERE id = ?';
        const [result] = await db.execute(query, [nombre_completo, correo_electronico, sexo, area, descripcion || null, acepta_boletin || false, rolesJson, req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Empleado no encontrado para actualizar' });
        res.json({ message: 'Empleado actualizado exitosamente' });
    } catch (error) {
        console.error("Error al actualizar empleado:", error);
        if (error.code === 'ER_DUP_ENTRY') {
            return res.status(409).json({ message: 'El correo electrónico ya está registrado por otro usuario.', errors: { correo_electronico: 'Este correo ya existe para otro usuario.' } });
        }
        res.status(500).json({ message: 'Error interno del servidor al actualizar empleado' });
    }
});

app.delete('/api/empleados/:id', async (req, res) => {
    try {
        const [result] = await db.execute('DELETE FROM empleados WHERE id = ?', [req.params.id]);
        if (result.affectedRows === 0) return res.status(404).json({ message: 'Empleado no encontrado para eliminar' });
        res.json({ message: 'Empleado eliminado exitosamente' });
    } catch (error) {
        console.error("Error al eliminar empleado:", error);
        res.status(500).json({ message: 'Error interno del servidor al eliminar empleado' });
    }
});

app.listen(PORT, () => {
    console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});