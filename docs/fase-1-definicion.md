# 📋 Fase 1: Definición del Problema y Objetivos
**Proyecto:** Habit Tracker con Sistema de Recompensas y Progresión ("Arquitectura de Hábitos")  
**Metodología:** Ciclo de Vida del Desarrollo de Software (SDLC)  
**Plataforma Objetivo:** Aplicación Web (PC / Laptop / Responsiva)

---

## 1. Planteamiento del Problema
* **El Problema:** Las aplicaciones tradicionales de seguimiento de hábitos suelen ser monótonas y se limitan a listados numéricos o cronómetros estáticos. Esto genera desmotivación a corto plazo, provocando que los usuarios abandonen la constancia diaria y pierdan el interés en el seguimiento de sus metas personales.
* **La Solución:** Desarrollar una aplicación web interactiva que incorpore un sistema de gamificación (colección de ítems de construcción) y control de rachas de constancia. De esta forma, el tiempo invertido en un hábito se traduce visualmente en el avance de una edificación virtual, incentivando la disciplina y el compromiso del usuario mediante el mantenimiento de sus logros.

---

## 2. Objetivo General del MVP
Construir una aplicación web funcional en un plazo de 4 semanas, utilizando tecnologías web estándar (**HTML5, CSS3, JavaScript Vanilla y Bootstrap**), que permita registrar, monitorear y cronometrar hábitos diarios, persistiendo la información de manera local y otorgando recompensas visuales basadas en la constancia y el rendimiento del usuario.

---

## 3. Objetivos Específicos y Alcance Funcional

### 🔹 3.1. Gestión y Control de Hábitos
- **Registro de Hábitos:** Interfaz intuitiva con campos validados para capturar el nombre del hábito y su categoría correspondiente.
- **Listado y Monitoreo:** Vista centralizada en formato de tarjetas para consultar los hábitos activos y visualizar sus métricas principales.

### 🔹 3.2. Cronometraje y Persistencia
- **Cronómetro Local:** Mecanismo de inicio y detención de sesiones de tiempo en tiempo real por hábito, acumulando el progreso en segundos.
- **Persistencia con `localStorage`:** Almacenamiento directo en el navegador web para garantizar que la información (hábitos, tiempos acumulados e ítems) se preserve tras reiniciar o recargar la página.

### 🔹 3.3. Gamificación e Incentivos (Progresión Visual)
- **Sistema de Recompensas por Hitos:** Notificación interactiva (pop-up / modal) al pausar o finalizar una sesión cuando se alcanza una meta de tiempo acumulado.
- **Colección de Ítems de Construcción:** Desbloqueo progresivo de elementos (ladrillos, ventanas, puertas, hasta la casa completa) estilo tarjeta/inventario para representar la disciplina del usuario.
- **Mecanismo de Deterioro por Inactividad:** Control de rachas diarias que penaliza o desactiva visualmente los ítems si el usuario abandona el hábito por un periodo prolongado.

---

## 4. Stack Tecnológico Seleccionado

| Componente | Tecnología / Herramienta |
| :--- | :--- |
| **Frontend Base** | HTML5 / CSS3 / JavaScript Vanilla (ES6+) |
| **Framework de UI** | Bootstrap 5 (Estilos, tarjetas, modales y responsividad) |
| **Almacenamiento** | `localStorage` del navegador |
| **Control de Versiones** | Git & GitHub |
| **Entorno de Pruebas** | Navegadores Web Modernos (Chrome, Edge, Firefox) |

---

## 5. Fases de Entregables (Estrategia de Desarrollo)

- [ ] **Semana 1 (Fase Core):** Estructura base en HTML/Bootstrap, formulario de registro y persistencia básica en `localStorage`.
- [ ] **Semana 2 (Fase Cronómetro):** Implementación del cronómetro funcional en JavaScript Vanilla y cálculo de tiempo acumulado.
- [ ] **Semana 3 (Fase Gamificación):** Integración de modales de recompensa al finalizar sesión y visualización del inventario de ítems.
- [ ] **Semana 4 (Fase QA & Cierre):** Pruebas de usabilidad, ajuste de rachas/deterioro, refinamiento de UI/UX y documentación final.