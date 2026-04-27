A continuación tienes una versión **cerrada, minimalista y ejecutable** (sin sobreingeniería) de todo el sistema.

---

# 1. FICHA DE PRODUCTO

## Nombre provisional

**Santes Live**

---

## Tipo de producto

App móvil (React Native + Expo)

---

## Descripción

Aplicación de guía en tiempo real para Les Santes de Mataró que permite visualizar eventos culturales en un mapa interactivo, incluyendo eventos estáticos y eventos móviles con ruta estimada basada en tiempo.

---

## Problema que resuelve

* Programa de fiestas fragmentado y difícil de seguir
* Falta de contexto espacial en eventos itinerantes
* Dificultad para decidir “qué hacer ahora”
* Desinformación en movilidad durante actos masivos

---

## Propuesta de valor

### Usuario

* Saber qué está pasando ahora
* Entender dónde están los eventos móviles
* Decidir a qué ir en segundos

### Ciudad / Ayuntamiento

* Canal único de información estructurada
* Reducción de saturación por mejor distribución de gente
* Modernización digital del evento

---

## Core features (MVP)

### 1. Mapa de eventos

* eventos estáticos (pin)
* eventos móviles (ruta + posición estimada)

### 2. Agenda simplificada

* lista por día
* filtros básicos

### 3. Vista “Ahora”

* eventos activos en tiempo real (por tiempo, no GPS real)

---

## Diferenciador clave

> Simulación temporal de eventos móviles basada en ruta + hora

---

## Stack

* React Native (Expo)
* Supabase (Postgres + realtime opcional futuro)
* Mapas: react-native-maps
* Estado: Zustand

---

## No incluido en MVP

> Regla de oro: si un campo o funcionalidad no ayuda al usuario a decidir **qué hacer ahora mismo**, se elimina.

* Tracking GPS real (sustituido por interpolación temporal)
* Sharing / planes de usuario
* Autenticación de usuarios
* Panel de administración
* Chat o red social
* Categorías como tabla separada (un campo `category` es suficiente)

 