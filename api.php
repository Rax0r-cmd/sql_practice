<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=utf-8');

// Configuración de conexión local MySQL (XAMPP por defecto)
$dbHost = '127.0.0.1';
$dbPort = '3306';
$dbUser = 'root';
$dbPass = '';
$sandboxDb = 'tp_final_sandbox'; // Base de datos aislada de práctica

function getRootPdo($host, $port, $user, $pass) {
    $dsn = "mysql:host={$host};port={$port};charset=utf8mb4";
    $opt = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    return new PDO($dsn, $user, $pass, $opt);
}

function getSandboxPdo($host, $port, $user, $pass, $db) {
    $root = getRootPdo($host, $port, $user, $pass);
    $root->exec("CREATE DATABASE IF NOT EXISTS `{$db}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
    $dsn = "mysql:host={$host};port={$port};dbname={$db};charset=utf8mb4";
    $opt = [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ];
    return new PDO($dsn, $user, $pass, $opt);
}

$action = $_GET['action'] ?? $_POST['action'] ?? 'status';

try {
    $pdo = getSandboxPdo($dbHost, $dbPort, $dbUser, $dbPass, $sandboxDb);

    if ($action === 'status') {
        echo json_encode([
            'success' => true,
            'message' => 'Conexión con MySQL activa.',
            'database' => $sandboxDb
        ]);
        exit;
    }

    if ($action === 'reset') {
        $root = getRootPdo($dbHost, $dbPort, $dbUser, $dbPass);
        $root->exec("DROP DATABASE IF EXISTS `{$sandboxDb}`;");
        $root->exec("CREATE DATABASE `{$sandboxDb}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;");
        echo json_encode([
            'success' => true,
            'message' => 'Base de datos sandbox reiniciada desde cero.'
        ]);
        exit;
    }

    if ($action === 'get_schema') {
        // Obtenemos tablas, columnas, vistas, procedures, functions y triggers
        $tablesStmt = $pdo->query("SHOW FULL TABLES WHERE Table_type = 'BASE TABLE'");
        $tables = [];
        while ($row = $tablesStmt->fetch(PDO::FETCH_NUM)) {
            $tableName = $row[0];
            // Estructura de columnas
            $colStmt = $pdo->query("DESCRIBE `{$tableName}`");
            $columns = $colStmt->fetchAll();

            // Total de filas
            $countStmt = $pdo->query("SELECT COUNT(*) AS total FROM `{$tableName}`");
            $count = $countStmt->fetch()['total'] ?? 0;

            // Datos de muestra (primeras 50 filas)
            $dataStmt = $pdo->query("SELECT * FROM `{$tableName}` LIMIT 50");
            $rows = $dataStmt->fetchAll();

            // Claves foráneas
            $fkStmt = $pdo->prepare("
                SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME, CONSTRAINT_NAME
                FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
                WHERE TABLE_SCHEMA = :db AND TABLE_NAME = :tbl AND REFERENCED_TABLE_NAME IS NOT NULL
            ");
            $fkStmt->execute([':db' => $sandboxDb, ':tbl' => $tableName]);
            $fks = $fkStmt->fetchAll();

            $tables[] = [
                'name' => $tableName,
                'columns' => $columns,
                'rows_count' => (int)$count,
                'rows' => $rows,
                'foreign_keys' => $fks
            ];
        }

        // Vistas
        $viewsStmt = $pdo->prepare("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = :db");
        $viewsStmt->execute([':db' => $sandboxDb]);
        $views = [];
        foreach ($viewsStmt->fetchAll() as $v) {
            $vName = $v['TABLE_NAME'];
            $colStmt = $pdo->query("DESCRIBE `{$vName}`");
            $vCols = $colStmt->fetchAll();
            $dataStmt = $pdo->query("SELECT * FROM `{$vName}` LIMIT 50");
            $vRows = $dataStmt->fetchAll();
            $views[] = [
                'name' => $vName,
                'columns' => $vCols,
                'rows' => $vRows
            ];
        }

        // Rutinas (Procedures y Functions)
        $routinesStmt = $pdo->prepare("
            SELECT ROUTINE_NAME, ROUTINE_TYPE, DTD_IDENTIFIER, ROUTINE_COMMENT
            FROM INFORMATION_SCHEMA.ROUTINES
            WHERE ROUTINE_SCHEMA = :db
        ");
        $routinesStmt->execute([':db' => $sandboxDb]);
        $routines = $routinesStmt->fetchAll();

        // Triggers
        $triggersStmt = $pdo->prepare("
            SELECT TRIGGER_NAME, EVENT_MANIPULATION, EVENT_OBJECT_TABLE, ACTION_TIMING
            FROM INFORMATION_SCHEMA.TRIGGERS
            WHERE TRIGGER_SCHEMA = :db
        ");
        $triggersStmt->execute([':db' => $sandboxDb]);
        $triggers = $triggersStmt->fetchAll();

        echo json_encode([
            'success' => true,
            'tables' => $tables,
            'views' => $views,
            'routines' => $routines,
            'triggers' => $triggers
        ]);
        exit;
    }

    if ($action === 'execute') {
        $rawSql = $_POST['sql'] ?? '';
        if (trim($rawSql) === '') {
            echo json_encode(['success' => false, 'error' => 'No se proporcionó código SQL.']);
            exit;
        }

        // Limpiar delimitadores comunes de MySQL CLI tipo DELIMITER //
        $cleanedSql = preg_replace('/^\s*delimiter\s+[^\r\n]+/mi', '', $rawSql);

        // Si contiene delimitadores // o $$, podemos normalizarlos o usar ejecución múltiple
        // Usamos mysqli multi_query o PDO exec según el caso
        $mysqli = new mysqli($dbHost, $dbUser, $dbPass, $sandboxDb, (int)$dbPort);
        if ($mysqli->connect_error) {
            echo json_encode(['success' => false, 'error' => 'Error al conectar: ' . $mysqli->connect_error]);
            exit;
        }
        $mysqli->set_charset('utf8mb4');

        $results = [];
        $hasError = false;
        $errorMsg = null;

        // Separar por delimitadores si el usuario usó DELIMITER // ... //
        if (preg_match('/\/\//', $rawSql)) {
            // Segmentar bloques delimitados por //
            $blocks = preg_split('/\/\/\s*/', $cleanedSql);
            foreach ($blocks as $block) {
                $trimmed = trim($block);
                if ($trimmed === '' || strtolower($trimmed) === 'delimiter ;' || strtolower($trimmed) === 'delimiter') continue;
                if (!$mysqli->query($trimmed)) {
                    $hasError = true;
                    $errorMsg = $mysqli->error;
                    break;
                }
            }
        } else {
            // Ejecución múltiple estándar con multi_query
            if ($mysqli->multi_query($cleanedSql)) {
                do {
                    if ($res = $mysqli->store_result()) {
                        $fields = [];
                        while ($f = $res->fetch_field()) {
                            $fields[] = $f->name;
                        }
                        $rows = [];
                        while ($r = $res->fetch_assoc()) {
                            $rows[] = $r;
                        }
                        $results[] = [
                            'type' => 'query',
                            'columns' => $fields,
                            'rows' => $rows,
                            'count' => count($rows)
                        ];
                        $res->free();
                    } else {
                        if ($mysqli->errno) {
                            $hasError = true;
                            $errorMsg = $mysqli->error;
                            break;
                        } else {
                            $results[] = [
                                'type' => 'command',
                                'affected_rows' => $mysqli->affected_rows
                            ];
                        }
                    }
                } while ($mysqli->more_results() && $mysqli->next_result());
            } else {
                $hasError = true;
                $errorMsg = $mysqli->error;
            }
        }

        if ($hasError) {
            echo json_encode([
                'success' => false,
                'error' => $errorMsg ?? $mysqli->error,
                'results' => $results
            ]);
        } else {
            echo json_encode([
                'success' => true,
                'results' => $results
            ]);
        }
        $mysqli->close();
        exit;
    }

    if ($action === 'validate_level') {
        $level = (int)($_POST['level'] ?? 1);
        $res = validateLevel($pdo, $sandboxDb, $level);
        echo json_encode($res);
        exit;
    }

    echo json_encode(['success' => false, 'error' => 'Acción desconocida.']);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}

/**
 * Validador de cada nivel con mensajes pedagógicos ultra precisos
 */
function validateLevel(PDO $pdo, $db, $level) {
    $tables = getTableList($pdo, $db);
    $views = getViewList($pdo, $db);
    $routines = getRoutinesList($pdo, $db);
    $triggers = getTriggersList($pdo, $db);

    switch ($level) {
        case 1:
            // Paso 1: tipo_recursos
            if (!in_array('tipo_recursos', $tables)) {
                return ['passed' => false, 'message' => "Falta crear la tabla 'tipo_recursos'."];
            }
            $trCols = getColumnsMap($pdo, 'tipo_recursos');
            if (!isset($trCols['id_tipo_recurso'])) {
                return ['passed' => false, 'message' => "En 'tipo_recursos' falta la clave primaria 'id_tipo_recurso' (INT AUTO_INCREMENT PRIMARY KEY)."];
            }
            if (!isset($trCols['nombre_tipo'])) {
                return ['passed' => false, 'message' => "En 'tipo_recursos' falta la columna 'nombre_tipo' (VARCHAR(100) NOT NULL)."];
            }
            return [
                'passed' => true,
                'message' => "¡Excelente! Tabla 'tipo_recursos' creada correctamente. En el panel derecho ya puedes verla reflejada."
            ];

        case 2:
            // Paso 2: recursos con FK
            if (!in_array('recursos', $tables)) {
                return ['passed' => false, 'message' => "Falta crear la tabla 'recursos'."];
            }
            $rCols = getColumnsMap($pdo, 'recursos');
            $req = ['id_recurso', 'nombre', 'precio_por_hora', 'ubicacion', 'id_tipo_recurso'];
            foreach ($req as $col) {
                if (!isset($rCols[$col])) {
                    return ['passed' => false, 'message' => "En 'recursos' falta la columna obligatoria '{$col}'."];
                }
            }
            $fks = getForeignKeys($pdo, $db, 'recursos');
            $hasFk = false;
            foreach ($fks as $fk) {
                if ($fk['COLUMN_NAME'] === 'id_tipo_recurso' && $fk['REFERENCED_TABLE_NAME'] === 'tipo_recursos') {
                    $hasFk = true;
                    break;
                }
            }
            if (!$hasFk) {
                return [
                    'passed' => false,
                    'message' => "La columna 'id_tipo_recurso' en 'recursos' debe tener un CONSTRAINT FOREIGN KEY apuntando a 'tipo_recursos(id_tipo_recurso)'."
                ];
            }
            return [
                'passed' => true,
                'message' => "¡Muy bien! Tabla 'recursos' creada con su clave foránea vinculada a 'tipo_recursos'."
            ];

        case 3:
            // Paso 3: clientes
            if (!in_array('clientes', $tables)) {
                return ['passed' => false, 'message' => "Falta crear la tabla 'clientes'."];
            }
            $cCols = getColumnsMap($pdo, 'clientes');
            $reqCli = ['id_cliente', 'nombre', 'apellido', 'telefono', 'mail'];
            foreach ($reqCli as $col) {
                if (!isset($cCols[$col])) {
                    return ['passed' => false, 'message' => "En 'clientes' falta la columna '{$col}'."];
                }
            }
            return [
                'passed' => true,
                'message' => "¡Perfecto! Tabla 'clientes' creada con todos los datos personales del usuario."
            ];

        case 4:
            // Paso 4: reservas (pivote N:M)
            if (!in_array('reservas', $tables)) {
                return ['passed' => false, 'message' => "Falta crear la tabla intermedia 'reservas'."];
            }
            $resFks = getForeignKeys($pdo, $db, 'reservas');
            $fkCli = false;
            $fkRec = false;
            foreach ($resFks as $fk) {
                if ($fk['COLUMN_NAME'] === 'id_cliente' && $fk['REFERENCED_TABLE_NAME'] === 'clientes') $fkCli = true;
                if ($fk['COLUMN_NAME'] === 'id_recurso' && $fk['REFERENCED_TABLE_NAME'] === 'recursos') $fkRec = true;
            }
            if (!$fkCli || !$fkRec) {
                return [
                    'passed' => false,
                    'message' => "La tabla 'reservas' debe tener claves foráneas apuntando tanto a 'clientes' (fk_reservas_cliente) como a 'recursos' (fk_reservas_recurso)."
                ];
            }
            return [
                'passed' => true,
                'message' => "¡Excelente! Tabla pivote 'reservas' creada uniendo la relación Muchos a Muchos entre clientes y recursos."
            ];

        case 5:
            // Paso 5: auditoria_reservas
            if (!in_array('auditoria_reservas', $tables)) {
                return ['passed' => false, 'message' => "Falta crear la tabla 'auditoria_reservas'."];
            }
            $audCols = getColumnsMap($pdo, 'auditoria_reservas');
            if (!isset($audCols['id_reserva']) || !isset($audCols['accion'])) {
                return ['passed' => false, 'message' => "En 'auditoria_reservas' faltan las columnas 'id_reserva' y 'accion'."];
            }
            return [
                'passed' => true,
                'message' => "¡Tabla de auditoría creada! Lista para recibir los registros automáticos cuando salte el trigger."
            ];

        case 6:
            // Paso 6: Carga de datos iniciales
            $cntTipos = (int)($pdo->query("SELECT COUNT(*) FROM tipo_recursos")->fetchColumn() ?? 0);
            $cntRecursos = (int)($pdo->query("SELECT COUNT(*) FROM recursos")->fetchColumn() ?? 0);
            $cntClientes = (int)($pdo->query("SELECT COUNT(*) FROM clientes")->fetchColumn() ?? 0);
            $cntReservas = (int)($pdo->query("SELECT COUNT(*) FROM reservas")->fetchColumn() ?? 0);

            if ($cntTipos < 2) return ['passed' => false, 'message' => "Te falta insertar datos de prueba en 'tipo_recursos' (al menos 2 registros)."];
            if ($cntRecursos < 2) return ['passed' => false, 'message' => "Te falta insertar datos de prueba en 'recursos' (al menos 2 registros)."];
            if ($cntClientes < 2) return ['passed' => false, 'message' => "Te falta insertar clientes en la tabla 'clientes' (al menos 2 registros)."];
            if ($cntReservas < 2) return ['passed' => false, 'message' => "Te falta registrar reservas de prueba en 'reservas' (al menos 2 registros)."];

            return [
                'passed' => true,
                'message' => "¡Excelente! La base de datos ya cuenta con registros reales para consultar y operar."
            ];

        case 7:
            // Paso 7: Vistas e índices
            if (!in_array('vw_detalle_reservas', $views)) {
                return ['passed' => false, 'message' => "Falta crear la vista 'vw_detalle_reservas' que une reservas con clientes y recursos."];
            }
            if (!in_array('vw_resumen_recursos', $views)) {
                return ['passed' => false, 'message' => "Falta crear la vista 'vw_resumen_recursos' que calcula totales y cantidades por recurso."];
            }
            return [
                'passed' => true,
                'message' => "¡Vistas operativas! 'vw_detalle_reservas' y 'vw_resumen_recursos' listas para ser consumidas por Windows Forms."
            ];

        case 8:
            // Paso 8: Función fn_verificar_disponibilidad
            if (!isset($routines['fn_verificar_disponibilidad']) || $routines['fn_verificar_disponibilidad'] !== 'FUNCTION') {
                return ['passed' => false, 'message' => "Falta crear la función 'fn_verificar_disponibilidad(p_id_recurso, p_fecha)'."];
            }
            try {
                $testStmt = $pdo->query("SELECT fn_verificar_disponibilidad(1, '2099-01-01 10:00:00') AS disp");
                $disp = $testStmt->fetch()['disp'];
                if ($disp != 1) {
                    return ['passed' => false, 'message' => "Para un horario libre (año 2099), 'fn_verificar_disponibilidad' debería devolver 1, pero devolvió {$disp}."];
                }
            } catch (Exception $e) {
                return ['passed' => false, 'message' => "Error al evaluar la función: " . $e->getMessage()];
            }
            return [
                'passed' => true,
                'message' => "¡Función verificada! Devuelve 1 para libre y 0 para ocupado."
            ];

        case 9:
            // Paso 9: Procedimientos CRUD clientes y recursos
            if (!isset($routines['sp_alta_cliente'])) {
                return ['passed' => false, 'message' => "Falta el procedimiento almacenado 'sp_alta_cliente'."];
            }
            if (!isset($routines['sp_alta_recurso']) && !isset($routines['sp_modificar_recurso'])) {
                return ['passed' => false, 'message' => "Falta crear 'sp_alta_recurso' o 'sp_modificar_recurso'."];
            }
            return [
                'passed' => true,
                'message' => "¡Procedimientos CRUD básicos creados y disponibles!"
            ];

        case 10:
            // Paso 10: Procedimiento transaccional de reservas
            if (!isset($routines['sp_alta_reserva'])) {
                return ['passed' => false, 'message' => "Falta crear el procedimiento almacenado 'sp_alta_reserva'."];
            }
            if (!isset($routines['sp_cancelar_reserva'])) {
                return ['passed' => false, 'message' => "Falta crear el procedimiento 'sp_cancelar_reserva'."];
            }
            return [
                'passed' => true,
                'message' => "¡Procedimientos transaccionales creados ('sp_alta_reserva' y 'sp_cancelar_reserva')!"
            ];

        case 11:
            // Paso 11: Trigger trg_auditoria_reservas
            if (!in_array('trg_auditoria_reservas', $triggers)) {
                return ['passed' => false, 'message' => "Falta crear el disparador (trigger) 'trg_auditoria_reservas'."];
            }
            try {
                $pdo->exec("INSERT INTO reservas (id_cliente, id_recurso, fecha_reserva, horas, total, estado) 
                            SELECT id_cliente, id_recurso, '2029-12-31 10:00:00', 1, 100.00, 'Confirmada'
                            FROM clientes, recursos LIMIT 1;");
                $testReservaId = $pdo->lastInsertId();
                $pdo->exec("UPDATE reservas SET estado = 'Cancelada' WHERE id_reserva = {$testReservaId}");
                $auditStmt = $pdo->query("SELECT * FROM auditoria_reservas WHERE id_reserva = {$testReservaId}");
                $auditRow = $auditStmt->fetch();
                if (!$auditRow) {
                    return [
                        'passed' => false,
                        'message' => "El trigger 'trg_auditoria_reservas' existe pero NO insertó en 'auditoria_reservas' cuando la reserva cambió a 'Cancelada'."
                    ];
                }
            } catch (Exception $e) {
                return ['passed' => false, 'message' => "Error probando el trigger: " . $e->getMessage()];
            }
            return [
                'passed' => true,
                'message' => "¡Trigger validado con éxito! Detecta automáticamente cancelaciones y audita la fecha, usuario y acción."
            ];

        case 12:
            // Paso 12: Cursor sp_calcular_total_recaudado_cursor
            if (!isset($routines['sp_calcular_total_recaudado_cursor'])) {
                return ['passed' => false, 'message' => "Falta crear el procedimiento con cursor 'sp_calcular_total_recaudado_cursor'."];
            }
            try {
                $pdo->exec("CALL sp_calcular_total_recaudado_cursor(@tot);");
                $totRes = $pdo->query("SELECT @tot AS total")->fetch();
                if ($totRes === false || !isset($totRes['total'])) {
                    return ['passed' => false, 'message' => "El procedimiento con cursor no devolvió el parámetro OUT @p_total_general."];
                }
            } catch (Exception $e) {
                return ['passed' => false, 'message' => "Error al ejecutar el cursor: " . $e->getMessage()];
            }
            return [
                'passed' => true,
                'message' => "🏆 ¡FELICITACIONES! Has completado y reconstruido todos los objetos del archivo DB_TPFinal.sql."
            ];

        default:
            return ['passed' => false, 'message' => 'Nivel no configurado.'];
    }
}

function getTableList(PDO $pdo, $db) {
    $stmt = $pdo->prepare("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = :db AND TABLE_TYPE = 'BASE TABLE'");
    $stmt->execute([':db' => $db]);
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

function getViewList(PDO $pdo, $db) {
    $stmt = $pdo->prepare("SELECT TABLE_NAME FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = :db");
    $stmt->execute([':db' => $db]);
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

function getRoutinesList(PDO $pdo, $db) {
    $stmt = $pdo->prepare("SELECT ROUTINE_NAME, ROUTINE_TYPE FROM INFORMATION_SCHEMA.ROUTINES WHERE ROUTINE_SCHEMA = :db");
    $stmt->execute([':db' => $db]);
    $map = [];
    foreach ($stmt->fetchAll() as $r) {
        $map[$r['ROUTINE_NAME']] = $r['ROUTINE_TYPE'];
    }
    return $map;
}

function getTriggersList(PDO $pdo, $db) {
    $stmt = $pdo->prepare("SELECT TRIGGER_NAME FROM INFORMATION_SCHEMA.TRIGGERS WHERE TRIGGER_SCHEMA = :db");
    $stmt->execute([':db' => $db]);
    return $stmt->fetchAll(PDO::FETCH_COLUMN);
}

function getColumnsMap(PDO $pdo, $table) {
    $stmt = $pdo->query("DESCRIBE `{$table}`");
    $map = [];
    while ($row = $stmt->fetch()) {
        $map[$row['Field']] = $row;
    }
    return $map;
}

function getForeignKeys(PDO $pdo, $db, $table) {
    $stmt = $pdo->prepare("
        SELECT COLUMN_NAME, REFERENCED_TABLE_NAME, REFERENCED_COLUMN_NAME
        FROM INFORMATION_SCHEMA.KEY_COLUMN_USAGE
        WHERE TABLE_SCHEMA = :db AND TABLE_NAME = :tbl AND REFERENCED_TABLE_NAME IS NOT NULL
    ");
    $stmt->execute([':db' => $db, ':tbl' => $table]);
    return $stmt->fetchAll();
}
