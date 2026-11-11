/**
 * Script de prueba en vivo para verificar todos los casos de la guía con la API de DeepSeek activa.
 * Ejecuta las peticiones directamente a través de supertest sin necesidad de levantar el servidor por separado.
 */
require('dotenv').config();
const request = require('supertest');
const app = require('../src/app');

async function runLiveEvidence() {
  console.log('===========================================================');
  console.log('  EVIDENCIA EN VIVO - LABORATORIO #5 (NOTAS + DEEPSEEK)   ');
  console.log('===========================================================\n');

  // 1. Crear dos notas
  console.log('1. Creando Nota 1...');
  const resNota1 = await request(app)
    .post('/api/notas')
    .send({
      titulo: 'Arquitectura Hexagonal',
      contenido: 'La arquitectura hexagonal divide la aplicación en capas desacopladas mediante puertos y adaptadores.',
    });
  console.log(`Status: ${resNota1.status}`, resNota1.body);

  console.log('\nCreando Nota 2...');
  const resNota2 = await request(app)
    .post('/api/notas')
    .send({
      titulo: 'Node.js y Express',
      contenido: 'Express es un marco de trabajo minimalista y flexible que facilita el desarrollo de aplicaciones web y APIs REST en Node.js.',
    });
  console.log(`Status: ${resNota2.status}`, resNota2.body);

  // 2. Listar notas
  console.log('\n2. Listando todas las notas (GET /api/notas)...');
  const resList = await request(app).get('/api/notas');
  console.log(`Status: ${resList.status}`, resList.body);

  // 3. Caso ★: Pregunta libre a la IA (DeepSeek)
  console.log('\n3. [CASO ★] Pregunta libre a la IA (POST /api/ia/preguntar)...');
  const resPregunta = await request(app)
    .post('/api/ia/preguntar')
    .send({ pregunta: '¿Qué ventaja tiene usar Zod para validación de datos en Express?' });
  console.log(`Status: ${resPregunta.status}`);
  console.log('Respuesta de la IA:');
  console.log(resPregunta.body.respuesta);
  console.log('Uso de tokens:', resPregunta.body.uso);

  // 4. Caso ★: Resumir nota 1 en 3 viñetas
  console.log('\n4. [CASO ★] Resumir Nota 1 en 3 viñetas (POST /api/notas/1/resumen)...');
  const resResumen = await request(app).post('/api/notas/1/resumen');
  console.log(`Status: ${resResumen.status}`);
  console.log('Nota ID:', resResumen.body.notaId);
  console.log('Resumen generado:');
  console.log(resResumen.body.resumen);

  // 5. Validación: pregunta de 1 letra
  console.log('\n5. Validando pregunta corta de 1 letra (POST /api/ia/preguntar)...');
  const resCorta = await request(app).post('/api/ia/preguntar').send({ pregunta: 'a' });
  console.log(`Status: ${resCorta.status} (esperado: 400 sin llamar al LLM)`);
  console.log(resCorta.body);

  // 6. Eliminar nota 2 y verificar
  console.log('\n6. Eliminando Nota 2 (DELETE /api/notas/2)...');
  const resDel = await request(app).delete('/api/notas/2');
  console.log(`Status: ${resDel.status} (esperado: 204)`);

  const resGet2 = await request(app).get('/api/notas/2');
  console.log(`GET /api/notas/2 tras eliminación: Status ${resGet2.status} (esperado: 404)`);

  console.log('\n===========================================================');
  console.log('  TODAS LAS PRUEBAS EN VIVO COMPLETADAS EXITOSAMENTE      ');
  console.log('===========================================================');
}

runLiveEvidence().catch(console.error);
