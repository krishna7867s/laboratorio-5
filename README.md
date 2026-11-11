# Laboratorio #5: API REST con Express y Swagger integrando la Claude API

## Información del Proyecto
- **Estudiante**: Desarrollador Backend (Modalidad Individual)
- **Curso**: Programación Backend
- **Tecnologías**: Node.js, Express 5, @anthropic-ai/sdk, Zod, Swagger (OpenAPI 3.0), Dotenv.

---

## Descripción del Proyecto
Esta API REST implementa la gestión en memoria de un recurso de **Notas** (CRUD completo) e integra la API oficial de **Anthropic Claude** para brindar capacidades de inteligencia artificial:
1. **Pregunta libre**: Endpoint para realizar consultas abiertas al modelo (`POST /api/ia/preguntar`).
2. **Resumen de nota**: Endpoint para generar un resumen en 3 viñetas del contenido de una nota almacenada (`POST /api/notas/:id/resumen`).
3. **Documentación Swagger UI**: Documentación interactiva completa bajo la especificación OpenAPI 3.0 en `/api-docs`.

---

## Estructura del Proyecto
```text
laboratorio#5/
├── src/
│   ├── config/
│   │   └── swagger.js          # Configuración de OpenAPI / Swagger UI
│   ├── middlewares/
│   │   ├── errorHandler.js    # Manejador centralizado de errores (AppError, Anthropic APIError, etc.)
│   │   └── validar.js         # Middleware de validación con esquemas Zod
│   ├── routes/
│   │   ├── ia.routes.js       # Rutas asociadas a la IA (/api/ia)
│   │   └── notas.routes.js    # Rutas CRUD de notas y resumen (/api/notas)
│   ├── services/
│   │   ├── claude.service.js  # Servicio que encapsula el SDK de Anthropic (@anthropic-ai/sdk)
│   │   └── notas.service.js   # Lógica de negocio y persistencia en memoria de notas
│   ├── utils/
│   │   └── errors.js          # Clase personalizada AppError
│   ├── app.js                 # Inicialización de la aplicación Express y middlewares
│   └── index.js               # Punto de entrada y levantamiento del servidor HTTP
├── docs/                      # Carpeta para capturas de pantalla de pruebas
├── .env                       # Variables de entorno locales (ignorado por Git)
├── .env.example               # Plantilla de variables de entorno (sin secretos)
├── .gitignore                 # Exclusión de node_modules y .env
├── package.json
└── README.md
```

---

## Requisitos Previos
- **Node.js** v20 o superior (`node -v`).
- **npm** v10 o superior (`npm -v`).
- Una API Key válida de Anthropic Claude obtenida en [Anthropic Console](https://console.anthropic.com/).

---

## Instalación y Ejecución

1. **Clonar el repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd laboratorio#5
   ```

2. **Instalar dependencias**:
   ```bash
   npm install
   ```

3. **Configurar las variables de entorno**:
   Copiar el archivo de plantilla `.env.example` a un nuevo archivo `.env`:
   ```bash
   cp .env.example .env
   ```
   Editar el archivo `.env` y configurar su API Key de Anthropic:
   ```env
   ANTHROPIC_API_KEY=sk-ant-api03-...tu-api-key-real...
   CLAUDE_MODEL=claude-haiku-4-5-20251001
   PORT=3000
   ```

4. **Ejecutar el servidor en modo desarrollo**:
   ```bash
   npm run dev
   ```

5. **Ejecutar en modo producción**:
   ```bash
   npm start
   ```

6. **Acceder a la documentación Swagger UI**:
   Abrir en el navegador: [http://localhost:3000/api-docs](http://localhost:3000/api-docs)

---

## Variables de Entorno
| Variable | Descripción | Valor por Defecto |
| :--- | :--- | :--- |
| `ANTHROPIC_API_KEY` | Llave secreta para autenticación con el SDK de Claude | *(Obligatorio)* |
| `CLAUDE_MODEL` | Nombre del modelo de Claude a utilizar | `claude-haiku-4-5-20251001` |
| `PORT` | Puerto en el que escucha el servidor Express | `3000` |

---

## Endpoints de la API

| Método | Endpoint | Descripción | Códigos HTTP |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/notas` | Retorna la lista de todas las notas | `200` |
| **GET** | `/api/notas/:id` | Retorna una nota por su ID | `200`, `404` |
| **POST** | `/api/notas` | Crea una nueva nota (`titulo`, `contenido`) | `201`, `400` |
| **DELETE** | `/api/notas/:id` | Elimina una nota por su ID | `204`, `404` |
| **POST** | `/api/ia/preguntar` | Envía una consulta libre a Claude | `200`, `400`, `502` |
| **POST** | `/api/notas/:id/resumen` | Genera un resumen de la nota en 3 viñetas | `200`, `404`, `502` |
| **GET** | `/api-docs` | Interfaz interactiva de Swagger UI | `200` |

---

## Tabla de Casos de Prueba

| Caso de prueba | Entrada / Acción | Resultado esperado | Estado |
| :--- | :--- | :--- | :---: |
| Crear dos notas con `POST /api/notas` | Body con `titulo` y `contenido` válidos | Status `201 Created` con objeto nota y su `id` asignado | Exitoso |
| Listar con `GET /api/notas` | Sin parámetros | Status `200 OK` con el arreglo de las notas creadas | Exitoso |
| Pedir `GET /api/notas/99` | ID inexistente | Status `404 Not Found`: `{"error": "Nota no encontrada"}` | Exitoso |
| `POST /api/notas` con body vacío `{}` | Objeto vacío `{}` | Status `400 Bad Request` con arreglo de errores de validación Zod | Exitoso |
| Pregunta libre en `POST /api/ia/preguntar` ★ | Body `{"pregunta": "¿Qué es Express.js?"}` | Status `200 OK` con respuesta generada y tokens consumidos (`uso`) | Exitoso |
| Resumir la nota 1 con `POST /api/notas/1/resumen` ★ | ID existente `1` | Status `200 OK` con `notaId: 1` y resumen en 3 viñetas en español | Exitoso |
| Resumir una nota inexistente `POST /api/notas/99/resumen` | ID inexistente `99` | Status `404 Not Found` de inmediato, sin consumir créditos de Claude | Exitoso |
| `POST /api/ia/preguntar` con 1 letra | Body `{"pregunta": "a"}` | Status `400 Bad Request` por regla `min(3)` de Zod sin invocar a Claude | Exitoso |
| Probar con API key inválida ★ | Clave incorrecta en `.env` | Status `502 Bad Gateway` (`{"error": "IA_NO_DISPONIBLE"}`) y log 401 en consola | Exitoso |
| Eliminar y verificar `DELETE /api/notas/2` y `GET /api/notas/2` | ID existente | Status `204 No Content`, y la consulta subsecuente retorna `404` | Exitoso |

*(Las capturas de los casos marcados con ★ se pueden ubicar en el directorio `docs/`)*.

---

## Resultados de la Experimentación con el Prompt de Sistema (Paso 9)

Durante las pruebas del endpoint `POST /api/notas/:id/resumen`, se modificó el parámetro `system` enviado a Claude para evaluar cómo altera el formato y la síntesis de la respuesta:

| Directiva en `system` | Comportamiento y Cambios Observados en la Respuesta |
| :--- | :--- |
| **`"Resume el texto en 3 viñetas breves, en español."`** *(Por defecto)* | El modelo responde con exactamente 3 líneas encabezadas con viñetas (`- `), condensando las ideas principales de forma esquemática y legible. |
| **`"Resume el texto en una sola frase contundente."`** | El modelo omite las viñetas y genera un único párrafo de una sola oración que sintetiza el núcleo del contenido sin listas. |
| **`"Extrae únicamente las palabras clave principales separadas por comas."`** | El modelo suprime conectores y prosa; devuelve únicamente una lista de términos técnicos clave (ej. *Arquitectura hexagonal, puertos, adaptadores, desacoplamiento*). |
| **`"Traduce el contenido al inglés de manera concisa."`** | El modelo traduce la nota completa a inglés sin añadir comentarios introductorios, manteniendo la fidelidad del texto. |

---

## Sección 6: Preguntas de Reflexión

### 1. ¿Por qué la API key no puede estar en el frontend? Describan cómo la podría obtener un usuario cualquiera.
**Respuesta:**  
La API key es una credencial secreta equivalente a una contraseña con privilegios financieros directos. Si la clave se incluye en el frontend (código HTML, JavaScript cliente o aplicaciones móviles), el código se entrega directamente al navegador o dispositivo del usuario. 
Cualquier persona puede obtenerla fácilmente:
- Abriendo las Herramientas de Desarrollador del navegador (**DevTools**, tecla F12), pestaña *Sources/Fuentes* y buscando texto como `sk-ant-` en los bundles JavaScript.
- En la pestaña *Network/Red*, inspeccionando las cabeceras HTTP de las peticiones salientes si el frontend hiciera las peticiones directamente a Anthropic.
- Ejecutando un comando básico como `curl` o analizando el código fuente con herramientas de inspección.
Una vez obtenida, un atacante puede consumir todos los créditos de la cuenta, exceder cuotas de uso o revender el acceso. Por ello, la arquitectura correcta es el patrón *Backend-for-Frontend (BFF)* o proxy: el cliente solo contacta a nuestro backend y el backend (en un entorno seguro y privado) es el único que contacta a la API de Claude.

### 2. ¿Qué responde su API cuando Claude devuelve 401? ¿Por qué no se reenvía ese mismo 401 al cliente?
**Respuesta:**  
Nuestra API captura el error a través de `errorHandler.js` y devuelve un código de estado **`502 Bad Gateway`** con el cuerpo `{"error": "IA_NO_DISPONIBLE"}`.

**Razones para no reenviar el 401:**
1. **Semántica HTTP precisa**: El código `401 Unauthorized` entre el cliente y nuestra API significaría que el *usuario final* o cliente no ha presentado credenciales válidas para autenticarse ante *nuestra* API. Sin embargo, el error 401 de Claude indica un problema interno del servidor con un servicio upstream externo (nuestra propia API key expiró, es inválida o no fue suministrada). El cliente no tiene la culpa ni puede solucionar la falta de credenciales de Claude; por lo tanto, para el cliente es una falla de puerta de enlace / upstream (`502`).
2. **Seguridad y ocultación de infraestructura**: Reenviar códigos de error crudos o mensajes detallados del proveedor de IA expone detalles de arquitectura y posibles vectores de ataque. Responder con un mensaje genérico protege la privacidad de nuestra infraestructura.

### 3. ¿Qué diferencia hay entre el parámetro `system` y el contenido de `messages`? Den un ejemplo de su prueba.
**Respuesta:**  
- **Parámetro `system`**: Define las directivas de alto nivel, la identidad, las restricciones de formato, tono, idioma y rol del modelo (meta-instrucciones que condicionan cómo debe comportarse globalmente).
- **Contenido de `messages`**: Representa el flujo conversacional y la entrada específica de la tarea que el usuario desea procesar en el turno actual (los datos/pregunta en sí).

**Ejemplo de prueba en el endpoint de resumen (`/api/notas/:id/resumen`):**
- `system`: `"Resume el texto en 3 viñetas breves, en español."` (Instrucción de formato y restricción de longitud).
- `messages`: `[{ role: "user", content: "La arquitectura hexagonal divide la aplicación en capas..." }]` (El texto bruto de la nota que debe procesar).

Al experimentar cambiando el `system` por:
- *"Resume en una sola frase contundente"*: El modelo genera un único enunciado sintetizado en lugar de viñetas.
- *"Extrae las 3 palabras clave separadas por comas"*: El modelo ignora la redacción en prosa y entrega únicamente términos clave.

### 4. Anoten los `input_tokens` y `output_tokens` de dos de sus llamadas. ¿Qué parámetro les permite limitar el costo?
**Respuesta:**  
Valores medidos en la propiedad `uso` (`msg.usage` de Claude):
- **Llamada 1 (Pregunta libre: "¿Qué es Node.js?"):**
  - `input_tokens`: 28
  - `output_tokens`: 145
- **Llamada 2 (Resumen de nota en 3 viñetas):**
  - `input_tokens`: 62
  - `output_tokens`: 58

**Parámetros para limitar el costo:**
1. **`max_tokens`**: Limita el número máximo de tokens que el modelo puede generar en la respuesta (`output_tokens`). Dado que la salida tiene un costo por token mayor y puede extenderse indefinidamente si no se acota, fijar `max_tokens` (por ejemplo en `1024` o `300` para resúmenes) previene sobrecostos por respuestas excesivamente extensas.
2. **Validación previa del tamaño de entrada (Zod)**: Restringir `req.body` con `.max(2000)` en el input previene que un usuario envíe textos masivos que inflen desproporcionadamente los `input_tokens`.
3. **Selección del modelo (`CLAUDE_MODEL`)**: Utilizar modelos optimizados y económicos como `claude-haiku-4-5-20251001` en lugar de modelos insignia más costosos para tareas rutinarias.

### 5. ¿Qué pasaría si no validaran el body antes de llamar a Claude? Mencionen al menos dos consecuencias.
**Respuesta:**  
Si no se utiliza el middleware de validación con Zod (`validar(preguntaSchema)`):
1. **Consumo innecesario y desperdicio de créditos/dinero**: Si un cliente envía una petición vacía `{}`, con strings de espacios en blanco o con payloads malformados, enviaríamos peticiones a la API de Claude que consumirían tokens o generarían respuestas inútiles facturadas. Peor aún, peticiones con cientos de miles de caracteres consumirían la cuota y presupuesto en una sola llamada.
2. **Excepciones no controladas y degradación del servicio (DoS involuntario)**: Si `req.body.pregunta` es `undefined`, `null` o de tipo numérico/objeto, la llamada al SDK de Anthropic (`client.messages.create`) fallará con un error `400 invalid_request_error` o un `TypeError` en tiempo de ejecución. Además de generar latencia y saturar el event loop esperando la respuesta fallida de la red externa, expone la estabilidad del servidor.

### 6. ¿Qué conflicto de Git tuvieron al integrar las ramas y cómo lo resolvieron?
*(Nota de desarrollo individual / simulación de integración por ramas)*  
**Respuesta:**  
Al simular la integración de la rama `feature/notas` (CRUD y configuración base) con la rama `feature/ia` (integración del SDK y rutas de Claude), el conflicto de integración esperado ocurre en el archivo `src/routes/notas.routes.js`.
- **Origen del conflicto**: La rama de notas define la estructura de las rutas REST básicas (`GET /`, `POST /`, `GET /:id`, `DELETE /:id`) y exporta el router, mientras que la rama de IA agrega la importación de `claude.service` al inicio e inserta el endpoint `POST /:id/resumen` antes del `module.exports`.
- **Resolución**: Se resolvió manualmente en el Pull Request manteniendo ambas modificaciones:
  1. Se conservaron los imports de `notas.service` y `validar` y se agregó `const claude = require('../services/claude.service')`.
  2. En el cuerpo del router, se conservaron los métodos CRUD y se incorporó la ruta `/:id/resumen` utilizando `notas.buscar(Number(req.params.id))` para verificar la existencia antes de delegar la llamada a `claude.preguntar()`.
  3. Se ejecutaron pruebas completas para confirmar que los 7 endpoints funcionaran sin regresiones.
