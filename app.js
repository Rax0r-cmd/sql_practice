// SQL Studio · Simulador Interactivo de Base de Datos
// Mapeado 1:1 en el orden exacto del archivo DB_TPFinal.sql del proyecto
// Explicaciones pedagógicas en lenguaje sencillo (como para secundaria) y consignas de la Cátedra (Lic. Adrián Aroca)

const MISSIONS = [
  {
    level: 1,
    title: "1. Tabla 'tipo_recursos' (Categorías de Espacios)",
    taskGoal: "La base debe incluir como mínimo la entidad: Tipos de recurso (clasificación de salas, puestos, oficinas u otros). Requisitos: definir claves primarias, usar tipos de datos adecuados y evitar información duplicada que corresponda modelar mediante relaciones.",
    sqlComment: "En nuestro DB_TPFinal.sql: '-- tipos de lugar (salas de reunion, oficinas, escritorios) ... aca guardamos si el lugar es una sala, una oficina o un escritorio'",
    simpleDesc: "El profesor te pide clasificar las salas y te pone como regla estricta: \"Evitar información duplicada\". Si en cada sala que des de alta escribieras la palabra \"Oficina Privada\", estarías repitiendo texto y violando esa regla. Por eso, para resolver este pedido creamos una tabla independiente llamada tipo_recursos que funcione como catálogo. Le asignamos un ID numérico único (PRIMARY KEY) y un nombre. Es la primera tabla que se crea porque no depende de nadie.",
    rationale: "La cátedra exige clasificar los recursos del coworking (salas, oficinas, puestos). Esta tabla es la primera del script porque no depende de nadie y permite tipificar los espacios antes de dar de alta cualquier sala u oficina física.",
    breakdown: [
      { code: "CREATE TABLE tipo_recursos (", explain: "Le dice a MySQL: 'Creame una tabla nueva llamada tipo_recursos'." },
      { code: "id_tipo_recurso INT AUTO_INCREMENT", explain: "Un número (1, 2, 3...) que el sistema le suma solo cada vez que agregamos un tipo." },
      { code: "PRIMARY KEY", explain: "Es el documento de identidad único de la fila: no puede haber dos categorías con el mismo número." },
      { code: "nombre_tipo VARCHAR(100) NOT NULL", explain: "Texto de hasta 100 letras (ej: 'Oficina Privada'). NOT NULL significa que es obligatorio, no puede quedar vacío." },
      { code: ");", explain: "Cierra la tabla y el punto y coma finaliza la orden en MySQL." }
    ],
    exactCode: `CREATE TABLE tipo_recursos (
    id_tipo_recurso INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo VARCHAR(100) NOT NULL
);`,
    starterSql: `-- ======================================================
-- PASO 1: CREAR TABLA tipo_recursos
-- Comentario en DB_TPFinal.sql:
-- "aca guardamos si el lugar es una sala, una oficina o un escritorio"
-- ======================================================

-- Escribe tu sentencia CREATE TABLE aquí abajo y presiona "Ejecutar (Ctrl+Enter)":

`,
    templateSql: `CREATE TABLE tipo_recursos (
    id_tipo_recurso INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo VARCHAR(100) NOT NULL
);`,
    solutionSql: `CREATE TABLE tipo_recursos (
    id_tipo_recurso INT AUTO_INCREMENT PRIMARY KEY,
    nombre_tipo VARCHAR(100) NOT NULL
);`
  },

  {
    level: 2,
    title: "2. Tabla 'recursos' (Salas y Oficinas Físicas con Clave Foránea)",
    taskGoal: "La base debe incluir la entidad: Recursos (elementos del coworking que pueden ser reservados: salas de reunión, puestos de trabajo, oficinas privadas). Cada recurso posee características comunes —identificación, nombre, ubicación, estado— y características particulares según el tipo de recurso. Requisitos: definir claves foráneas.",
    sqlComment: "En nuestro DB_TPFinal.sql: '-- los lugares o salas que se pueden alquilar ... esta tabla guarda los lugares con su precio por hora y se conecta con tipo_recursos'",
    simpleDesc: "El profesor te pide registrar los espacios físicos reales con sus datos comunes (nombre, ubicación, precio) y conectar cada espacio con su tipo sin duplicar datos. Para resolver esto, creamos la tabla recursos y le ponemos una Clave Foránea (FOREIGN KEY) llamada id_tipo_recurso que apunta a la tabla del Paso 1. Además, agregamos columnas opcionales (sillas, mobiliario) para que más adelante en C# podamos aplicar Herencia y POO.",
    rationale: "La cátedra exige modelar las características comunes de los recursos (nombre, ubicación, precio) y evitar duplicación mediante relaciones (Foreign Key). También incluye atributos particulares de POO (mobiliario, sillas, categoría) para herencia.",
    breakdown: [
      { code: "CREATE TABLE recursos (", explain: "Creame la tabla para los espacios que se pueden alquilar." },
      { code: "id_recurso INT AUTO_INCREMENT PRIMARY KEY", explain: "Número identificador único de cada sala u oficina." },
      { code: "nombre VARCHAR(100) NOT NULL", explain: "Nombre de la sala (ej: 'Sala Innovación')." },
      { code: "descripcion TEXT", explain: "Detalles del lugar (proyector, pizarrón, etc.). TEXT permite textos largos." },
      { code: "ubicacion VARCHAR(100) NOT NULL", explain: "Dónde queda físicamente (ej: 'Piso 1 - Sector A')." },
      { code: "precio_por_hora DECIMAL(10,2) NOT NULL", explain: "El valor por hora. DECIMAL(10,2) guarda números con 2 decimales para los centavos (ej: 3500.00)." },
      { code: "id_tipo_recurso INT NOT NULL", explain: "La columna que guarda el número de categoría del Paso 1." },
      { code: "CONSTRAINT fk_recursos_tipo FOREIGN KEY...", explain: "El candado de seguridad: le prohíbe al sistema asignarle una categoría que no exista en tipo_recursos." }
    ],
    exactCode: `CREATE TABLE recursos (
    id_recurso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(100) NOT NULL,
    precio_por_hora DECIMAL(10,2) NOT NULL,
    mobiliario_incluido BOOLEAN NULL,
    cantidad_sillas INT NULL,
    nro_categoria INT NULL,
    id_tipo_recurso INT NOT NULL,
    CONSTRAINT fk_recursos_tipo
        FOREIGN KEY (id_tipo_recurso)
        REFERENCES tipo_recursos(id_tipo_recurso)
);`,
    starterSql: `-- ======================================================
-- PASO 2: CREAR TABLA recursos
-- Comentario en DB_TPFinal.sql:
-- "esta tabla guarda los lugares con su precio por hora y se conecta con tipo_recursos"
-- ======================================================

-- Escribe tu CREATE TABLE recursos con la clave foránea fk_recursos_tipo:

`,
    templateSql: `CREATE TABLE recursos (
    id_recurso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(100) NOT NULL,
    precio_por_hora DECIMAL(10,2) NOT NULL,
    mobiliario_incluido BOOLEAN NULL,
    cantidad_sillas INT NULL,
    nro_categoria INT NULL,
    id_tipo_recurso INT NOT NULL,
    CONSTRAINT fk_recursos_tipo
        FOREIGN KEY (id_tipo_recurso)
        REFERENCES tipo_recursos(id_tipo_recurso)
);`,
    solutionSql: `CREATE TABLE recursos (
    id_recurso INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    ubicacion VARCHAR(100) NOT NULL,
    precio_por_hora DECIMAL(10,2) NOT NULL,
    mobiliario_incluido BOOLEAN NULL,
    cantidad_sillas INT NULL,
    nro_categoria INT NULL,
    id_tipo_recurso INT NOT NULL,
    CONSTRAINT fk_recursos_tipo
        FOREIGN KEY (id_tipo_recurso)
        REFERENCES tipo_recursos(id_tipo_recurso)
);`
  },

  {
    level: 3,
    title: "3. Tabla 'clientes' (La Libreta de Contactos)",
    taskGoal: "La base debe incluir como mínimo la entidad: Clientes (personas que pueden realizar reservas). Requisitos: utilizar tipos de datos adecuados e incorporar restricciones que ayuden a preservar la integridad.",
    sqlComment: "En nuestro DB_TPFinal.sql: '-- los clientes que reservan ... guardamos los datos basicos de los clientes que alquilan'",
    simpleDesc: "El profesor te pide registrar a los usuarios del sistema. Para resolver este pedido creamos la tabla clientes. Necesitamos identificarlos con un número único (id_cliente), guardar sus datos de contacto (nombre, apellido, teléfono, mail) obligatorios (NOT NULL) para evitar registros incompletos, y agregamos una columna fecha_registro que tome automáticamente el reloj del servidor para saber cuándo se dio de alta.",
    rationale: "La cátedra define la entidad 'Clientes: personas que pueden realizar reservas'. Es la tercera tabla del modelo y contiene los datos personales requeridos para la facturación y contacto.",
    breakdown: [
      { code: "CREATE TABLE clientes (", explain: "Creame la tabla para guardar las personas que reservan." },
      { code: "id_cliente INT AUTO_INCREMENT PRIMARY KEY", explain: "Número único de socio o cliente." },
      { code: "nombre, apellido VARCHAR(100) NOT NULL", explain: "Nombre y apellido del cliente, obligatorios." },
      { code: "telefono VARCHAR(20) NOT NULL", explain: "Teléfono de contacto (VARCHAR para permitir guiones y código de área)." },
      { code: "mail VARCHAR(255) NOT NULL", explain: "Correo electrónico para mandar los comprobantes." },
      { code: "fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP", explain: "Guarda el día y la hora exacta del reloj del servidor cuando se da de alta, solo y sin escribir nada." }
    ],
    exactCode: `CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    mail VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);`,
    starterSql: `-- ======================================================
-- PASO 3: CREAR TABLA clientes
-- Comentario en DB_TPFinal.sql:
-- "guardamos los datos basicos de los clientes que alquilan"
-- ======================================================

-- Escribe tu CREATE TABLE clientes:

`,
    templateSql: `CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    mail VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);`,
    solutionSql: `CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(20) NOT NULL,
    mail VARCHAR(255) NOT NULL,
    fecha_registro DATETIME DEFAULT CURRENT_TIMESTAMP
);`
  },

  {
    level: 4,
    title: "4. Tabla Pivote 'reservas' (El Puente que Junta Cliente y Sala)",
    taskGoal: "La base debe incluir la entidad: Reservas (relación entre un cliente, un recurso y un período de uso). Operación principal: un cliente debe poder reservar un recurso para una fecha y horario determinados. El sistema debe impedir situaciones inconsistentes: reservar un recurso inexistente o no disponible.",
    sqlComment: "En nuestro DB_TPFinal.sql: '-- tabla pivote (o intermedia): une clientes con recursos (relacion muchos a muchos) ... esta es la tabla intermedia que junta al cliente con el recurso reservado, la fecha y el total'",
    simpleDesc: "Un cliente puede hacer muchas reservas en el año, y una sala puede ser reservada muchas veces. Es una relación Muchos a Muchos (N:M). Para resolver el pedido del profesor sin mezclar clientes con salas, creamos una tabla intermedia o pivote llamada reservas. En ella unimos al cliente (id_cliente) con la sala (id_recurso) mediante dos Claves Foráneas con restricciones para impedir reservas inconsistentes, y registramos la fecha, horas, total y estado.",
    rationale: "Relación Muchos a Muchos (N:M). Exige dos claves foráneas obligatorias hacia 'clientes' y 'recursos', garantizando la integridad de datos del sistema.",
    breakdown: [
      { code: "CREATE TABLE reservas (", explain: "Creame la tabla de reservas de alquiler." },
      { code: "id_reserva INT AUTO_INCREMENT PRIMARY KEY", explain: "Número de ticket o reserva único." },
      { code: "id_cliente INT NOT NULL", explain: "¿Quién reservó? (Apunta a la tabla clientes)." },
      { code: "id_recurso INT NOT NULL", explain: "¿Qué sala reservó? (Apunta a la tabla recursos)." },
      { code: "fecha_reserva DATETIME NOT NULL", explain: "Día y hora de la reserva (ej: 2026-11-01 10:00:00)." },
      { code: "horas INT NOT NULL DEFAULT 1", explain: "Cantidad de horas contratadas (por defecto 1)." },
      { code: "total DECIMAL(10,2) NOT NULL", explain: "Plata total a cobrar." },
      { code: "estado VARCHAR(20) DEFAULT 'Confirmada'", explain: "Arranca en 'Confirmada' y luego puede pasar a 'Cancelada'." },
      { code: "CONSTRAINT fk_reservas_cliente...", explain: "Candado: no podés hacer una reserva con un cliente inventado." },
      { code: "CONSTRAINT fk_reservas_recurso...", explain: "Candado: no podés reservar una sala que no exista." }
    ],
    exactCode: `CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_recurso INT NOT NULL,
    fecha_reserva DATETIME NOT NULL,
    horas INT NOT NULL DEFAULT 1,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Confirmada',
    CONSTRAINT fk_reservas_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES clientes(id_cliente),
    CONSTRAINT fk_reservas_recurso
        FOREIGN KEY (id_recurso)
        REFERENCES recursos(id_recurso)
);`,
    starterSql: `-- ======================================================
-- PASO 4: CREAR TABLA INTERMEDIA reservas
-- Comentario en DB_TPFinal.sql:
-- "junta al cliente con el recurso reservado, la fecha y el total"
-- ======================================================

-- Escribe tu CREATE TABLE reservas aquí con sus dos Claves Foráneas:

`,
    templateSql: `CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_recurso INT NOT NULL,
    fecha_reserva DATETIME NOT NULL,
    horas INT NOT NULL DEFAULT 1,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Confirmada',
    CONSTRAINT fk_reservas_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES clientes(id_cliente),
    CONSTRAINT fk_reservas_recurso
        FOREIGN KEY (id_recurso)
        REFERENCES recursos(id_recurso)
);`,
    solutionSql: `CREATE TABLE reservas (
    id_reserva INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NOT NULL,
    id_recurso INT NOT NULL,
    fecha_reserva DATETIME NOT NULL,
    horas INT NOT NULL DEFAULT 1,
    total DECIMAL(10,2) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'Confirmada',
    CONSTRAINT fk_reservas_cliente
        FOREIGN KEY (id_cliente)
        REFERENCES clientes(id_cliente),
    CONSTRAINT fk_reservas_recurso
        FOREIGN KEY (id_recurso)
        REFERENCES recursos(id_recurso)
);`
  },

  {
    level: 5,
    title: "5. Tabla 'auditoria_reservas' (La Caja Negra)",
    taskGoal: "Incorporar al menos un trigger con una finalidad justificada. Se recomienda utilizarlo para una auditoría pequeña de una operación importante. Toda tabla adicional debe estar justificada.",
    sqlComment: "En nuestro DB_TPFinal.sql: '-- tabla para guardar el historial si alguien cancela una reserva ... aca se guarda un registro solo si alguien cancela una reserva'",
    simpleDesc: "El profesor te pide más adelante un trigger para auditar una operación crítica (como la cancelación de una reserva). Pero un trigger necesita un lugar físico donde guardar esa información. Para dar respuesta a este requerimiento, creamos de forma justificada la tabla auditoria_reservas. Será el destino donde el trigger anotará automáticamente qué reserva se canceló, en qué fecha y qué usuario lo hizo.",
    rationale: "La cátedra solicita: 'Incorporar al menos un trigger para una pequeña auditoría de una operación importante'. Esta tabla es el destino exclusivo de los registros de auditoría.",
    breakdown: [
      { code: "CREATE TABLE auditoria_reservas (", explain: "Creame la tabla de auditoría para guardar el historial." },
      { code: "id_auditoria INT AUTO_INCREMENT PRIMARY KEY", explain: "Número de evento de auditoría." },
      { code: "id_reserva INT NOT NULL", explain: "¿Cuál fue la reserva afectada?" },
      { code: "accion VARCHAR(50) NOT NULL", explain: "Qué pasó (ej: 'Cancelacion de reserva')." },
      { code: "fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP", explain: "Momento exacto en que se canceló." },
      { code: "usuario VARCHAR(100) DEFAULT 'Sistema'", explain: "Quién estaba conectado en el sistema al hacerlo." }
    ],
    exactCode: `CREATE TABLE auditoria_reservas (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    accion VARCHAR(50) NOT NULL,
    fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(100) DEFAULT 'Sistema'
);`,
    starterSql: `-- ======================================================
-- PASO 5: CREAR TABLA auditoria_reservas
-- Comentario en DB_TPFinal.sql:
-- "aca se guarda un registro solo si alguien cancela una reserva"
-- ======================================================

-- Escribe tu CREATE TABLE auditoria_reservas:

`,
    templateSql: `CREATE TABLE auditoria_reservas (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    accion VARCHAR(50) NOT NULL,
    fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(100) DEFAULT 'Sistema'
);`,
    solutionSql: `CREATE TABLE auditoria_reservas (
    id_auditoria INT AUTO_INCREMENT PRIMARY KEY,
    id_reserva INT NOT NULL,
    accion VARCHAR(50) NOT NULL,
    fecha_accion DATETIME DEFAULT CURRENT_TIMESTAMP,
    usuario VARCHAR(100) DEFAULT 'Sistema'
);`
  },

  {
    level: 6,
    title: "6. Carga de Datos de Prueba (Sembrar Datos en las Tablas)",
    taskGoal: "Cargar datos iniciales suficientes para probar el sistema. Antes de pasar a C#: probar en Workbench procedimientos, vistas, función, restricciones y trigger. Guardar el script completo de creación de la base.",
    sqlComment: "En nuestro DB_TPFinal.sql: '-- CARGA DE DATOS PARA PROBAR QUE ANDE TODO ... cargamos datos de ejemplo para que las tablas no arranquen vacias al abrir el sistema'",
    simpleDesc: "Las tablas ya están creadas con sus candados y relaciones, pero están vacías. Para cumplir con el pedido de la cátedra de tener datos suficientes para probar, escribimos los INSERT INTO. Pero hay una trampa de diseño: no podés cargar una reserva sin antes tener clientes y salas, ni podés cargar salas sin antes tener los tipos. Por eso respetamos el orden estricto de dependencias.",
    rationale: "La cátedra exige: 'Cargar datos iniciales suficientes para probar el sistema antes de comenzar la integración con C#'.",
    breakdown: [
      { code: "INSERT INTO tipo_recursos...", explain: "Agrega las categorías 'Sala de Reuniones', 'Oficina Privada' y 'Puesto'." },
      { code: "INSERT INTO recursos...", explain: "Agrega la 'Sala Innovación' ($3500), 'Oficina Ejecutiva' ($4500), etc." },
      { code: "INSERT INTO clientes...", explain: "Agrega a Lucas Gonzalez y Mariana Lopez." },
      { code: "INSERT INTO reservas...", explain: "Registra las primeras reservas asociando los IDs de clientes y recursos." }
    ],
    exactCode: `INSERT INTO tipo_recursos (nombre_tipo) VALUES 
('Sala de Reuniones'),
('Oficina Privada'),
('Puesto de Trabajo');

INSERT INTO recursos (nombre, descripcion, ubicacion, precio_por_hora, mobiliario_incluido, cantidad_sillas, nro_categoria, id_tipo_recurso) VALUES 
('Sala Innovación', 'Proyector y pizarra para 10 personas', 'Piso 1 - Sector A', 3500.00, NULL, 40, NULL, 1),
('Oficina Ejecutiva 1', 'Oficina privada para 2 personas', 'Piso 2 - Of. 201', 4500.00, TRUE, NULL, NULL, 2),
('Puesto Box 1', 'Puesto individual', 'Planta Baja - Box 1', 1200.00, NULL, NULL, 1, 3);

INSERT INTO clientes (nombre, apellido, telefono, mail) VALUES 
('Lucas', 'Gonzalez', '1145678901', 'lucas.gonzalez@gmail.com'),
('Mariana', 'Lopez', '1178901234', 'mariana.lopez@hotmail.com');

INSERT INTO reservas (id_cliente, id_recurso, fecha_reserva, horas, total, estado) VALUES 
(1, 1, '2026-11-01 10:00:00', 2, 7000.00, 'Confirmada'),
(2, 2, '2026-11-02 14:00:00', 3, 13500.00, 'Confirmada');`,
    starterSql: `-- ======================================================
-- PASO 6: POBLAR LA BASE DE DATOS
-- Comentario en DB_TPFinal.sql:
-- "cargamos datos de ejemplo para que las tablas no arranquen vacias"
-- ======================================================

-- Pega o escribe los INSERTs para cargar datos de prueba:

`,
    templateSql: `INSERT INTO tipo_recursos (nombre_tipo) VALUES 
('Sala de Reuniones'),
('Oficina Privada'),
('Puesto de Trabajo');

INSERT INTO recursos (nombre, descripcion, ubicacion, precio_por_hora, mobiliario_incluido, cantidad_sillas, nro_categoria, id_tipo_recurso) VALUES 
('Sala Innovación', 'Proyector y pizarra para 10 personas', 'Piso 1 - Sector A', 3500.00, NULL, 40, NULL, 1),
('Oficina Ejecutiva 1', 'Oficina privada para 2 personas', 'Piso 2 - Of. 201', 4500.00, TRUE, NULL, NULL, 2),
('Puesto Box 1', 'Puesto individual', 'Planta Baja - Box 1', 1200.00, NULL, NULL, 1, 3);

INSERT INTO clientes (nombre, apellido, telefono, mail) VALUES 
('Lucas', 'Gonzalez', '1145678901', 'lucas.gonzalez@gmail.com'),
('Mariana', 'Lopez', '1178901234', 'mariana.lopez@hotmail.com');

INSERT INTO reservas (id_cliente, id_recurso, fecha_reserva, horas, total, estado) VALUES 
(1, 1, '2026-11-01 10:00:00', 2, 7000.00, 'Confirmada'),
(2, 2, '2026-11-02 14:00:00', 3, 13500.00, 'Confirmada');`,
    solutionSql: `INSERT INTO tipo_recursos (nombre_tipo) VALUES 
('Sala de Reuniones'),
('Oficina Privada'),
('Puesto de Trabajo');

INSERT INTO recursos (nombre, descripcion, ubicacion, precio_por_hora, mobiliario_incluido, cantidad_sillas, nro_categoria, id_tipo_recurso) VALUES 
('Sala Innovación', 'Proyector y pizarra para 10 personas', 'Piso 1 - Sector A', 3500.00, NULL, 40, NULL, 1),
('Oficina Ejecutiva 1', 'Oficina privada para 2 personas', 'Piso 2 - Of. 201', 4500.00, TRUE, NULL, NULL, 2),
('Puesto Box 1', 'Puesto individual', 'Planta Baja - Box 1', 1200.00, NULL, NULL, 1, 3);

INSERT INTO clientes (nombre, apellido, telefono, mail) VALUES 
('Lucas', 'Gonzalez', '1145678901', 'lucas.gonzalez@gmail.com'),
('Mariana', 'Lopez', '1178901234', 'mariana.lopez@hotmail.com');

INSERT INTO reservas (id_cliente, id_recurso, fecha_reserva, horas, total, estado) VALUES 
(1, 1, '2026-11-01 10:00:00', 2, 7000.00, 'Confirmada'),
(2, 2, '2026-11-02 14:00:00', 3, 13500.00, 'Confirmada');`
  },

  {
    level: 7,
    title: "7. Vistas: 'vw_detalle_reservas' y 'vw_resumen_recursos'",
    taskGoal: "Crear al menos dos vistas útiles para la aplicación. Ejemplos: detalle completo de reservas con datos del cliente y del recurso; resumen de recursos con estado o cantidad de reservas.",
    sqlComment: "En nuestro DB_TPFinal.sql: '-- VISTAS (Consultas ya armadas para no repetir codigo) ... con esta vista vemos la lista de reservas con nombres reales en vez de numeros de id ... te muestra el resumen de cada sala: cuantas veces se reservo y el total facturado'",
    simpleDesc: "El profesor te pide dos consultas guardadas para alimentar las pantallas de Windows Forms en C#. Para responder al primer ejemplo, creamos vw_detalle_reservas usando INNER JOIN para mostrar el nombre del cliente y el nombre de la sala en vez de códigos numéricos. Para el segundo ejemplo, creamos vw_resumen_recursos agrupando por sala con COUNT y SUM para saber cuántas reservas tuvo y el dinero facturado.",
    rationale: "La cátedra solicita dos vistas útiles: una para detalle desnormalizado y otra con resúmenes estadísticos (COUNT y SUM) para alimentar reportes en C#.",
    breakdown: [
      { code: "CREATE VIEW vw_detalle_reservas AS", explain: "Guardame esta consulta con el nombre vw_detalle_reservas." },
      { code: "CONCAT(c.nombre, ' ', c.apellido) AS cliente", explain: "Pega el nombre y apellido en una sola columna legible." },
      { code: "INNER JOIN clientes c ON...", explain: "Junta la reserva con el cliente para traer su nombre y mail." },
      { code: "INNER JOIN recursos rec ON...", explain: "Junta la reserva con la sala para traer su nombre y precio." },
      { code: "CREATE VIEW vw_resumen_recursos AS", explain: "Segunda vista para calcular estadísticas por sala." },
      { code: "COUNT(r.id_reserva), SUM(r.total)...", explain: "Cuenta cuántas veces se alquiló y suma el total facturado." }
    ],
    exactCode: `CREATE VIEW vw_detalle_reservas AS
SELECT 
    r.id_reserva,
    CONCAT(c.nombre, ' ', c.apellido) AS cliente,
    c.mail AS mail_cliente,
    rec.nombre AS recurso,
    t.nombre_tipo AS tipo_espacio,
    r.fecha_reserva,
    r.horas,
    r.total,
    r.estado
FROM reservas r
INNER JOIN clientes c ON r.id_cliente = c.id_cliente
INNER JOIN recursos rec ON r.id_recurso = rec.id_recurso
INNER JOIN tipo_recursos t ON rec.id_tipo_recurso = t.id_tipo_recurso;

CREATE VIEW vw_resumen_recursos AS
SELECT 
    rec.id_recurso,
    rec.nombre AS recurso,
    t.nombre_tipo AS tipo,
    rec.precio_por_hora,
    COUNT(r.id_reserva) AS cantidad_reservas,
    IFNULL(SUM(CASE WHEN r.estado = 'Confirmada' THEN r.total ELSE 0 END), 0) AS total_recaudado
FROM recursos rec
INNER JOIN tipo_recursos t ON rec.id_tipo_recurso = t.id_tipo_recurso
LEFT JOIN reservas r ON rec.id_recurso = r.id_recurso
GROUP BY rec.id_recurso, rec.nombre, t.nombre_tipo, rec.precio_por_hora;`,
    starterSql: `-- ======================================================
-- PASO 7: CREAR VISTAS (VIEWS)
-- Comentario en DB_TPFinal.sql:
-- "con esta vista vemos la lista de reservas con nombres reales en vez de numeros de id"
-- ======================================================

-- Escribe la creación de las dos vistas:

`,
    templateSql: `CREATE VIEW vw_detalle_reservas AS
SELECT 
    r.id_reserva,
    CONCAT(c.nombre, ' ', c.apellido) AS cliente,
    c.mail AS mail_cliente,
    rec.nombre AS recurso,
    t.nombre_tipo AS tipo_espacio,
    r.fecha_reserva,
    r.horas,
    r.total,
    r.estado
FROM reservas r
INNER JOIN clientes c ON r.id_cliente = c.id_cliente
INNER JOIN recursos rec ON r.id_recurso = rec.id_recurso
INNER JOIN tipo_recursos t ON rec.id_tipo_recurso = t.id_tipo_recurso;

CREATE VIEW vw_resumen_recursos AS
SELECT 
    rec.id_recurso,
    rec.nombre AS recurso,
    t.nombre_tipo AS tipo,
    rec.precio_por_hora,
    COUNT(r.id_reserva) AS cantidad_reservas,
    IFNULL(SUM(CASE WHEN r.estado = 'Confirmada' THEN r.total ELSE 0 END), 0) AS total_recaudado
FROM recursos rec
INNER JOIN tipo_recursos t ON rec.id_tipo_recurso = t.id_tipo_recurso
LEFT JOIN reservas r ON rec.id_recurso = r.id_recurso
GROUP BY rec.id_recurso, rec.nombre, t.nombre_tipo, rec.precio_por_hora;`,
    solutionSql: `CREATE VIEW vw_detalle_reservas AS
SELECT 
    r.id_reserva,
    CONCAT(c.nombre, ' ', c.apellido) AS cliente,
    c.mail AS mail_cliente,
    rec.nombre AS recurso,
    t.nombre_tipo AS tipo_espacio,
    r.fecha_reserva,
    r.horas,
    r.total,
    r.estado
FROM reservas r
INNER JOIN clientes c ON r.id_cliente = c.id_cliente
INNER JOIN recursos rec ON r.id_recurso = rec.id_recurso
INNER JOIN tipo_recursos t ON rec.id_tipo_recurso = t.id_tipo_recurso;

CREATE VIEW vw_resumen_recursos AS
SELECT 
    rec.id_recurso,
    rec.nombre AS recurso,
    t.nombre_tipo AS tipo,
    rec.precio_por_hora,
    COUNT(r.id_reserva) AS cantidad_reservas,
    IFNULL(SUM(CASE WHEN r.estado = 'Confirmada' THEN r.total ELSE 0 END), 0) AS total_recaudado
FROM recursos rec
INNER JOIN tipo_recursos t ON rec.id_tipo_recurso = t.id_tipo_recurso
LEFT JOIN reservas r ON rec.id_recurso = r.id_recurso
GROUP BY rec.id_recurso, rec.nombre, t.nombre_tipo, rec.precio_por_hora;`
  },

  {
    level: 8,
    title: "8. Función: 'fn_verificar_disponibilidad' (El Radar)",
    taskGoal: "Crear al menos una función definida por el usuario que tenga una utilidad real. Ejemplos posibles: determinar disponibilidad. El sistema debe impedir superponer reservas para el mismo recurso.",
    sqlComment: "En nuestro DB_TPFinal.sql: '-- FUNCION: Para saber si un lugar esta libre ... la funcion se fija si hay reservas en ese horario, si no hay devuelve 1 (libre) y si hay devuelve 0 (ocupado)'",
    simpleDesc: "El profesor pide evitar que dos personas reserven la misma sala en el mismo horario. Para resolverlo desde la base de datos, creamos la función fn_verificar_disponibilidad. Recibe la sala y la fecha, cuenta en la tabla reservas si hay alguna reserva confirmada en ese momento: si da 0 devuelve 1 (Libre), y si hay alguna devuelve 0 (Ocupada). Esta función será el radar que usemos antes de confirmar cualquier alquiler.",
    rationale: "La cátedra exige: 'Crear al menos una función definida por el usuario para determinar disponibilidad. El sistema debe impedir superponer reservas'.",
    breakdown: [
      { code: "DELIMITER //", explain: "Le avisa a MySQL que el punto y coma no corte el código adentro del bloque." },
      { code: "CREATE FUNCTION fn_verificar_disponibilidad...", explain: "Declara la función que recibe la sala y la fecha, y devuelve un INT (1 o 0)." },
      { code: "DETERMINISTIC READS SQL DATA", explain: "Configuraciones obligatorias de MySQL que indican que lee datos de la BD." },
      { code: "SELECT COUNT(*) INTO v_cantidad...", explain: "Cuenta cuántas reservas confirmadas hay en esa misma sala y fecha." },
      { code: "IF v_cantidad = 0 THEN RETURN 1; ELSE RETURN 0;", explain: "Si no hay nadie devuelve 1 (Libre); si hay alguien devuelve 0 (Ocupado)." },
      { code: "DELIMITER ;", explain: "Restaura el delimitador habitual de MySQL." }
    ],
    exactCode: `DELIMITER //

CREATE FUNCTION fn_verificar_disponibilidad(
    p_id_recurso INT,
    p_fecha DATETIME
) 
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_cantidad INT DEFAULT 0;
    
    SELECT COUNT(*) INTO v_cantidad
    FROM reservas
    WHERE id_recurso = p_id_recurso AND fecha_reserva = p_fecha AND estado = 'Confirmada';
      
    IF v_cantidad = 0 THEN
        RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END //

DELIMITER ;`,
    starterSql: `-- ======================================================
-- PASO 8: CREAR FUNCIÓN fn_verificar_disponibilidad
-- Comentario en DB_TPFinal.sql:
-- "si no hay reservas devuelve 1 (libre) y si hay devuelve 0 (ocupado)"
-- ======================================================

-- Escribe la función con DELIMITER //:

`,
    templateSql: `DELIMITER //

CREATE FUNCTION fn_verificar_disponibilidad(
    p_id_recurso INT,
    p_fecha DATETIME
) 
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_cantidad INT DEFAULT 0;
    
    SELECT COUNT(*) INTO v_cantidad
    FROM reservas
    WHERE id_recurso = p_id_recurso AND fecha_reserva = p_fecha AND estado = 'Confirmada';
      
    IF v_cantidad = 0 THEN
        RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END //

DELIMITER ;`,
    solutionSql: `DELIMITER //

CREATE FUNCTION fn_verificar_disponibilidad(
    p_id_recurso INT,
    p_fecha DATETIME
) 
RETURNS INT
DETERMINISTIC
READS SQL DATA
BEGIN
    DECLARE v_cantidad INT DEFAULT 0;
    
    SELECT COUNT(*) INTO v_cantidad
    FROM reservas
    WHERE id_recurso = p_id_recurso AND fecha_reserva = p_fecha AND estado = 'Confirmada';
      
    IF v_cantidad = 0 THEN
        RETURN 1;
    ELSE
        RETURN 0;
    END IF;
END //

DELIMITER ;`
  },

  {
    level: 9,
    title: "9. Procedimientos CRUD: 'sp_alta_cliente' y 'sp_modificar_cliente'",
    taskGoal: "Crear procedimientos para las principales operaciones de escritura del sistema. Como mínimo: alta de cliente, modificación de recurso, alta de reserva, cancelación o modificación de una reserva.",
    sqlComment: "En nuestro DB_TPFinal.sql: '-- PROCEDIMIENTOS ALMACENADOS (Para agregar, modificar y cancelar) ... guarda un cliente nuevo en la tabla clientes con los datos que le mandamos'",
    simpleDesc: "En aplicaciones profesionales con Windows Forms no dejamos que C# haga \"INSERT\" o \"UPDATE\" directo en las tablas. Para cumplir con la consigna de escritura protegida, creamos sp_alta_cliente y sp_modificar_cliente. Son procedimientos con parámetros de entrada (IN) que encapsulan la inserción y actualización dentro del motor de base de datos.",
    rationale: "La cátedra exige: 'Crear procedimientos para las principales operaciones de escritura: alta de cliente, alta de recurso, modificación de recurso'.",
    breakdown: [
      { code: "CREATE PROCEDURE sp_alta_cliente...", explain: "Crea el procedimiento para guardar clientes nuevos." },
      { code: "IN p_nombre, p_apellido...", explain: "Parámetros de entrada (IN) que le mandamos desde C#." },
      { code: "INSERT INTO clientes... VALUES...", explain: "Inserta en la tabla con los valores recibidos." },
      { code: "CREATE PROCEDURE sp_modificar_cliente...", explain: "Procedimiento para actualizar los datos de un cliente existente por su ID." }
    ],
    exactCode: `DELIMITER //

CREATE PROCEDURE sp_alta_cliente(
    IN p_nombre VARCHAR(100),
    IN p_apellido VARCHAR(100),
    IN p_telefono VARCHAR(20),
    IN p_mail VARCHAR(255)
)
BEGIN
    INSERT INTO clientes (nombre, apellido, telefono, mail)
    VALUES (p_nombre, p_apellido, p_telefono, p_mail);
END //

CREATE PROCEDURE sp_modificar_cliente(
    IN p_id_cliente INT,
    IN p_nombre VARCHAR(100),
    IN p_apellido VARCHAR(100),
    IN p_telefono VARCHAR(20),
    IN p_mail VARCHAR(255)
)
BEGIN
    UPDATE clientes
    SET nombre = p_nombre,
        apellido = p_apellido,
        telefono = p_telefono,
        mail = p_mail
    WHERE id_cliente = p_id_cliente;
END //

DELIMITER ;`,
    starterSql: `-- ======================================================
-- PASO 9: PROCEDIMIENTOS CRUD BÁSICOS
-- Comentario en DB_TPFinal.sql:
-- "guarda un cliente nuevo en la tabla clientes con los datos que le mandamos"
-- ======================================================

-- Escribe sp_alta_cliente y sp_modificar_cliente:

`,
    templateSql: `DELIMITER //

CREATE PROCEDURE sp_alta_cliente(
    IN p_nombre VARCHAR(100),
    IN p_apellido VARCHAR(100),
    IN p_telefono VARCHAR(20),
    IN p_mail VARCHAR(255)
)
BEGIN
    INSERT INTO clientes (nombre, apellido, telefono, mail)
    VALUES (p_nombre, p_apellido, p_telefono, p_mail);
END //

CREATE PROCEDURE sp_modificar_cliente(
    IN p_id_cliente INT,
    IN p_nombre VARCHAR(100),
    IN p_apellido VARCHAR(100),
    IN p_telefono VARCHAR(20),
    IN p_mail VARCHAR(255)
)
BEGIN
    UPDATE clientes
    SET nombre = p_nombre,
        apellido = p_apellido,
        telefono = p_telefono,
        mail = p_mail
    WHERE id_cliente = p_id_cliente;
END //

DELIMITER ;`,
    solutionSql: `DELIMITER //

CREATE PROCEDURE sp_alta_cliente(
    IN p_nombre VARCHAR(100),
    IN p_apellido VARCHAR(100),
    IN p_telefono VARCHAR(20),
    IN p_mail VARCHAR(255)
)
BEGIN
    INSERT INTO clientes (nombre, apellido, telefono, mail)
    VALUES (p_nombre, p_apellido, p_telefono, p_mail);
END //

CREATE PROCEDURE sp_modificar_cliente(
    IN p_id_cliente INT,
    IN p_nombre VARCHAR(100),
    IN p_apellido VARCHAR(100),
    IN p_telefono VARCHAR(20),
    IN p_mail VARCHAR(255)
)
BEGIN
    UPDATE clientes
    SET nombre = p_nombre,
        apellido = p_apellido,
        telefono = p_telefono,
        mail = p_mail
    WHERE id_cliente = p_id_cliente;
END //

DELIMITER ;`
  },

  {
    level: 10,
    title: "10. Procedimiento Transaccional: 'sp_alta_reserva' (El Guardia con Alarma)",
    taskGoal: "Manejo de errores: Captura en C# de excepciones provenientes de MySQL. Al menos una regla de negocio debe ser validada desde la base mediante: SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = 'Mensaje de negocio'. Impedir reservar un recurso que no se encuentra disponible.",
    sqlComment: "En nuestro DB_TPFinal.sql: '-- para guardar una reserva nueva, si el lugar ya esta ocupado no te deja y tira cartel de error ... chequea si el lugar esta libre con la funcion, si esta libre guarda la reserva y si esta ocupado tira error 45000'",
    simpleDesc: "El profesor pide que si una sala está ocupada, la propia base de datos lance un error controlado. Para resolver esto creamos sp_alta_reserva: antes de insertar, llama a nuestra función del Paso 8. Si la función dice que está ocupada, ejecuta SIGNAL SQLSTATE '45000' con un mensaje claro. En C# capturaremos este código \"45000\" para mostrar un aviso amigable en la pantalla.",
    rationale: "La cátedra evalúa en la Etapa 4: 'Manejo de errores: Captura en C# de excepciones provenientes de MySQL diferenciando errores personalizados'.",
    breakdown: [
      { code: "SET v_disponible = fn_verificar_disponibilidad...", explain: "Llama a la función del Paso 8 para fijarse si la sala está libre." },
      { code: "IF v_disponible = 0 THEN", explain: "Si dio 0 significa que la sala ya está ocupada en ese horario." },
      { code: "SIGNAL SQLSTATE '45000' SET MESSAGE_TEXT = '...'", explain: "Lanza la excepción personalizada en MySQL que captura C# en un try-catch." },
      { code: "ELSE INSERT INTO reservas...", explain: "Si estaba libre (1), realiza la inserción de la reserva normalmente." },
      { code: "CREATE PROCEDURE sp_cancelar_reserva...", explain: "Procedimiento para cambiar el estado a 'Cancelada'." }
    ],
    exactCode: `DELIMITER //

CREATE PROCEDURE sp_alta_reserva(
    IN p_id_cliente INT,
    IN p_id_recurso INT,
    IN p_fecha DATETIME,
    IN p_horas INT,
    IN p_total DECIMAL(10,2)
)
BEGIN
    DECLARE v_disponible INT;

    SET v_disponible = fn_verificar_disponibilidad(p_id_recurso, p_fecha);

    IF v_disponible = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El recurso ya se encuentra reservado en ese dia y horario.';
    ELSE
        INSERT INTO reservas (id_cliente, id_recurso, fecha_reserva, horas, total, estado)
        VALUES (p_id_cliente, p_id_recurso, p_fecha, p_horas, p_total, 'Confirmada');
    END IF;
END //

CREATE PROCEDURE sp_cancelar_reserva(
    IN p_id_reserva INT
)
BEGIN
    UPDATE reservas
    SET estado = 'Cancelada'
    WHERE id_reserva = p_id_reserva;
END //

DELIMITER ;`,
    starterSql: `-- ======================================================
-- PASO 10: PROCEDIMIENTO CON CONTROL DE EXCEPCIONES
-- Comentario en DB_TPFinal.sql:
-- "si esta libre guarda la reserva y si esta ocupado tira error 45000"
-- ======================================================

-- Escribe sp_alta_reserva y sp_cancelar_reserva:

`,
    templateSql: `DELIMITER //

CREATE PROCEDURE sp_alta_reserva(
    IN p_id_cliente INT,
    IN p_id_recurso INT,
    IN p_fecha DATETIME,
    IN p_horas INT,
    IN p_total DECIMAL(10,2)
)
BEGIN
    DECLARE v_disponible INT;

    SET v_disponible = fn_verificar_disponibilidad(p_id_recurso, p_fecha);

    IF v_disponible = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El recurso ya se encuentra reservado en ese dia y horario.';
    ELSE
        INSERT INTO reservas (id_cliente, id_recurso, fecha_reserva, horas, total, estado)
        VALUES (p_id_cliente, p_id_recurso, p_fecha, p_horas, p_total, 'Confirmada');
    END IF;
END //

CREATE PROCEDURE sp_cancelar_reserva(
    IN p_id_reserva INT
)
BEGIN
    UPDATE reservas
    SET estado = 'Cancelada'
    WHERE id_reserva = p_id_reserva;
END //

DELIMITER ;`,
    solutionSql: `DELIMITER //

CREATE PROCEDURE sp_alta_reserva(
    IN p_id_cliente INT,
    IN p_id_recurso INT,
    IN p_fecha DATETIME,
    IN p_horas INT,
    IN p_total DECIMAL(10,2)
)
BEGIN
    DECLARE v_disponible INT;

    SET v_disponible = fn_verificar_disponibilidad(p_id_recurso, p_fecha);

    IF v_disponible = 0 THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'El recurso ya se encuentra reservado en ese dia y horario.';
    ELSE
        INSERT INTO reservas (id_cliente, id_recurso, fecha_reserva, horas, total, estado)
        VALUES (p_id_cliente, p_id_recurso, p_fecha, p_horas, p_total, 'Confirmada');
    END IF;
END //

CREATE PROCEDURE sp_cancelar_reserva(
    IN p_id_reserva INT
)
BEGIN
    UPDATE reservas
    SET estado = 'Cancelada'
    WHERE id_reserva = p_id_reserva;
END //

DELIMITER ;`
  },

  {
    level: 11,
    title: "11. Trigger: 'trg_auditoria_reservas' (La Alarma Automática)",
    taskGoal: "Incorporar al menos un trigger con una finalidad justificada. Se recomienda utilizarlo para una auditoría pequeña de una operación importante.",
    sqlComment: "En nuestro DB_TPFinal.sql: '-- TRIGGER ... este trigger salta solo cuando se cancela una reserva y lo anota en la tabla auditoria_reservas'",
    simpleDesc: "Para garantizar que ninguna cancelación pase desapercibida (incluso si el programador de C# se olvida de registrarla), creamos el disparador automático trg_auditoria_reservas. Se queda vigilando la tabla reservas: en el instante en que alguien modifica el estado a \"Cancelada\", el trigger se dispara solo y guarda la evidencia en la tabla auditoria_reservas creada en el Paso 5.",
    rationale: "La cátedra exige: 'Trigger: Incorporar al menos un trigger con una finalidad justificada. Se recomienda utilizarlo para una auditoría pequeña de una operación importante'.",
    breakdown: [
      { code: "CREATE TRIGGER trg_auditoria_reservas", explain: "Crea el disparador automático." },
      { code: "AFTER UPDATE ON reservas FOR EACH ROW", explain: "Se activa automáticamente DESPUÉS de que se modifica una fila en la tabla reservas." },
      { code: "IF NEW.estado = 'Cancelada' AND OLD.estado != 'Cancelada'", explain: "Comprueba si el estado anterior NO era cancelada y el nuevo valor SÍ es cancelada." },
      { code: "INSERT INTO auditoria_reservas... NOW(), CURRENT_USER()", explain: "Inserta la evidencia en la auditoría con el reloj actual y el usuario." }
    ],
    exactCode: `DELIMITER //

CREATE TRIGGER trg_auditoria_reservas
AFTER UPDATE ON reservas
FOR EACH ROW
BEGIN
    IF NEW.estado = 'Cancelada' AND OLD.estado != 'Cancelada' THEN
        INSERT INTO auditoria_reservas (id_reserva, accion, fecha_accion, usuario)
        VALUES (NEW.id_reserva, 'Cancelacion de reserva', NOW(), CURRENT_USER());
    END IF;
END //

DELIMITER ;`,
    starterSql: `-- ======================================================
-- PASO 11: TRIGGER DE AUDITORÍA AUTOMÁTICA
-- Comentario en DB_TPFinal.sql:
-- "este trigger salta solo cuando se cancela una reserva y lo anota en la tabla auditoria_reservas"
-- ======================================================

-- Escribe el CREATE TRIGGER trg_auditoria_reservas:

`,
    templateSql: `DELIMITER //

CREATE TRIGGER trg_auditoria_reservas
AFTER UPDATE ON reservas
FOR EACH ROW
BEGIN
    IF NEW.estado = 'Cancelada' AND OLD.estado != 'Cancelada' THEN
        INSERT INTO auditoria_reservas (id_reserva, accion, fecha_accion, usuario)
        VALUES (NEW.id_reserva, 'Cancelacion de reserva', NOW(), CURRENT_USER());
    END IF;
END //

DELIMITER ;`,
    solutionSql: `DELIMITER //

CREATE TRIGGER trg_auditoria_reservas
AFTER UPDATE ON reservas
FOR EACH ROW
BEGIN
    IF NEW.estado = 'Cancelada' AND OLD.estado != 'Cancelada' THEN
        INSERT INTO auditoria_reservas (id_reserva, accion, fecha_accion, usuario)
        VALUES (NEW.id_reserva, 'Cancelacion de reserva', NOW(), CURRENT_USER());
    END IF;
END //

DELIMITER ;`
  },

  {
    level: 12,
    title: "12. Cursor: 'sp_calcular_total_recaudado_cursor' (El Contador con Calculadora)",
    taskGoal: "Contenido curricular de Algoritmos II: Demostrar el uso de estructuras avanzadas de iteración secuencial (Cursores) en MySQL para procesamiento por lotes fila por fila.",
    sqlComment: "En nuestro DB_TPFinal.sql: '-- CURSOR (Para recorrer las reservas fila por fila) ... el cursor va leyendo una por una las reservas confirmadas y va sumando los totales en una variable'",
    simpleDesc: "Un cursor permite recorrer una tabla fila por fila como si fuera un bucle while o foreach en C#. Para cumplir con este requisito de la materia, creamos sp_calcular_total_recaudado_cursor: abre la lista de reservas confirmadas, lee el monto de cada una con FETCH, lo suma a un acumulador paso a paso, y al terminar devuelve el total recaudado en un parámetro de salida OUT.",
    rationale: "En la evaluación final de Algoritmos II se exige demostrar el uso de cursores para procesamiento por lotes fila por fila (OPEN, FETCH, LOOP, CLOSE).",
    breakdown: [
      { code: "DECLARE cur_reservas CURSOR FOR SELECT total...", explain: "Declara el cursor con la consulta de reservas que va a recorrer." },
      { code: "DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin = TRUE;", explain: "El freno de mano: cuando se terminan las filas, pone la bandera v_fin en verdadero." },
      { code: "OPEN cur_reservas;", explain: "Abre el cursor en la memoria del servidor." },
      { code: "FETCH cur_reservas INTO v_monto;", explain: "Lee la fila actual y guarda la plata en la variable v_monto." },
      { code: "SET v_acumulador = v_acumulador + v_monto;", explain: "Suma la plata al acumulador total." },
      { code: "CLOSE cur_reservas; SET p_total_general = v_acumulador;", explain: "Cierra el cursor y devuelve el monto final acumulado." }
    ],
    exactCode: `DELIMITER //

CREATE PROCEDURE sp_calcular_total_recaudado_cursor(
    OUT p_total_general DECIMAL(10,2)
)
BEGIN
    DECLARE v_fin INT DEFAULT FALSE;
    DECLARE v_monto DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_acumulador DECIMAL(10,2) DEFAULT 0.00;

    DECLARE cur_reservas CURSOR FOR 
        SELECT total FROM reservas WHERE estado = 'Confirmada';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin = TRUE;

    OPEN cur_reservas;

    bucle_reservas: LOOP
        FETCH cur_reservas INTO v_monto;
        
        IF v_fin THEN
            LEAVE bucle_reservas;
        END IF;

        SET v_acumulador = v_acumulador + v_monto;
    END LOOP;

    CLOSE cur_reservas;

    SET p_total_general = v_acumulador;
END //

DELIMITER ;`,
    starterSql: `-- ======================================================
-- PASO 12: PROCEDIMIENTO CON CURSOR
-- Comentario en DB_TPFinal.sql:
-- "el cursor va leyendo una por una las reservas confirmadas y va sumando los totales en una variable"
-- ======================================================

-- Escribe sp_calcular_total_recaudado_cursor:

`,
    templateSql: `DELIMITER //

CREATE PROCEDURE sp_calcular_total_recaudado_cursor(
    OUT p_total_general DECIMAL(10,2)
)
BEGIN
    DECLARE v_fin INT DEFAULT FALSE;
    DECLARE v_monto DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_acumulador DECIMAL(10,2) DEFAULT 0.00;

    DECLARE cur_reservas CURSOR FOR 
        SELECT total FROM reservas WHERE estado = 'Confirmada';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin = TRUE;

    OPEN cur_reservas;

    bucle_reservas: LOOP
        FETCH cur_reservas INTO v_monto;
        
        IF v_fin THEN
            LEAVE bucle_reservas;
        END IF;

        SET v_acumulador = v_acumulador + v_monto;
    END LOOP;

    CLOSE cur_reservas;

    SET p_total_general = v_acumulador;
END //

DELIMITER ;`,
    solutionSql: `DELIMITER //

CREATE PROCEDURE sp_calcular_total_recaudado_cursor(
    OUT p_total_general DECIMAL(10,2)
)
BEGIN
    DECLARE v_fin INT DEFAULT FALSE;
    DECLARE v_monto DECIMAL(10,2) DEFAULT 0.00;
    DECLARE v_acumulador DECIMAL(10,2) DEFAULT 0.00;

    DECLARE cur_reservas CURSOR FOR 
        SELECT total FROM reservas WHERE estado = 'Confirmada';

    DECLARE CONTINUE HANDLER FOR NOT FOUND SET v_fin = TRUE;

    OPEN cur_reservas;

    bucle_reservas: LOOP
        FETCH cur_reservas INTO v_monto;
        
        IF v_fin THEN
            LEAVE bucle_reservas;
        END IF;

        SET v_acumulador = v_acumulador + v_monto;
    END LOOP;

    CLOSE cur_reservas;

    SET p_total_general = v_acumulador;
END //

DELIMITER ;`
  }
];

// Determinar la URL del backend PHP dinámicamente
const API_BASE = (window.location.protocol === 'file:' || (window.location.port !== '' && window.location.port !== '80'))
  ? 'http://localhost/TPFINAL/sql_lab/api.php'
  : 'api.php';


// Detección automática del entorno: MySQL (XAMPP) o Modo Sandbox
async function detectEngineMode() {
  const statusBadge = document.getElementById('engine-status-text') || document.querySelector('.status-indicator span:last-child');
  const statusDot = document.querySelector('.status-dot');

  if (window.location.protocol === 'file:') {
    enableEmbeddedMode('MySQL 8.0 Sandbox Activo');
    return;
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 1200);
    const res = await fetch(`${API_BASE}?action=status`, { signal: controller.signal });
    clearTimeout(timeoutId);
    const data = await res.json();
    if (data.success) {
      state.embeddedMode = false;
      if (statusBadge) statusBadge.textContent = 'MySQL 8.0 Activo';
      if (statusDot) {
        statusDot.style.background = 'var(--accent-success)';
        statusDot.style.boxShadow = '0 0 6px rgba(16, 185, 129, 0.6)';
      }
    } else {
      enableEmbeddedMode('MySQL 8.0 Sandbox Activo');
    }
  } catch (err) {
    enableEmbeddedMode('MySQL 8.0 Sandbox Activo');
  }
}

function enableEmbeddedMode(label = 'MySQL 8.0 Sandbox Activo') {
  state.embeddedMode = true;
  const statusBadge = document.getElementById('engine-status-text') || document.querySelector('.status-indicator span:last-child');
  const statusDot = document.querySelector('.status-dot');
  if (statusBadge) statusBadge.textContent = label;
  if (statusDot) {
    statusDot.style.background = 'var(--accent-success)';
    statusDot.style.boxShadow = '0 0 6px rgba(16, 185, 129, 0.6)';
  }
}

// Estado global de la aplicación
const state = {
  currentLevel: 1,
  embeddedMode: false,
  schema: { tables: [], views: [], routines: [], triggers: [] },
  activeTable: null,
  activeTab: 'tables',
  consoleExpanded: false
};

// Inicialización al cargar el DOM
document.addEventListener('DOMContentLoaded', async () => {
  initMissionSelector();
  initEditor();
  initTabs();
  loadMission(1);

  await detectEngineMode();
  await refreshSchema();
});

// Inicializar el selector de niveles
function initMissionSelector() {
  const select = document.getElementById('level-select');
  select.innerHTML = '';
  MISSIONS.forEach(m => {
    const opt = document.createElement('option');
    opt.value = m.level;
    const titleText = m.title || `Paso ${m.level}`;
    opt.textContent = `Paso ${m.level}: ${titleText.includes('.') ? titleText.split('.')[1].trim() : titleText}`;
    select.appendChild(opt);
  });

  select.addEventListener('change', (e) => {
    loadMission(parseInt(e.target.value, 10));
  });
}

// Cargar misión en la interfaz
function loadMission(lvl) {
  const mission = MISSIONS.find(m => m.level === lvl) || MISSIONS[0];
  state.currentLevel = mission.level;

  document.getElementById('level-select').value = mission.level;
  document.getElementById('mission-title').textContent = mission.title;
  
  // Cerrar el acordeón de soluciones para que el alumno no vea la respuesta sin querer
  const detailsSolution = document.getElementById('details-solution');
  if (detailsSolution) {
    detailsSolution.open = false;
  }

  // 0. ¿Qué debes hacer en este paso?
  const taskGoalEl = document.getElementById('mission-task-goal');
  if (taskGoalEl) {
    taskGoalEl.textContent = mission.taskGoal || '';
  }

  // 1. Explicación conceptual clara
  document.getElementById('mission-simple-desc').textContent = mission.simpleDesc;

  // 2. Desglose paso a paso de cada línea del código
  const breakdownList = document.getElementById('mission-breakdown-list');
  breakdownList.innerHTML = '';
  (mission.breakdown || []).forEach(item => {
    const row = document.createElement('div');
    row.className = 'breakdown-row';
    row.innerHTML = `
      <span class="breakdown-code">${escapeHtml(item.code)}</span>
      <span class="breakdown-desc">➜ ${escapeHtml(item.explain)}</span>
    `;
    breakdownList.appendChild(row);
  });

  // 3. Código exacto a escribir
  const exactCodeEl = document.getElementById('mission-exact-code');
  exactCodeEl.innerHTML = highlightSql(mission.exactCode);

  // Conectar botón para pegar en el editor directamente
  const btnCopyExact = document.getElementById('btn-copy-exact-code');
  if (btnCopyExact) {
    btnCopyExact.onclick = () => {
      const textarea = document.getElementById('sql-editor');
      textarea.value = mission.exactCode;
      updateLineNumbers();
      updateEditorHighlighting();
      textarea.focus();
      logConsole(`Código del Paso ${state.currentLevel} pegado en el editor. ¡Listo para presionar "Ejecutar"!`, 'info');
    };
  }

  // 4. Justificación de la cátedra
  const rationaleEl = document.getElementById('mission-rationale');
  rationaleEl.innerHTML = `<strong>En nuestro archivo SQL:</strong> <em>"${escapeHtml(mission.sqlComment)}"</em><br><br><strong>Consigna de Cátedra:</strong> ${escapeHtml(mission.rationale)}`;
  
  document.getElementById('mission-progress').textContent = `Paso ${mission.level} de ${MISSIONS.length}`;

  // El editor arranca con instrucciones limpias para que el alumno escriba
  const textarea = document.getElementById('sql-editor');
  textarea.value = mission.starterSql;
  updateLineNumbers();
  updateEditorHighlighting();
}

// Configuración del editor de texto
function initEditor() {
  const textarea = document.getElementById('sql-editor');
  const highlightingPre = document.getElementById('highlighting-pre');
  
  textarea.addEventListener('input', () => {
    updateLineNumbers();
    updateEditorHighlighting();
  });

  textarea.addEventListener('scroll', () => {
    if (highlightingPre) {
      highlightingPre.scrollTop = textarea.scrollTop;
      highlightingPre.scrollLeft = textarea.scrollLeft;
    }
    document.getElementById('line-numbers').scrollTop = textarea.scrollTop;
  });

  // Atajos de teclado: Tab para sangría y Ctrl + Enter para ejecutar
  textarea.addEventListener('keydown', (e) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      textarea.value = textarea.value.substring(0, start) + "    " + textarea.value.substring(end);
      textarea.selectionStart = textarea.selectionEnd = start + 4;
      updateLineNumbers();
      updateEditorHighlighting();
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      executeSql();
    }
  });

  document.getElementById('btn-execute').addEventListener('click', executeSql);
  document.getElementById('btn-validate').addEventListener('click', validateCurrentLevel);
  document.getElementById('btn-hint').addEventListener('click', showHintModal);
  document.getElementById('btn-reset-sandbox').addEventListener('click', resetSandbox);
  document.getElementById('btn-clear-console').addEventListener('click', clearConsole);
  document.getElementById('btn-close-modal').addEventListener('click', hideModal);

  // Botón Insertar Guía (plantilla con esqueleto)
  document.getElementById('btn-insert-template').addEventListener('click', () => {
    const mission = MISSIONS.find(m => m.level === state.currentLevel);
    if (mission) {
      textarea.value = mission.exactCode;
      updateLineNumbers();
      updateEditorHighlighting();
      logConsole(`Código del Paso ${state.currentLevel} insertado en el editor.`, 'info');
    }
  });

  // Botón Vaciar Editor
  document.getElementById('btn-clear-editor').addEventListener('click', () => {
    textarea.value = '';
    updateLineNumbers();
    updateEditorHighlighting();
    textarea.focus();
  });

  // Botón Toggle Expandir Consola
  const btnToggleConsole = document.getElementById('btn-toggle-console');
  btnToggleConsole.addEventListener('click', () => {
    const panel = document.getElementById('console-panel');
    state.consoleExpanded = !state.consoleExpanded;
    if (state.consoleExpanded) {
      panel.classList.add('expanded');
      btnToggleConsole.textContent = '↕ Reducir';
    } else {
      panel.classList.remove('expanded');
      btnToggleConsole.textContent = '↕ Expandir';
    }
  });

  // Botón Copiar Solución en el Modal
  const btnCopySolution = document.getElementById('btn-copy-solution');
  if (btnCopySolution) {
    btnCopySolution.addEventListener('click', () => {
      const mission = MISSIONS.find(m => m.level === state.currentLevel);
      if (mission && mission.exactCode) {
        document.getElementById('sql-editor').value = mission.exactCode;
        updateLineNumbers();
        updateEditorHighlighting();
        hideModal();
        logConsole(`Solución del Paso ${state.currentLevel} pegada en el editor.`, 'info');
      }
    });
  }
}

function updateLineNumbers() {
  const textarea = document.getElementById('sql-editor');
  const lineNumbers = document.getElementById('line-numbers');
  const lines = textarea.value.split('\n').length;
  let html = '';
  for (let i = 1; i <= lines; i++) {
    html += i + '<br>';
  }
  lineNumbers.innerHTML = html;
}

// Configuración de pestañas derechas
function initTabs() {
  const tabs = document.querySelectorAll('.tab-btn');
  tabs.forEach(btn => {
    btn.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = `tab-${btn.dataset.tab}`;
      const targetContent = document.getElementById(targetId);
      if (targetContent) targetContent.classList.add('active');
      state.activeTab = btn.dataset.tab;

      if (btn.dataset.tab === 'erd' && state.schema && state.schema.tables) {
        setTimeout(() => renderErdTab(state.schema.tables), 50);
      }
    });
  });
}

// Ejecutar SQL contra el backend o motor embebido
async function executeSql() {
  const rawSql = document.getElementById('sql-editor').value;
  const sqlWithoutComments = rawSql.replace(/--.*$/gm, '').trim();

  if (!sqlWithoutComments) {
    logConsole('ℹ️ Aún no has escrito código SQL para ejecutar. Escribe tu sentencia o presiona "📋 Pegar en Editor".', 'info');
    return;
  }

  logConsole('Ejecutando sentencias SQL...', 'info');

  if (state.embeddedMode) {
    const res = EmbeddedEngine.execute(rawSql);
    if (!res.success) {
      logConsole(`❌ Error SQL: ${res.error}`, 'error');
    } else {
      logConsole(`✅ Código ejecutado correctamente en modo portable. Observa los cambios a la derecha.`, 'success');
      if (res.results && res.results.some(r => r.type === 'query')) {
        renderQueryResults(res.results.filter(r => r.type === 'query'));
        switchTab('query');
      }
    }
    await refreshSchema();
    return;
  }

  try {
    const formData = new FormData();
    formData.append('action', 'execute');
    formData.append('sql', rawSql);

    const res = await fetch(API_BASE, { method: 'POST', body: formData });
    const data = await res.json();

    if (!data.success) {
      logConsole(`❌ Error SQL: ${data.error}`, 'error');
    } else {
      logConsole(`✅ Código ejecutado correctamente. Observa los cambios a la derecha.`, 'success');
      
      if (data.results && data.results.some(r => r.type === 'query')) {
        renderQueryResults(data.results.filter(r => r.type === 'query'));
        switchTab('query');
      }
    }

    await refreshSchema();

  } catch (err) {
    logConsole(`❌ Error de conexión al servidor: ${err.message}`, 'error');
  }
}

// Validar el nivel actual
async function validateCurrentLevel() {
  logConsole(`Validando Paso ${state.currentLevel}...`, 'info');

  if (state.embeddedMode) {
    const data = EmbeddedEngine.validateLevel(state.currentLevel);
    handleValidationResult(data);
    await refreshSchema();
    return;
  }

  try {
    const formData = new FormData();
    formData.append('action', 'validate_level');
    formData.append('level', state.currentLevel);

    const res = await fetch(API_BASE, { method: 'POST', body: formData });
    const data = await res.json();
    handleValidationResult(data);
    await refreshSchema();

  } catch (err) {
    logConsole(`❌ Error validando paso: ${err.message}`, 'error');
  }
}

function handleValidationResult(data) {
  if (data.passed) {
    logConsole(`🎉 ¡Paso ${state.currentLevel} APROBADO! ${data.message}`, 'success');
    
    if (state.currentLevel < MISSIONS.length) {
      setTimeout(() => {
        if (confirm(`¡Paso ${state.currentLevel} superado con éxito!\n\n${data.message}\n\n¿Deseas avanzar al Paso ${state.currentLevel + 1}?`)) {
          loadMission(state.currentLevel + 1);
        }
      }, 300);
    } else {
      alert("🏆 ¡FELICITACIONES! Has reconstruido todos los objetos del script DB_TPFinal.sql con éxito.");
    }
  } else {
    logConsole(`⚠️ Corrección automática: ${data.message}`, 'error');
  }
}

// Refrescar el esquema de la base de datos en tiempo real
async function refreshSchema() {
  if (state.embeddedMode) {
    const data = EmbeddedEngine.getSchema();
    applySchemaData(data);
    return;
  }

  try {
    const res = await fetch(`${API_BASE}?action=get_schema`);
    const data = await res.json();
    if (data.success) {
      applySchemaData(data);
    }
  } catch (err) {
    console.error('Error refreshing schema:', err);
  }
}

function applySchemaData(data) {
  state.schema = data;
  renderSchemaSidebar(data.tables);
  renderObjectsTab(data);
  renderErdTab(data.tables);

  if (data.tables.length > 0) {
    const stillExists = data.tables.find(t => t.name === state.activeTable);
    if (stillExists) {
      renderTableData(stillExists);
    } else {
      renderTableData(data.tables[0]);
    }
  } else {
    renderEmptyTables();
  }

  document.getElementById('count-tables').textContent = data.tables.length;
  const totalObj = (data.views?.length || 0) + (data.routines?.length || 0) + (data.triggers?.length || 0);
  document.getElementById('count-objects').textContent = totalObj;
}

// Renderizar la barra lateral de tablas
function renderSchemaSidebar(tables) {
  const list = document.getElementById('table-list');
  list.innerHTML = '';

  if (tables.length === 0) {
    list.innerHTML = '<li style="padding:12px; color:#64748b; font-size:11px;">(Sin tablas aún)</li>';
    return;
  }

  tables.forEach(tbl => {
    const li = document.createElement('li');
    li.className = `table-item ${state.activeTable === tbl.name ? 'active' : ''}`;
    li.innerHTML = `
      <span>${tbl.name}</span>
      <span style="font-size:10px; color:#64748b;">${tbl.rows_count} filas</span>
    `;
    li.addEventListener('click', () => {
      document.querySelectorAll('.table-item').forEach(el => el.classList.remove('active'));
      li.classList.add('active');
      renderTableData(tbl);
    });
    list.appendChild(li);
  });
}

// Renderizar datos de la tabla activa en tiempo real
function renderTableData(tbl) {
  state.activeTable = tbl.name;
  document.getElementById('active-table-name').textContent = tbl.name;
  document.getElementById('active-table-info').textContent = `${tbl.columns.length} columnas · ${tbl.rows_count} registros`;

  const container = document.getElementById('table-grid-container');
  container.innerHTML = '';

  const table = document.createElement('table');
  table.className = 'data-table';

  const thead = document.createElement('thead');
  const trHead = document.createElement('tr');

  // Columna de numeración #
  const thNum = document.createElement('th');
  thNum.className = 'th-row-num';
  thNum.textContent = '#';
  trHead.appendChild(thNum);

  tbl.columns.forEach(col => {
    const th = document.createElement('th');
    let badges = '';
    if (col.Key === 'PRI') badges += '<span class="badge-pk">PK</span>';
    if (col.Key === 'MUL') badges += '<span class="badge-fk">FK</span>';

    th.innerHTML = `${col.Field} <span style="font-weight:400; font-size:10px; color:#64748b;">(${col.Type})</span> ${badges}`;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  table.appendChild(thead);

  const tbody = document.createElement('tbody');
  if (tbl.rows.length === 0) {
    const tr = document.createElement('tr');
    const td = document.createElement('td');
    td.colSpan = tbl.columns.length + 1;
    td.style.textAlign = 'center';
    td.style.padding = '36px 16px';
    td.innerHTML = `
      <div style="font-size:13px; font-weight:600; color:#94a3b8; margin-bottom:6px;">
        📋 Tabla creada pero sin registros (0 filas)
      </div>
      <div style="font-size:11px; color:#64748b; line-height: 1.6;">
        La estructura de la tabla está definida con todas sus columnas.<br>
        En el <strong>Paso 6 (Carga de Datos de Prueba)</strong> realizaremos los <code>INSERT INTO</code> para poblarla.
      </div>
    `;
    tr.appendChild(td);
    tbody.appendChild(tr);
  } else {
    tbl.rows.forEach((row, rIdx) => {
      const tr = document.createElement('tr');

      // Numeración de fila
      const tdNum = document.createElement('td');
      tdNum.className = 'td-row-num';
      tdNum.textContent = rIdx + 1;
      tr.appendChild(tdNum);

      tbl.columns.forEach(col => {
        const td = document.createElement('td');
        const val = row[col.Field];
        if (val === null || val === undefined) {
          td.innerHTML = '<span style="color:#64748b; font-style:italic;">NULL</span>';
        } else {
          td.textContent = val;
        }
        tr.appendChild(td);
      });
      tbody.appendChild(tr);
    });
  }

  table.appendChild(tbody);
  container.appendChild(table);
}

function renderEmptyTables() {
  document.getElementById('active-table-name').textContent = 'Base de Datos Vacía';
  document.getElementById('active-table-info').textContent = '0 tablas';
  const container = document.getElementById('table-grid-container');
  container.innerHTML = `
    <div class="empty-state">
      <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
        <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
        <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
      </svg>
      <span>Aún no has creado tablas. En el Paso 1 escribe el CREATE TABLE tipo_recursos y pulsa "Ejecutar".</span>
    </div>
  `;
}

// Renderizar resultados de consultas SELECT
function renderQueryResults(queries) {
  const container = document.getElementById('tab-query');
  container.innerHTML = '';

  queries.forEach((q, idx) => {
    const card = document.createElement('div');
    card.className = 'query-result-card';

    const header = document.createElement('div');
    header.className = 'query-result-header';
    header.innerHTML = `
      <div style="display:flex; align-items:center; gap:8px;">
        <span style="color:#38bdf8; font-weight:600;">📊 Resultado Consulta #${idx + 1}</span>
        <span style="font-size:10px; padding:2px 6px; border-radius:4px; background:${q.count > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(148, 163, 184, 0.15)'}; color:${q.count > 0 ? '#34d399' : '#94a3b8'}; font-weight: 500;">
          ${q.count} ${q.count === 1 ? 'fila' : 'filas'}
        </span>
      </div>
      <span style="font-size:10px; color:#64748b;">${q.columns.length} columnas devueltas</span>
    `;
    card.appendChild(header);

    const tblWrap = document.createElement('div');
    tblWrap.className = 'data-grid-container';
    tblWrap.style.border = 'none';

    const table = document.createElement('table');
    table.className = 'data-table';

    // Cabecera de la tabla
    const thead = document.createElement('thead');
    const trHead = document.createElement('tr');

    // Columna de numeración #
    const thNum = document.createElement('th');
    thNum.className = 'th-row-num';
    thNum.textContent = '#';
    trHead.appendChild(thNum);

    q.columns.forEach(c => {
      const th = document.createElement('th');
      th.textContent = c;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    table.appendChild(thead);

    // Cuerpo de la tabla
    const tbody = document.createElement('tbody');
    if (q.rows.length === 0) {
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = q.columns.length + 1;
      td.style.textAlign = 'center';
      td.style.padding = '36px 16px';
      td.innerHTML = `
        <div style="font-size:13px; font-weight:600; color:#94a3b8; margin-bottom:6px;">
          📋 Tabla creada pero sin registros (0 filas)
        </div>
        <div style="font-size:11px; color:#64748b; line-height: 1.6;">
          La estructura de columnas de la tabla existe correctamente.<br>
          Para ver filas con datos en esta consulta, debes insertar registros usando <code>INSERT INTO ...</code><br>
          o completar el <strong>Paso 6 (Carga de Datos de Prueba)</strong>.
        </div>
      `;
      tr.appendChild(td);
      tbody.appendChild(tr);
    } else {
      q.rows.forEach((r, rIdx) => {
        const tr = document.createElement('tr');

        // Número de fila (1, 2, 3...)
        const tdNum = document.createElement('td');
        tdNum.className = 'td-row-num';
        tdNum.textContent = rIdx + 1;
        tr.appendChild(tdNum);

        q.columns.forEach(c => {
          const td = document.createElement('td');
          const val = r[c];
          if (val === null || val === undefined) {
            td.innerHTML = '<span style="color:#64748b; font-style:italic;">NULL</span>';
          } else {
            td.textContent = val;
          }
          tr.appendChild(td);
        });
        tbody.appendChild(tr);
      });
    }

    table.appendChild(tbody);
    tblWrap.appendChild(table);
    card.appendChild(tblWrap);
    container.appendChild(card);
  });
}

// Renderizar la pestaña de Objetos Almacenados
function renderObjectsTab(data) {
  const container = document.getElementById('tab-objects');
  container.innerHTML = '';

  const createSection = (title, items, typeKey) => {
    const card = document.createElement('div');
    card.style.margin = '12px';
    card.style.background = '#0e1422';
    card.style.border = '1px solid var(--border-subtle)';
    card.style.borderRadius = 'var(--radius-sm)';

    const head = document.createElement('div');
    head.style.padding = '8px 12px';
    head.style.background = '#131b2e';
    head.style.borderBottom = '1px solid var(--border-subtle)';
    head.style.fontWeight = '600';
    head.style.fontSize = '11px';
    head.style.color = '#f1f5f9';
    head.textContent = `${title} (${items.length})`;
    card.appendChild(head);

    const body = document.createElement('div');
    body.style.padding = '8px 12px';
    if (items.length === 0) {
      body.innerHTML = '<span style="color:#64748b; font-size:11px;">(Ninguno creado aún)</span>';
    } else {
      const ul = document.createElement('ul');
      ul.style.listStyle = 'none';
      items.forEach(it => {
        const li = document.createElement('li');
        li.style.padding = '4px 0';
        li.style.fontFamily = 'var(--font-mono)';
        li.style.fontSize = '11px';
        li.style.color = '#93c5fd';
        li.textContent = it[typeKey] || it.name || it.ROUTINE_NAME || it.TRIGGER_NAME;
        ul.appendChild(li);
      });
      body.appendChild(ul);
    }
    card.appendChild(body);
    container.appendChild(card);
  };

  createSection('Vistas (Views)', data.views || [], 'name');
  createSection('Procedimientos y Funciones (Routines)', data.routines || [], 'ROUTINE_NAME');
  createSection('Triggers (Disparadores)', data.triggers || [], 'TRIGGER_NAME');
}

// Estado de posiciones del Diagrama Entidad-Relación (DER)
const erdState = {
  positions: {
    'tipo_recursos': { x: 40, y: 40 },
    'recursos': { x: 40, y: 260 },
    'clientes': { x: 380, y: 40 },
    'reservas': { x: 380, y: 260 },
    'auditoria_reservas': { x: 720, y: 260 }
  },
  draggingNode: null,
  dragOffset: { x: 0, y: 0 }
};

// Renderizar diagrama entidad relación (DER) interactivo con conectores SVG
function renderErdTab(tables) {
  const canvas = document.getElementById('erd-canvas');
  const nodesLayer = document.getElementById('erd-nodes-layer');
  const svgLayer = document.getElementById('erd-svg-layer');
  const relationsCountEl = document.getElementById('erd-relations-count');

  if (!canvas || !nodesLayer || !svgLayer) return;

  nodesLayer.innerHTML = '';
  
  // Limpiar paths previos conservando los <defs> de marcadores
  const oldPaths = svgLayer.querySelectorAll('.erd-relation-path');
  oldPaths.forEach(p => p.remove());

  if (!tables || tables.length === 0) {
    if (relationsCountEl) relationsCountEl.textContent = '0 relaciones';
    nodesLayer.innerHTML = `
      <div class="empty-state" style="position: absolute; top: 35%; left: 50%; transform: translate(-50%, -50%);">
        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="3" y1="9" x2="21" y2="9"></line>
          <line x1="9" y1="21" x2="9" y2="9"></line>
        </svg>
        <span style="font-size: 13px; font-weight: 500; color: #94a3b8;">El Diagrama Entidad-Relación se encuentra vacío</span>
        <span style="font-size: 11px; color: #64748b;">Crea tablas en el editor SQL para verlas aparecer y conectarse automáticamente aquí.</span>
      </div>
    `;
    return;
  }

  // 1. Asignar posiciones y crear nodos en el DOM
  let autoIndex = 0;
  tables.forEach(tbl => {
    if (!erdState.positions[tbl.name]) {
      const col = autoIndex % 3;
      const row = Math.floor(autoIndex / 3);
      erdState.positions[tbl.name] = {
        x: 40 + col * 320,
        y: 40 + row * 240
      };
      autoIndex++;
    }

    const pos = erdState.positions[tbl.name];
    const node = document.createElement('div');
    node.className = 'erd-node';
    node.id = `erd-node-${tbl.name}`;
    node.style.left = `${pos.x}px`;
    node.style.top = `${pos.y}px`;

    const header = document.createElement('div');
    header.className = 'erd-node-header';
    header.innerHTML = `
      <span class="erd-node-title">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <ellipse cx="12" cy="5" rx="9" ry="3"></ellipse>
          <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"></path>
          <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"></path>
        </svg>
        ${escapeHtml(tbl.name)}
      </span>
      <span class="erd-node-count">${tbl.columns.length} campos</span>
    `;

    const body = document.createElement('div');
    body.className = 'erd-node-body';

    tbl.columns.forEach(col => {
      const row = document.createElement('div');
      row.className = 'erd-field-row';
      row.id = `erd-field-${tbl.name}-${col.Field}`;

      let badge = '';
      if (col.Key === 'PRI') badge = '<span class="badge-pk" title="Clave Primaria">PK</span>';
      if (col.Key === 'MUL') badge = '<span class="badge-fk" title="Clave Foránea">FK</span>';

      row.innerHTML = `
        <div class="erd-field-left">
          ${badge}
          <span class="erd-field-name">${escapeHtml(col.Field)}</span>
        </div>
        <span class="erd-field-type">${escapeHtml(col.Type)}</span>
      `;
      body.appendChild(row);
    });

    node.appendChild(header);
    node.appendChild(body);

    header.addEventListener('mousedown', (e) => {
      erdState.draggingNode = tbl.name;
      const nodeRect = node.getBoundingClientRect();
      erdState.dragOffset = {
        x: e.clientX - nodeRect.left,
        y: e.clientY - nodeRect.top
      };
      node.classList.add('dragging');
      e.preventDefault();
    });

    nodesLayer.appendChild(node);
  });

  // 2. Trazar relaciones foráneas en SVG
  drawErdRelations(tables);
}

// Dibujar conectores SVG en curvas Bezier entre tablas
function drawErdRelations(tables) {
  const svgLayer = document.getElementById('erd-svg-layer');
  const canvas = document.getElementById('erd-canvas');
  const relationsCountEl = document.getElementById('erd-relations-count');

  if (!svgLayer || !canvas || !tables) return;

  svgLayer.querySelectorAll('.erd-relation-path').forEach(p => p.remove());

  let relationCount = 0;

  tables.forEach(tbl => {
    if (!tbl.foreign_keys || tbl.foreign_keys.length === 0) return;

    tbl.foreign_keys.forEach(fk => {
      const sourceFieldName = fk.COLUMN_NAME;
      const targetTableName = fk.REFERENCED_TABLE_NAME;
      const targetFieldName = fk.REFERENCED_COLUMN_NAME;

      const sourceNode = document.getElementById(`erd-node-${tbl.name}`);
      const targetNode = document.getElementById(`erd-node-${targetTableName}`);

      if (!sourceNode || !targetNode) return;

      const sourcePos = erdState.positions[tbl.name];
      const targetPos = erdState.positions[targetTableName];
      if (!sourcePos || !targetPos) return;

      relationCount++;

      const sourceWidth = sourceNode.offsetWidth || 230;
      const sourceHeight = sourceNode.offsetHeight || 140;
      const targetWidth = targetNode.offsetWidth || 230;
      const targetHeight = targetNode.offsetHeight || 140;

      let x1, y1, x2, y2;

      if (sourcePos.x + sourceWidth < targetPos.x) {
        x1 = sourcePos.x + sourceWidth;
        y1 = sourcePos.y + sourceHeight * 0.4;
        x2 = targetPos.x;
        y2 = targetPos.y + targetHeight * 0.4;
      } else if (sourcePos.x > targetPos.x + targetWidth) {
        x1 = sourcePos.x;
        y1 = sourcePos.y + sourceHeight * 0.4;
        x2 = targetPos.x + targetWidth;
        y2 = targetPos.y + targetHeight * 0.4;
      } else {
        x1 = sourcePos.x + sourceWidth * 0.5;
        y1 = sourcePos.y < targetPos.y ? sourcePos.y + sourceHeight : sourcePos.y;
        x2 = targetPos.x + targetWidth * 0.5;
        y2 = sourcePos.y < targetPos.y ? targetPos.y : targetPos.y + targetHeight;
      }

      const dx = Math.abs(x2 - x1) * 0.5;
      const p1ControlX = x1 < x2 ? x1 + dx : x1 - dx;
      const p2ControlX = x1 < x2 ? x2 - dx : x2 + dx;

      const d = `M ${x1} ${y1} C ${p1ControlX} ${y1}, ${p2ControlX} ${y2}, ${x2} ${y2}`;

      const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      path.setAttribute('class', 'erd-relation-path');
      path.setAttribute('d', d);
      path.setAttribute('marker-start', 'url(#erd-dot)');
      path.setAttribute('marker-end', 'url(#erd-arrow)');
      path.setAttribute('data-relation', `${tbl.name}.${sourceFieldName} -> ${targetTableName}.${targetFieldName}`);

      svgLayer.appendChild(path);
    });
  });

  if (relationsCountEl) {
    relationsCountEl.textContent = `${relationCount} ${relationCount === 1 ? 'relación' : 'relaciones'}`;
  }
}

// Inicializar eventos de Drag & Drop y Auto-Layout para el DER
document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('erd-canvas');
  if (canvas) {
    canvas.addEventListener('mousemove', (e) => {
      if (!erdState.draggingNode) return;

      const canvasRect = canvas.getBoundingClientRect();
      const newX = Math.max(10, e.clientX - canvasRect.left + canvas.scrollLeft - erdState.dragOffset.x);
      const newY = Math.max(10, e.clientY - canvasRect.top + canvas.scrollTop - erdState.dragOffset.y);

      erdState.positions[erdState.draggingNode] = { x: newX, y: newY };

      const nodeEl = document.getElementById(`erd-node-${erdState.draggingNode}`);
      if (nodeEl) {
        nodeEl.style.left = `${newX}px`;
        nodeEl.style.top = `${newY}px`;
      }

      if (state.schema && state.schema.tables) {
        drawErdRelations(state.schema.tables);
      }
    });

    window.addEventListener('mouseup', () => {
      if (erdState.draggingNode) {
        const nodeEl = document.getElementById(`erd-node-${erdState.draggingNode}`);
        if (nodeEl) nodeEl.classList.remove('dragging');
        erdState.draggingNode = null;
      }
    });

    const btnAutoLayout = document.getElementById('btn-erd-auto-layout');
    if (btnAutoLayout) {
      btnAutoLayout.addEventListener('click', () => {
        erdState.positions = {
          'tipo_recursos': { x: 40, y: 40 },
          'recursos': { x: 40, y: 260 },
          'clientes': { x: 380, y: 40 },
          'reservas': { x: 380, y: 260 },
          'auditoria_reservas': { x: 720, y: 260 }
        };
        if (state.schema && state.schema.tables) {
          renderErdTab(state.schema.tables);
        }
      });
    }
  }
});

// Cambiar de pestaña programáticamente
function switchTab(tabKey) {
  const btn = document.querySelector(`.tab-btn[data-tab="${tabKey}"]`);
  if (btn) btn.click();
}

// Consola de diagnóstico
function logConsole(msg, type = 'info') {
  const body = document.getElementById('console-body');
  const line = document.createElement('div');
  line.className = `console-msg ${type}`;
  const time = new Date().toLocaleTimeString();
  line.innerHTML = `<span style="color:#64748b;">[${time}]</span> <span>${escapeHtml(msg)}</span>`;
  body.appendChild(line);
  body.scrollTop = body.scrollHeight;
}

function clearConsole() {
  document.getElementById('console-body').innerHTML = '';
}

// Reiniciar sandbox
async function resetSandbox() {
  if (!confirm("¿Deseas reiniciar la base de datos de práctica desde cero?\nSe borrarán todas las tablas y objetos para empezar limpios.")) {
    return;
  }

  if (state.embeddedMode) {
    EmbeddedEngine.reset();
    logConsole('Base de datos sandbox reiniciada a cero (modo portable).', 'info');
    await refreshSchema();
    return;
  }

  try {
    const res = await fetch(`${API_BASE}?action=reset`);
    const data = await res.json();
    if (data.success) {
      logConsole('Base de datos sandbox reiniciada a cero.', 'info');
      await refreshSchema();
    } else {
      logConsole(`Error al reiniciar: ${data.error}`, 'error');
    }
  } catch (err) {
    logConsole(`Error: ${err.message}`, 'error');
  }
}

// Modal de Pistas y Solución
function showHintModal() {
  const mission = MISSIONS.find(m => m.level === state.currentLevel);
  if (!mission) return;

  document.getElementById('modal-title').textContent = `Pistas & Solución: ${mission.title}`;
  document.getElementById('modal-hint-text').textContent = mission.simpleDesc;
  
  const snippetEl = document.getElementById('modal-code-snippet');
  snippetEl.innerHTML = highlightSql(mission.exactCode);
  document.getElementById('modal-overlay').classList.add('open');
}

function hideModal() {
  document.getElementById('modal-overlay').classList.remove('open');
}

// Actualizar el resaltado del editor en tiempo real
function updateEditorHighlighting() {
  const textarea = document.getElementById('sql-editor');
  const codeEl = document.getElementById('highlighting-content');
  if (codeEl && textarea) {
    codeEl.innerHTML = highlightSql(textarea.value);
  }
}

// Resaltador de sintaxis SQL Dark Mode (estilo VS Code / Tokyo Night)
function highlightSql(sql) {
  if (!sql) return '';

  const placeholders = [];
  const addPlaceholder = (str, className) => {
    const id = `___TOK${placeholders.length}___`;
    placeholders.push(`<span class="${className}">${str}</span>`);
    return id;
  };

  let code = sql
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  code = code.replace(/(--[^\r\n]*)/g, m => addPlaceholder(m, 'token-comment'));
  code = code.replace(/(\/\*[\s\S]*?\*\/)/g, m => addPlaceholder(m, 'token-comment'));
  code = code.replace(/('([^'\\]|\\.)*')/g, m => addPlaceholder(m, 'token-string'));
  code = code.replace(/\b(@\w+|p_\w+|v_\w+|NEW\.\w+|OLD\.\w+)\b/gi, m => addPlaceholder(m, 'token-variable'));

  const funcs = 'COUNT|SUM|AVG|MAX|MIN|IFNULL|CONCAT|NOW|CURRENT_USER|CURRENT_TIMESTAMP';
  code = code.replace(new RegExp(`\\b(${funcs})\\b(?=\\s*\\()`, 'gi'), m => addPlaceholder(m, 'token-function'));

  const types = 'INT|BIGINT|SMALLINT|TINYINT|VARCHAR|TEXT|DECIMAL|BOOLEAN|DATETIME|DATE|TIME|TIMESTAMP|FLOAT|DOUBLE';
  code = code.replace(new RegExp(`\\b(${types})\\b`, 'gi'), m => addPlaceholder(m, 'token-type'));

  const keywords = 'CREATE|TABLE|DROP|DATABASE|ALTER|SELECT|FROM|WHERE|INSERT|INTO|VALUES|UPDATE|SET|DELETE|INNER|LEFT|RIGHT|JOIN|ON|GROUP|BY|ORDER|HAVING|LIMIT|AND|OR|NOT|AS|CASE|WHEN|THEN|ELSE|END|IF|NULL|DEFAULT|DELIMITER|BEGIN|PROCEDURE|FUNCTION|TRIGGER|CURSOR|LOOP|LEAVE|FETCH|OPEN|CLOSE|DECLARE|HANDLER|SIGNAL|SQLSTATE|DETERMINISTIC|READS|SQL|DATA|RETURNS|RETURN|OUT|IN|AFTER|BEFORE|FOR|EACH|ROW|AUTO_INCREMENT|PRIMARY|KEY|FOREIGN|REFERENCES|CONSTRAINT|VIEW|INDEX|USE|EXISTS|TRUE|FALSE';
  code = code.replace(new RegExp(`\\b(${keywords})\\b`, 'gi'), m => addPlaceholder(m, 'token-keyword'));

  code = code.replace(/\b(\d+(\.\d+)?)\b/g, m => addPlaceholder(m, 'token-number'));

  for (let i = placeholders.length - 1; i >= 0; i--) {
    code = code.replace(`___TOK${i}___`, placeholders[i]);
  }

  if (code.endsWith('\n')) {
    code += ' ';
  }

  return code;
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}
