/**
 * SQL Studio · Motor de Base de Datos Embebido en Memoria (JavaScript Puro)
 * Permite que toda la aplicación funcione 100% de manera autónoma y portable
 * sin requerir XAMPP, Apache, PHP ni MySQL instalado en la máquina.
 */

const EmbeddedEngine = {
  db: {
    tables: {},
    views: {},
    routines: {},
    triggers: {}
  },

  reset() {
    this.db = {
      tables: {},
      views: {},
      routines: {},
      triggers: {}
    };
  },

  getSchema() {
    const tableList = [];
    for (const [name, tbl] of Object.entries(this.db.tables)) {
      tableList.push({
        name: tbl.name,
        columns: tbl.columns || [],
        rows_count: (tbl.rows || []).length,
        rows: tbl.rows || [],
        foreign_keys: tbl.foreign_keys || []
      });
    }

    const viewList = [];
    for (const [name, v] of Object.entries(this.db.views)) {
      viewList.push({
        name: v.name,
        columns: v.columns || [],
        rows: v.rows || []
      });
    }

    const routineList = [];
    for (const [name, r] of Object.entries(this.db.routines)) {
      routineList.push({
        ROUTINE_NAME: r.name,
        ROUTINE_TYPE: r.type,
        DTD_IDENTIFIER: r.returnType || '',
        ROUTINE_COMMENT: ''
      });
    }

    const triggerList = [];
    for (const [name, trg] of Object.entries(this.db.triggers)) {
      triggerList.push({
        TRIGGER_NAME: trg.name,
        EVENT_MANIPULATION: trg.event || 'UPDATE',
        EVENT_OBJECT_TABLE: trg.table || 'reservas',
        ACTION_TIMING: trg.timing || 'AFTER'
      });
    }

    return {
      success: true,
      tables: tableList,
      views: viewList,
      routines: routineList,
      triggers: triggerList
    };
  },

  execute(rawSql) {
    if (!rawSql || !rawSql.trim()) {
      return { success: false, error: 'No se proporcionó código SQL para ejecutar.' };
    }

    try {
      // 1. Limpiar comentarios de una línea (-- y #)
      let cleaned = rawSql
        .replace(/--[^\r\n]*/g, '')
        .replace(/#[^\r\n]*/g, '');

      // 2. Limpiar comentarios de bloque (/* ... */)
      cleaned = cleaned.replace(/\/\*[\s\S]*?\*\//g, '');

      // 3. Segmentar comandos según DELIMITER
      const statements = this.splitStatements(cleaned);
      const results = [];

      for (let stmt of statements) {
        stmt = stmt.trim();
        if (!stmt) continue;

        // Limpiar directivas DELIMITER
        if (/^delimiter\b/i.test(stmt)) continue;

        // Detectar tipo de comando
        if (/^CREATE\s+TABLE/i.test(stmt)) {
          this.parseCreateTable(stmt);
          results.push({ type: 'command', affected_rows: 0, message: 'Tabla creada' });
        } else if (/^INSERT\s+INTO/i.test(stmt)) {
          const count = this.parseInsert(stmt);
          results.push({ type: 'command', affected_rows: count, message: `${count} fila(s) insertada(s)` });
        } else if (/^CREATE\s+VIEW/i.test(stmt)) {
          this.parseCreateView(stmt);
          results.push({ type: 'command', affected_rows: 0, message: 'Vista creada' });
        } else if (/^CREATE\s+FUNCTION/i.test(stmt)) {
          this.parseCreateFunction(stmt);
          results.push({ type: 'command', affected_rows: 0, message: 'Función creada' });
        } else if (/^CREATE\s+PROCEDURE/i.test(stmt)) {
          this.parseCreateProcedure(stmt);
          results.push({ type: 'command', affected_rows: 0, message: 'Procedimiento almacenado creado' });
        } else if (/^CREATE\s+TRIGGER/i.test(stmt)) {
          this.parseCreateTrigger(stmt);
          results.push({ type: 'command', affected_rows: 0, message: 'Trigger creado' });
        } else if (/^SELECT\b/i.test(stmt)) {
          const queryRes = this.parseSelect(stmt);
          results.push(queryRes);
        } else if (/^(DROP|ALTER|UPDATE|DELETE|SET|USE)\b/i.test(stmt)) {
          // Comandos auxiliares simulados
          results.push({ type: 'command', affected_rows: 1, message: 'Comando procesado' });
        }
      }

      return { success: true, results };
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  splitStatements(sql) {
    const list = [];
    let current = '';
    let inDelimiter = false;
    let customDelim = ';';

    const lines = sql.split(/\r?\n/);
    for (const line of lines) {
      const trimmedLine = line.trim();
      const delimMatch = trimmedLine.match(/^DELIMITER\s+([^\s]+)/i);
      if (delimMatch) {
        if (current.trim()) {
          list.push(current.trim());
          current = '';
        }
        customDelim = delimMatch[1];
        continue;
      }

      current += line + '\n';
      if (customDelim !== ';' && current.includes(customDelim)) {
        const parts = current.split(customDelim);
        while (parts.length > 1) {
          list.push(parts.shift().trim());
        }
        current = parts[0] || '';
      } else if (customDelim === ';' && current.includes(';')) {
        const parts = current.split(';');
        while (parts.length > 1) {
          list.push(parts.shift().trim());
        }
        current = parts[0] || '';
      }
    }

    if (current.trim()) {
      list.push(current.trim());
    }

    return list.filter(s => s.length > 0);
  },

  parseCreateTable(stmt) {
    const tableMatch = stmt.match(/CREATE\s+TABLE\s+(?:IF\s+NOT\s+EXISTS\s+)?(?:`?(\w+)`?\.)?`?(\w+)`?\s*\(([\s\S]+)\)/i);
    if (!tableMatch) {
      throw new Error("Sintaxis de CREATE TABLE no válida.");
    }

    const tableName = (tableMatch[2] || tableMatch[1]).toLowerCase();
    const body = tableMatch[3];

    const columns = [];
    const foreignKeys = [];
    const primaryKeyCols = new Set();

    // Separar elementos internos respetando paréntesis anidados (ej. DECIMAL(10,2))
    const items = this.splitCommaRespectingParens(body);

    for (const item of items) {
      const trimmed = item.trim();
      if (!trimmed) continue;

      // 1. Detectar CONSTRAINT FOREIGN KEY
      const fkMatch = trimmed.match(/(?:CONSTRAINT\s+`?(\w+)`?\s+)?FOREIGN\s+KEY\s*\(`?(\w+)`?\)\s*REFERENCES\s+`?(\w+)`?\s*\(`?(\w+)`?\)/i);
      if (fkMatch) {
        const refTable = fkMatch[3].toLowerCase();
        
        // REGLA DE INTEGRIDAD REFERENCIAL DE DDL (IGUAL A MYSQL):
        if (!this.db.tables[refTable]) {
          throw new Error(`Error Code: 1824. Failed to open the referenced table '${refTable}'. No puedes crear la tabla '${tableName}' con una clave foránea hacia '${refTable}' porque esa tabla aún no existe. Debes crear primero la tabla maestra '${refTable}' en el Paso 1.`);
        }

        foreignKeys.push({
          CONSTRAINT_NAME: fkMatch[1] || `fk_${tableName}_${fkMatch[3]}`,
          COLUMN_NAME: fkMatch[2],
          REFERENCED_TABLE_NAME: refTable,
          REFERENCED_COLUMN_NAME: fkMatch[4]
        });
        continue;
      }

      // 2. Detectar PRIMARY KEY (col1, col2)
      const pkMatch = trimmed.match(/^PRIMARY\s+KEY\s*\(([^)]+)\)/i);
      if (pkMatch) {
        pkMatch[1].split(',').map(s => s.trim().replace(/`/g, '')).forEach(c => primaryKeyCols.add(c));
        continue;
      }

      // 3. Columna ordinaria
      const colMatch = trimmed.match(/^`?(\w+)`?\s+([A-Za-z0-9_]+(?:\s*\([^)]+\))?)([\s\S]*)$/i);
      if (colMatch) {
        const colName = colMatch[1];
        const colType = colMatch[2].toLowerCase();
        const colRest = colMatch[3] || '';

        const isPk = /PRIMARY\s+KEY/i.test(colRest);
        if (isPk) primaryKeyCols.add(colName);

        const isAutoInc = /AUTO_INCREMENT/i.test(colRest);
        const isNotNull = /NOT\s+NULL/i.test(colRest) || isPk;

        columns.push({
          Field: colName,
          Type: colType,
          Null: isNotNull ? 'NO' : 'YES',
          Key: isPk ? 'PRI' : '',
          Default: null,
          Extra: isAutoInc ? 'auto_increment' : ''
        });
      }
    }

    // Actualizar badges PK y FK en las columnas
    columns.forEach(col => {
      if (primaryKeyCols.has(col.Field)) {
        col.Key = 'PRI';
      }
      if (foreignKeys.some(fk => fk.COLUMN_NAME === col.Field)) {
        col.Key = col.Key === 'PRI' ? 'PRI' : 'MUL';
      }
    });

    const existingRows = this.db.tables[tableName]?.rows || [];

    this.db.tables[tableName] = {
      name: tableName,
      columns,
      foreign_keys: foreignKeys,
      rows: existingRows,
      rows_count: existingRows.length
    };
  },

    parseInsert(stmt) {
    const match = stmt.match(/INSERT\s+INTO\s+`?(\w+)`?\s*(?:\(([^)]+)\))?\s*VALUES\s*([\s\S]+)$/i);
    if (!match) return 0;

    const tableName = match[1].toLowerCase();
    const colsPart = match[2];
    const valsPart = match[3];

    let targetTable = this.db.tables[tableName];
    if (!targetTable) {
      throw new Error(`Error Code: 1146. Table '${tableName}' doesn't exist. No puedes insertar datos en una tabla que aún no ha sido creada.`);
    }

    let colNames = [];
    if (colsPart) {
      colNames = colsPart.split(',').map(c => c.trim().replace(/`/g, ''));
    } else if (targetTable.columns.length > 0) {
      colNames = targetTable.columns.map(c => c.Field);
    }

    // Segmentar tuplas (val1, val2), (val3, val4)
    const tuples = this.extractTuples(valsPart);
    let insertedCount = 0;

    for (const tuple of tuples) {
      const rawValues = this.splitCommaRespectingQuotes(tuple);
      const rowObj = {};

      if (colNames.length > 0) {
        colNames.forEach((col, idx) => {
          rowObj[col] = this.cleanSqlValue(rawValues[idx]);
        });
      } else {
        rawValues.forEach((val, idx) => {
          rowObj[`col_${idx + 1}`] = this.cleanSqlValue(val);
        });
      }

      // Validar claves foráneas activas
      if (targetTable.foreign_keys && targetTable.foreign_keys.length > 0) {
        for (const fk of targetTable.foreign_keys) {
          const fkVal = rowObj[fk.COLUMN_NAME];
          if (fkVal !== null && fkVal !== undefined) {
            const parentTable = this.db.tables[fk.REFERENCED_TABLE_NAME];
            if (!parentTable) {
              throw new Error(`Error Code: 1452. Cannot add or update a child row: a foreign key constraint fails ('${fk.CONSTRAINT_NAME}'). La tabla padre '${fk.REFERENCED_TABLE_NAME}' no existe.`);
            }
            const existsInParent = parentTable.rows.some(pRow => String(pRow[fk.REFERENCED_COLUMN_NAME]) === String(fkVal));
            if (!existsInParent) {
              throw new Error(`Error Code: 1452. Cannot add or update a child row: a foreign key constraint fails ('${fk.CONSTRAINT_NAME}'). El valor '${fkVal}' en la columna '${fk.COLUMN_NAME}' no existe en la tabla padre '${fk.REFERENCED_TABLE_NAME}.${fk.REFERENCED_COLUMN_NAME}'.`);
            }
          }
        }
      }

      // Si tiene clave autoincremental y no fue provista, autogenerar
      const autoCol = targetTable.columns.find(c => c.Extra === 'auto_increment');
      if (autoCol && (!rowObj[autoCol.Field] || rowObj[autoCol.Field] === 'NULL')) {
        rowObj[autoCol.Field] = targetTable.rows.length + 1;
      }

      targetTable.rows.push(rowObj);
      insertedCount++;
    }

    targetTable.rows_count = targetTable.rows.length;
    return insertedCount;
  },

    parseCreateView(stmt) {
    const match = stmt.match(/CREATE\s+VIEW\s+`?(\w+)`?\s+AS\s+([\s\S]+)$/i);
    if (!match) return;

    const viewName = match[1];
    const query = match[2];

    // Verificar si las tablas consultadas en la vista existen
    const fromMatches = query.matchAll(/(?:FROM|JOIN)\s+`?(\w+)`?/gi);
    for (const m of fromMatches) {
      const tblRef = m[1].toLowerCase();
      // Omitir palabras reservadas o subconsultas
      if (['select', 'as', 'where', 'left', 'right', 'inner'].includes(tblRef)) continue;
      if (!this.db.tables[tblRef]) {
        throw new Error(`Error Code: 1146. Table '${tblRef}' doesn't exist. No puedes crear la vista '${viewName}' porque la tabla '${tblRef}' que intenta consultar no existe.`);
      }
    }

    // Extraer nombres aproximados de columnas seleccionadas
    const selectMatch = query.match(/SELECT\s+([\s\S]+?)\s+FROM/i);
    const viewCols = [];
    if (selectMatch) {
      const colItems = this.splitCommaRespectingParens(selectMatch[1]);
      colItems.forEach(item => {
        const asMatch = item.match(/(?:AS\s+`?(\w+)`?|`?(\w+)`?\s*)$/i);
        const colName = asMatch ? (asMatch[1] || asMatch[2]) : item.trim();
        viewCols.push({ Field: colName, Type: 'varchar(100)', Null: 'YES', Key: '', Default: null });
      });
    }

    this.db.views[viewName] = {
      name: viewName,
      columns: viewCols.length > 0 ? viewCols : [{ Field: 'resultado', Type: 'text' }],
      rows: []
    };
  },

  parseCreateFunction(stmt) {
    const match = stmt.match(/CREATE\s+FUNCTION\s+`?(\w+)`?\s*\(([^)]*)\)\s*RETURNS\s+([A-Za-z0-9_]+)/i);
    if (match) {
      const funcName = match[1];
      const returnType = match[3];
      this.db.routines[funcName] = {
        name: funcName,
        type: 'FUNCTION',
        returnType: returnType.toUpperCase()
      };
    }
  },

    parseCreateProcedure(stmt) {
    const match = stmt.match(/CREATE\s+PROCEDURE\s+`?(\w+)`?\s*\(([^)]*)\)/i);
    if (match) {
      const procName = match[1];

      // Si es sp_alta_reserva, verificar que la función de disponibilidad ya exista
      if (procName.toLowerCase() === 'sp_alta_reserva') {
        if (!this.db.routines['fn_verificar_disponibilidad']) {
          throw new Error(`Error Code: 1305. FUNCTION fn_verificar_disponibilidad does not exist. El procedimiento '${procName}' requiere que primero crees la función de disponibilidad en el Paso 8.`);
        }
      }

      // Si es sp_calcular_total_recaudado_cursor, verificar que la tabla reservas exista
      if (procName.toLowerCase().includes('cursor')) {
        if (!this.db.tables['reservas']) {
          throw new Error(`Error Code: 1146. Table 'reservas' doesn't exist. El cursor no puede consultar una tabla inexistente. Debes crear 'reservas' en el Paso 4.`);
        }
      }

      this.db.routines[procName] = {
        name: procName,
        type: 'PROCEDURE',
        returnType: ''
      };
    }
  },

    parseCreateTrigger(stmt) {
    const match = stmt.match(/CREATE\s+TRIGGER\s+`?(\w+)`?\s+(AFTER|BEFORE)\s+(INSERT|UPDATE|DELETE)\s+ON\s+`?(\w+)`?/i);
    if (match) {
      const trgName = match[1];
      const targetTable = match[4].toLowerCase();

      if (!this.db.tables[targetTable]) {
        throw new Error(`Error Code: 1146. Table '${targetTable}' doesn't exist. No puedes crear el trigger '${trgName}' porque la tabla '${targetTable}' no existe.`);
      }

      // Si el trigger inserta en una tabla de auditoría, validar que exista
      const insertMatch = stmt.match(/INSERT\s+INTO\s+`?(\w+)`?/i);
      if (insertMatch) {
        const audTable = insertMatch[1].toLowerCase();
        if (!this.db.tables[audTable]) {
          throw new Error(`Error Code: 1146. Table '${audTable}' doesn't exist. El trigger '${trgName}' intenta registrar en '${audTable}', pero esa tabla aún no fue creada (Paso 5).`);
        }
      }

      this.db.triggers[trgName] = {
        name: trgName,
        timing: match[2].toUpperCase(),
        event: match[3].toUpperCase(),
        table: targetTable
      };
    }
  },

  parseSelect(stmt) {
    const fromMatch = stmt.match(/FROM\s+`?(\w+)`?/i);
    const tableName = fromMatch ? fromMatch[1].toLowerCase() : null;

    if (tableName && this.db.tables[tableName]) {
      const tbl = this.db.tables[tableName];
      return {
        type: 'query',
        columns: tbl.columns.map(c => c.Field),
        rows: tbl.rows,
        count: tbl.rows.length
      };
    }

    return {
      type: 'query',
      columns: ['Resultado'],
      rows: [{ Resultado: 'Consulta simulada procesada con éxito.' }],
      count: 1
    };
  },

  validateLevel(level) {
    const tables = Object.keys(this.db.tables);
    const views = Object.keys(this.db.views);
    const routines = this.db.routines;
    const triggers = this.db.triggers;

    switch (level) {
      case 1:
        if (!tables.includes('tipo_recursos')) {
          return { passed: false, message: "Falta crear la tabla 'tipo_recursos'." };
        }
        const trCols = (this.db.tables['tipo_recursos'].columns || []).map(c => c.Field.toLowerCase());
        if (!trCols.includes('id_tipo_recurso')) {
          return { passed: false, message: "En 'tipo_recursos' falta la clave primaria 'id_tipo_recurso' (INT AUTO_INCREMENT PRIMARY KEY)." };
        }
        if (!trCols.includes('nombre_tipo')) {
          return { passed: false, message: "En 'tipo_recursos' falta la columna obligatoria 'nombre_tipo' (VARCHAR(100) NOT NULL)." };
        }
        return {
          passed: true,
          message: "¡Excelente! Tabla 'tipo_recursos' creada correctamente. Observa cómo apareció en el panel derecho y en el DER."
        };

      case 2:
        if (!tables.includes('tipo_recursos')) {
          return { passed: false, message: "Para validar el Paso 2, primero debes haber creado la tabla maestra 'tipo_recursos' en el Paso 1." };
        }
        if (!tables.includes('recursos')) {
          return { passed: false, message: "Falta crear la tabla 'recursos'." };
        }
        const rCols = (this.db.tables['recursos'].columns || []).map(c => c.Field.toLowerCase());
        const req2 = ['id_recurso', 'nombre', 'precio_por_hora', 'ubicacion', 'id_tipo_recurso'];
        for (const col of req2) {
          if (!rCols.includes(col)) {
            return { passed: false, message: `En 'recursos' falta la columna obligatoria '${col}'.` };
          }
        }
        const rFks = this.db.tables['recursos'].foreign_keys || [];
        const hasFk = rFks.some(fk => fk.COLUMN_NAME.toLowerCase() === 'id_tipo_recurso' && fk.REFERENCED_TABLE_NAME.toLowerCase() === 'tipo_recursos');
        if (!hasFk) {
          return {
            passed: false,
            message: "La columna 'id_tipo_recurso' en 'recursos' debe tener un CONSTRAINT FOREIGN KEY apuntando a 'tipo_recursos(id_tipo_recurso)'."
          };
        }
        return {
          passed: true,
          message: "¡Muy bien! Tabla 'recursos' creada con su clave foránea vinculada a 'tipo_recursos'."
        };

      case 3:
        if (!tables.includes('clientes')) {
          return { passed: false, message: "Falta crear la tabla 'clientes'." };
        }
        const cCols = (this.db.tables['clientes'].columns || []).map(c => c.Field.toLowerCase());
        const reqCli = ['id_cliente', 'nombre', 'apellido', 'telefono', 'mail'];
        for (const col of reqCli) {
          if (!cCols.includes(col)) {
            return { passed: false, message: `En 'clientes' falta la columna '${col}'.` };
          }
        }
        return {
          passed: true,
          message: "¡Perfecto! Tabla 'clientes' creada con todos los datos personales del usuario."
        };

      case 4:
        if (!tables.includes('reservas')) {
          return { passed: false, message: "Falta crear la tabla intermedia 'reservas'." };
        }
        const resFks = this.db.tables['reservas'].foreign_keys || [];
        const fkCli = resFks.some(fk => fk.COLUMN_NAME.toLowerCase() === 'id_cliente' && fk.REFERENCED_TABLE_NAME.toLowerCase() === 'clientes');
        const fkRec = resFks.some(fk => fk.COLUMN_NAME.toLowerCase() === 'id_recurso' && fk.REFERENCED_TABLE_NAME.toLowerCase() === 'recursos');
        if (!fkCli || !fkRec) {
          return {
            passed: false,
            message: "La tabla 'reservas' debe tener claves foráneas apuntando tanto a 'clientes' (fk_reservas_cliente) como a 'recursos' (fk_reservas_recurso)."
          };
        }
        return {
          passed: true,
          message: "¡Excelente! Tabla pivote 'reservas' creada uniendo la relación Muchos a Muchos entre clientes y recursos."
        };

      case 5:
        if (!tables.includes('auditoria_reservas')) {
          return { passed: false, message: "Falta crear la tabla 'auditoria_reservas'." };
        }
        const audCols = (this.db.tables['auditoria_reservas'].columns || []).map(c => c.Field.toLowerCase());
        if (!audCols.includes('id_reserva') || !audCols.includes('accion')) {
          return { passed: false, message: "En 'auditoria_reservas' faltan las columnas 'id_reserva' y 'accion'." };
        }
        return {
          passed: true,
          message: "¡Tabla de auditoría creada! Lista para recibir los registros automáticos cuando salte el trigger."
        };

      case 6:
        const cntT = this.db.tables['tipo_recursos']?.rows?.length || 0;
        const cntR = this.db.tables['recursos']?.rows?.length || 0;
        const cntC = this.db.tables['clientes']?.rows?.length || 0;
        const cntRes = this.db.tables['reservas']?.rows?.length || 0;

        if (cntT < 2) return { passed: false, message: "Te falta insertar datos de prueba en 'tipo_recursos' (al menos 2 registros)." };
        if (cntR < 2) return { passed: false, message: "Te falta insertar datos de prueba en 'recursos' (al menos 2 registros)." };
        if (cntC < 2) return { passed: false, message: "Te falta insertar clientes en la tabla 'clientes' (al menos 2 registros)." };
        if (cntRes < 2) return { passed: false, message: "Te falta registrar reservas de prueba en 'reservas' (al menos 2 registros)." };

        return {
          passed: true,
          message: "¡Excelente! La base de datos ya cuenta con registros reales para consultar y operar."
        };

      case 7:
        if (!views.includes('vw_detalle_reservas')) {
          return { passed: false, message: "Falta crear la vista 'vw_detalle_reservas' que une reservas con clientes y recursos." };
        }
        if (!views.includes('vw_resumen_recursos')) {
          return { passed: false, message: "Falta crear la vista 'vw_resumen_recursos' que calcula totales y cantidades por recurso." };
        }
        return {
          passed: true,
          message: "¡Vistas operativas! 'vw_detalle_reservas' y 'vw_resumen_recursos' listas para ser consumidas por Windows Forms."
        };

      case 8:
        if (!routines['fn_verificar_disponibilidad'] || routines['fn_verificar_disponibilidad'].type !== 'FUNCTION') {
          return { passed: false, message: "Falta crear la función 'fn_verificar_disponibilidad(p_id_recurso, p_fecha)'." };
        }
        return {
          passed: true,
          message: "¡Función creada con éxito! Lista para validar la disponibilidad horaria antes de confirmar cualquier reserva."
        };

      case 9:
        if (!routines['sp_alta_cliente']) {
          return { passed: false, message: "Falta crear el procedimiento almacenado 'sp_alta_cliente'." };
        }
        if (!routines['sp_modificar_cliente']) {
          return { passed: false, message: "Falta crear el procedimiento almacenado 'sp_modificar_cliente'." };
        }
        return {
          passed: true,
          message: "¡Procedimientos de cliente listos! La capa de datos de Windows Forms ya puede dar de alta y modificar clientes."
        };

      case 10:
        if (!routines['sp_alta_reserva']) {
          return { passed: false, message: "Falta crear el procedimiento almacenado 'sp_alta_reserva'." };
        }
        if (!routines['sp_cancelar_reserva']) {
          return { passed: false, message: "Falta crear el procedimiento almacenado 'sp_cancelar_reserva'." };
        }
        return {
          passed: true,
          message: "¡Procedimiento transaccional configurado! Controla disponibilidad y dispara la excepción personalizada SIGNAL 45000."
        };

      case 11:
        if (!triggers['trg_auditoria_reservas']) {
          return { passed: false, message: "Falta crear el disparador (trigger) 'trg_auditoria_reservas' en la tabla reservas." };
        }
        return {
          passed: true,
          message: "¡Trigger de auditoría activo! Cada vez que una reserva cambie a estado Cancelada, se generará el log automático."
        };

      case 12:
        if (!routines['sp_calcular_total_recaudado_cursor']) {
          return { passed: false, message: "Falta crear el procedimiento 'sp_calcular_total_recaudado_cursor' con el CURSOR de MySQL." };
        }
        return {
          passed: true,
          message: "🏆 ¡TRABAJO PRÁCTICO COMPLETADO! Has creado con éxito todas las tablas, vistas, funciones, procedimientos, triggers y cursores del proyecto."
        };

      default:
        return { passed: true, message: "Paso verificado." };
    }
  },

  // Helpers auxiliares
  splitCommaRespectingParens(str) {
    const result = [];
    let current = '';
    let depth = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if (char === '(') depth++;
      else if (char === ')') depth = Math.max(0, depth - 1);

      if (char === ',' && depth === 0) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) result.push(current.trim());
    return result;
  },

  splitCommaRespectingQuotes(str) {
    const result = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if ((char === "'" || char === '"') && str[i - 1] !== '\\') {
        if (!inQuote) {
          inQuote = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuote = false;
        }
      }

      if (char === ',' && !inQuote) {
        result.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    if (current.trim()) result.push(current.trim());
    return result;
  },

  extractTuples(str) {
    const tuples = [];
    let current = '';
    let inTuple = false;
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < str.length; i++) {
      const char = str[i];
      if ((char === "'" || char === '"') && str[i - 1] !== '\\') {
        if (!inQuote) {
          inQuote = true;
          quoteChar = char;
        } else if (char === quoteChar) {
          inQuote = false;
        }
      }

      if (!inQuote) {
        if (char === '(') {
          inTuple = true;
          current = '';
          continue;
        } else if (char === ')') {
          inTuple = false;
          tuples.push(current.trim());
          current = '';
          continue;
        }
      }

      if (inTuple) {
        current += char;
      }
    }
    return tuples;
  },

  cleanSqlValue(val) {
    if (!val) return null;
    val = val.trim();
    if (/^null$/i.test(val)) return null;
    if (/^true$/i.test(val)) return 1;
    if (/^false$/i.test(val)) return 0;
    if (/^'.*'$/.test(val) || /^".*"$/.test(val)) {
      return val.slice(1, -1).replace(/\\'/g, "'").replace(/\\"/g, '"');
    }
    const num = Number(val);
    return isNaN(num) ? val : num;
  }
};
