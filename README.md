# 🟢🔴 DRT Interface — Detection Response Task Module
**Módulo para la medición de tiempos de reacción en estudios de distracción cognitiva**

Este repositorio contiene la interfaz DRT utilizada para medir el tiempo de reacción del conductor ante un estímulo visual durante tareas secundarias dentro del vehículo. Forma parte de la suite experimental del proyecto IVIS Dorado–Chaves (DC), orientado a evaluar la distracción cognitiva en escenarios urbanos reales.

---

## 🎯 Propósito del módulo

El DRT (Detection Response Task) permite capturar de manera precisa y reproducible el tiempo de reacción del usuario mientras conduce.  
Este módulo registra:

- La aparición aleatoria del estímulo.
- El tiempo de reacción en milisegundos.
- El número de ensayo (trial).
- Un archivo CSV exportable con los datos generados.

Estos datos se utilizan para construir métricas de eficiencia cognitiva y apoyar la validación del sistema IVIS bajo el marco de la norma **ISO 9241-11**.

---

## ✨ Características principales

- Cambio de color **Rojo → Verde** para indicar el estímulo.
- Captura del tiempo de reacción en milisegundos (ms).
- Registro automático de cada prueba.
- Botón para reiniciar la secuencia de ensayos.
- Diseño táctil y minimalista, centrado en el estímulo.
- Compatible con tablets y pantallas del vehículo.

---

## 🧱 Stack tecnológico

- **HTML5**
- **CSS3**
- **JavaScript Vanilla**
- Sin dependencias externas ni frameworks.
- Optimizado para dispositivos táctiles.

---

## ▶️ Ejecución local

### 1. Clonar el repositorio
```bash
git clone https://github.com/<usuario>/<repo-drt>.git
cd <repo-drt>
