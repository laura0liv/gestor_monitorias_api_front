// src/lib/tutores.js
export let tutores = [
  { nombre: "Ana Rodríguez", materia: "Matemáticas" },
  { nombre: "Carlos Pérez", materia: "Física" },
  { nombre: "Laura Gómez", materia: "Química" },
  { nombre: "Juan Martínez", materia: "Lengua y Literatura" },
  { nombre: "Sofía Hernández", materia: "Historia" },
  { nombre: "Andrés Castillo", materia: "Programación en Java" },
  { nombre: "Mariana Torres", materia: "Bases de Datos" }
];

// función para agregar un tutor nuevo
export function agregarTutor(nombre, materia) {
  tutores.push({ nombre, materia });
}