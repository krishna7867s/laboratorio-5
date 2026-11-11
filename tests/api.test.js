const { describe, it, before, beforeEach } = require('node:test');
const assert = require('node:assert/strict');
const request = require('supertest');
const Anthropic = require('@anthropic-ai/sdk');

// Mockear el servicio de Claude antes de cargar la app
const claude = require('../src/services/claude.service');

describe('Suite de Pruebas Laboratorio #5 - Notas + IA', () => {
  let app;
  let originalPreguntar;

  before(() => {
    originalPreguntar = claude.preguntar;
    app = require('../src/app');
  });

  beforeEach(() => {
    // Restaurar mock por defecto
    claude.preguntar = async (texto, system) => {
      if (system && system.includes('viñetas')) {
        return {
          respuesta: '- Punto clave 1\n- Punto clave 2\n- Punto clave 3',
          uso: { input_tokens: 62, output_tokens: 58 },
        };
      }
      return {
        respuesta: 'Esta es una respuesta simulada de Claude.',
        uso: { input_tokens: 28, output_tokens: 145 },
      };
    };
  });

  it('1. POST /api/notas: Crea dos notas (201 con id)', async () => {
    const res1 = await request(app)
      .post('/api/notas')
      .send({ titulo: 'Primera Nota', contenido: 'Contenido de la primera nota' });
    assert.equal(res1.status, 201);
    assert.equal(res1.body.id, 1);
    assert.equal(res1.body.titulo, 'Primera Nota');

    const res2 = await request(app)
      .post('/api/notas')
      .send({ titulo: 'Segunda Nota', contenido: 'Contenido de la segunda nota' });
    assert.equal(res2.status, 201);
    assert.equal(res2.body.id, 2);
    assert.equal(res2.body.titulo, 'Segunda Nota');
  });

  it('2. GET /api/notas: Listar notas (200 con las notas creadas)', async () => {
    const res = await request(app).get('/api/notas');
    assert.equal(res.status, 200);
    assert.ok(Array.isArray(res.body));
    assert.ok(res.body.length >= 2);
  });

  it('3. GET /api/notas/99: Pedir nota inexistente (404 Nota no encontrada)', async () => {
    const res = await request(app).get('/api/notas/99');
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Nota no encontrada');
  });

  it('4. POST /api/notas: Enviar body vacío {} (400 con detalles de Zod)', async () => {
    const res = await request(app).post('/api/notas').send({});
    assert.equal(res.status, 400);
    assert.ok(Array.isArray(res.body.errores));
  });

  it('5. POST /api/ia/preguntar: Pregunta libre (200 con respuesta y uso de tokens)', async () => {
    const res = await request(app)
      .post('/api/ia/preguntar')
      .send({ pregunta: '¿Qué es una API REST?' });
    assert.equal(res.status, 200);
    assert.ok(res.body.respuesta);
    assert.ok(res.body.uso);
    assert.equal(res.body.uso.input_tokens, 28);
  });

  it('6. POST /api/notas/1/resumen: Resumir nota 1 (200 con resumen en 3 viñetas)', async () => {
    const res = await request(app).post('/api/notas/1/resumen');
    assert.equal(res.status, 200);
    assert.equal(res.body.notaId, 1);
    assert.ok(res.body.resumen.includes('- Punto clave'));
  });

  it('7. POST /api/notas/99/resumen: Resumir nota que no existe (404 sin llamar a Claude)', async () => {
    let llamado = false;
    claude.preguntar = async () => {
      llamado = true;
      return {};
    };

    const res = await request(app).post('/api/notas/99/resumen');
    assert.equal(res.status, 404);
    assert.equal(res.body.error, 'Nota no encontrada');
    assert.equal(llamado, false);
  });

  it('8. POST /api/ia/preguntar: Pregunta de 1 letra (400 sin llamar a Claude)', async () => {
    let llamado = false;
    claude.preguntar = async () => {
      llamado = true;
      return {};
    };

    const res = await request(app)
      .post('/api/ia/preguntar')
      .send({ pregunta: 'a' });
    assert.equal(res.status, 400);
    assert.ok(Array.isArray(res.body.errores));
    assert.equal(llamado, false);
  });

  it('9. Error de API Key (502 IA_NO_DISPONIBLE ante error 401 de Claude API)', async () => {
    claude.preguntar = async () => {
      const err = new Anthropic.APIError(
        401,
        { error: { message: 'Invalid API Key', type: 'authentication_error' } },
        'Invalid API Key',
        new Headers()
      );
      throw err;
    };

    const res = await request(app)
      .post('/api/ia/preguntar')
      .send({ pregunta: '¿Hola Claude?' });

    assert.equal(res.status, 502);
    assert.equal(res.body.error, 'IA_NO_DISPONIBLE');
  });

  it('10. DELETE /api/notas/2 y luego GET /api/notas/2 (204 y después 404)', async () => {
    const resDelete = await request(app).delete('/api/notas/2');
    assert.equal(resDelete.status, 204);

    const resGet = await request(app).get('/api/notas/2');
    assert.equal(resGet.status, 404);
    assert.equal(resGet.body.error, 'Nota no encontrada');
  });

  it('11. GET /api-docs: Swagger UI responde 200 OK', async () => {
    const res = await request(app).get('/api-docs/');
    assert.equal(res.status, 200);
  });
});
