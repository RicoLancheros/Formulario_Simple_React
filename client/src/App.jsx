import React, { useState, useEffect, useCallback } from 'react';
import EmployeeForm from './components/EmployeeForm';
import EmployeeList from './components/EmployeeList';
import { getEmpleados, deleteEmpleado as deleteEmpleadoService } from './services/employeeService';
import './App.css';

function App() {
    const [empleados, setEmpleados] = useState([]);
    const [currentEmployeeId, setCurrentEmployeeId] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [employeeToDeleteId, setEmployeeToDeleteId] = useState(null);
    const [deleteMessage, setDeleteMessage] = useState({ type: '', content: '' });


    const fetchEmpleados = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await getEmpleados();
            console.log('Datos recibidos en fetchEmpleados:', response.data);
            setEmpleados(response.data);
        } catch (err) {
            console.error("Error fetching empleados:", err);
            setError("No se pudieron cargar los empleados. Intente más tarde.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchEmpleados();
    }, [fetchEmpleados]);

    const handleSave = () => {
        fetchEmpleados(); 
        setShowForm(false);
        setCurrentEmployeeId(null); 
    };

    const handleEdit = (id) => {
        setCurrentEmployeeId(id);
        setShowForm(true);
        setDeleteMessage({ type: '', content: ''}); 
    };

    const handleDeleteAttempt = (id) => {
        setEmployeeToDeleteId(id);
        setShowDeleteConfirm(true);
    };

    const handleDeleteConfirm = async () => {
        if (employeeToDeleteId) {
            try {
                await deleteEmpleadoService(employeeToDeleteId);
                setDeleteMessage({ type: 'success', content: 'Empleado eliminado exitosamente.' });
                fetchEmpleados();
            } catch (err) {
                console.error("Error eliminando empleado:", err);
                setDeleteMessage({ type: 'error', content: 'Error al eliminar empleado.' });
            } finally {
                setShowDeleteConfirm(false);
                setEmployeeToDeleteId(null);
            }
        }
    };

    const handleCancelDelete = () => {
        setShowDeleteConfirm(false);
        setEmployeeToDeleteId(null);
    };

    const handleAddNew = () => {
        setCurrentEmployeeId(null);
        setShowForm(true);
        setDeleteMessage({ type: '', content: ''});
    };

    const handleCancelForm = () => {
        setShowForm(false);
        setCurrentEmployeeId(null);
    }

    return (
        <div className="app-container">
            <h1>Gestión de Empleados</h1>

            {deleteMessage.content && (
                 <div className={`message ${deleteMessage.type === 'success' ? 'message-success' : 'message-error'}`} style={{maxWidth:'600px', margin:'0 auto 20px auto'}}>
                    {deleteMessage.content}
                </div>
            )}

            {!showForm && (
                <button onClick={handleAddNew} className="toggle-form-button">
                    Agregar Nuevo Empleado
                </button>
            )}

            {showForm && (
                <EmployeeForm
                    employeeId={currentEmployeeId}
                    onSave={handleSave}
                    onCancel={handleCancelForm}
                />
            )}

            <EmployeeList
                empleados={empleados}
                onEdit={handleEdit}
                onDelete={handleDeleteAttempt}
                loading={loading}
                error={error}
            />

            {showDeleteConfirm && (
                <>
                    <div className="overlay" onClick={handleCancelDelete}></div>
                    <div className="confirmation-dialog">
                        <p>¿Está seguro de que desea eliminar este empleado?</p>
                        <button onClick={handleDeleteConfirm} className="button-delete">Sí, Eliminar</button>
                        <button onClick={handleCancelDelete} className="button-secondary">Cancelar</button>
                    </div>
                </>
            )}
        </div>
    );
}

export default App;