const router = require('express').Router();
const { z } = require('zod');
const rateLimit = require('express-rate-limit');
const validar = require('../middlewares/validar');
const claude = require('../services/claude.service');

// Reto Extra: Proteger endpoints de IA con rate limiting para evitar consumo excesivo de créditos
const iaLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 30, // máximo 30 peticiones por ventana por IP
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Demasiadas peticiones a la IA. Por favor intente más tarde.' },
});

router.use(iaLimiter);

const preguntaSchema = z.object({
  pregunta: z.string().min(3).max(2000),
});

/**
 * @openapi
 * /api/ia/preguntar:
 *   post:
 *     summary: Envía una pregunta a Claude
 *     tags: [IA]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/Pregunta'
 *     responses:
 *       200:
 *         description: Respuesta del modelo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 respuesta:
 *                   type: string
 *                 uso:
 *                   type: object
 *       400:
 *         description: Datos inválidos
 *       502:
 *         description: Claude no disponible
 */
router.post('/preguntar', validar(preguntaSchema), async (req, res) => {
  const r = await claude.preguntar(req.body.pregunta);
  res.json(r);
});

module.exports = router;
