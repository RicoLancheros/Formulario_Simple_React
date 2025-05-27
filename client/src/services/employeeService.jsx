import axios from 'axios';
const API_BASE_URL = '/api/empleados';

export const getEmpleados = () => axios.get(API_BASE_URL);
export const getEmpleado = (id) => axios.get(`${API_BASE_URL}/${id}`);
export const createEmpleado = (empleado) => axios.post(API_BASE_URL, empleado);
export const updateEmpleado = (id, empleado) => axios.put(`${API_BASE_URL}/${id}`, empleado);
export const deleteEmpleado = (id) => axios.delete(`${API_BASE_URL}/${id}`);