import React, { useState, useEffect } from 'react';
import { createEmpleado, getEmpleado, updateEmpleado } from '../services/employeeService';
import './EmployeeForm.css';

const AREAS = ["Administración", "Ventas", "Marketing", "Tecnología", "Recursos Humanos", "Calidad"];
const ROLES_DISPONIBLES = ["Profesional de proyectos - Desarrollador", "Gerente estratégico", "Auxiliar administrativo", "Analista QA"];

const initialFormState = {
    nombre_completo: '',
    correo_electronico: '',
    sexo: '',
    area: AREAS[0],
    descripcion: '',
    acepta_boletin: false,
    roles: [],
};

function EmployeeForm({ employeeId, onSave, onCancel }) {
    const [formData, setFormData] = useState(initialFormState);
    const [errors, setErrors] = useState({});
    const [serverMessage, setServerMessage] = useState({ type: '', content: '' }); // type: 'success' o 'error'

    const isEditing = Boolean(employeeId);

    useEffect(() => {
        if (isEditing) {
            getEmpleado(employeeId)
                .then(response => {
                    const emp = response.data;
                    setFormData({
                        nombre_completo: emp.nombre_completo || '',
                        correo_electronico: emp.correo_electronico || '',
                        sexo: emp.sexo || '',
                        area: emp.area || AREAS[0],
                        descripcion: emp.descripcion || '',
                        acepta_boletin: Boolean(emp.acepta_boletin),
                        roles: Array.isArray(emp.roles) ? emp.roles : [],
                    });
                })
                .catch(err => {
                    console.error("Error cargando empleado para editar:", err);
                    setServerMessage({ type: 'error', content: 'Error al cargar datos del empleado.' });
                });
        } else {
            setFormData(initialFormState);
        }
        setErrors({});
        setServerMessage({ type: '', content: ''});
    }, [employeeId, isEditing]);

    const validateForm = () => {
        const newErrors = {};
        if (!formData.nombre_completo.trim()) newErrors.nombre_completo = "Nombre completo es requerido.";
        if (!formData.correo_electronico.trim()) {
            newErrors.correo_electronico = "Correo electrónico es requerido.";
        } else if (!/\S+@\S+\.\S+/.test(formData.correo_electronico)) {
            newErrors.correo_electronico = "Correo electrónico no es válido.";
        }
        if (!formData.sexo) newErrors.sexo = "Sexo es requerido.";
        if (!formData.area) newErrors.area = "Área es requerida.";
        if (formData.roles.length === 0) newErrors.roles = "Debe seleccionar al menos un rol.";
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleRoleChange = (e) => {
        const { value, checked } = e.target;
        setFormData(prev => {
            const currentRoles = prev.roles;
            if (checked) {
                return { ...prev, roles: [...currentRoles, value] };
            } else {
                return { ...prev, roles: currentRoles.filter(role => role !== value) };
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setServerMessage({ type: '', content: ''});
        if (!validateForm()) return;

        try {
            if (isEditing) {
                await updateEmpleado(employeeId, formData);
                setServerMessage({ type: 'success', content: 'Empleado actualizado exitosamente.' });
            } else {
                await createEmpleado(formData);
                setServerMessage({ type: 'success', content: 'Empleado creado exitosamente.' });
                setFormData(initialFormState);
            }
            if(onSave) onSave();
        } catch (err) {
            console.error("Error guardando empleado:", err.response?.data || err.message);
            const apiError = err.response?.data;
            if (apiError && apiError.errors) {
                setErrors(prevErrors => ({...prevErrors, ...apiError.errors})); 
            }
            setServerMessage({ type: 'error', content: apiError?.message || 'Ocurrió un error al guardar.' });
        }
    };

    return (
        <div className="employee-form-card">
            <h3>{isEditing ? 'Modificar Empleado' : 'Crear Empleado'}</h3>
            <p className="form-instruction">Los campos con asteriscos (*) son obligatorios</p>

            {serverMessage.content && (
                <div className={`message ${serverMessage.type === 'success' ? 'message-success' : 'message-error'}`}>
                    {serverMessage.content}
                </div>
            )}

            <form onSubmit={handleSubmit} noValidate>
                <div>
                    <label htmlFor="nombre_completo">Nombre completo *</label>
                    <input type="text" id="nombre_completo" name="nombre_completo" value={formData.nombre_completo} onChange={handleChange} placeholder="Nombre completo" />
                    {errors.nombre_completo && <span className="error-text">{errors.nombre_completo}</span>}
                </div>
                <div>
                    <label htmlFor="correo_electronico">Correo electrónico *</label>
                    <input type="email" id="correo_electronico" name="correo_electronico" value={formData.correo_electronico} onChange={handleChange} placeholder="ejemplo@correo.com" />
                    {errors.correo_electronico && <span className="error-text">{errors.correo_electronico}</span>}
                </div>
                <fieldset>
                    <legend>Sexo *</legend>
                    {['Masculino', 'Femenino', 'Otro'].map(s => (
                        <label key={s} className="radio-label">
                            <input type="radio" name="sexo" value={s} checked={formData.sexo === s} onChange={handleChange} /> {s}
                        </label>
                    ))}
                    {errors.sexo && <span className="error-text">{errors.sexo}</span>}
                </fieldset>
                <div>
                    <label htmlFor="area">Área *</label>
                    <select id="area" name="area" value={formData.area} onChange={handleChange}>
                        {AREAS.map(a => <option key={a} value={a}>{a}</option>)}
                    </select>
                    {errors.area && <span className="error-text">{errors.area}</span>}
                </div>
                <div>
                    <label htmlFor="descripcion">Descripción (Opcional)</label>
                    <textarea id="descripcion" name="descripcion" value={formData.descripcion} onChange={handleChange} placeholder="Experiencia del empleado..." />
                    {/* No hay error para descripción ya que es opcional */}
                </div>
                <div>
                    <label className="checkbox-label">
                        <input type="checkbox" name="acepta_boletin" checked={formData.acepta_boletin} onChange={handleChange} />
                        Deseo recibir boletín informativo
                    </label>
                </div>
                <fieldset>
                    <legend>Roles *</legend>
                    {ROLES_DISPONIBLES.map(role => (
                        <label key={role} className="checkbox-label">
                            <input type="checkbox" value={role} checked={formData.roles.includes(role)} onChange={handleRoleChange} />
                            {role}
                        </label>
                    ))}
                     {errors.roles && <span className="error-text">{errors.roles}</span>}
                </fieldset>
                <div className="form-actions">
                    <button type="submit" className="button-primary">{isEditing ? 'Actualizar' : 'Guardar'}</button>
                    {onCancel && <button type="button" className="button-secondary" onClick={onCancel}>Cancelar</button>}
                </div>
            </form>
        </div>
    );
}
export default EmployeeForm;