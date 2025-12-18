# Intranet Empresarial con CatBox Inteligente

## 📌 Descripción del Proyecto

Este proyecto consiste en una **aplicación web tipo intranet empresarial** que permite a los usuarios acceder a información interna de la empresa mediante una **interfaz web moderna** y un **CatBox (chatbox inteligente)**.

El CatBox se conecta a una **API externa** que utiliza un **LLM (Large Language Model)** junto con un **MCP (Model Context Protocol)** para interpretar las preguntas del usuario, consultar la **base de datos corporativa** y devolver respuestas contextualizadas y relevantes.

La aplicación sigue una **arquitectura Cliente-Servidor**, separando claramente frontend, backend, base de datos y servicios externos.

---

## 🏗️ Arquitectura General

### Modelo Cliente-Servidor

- **Frontend**: SPA web responsive
- **Backend**: API REST para la lógica de negocio
- **Base de Datos**: Almacenamiento de información corporativa
- **Servicios Externos**: API Flask CatBox con LLM + MCP

---

## 🧩 Tecnologías Utilizadas

### Frontend
- **React**
  - Componentes reutilizables
  - Routing
  - Gestión de estado
  - Interfaz de usuario del CatBox

### Backend
- **Node.js**
- **Express.js**
  - Arquitectura MVC
  - Autenticación y autorización
  - Operaciones CRUD
  - Exposición de API REST

### Base de Datos
- **PostgreSQL**
  - Gestión de:
    - Usuarios
    - Empleados
    - Clientes
    - Productos
    - Ventas

### Servicios Externos
- **Flask API (CatBox)**
  - Comunicación con el LLM
  - Implementación de MCP
  - Consultas inteligentes a la base de datos
  - Generación de respuestas en lenguaje natural

---

## 🔄 Flujo de Funcionamiento

1. El usuario accede a la intranet desde el **frontend en React**.
2. El usuario interactúa con el **CatBox** realizando una pregunta.
3. El CatBox envía la consulta a la **API Flask**.
4. La API Flask:
   - Interpreta la intención usando un **LLM**
   - Utiliza **MCP** para decidir qué datos necesita
   - Consulta la **base de datos PostgreSQL**
5. La respuesta se procesa y se devuelve al CatBox.
6. El usuario recibe la información en **lenguaje natural**.

---

## 📂 Estructura del Proyecto 

```bash
backend/
│   app.js
├── config/
│ └── db.js
│ └── jsonwebtoken.js
│ └── swagger.js
├── controllers/
│ └── authController.js
│ └── adminController.js
│ └── chatController.js
│ └── hrController.js
│ └── mktController.js
├── middlewares/
│ └── checkRefreshCookie.js
│ └── auth.middleware.js
│ └── error404.js
│ └── morgan.js
│ └── validate.js
├── models/
│ └── adminModel.js
│ └── authModel.js
│ └── hrModel.js
│ └── mktModel.js
├── routes/
│ └── adminRoutes.js
│ └── authRoutes.js
│ └── chatRoutes.js
│ └── hrRoutes.js
│ └── mktRoutes.js
├── queries/
├── validators/
│ 
frontend/
│   index.html
├── public/
├── src/
│ └── components
│        └── Chat
│        └── Footer
│        └── Header
│        └── Layout
│        └── Main
│               └── AdminDashboard
│               └── AllUsers
│               └── CreateUserContainer
│               └── HrPage
│               └── MktPage
│               └── Login
│               └── Splash
│        └── Pagination
│ └── services

## 📄 Instrucciones
### 1. Clona el repositorio 

```bash
git clone https://github.com/luciaaroca/desafio-tripulaciones.git
```

### 2. Instalar dependendias

```bash
npm install (Dependencias globales)

cd frontend
npm install (Dependencias frontend)

cd ../backend
npm install (Dependencia backend)
```

### 3. Configurar variables de entorno


```bash
Backend:
# BBDD remota

# SQL
# Datos BBDD PostgreSQL
PG_USER=
# Busca la IP de tu ordenador y cambiala en HOST:
PG_HOST=
PG_DATABASE=
PG_PASSWORD=
PG_PORT=
JWT_SECRET=
JWT_REFRESH_SECRET=
PG_SSL=
# Servidor
PORT=
# Con docker o en render: NODE_ENV=production
NODE_ENV=
# Api Key OpenAI
OPENAI_API_KEY=

# Json Web Token
MY_TOKEN_SECRET=
--------
Frontend
VITE_API_URL=
VITE_API_LLM=
```
### 5. Iniciar el servidor:
```bash
- npm run dev
```

