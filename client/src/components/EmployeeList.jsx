import React from 'react';
import './EmployeeList.css';

function EmployeeList({ empleados, onEdit, onDelete, loading, error }) {
    if (loading) return <p>Cargando empleados...</p>;
    if (error) return <p className="message message-error">Error al cargar empleados: {error}</p>;
    if (empleados.length === 0) return <p>No hay empleados registrados.</p>;

    return (
        <div className="employee-list-container">
            <h3>Lista de Empleados</h3>
            <table>
                <thead>
                    <tr>
                        <th>Nombre</th>
                        <th>Correo</th>
                        <th>Área</th>
                        <th>Roles</th>
                        <th>Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {empleados.map(emp => (
                        <tr key={emp.id}>
                            <td>{emp.nombre_completo}</td>
                            <td>{emp.correo_electronico}</td>
                            <td>{emp.area}</td>
                            <td>{Array.isArray(emp.roles) ? emp.roles.join(', ') : ''}</td>
                            <td>
                                <button onClick={() => onEdit(emp.id)} className="button-edit">Editar</button>
                                <button onClick={() => onDelete(emp.id)} className="button-delete">Eliminar</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
export default EmployeeList;