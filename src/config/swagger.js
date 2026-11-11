const swaggerJsdoc = require('swagger-jsdoc');

module.exports = swaggerJsdoc({
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Lab 5: Notas + IA',
      version: '1.0.0',
      description: 'API REST con Express y Swagger integrando la Claude API',
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Servidor local de desarrollo',
      },
    ],
    components: {
      schemas: {
        Pregunta: {
          type: 'object',
          required: ['pregunta'],
          properties: {
            pregunta: {
              type: 'string',
              description: 'Texto de la pregunta a enviar al modelo',
              example: '¿Qué es una API REST y para qué sirve?',
            },
          },
        },
        NotaInput: {
          type: 'object',
          required: ['titulo', 'contenido'],
          properties: {
            titulo: {
              type: 'string',
              description: 'Título de la nota (1-100 caracteres)',
              example: 'Arquitectura de Software',
            },
            contenido: {
              type: 'string',
              description: 'Contenido detallado de la nota (1-5000 caracteres)',
              example: 'La arquitectura hexagonal divide la aplicación en capas desacopladas mediante puertos y adaptadores.',
            },
          },
        },
        Nota: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Identificador único de la nota',
              example: 1,
            },
            titulo: {
              type: 'string',
              example: 'Arquitectura de Software',
            },
            contenido: {
              type: 'string',
              example: 'La arquitectura hexagonal divide la aplicación en capas desacopladas mediante puertos y adaptadores.',
            },
          },
        },
        ResumenResponse: {
          type: 'object',
          properties: {
            notaId: {
              type: 'integer',
              example: 1,
            },
            resumen: {
              type: 'string',
              example: '- Punto 1\n- Punto 2\n- Punto 3',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Nota no encontrada',
            },
          },
        },
      },
    },
  },
  apis: ['./src/routes/*.js'], // Dónde leer las anotaciones @openapi
});
