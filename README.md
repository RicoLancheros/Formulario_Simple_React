# Formulario Simple React

# Manual de usuario #

# 1. Crear la base de datos en Mysql:

#1. Crear la base de datos (si no existe)
CREATE DATABASE Formulario_Examen;
#2. Usar la base de datos creada
USE Formulario_Examen;
#3. Crear la tabla de empleados
CREATE TABLE IF NOT EXISTS empleados (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre_completo VARCHAR(255) NOT NULL,
    correo_electronico VARCHAR(255) NOT NULL UNIQUE,
    sexo ENUM('Masculino', 'Femenino', 'Otro') NOT NULL,
    area VARCHAR(100) NOT NULL,
    descripcion TEXT,
    acepta_boletin BOOLEAN DEFAULT FALSE,
    roles JSON NOT NULL,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT chk_roles CHECK (JSON_VALID(roles))
);

# 2. Cambiar la contraseña en db.js a la de tu Mysql.

# 3. Iniciar el Script dentro del proyecto (IniciarProyecto.bat). 

# Fin del manual de usuario...






