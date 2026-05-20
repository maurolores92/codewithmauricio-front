# AI Kanban Frontend

Frontend de una plataforma Kanban inteligente y multi-tenant desarrollada con Next.js, enfocada en la gestión visual de proyectos, automatización de flujos de trabajo y generación asistida por Inteligencia Artificial.

La aplicación incluye un sistema avanzado de gestión de tareas con Drag & Drop, dashboards analíticos, autenticación basada en roles (RBAC) y funcionalidades preparadas para tiempo real mediante WebSockets.

---

## ✨ Características Principales

### 🧠 Inteligencia Artificial Integrada
- Generación automática de tableros Kanban mediante IA
- Creación inteligente de tareas y estados
- Automatización de workflows
- Integración con Groq API

### 📋 Sistema Kanban Avanzado
- Gestión de tableros, columnas y tareas
- Funcionalidad Drag & Drop fluida
- Reordenamiento dinámico de columnas y tareas
- Arquitectura multi-tenant

### 🔐 Gestión de Usuarios y Permisos (RBAC)
- Sistema de Roles y Permisos dinámicos
- Renderizado condicional basado en permisos
- Integración con CASL
- Seguridad en frontend basada en abilities

### 📊 Dashboard Analítico
- Visualización de métricas y estadísticas
- Gráficos interactivos
- Panel administrativo
- Seguimiento visual de proyectos

### ⚡ Tiempo Real y Automatización
- Preparado para WebSockets
- Actualizaciones en tiempo real
- Integración con Socket.io-client

---

## 🛠️ Stack Tecnológico

### Core
- Next.js 13
- React 18
- TypeScript

### UI & Componentes
- Material UI (MUI v5)
- Iconify
- React Hot Toast

### Formularios y Validación
- React Hook Form
- Yup

### Estado Global y API
- Redux Toolkit
- Axios

### Drag & Drop
- dnd-kit
  - @dnd-kit/core
  - @dnd-kit/sortable

### Gráficos y Visualización
- ApexCharts
- Recharts
- Chart.js

### Tiempo Real
- Socket.io-client

### Extras
- FullCalendar
- React Draft Wysiwyg

---

## 🚀 Instalación

### Clonar el repositorio

```bash
git clone https://github.com/maurolores92/kanban-board-front.git
```

### Instalar dependencias

```bash
npm install
```

---

## ⚙️ Variables de entorno

Crear un archivo `.env.local`:

```env
NEXT_PUBLIC_API_URL=your_backend_url
NEXT_PUBLIC_GROQ_API_KEY=your_groq_api_key
```

---

## ▶️ Ejecutar el proyecto

```bash
npm run dev
```

---

## 🧠 Arquitectura del Proyecto

El frontend está construido bajo una arquitectura modular escalable utilizando:

- Separación por módulos
- Gestión global de estado
- Sistema RBAC desacoplado
- Comunicación REST + WebSockets
- Componentes reutilizables
- Renderizado condicional basado en permisos

---

## 📌 Funcionalidades Futuras

- Colaboración en tiempo real
- Notificaciones push
- Automatizaciones avanzadas
- Integración con calendarios externos
- Sistema de comentarios y actividad
- Exportación de reportes

---

## 👨‍💻 Autor

Desarrollado por Mauricio Lores

---

## 📄 Licencia

Este proyecto está licenciado bajo la licencia MIT.