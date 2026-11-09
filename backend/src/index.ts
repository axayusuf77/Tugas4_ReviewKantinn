import 'dotenv/config';
import cors from 'cors';
import express, { type Request, type Response, type Application } from 'express';
import { sql } from 'drizzle-orm';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './docs/openapi.ts';
import { getDb } from './db/index.ts';
import { authRouter } from './routes/authRouter.ts';
import { userRouter } from './routes/userRouter.ts';
import { stallRouter } from './routes/stallRouter.ts';
import { menuItemRouter } from './routes/menuItemRouter.ts';
import { reviewRouter } from './routes/reviewRouter.ts';
import { likeRouter } from './routes/likeRouter.ts';
import { flagRouter } from './routes/flagRouter.ts';
import { auditLogRouter } from './routes/auditLogRouter.ts';
import { notFoundHandler } from './middlewares/notFound.ts';
import { errorHandler } from './middlewares/errorHandler.ts';

const app: Application = express();
const PORT: number = Number(process.env.PORT ?? 3000);

// Tugas 4: frontend React berjalan di origin berbeda (mis. http://localhost:5173),
// jadi browser hanya mengizinkan request kalau backend memberi izin lewat CORS.
// Daftar origin diatur di .env (CORS_ORIGIN, pisahkan dengan koma).
const allowedOrigins: string[] = (process.env.CORS_ORIGIN ?? 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter((origin) => origin.length > 0);

app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }),
);

app.use(express.json());

// Dokumentasi API (Swagger UI) di /docs
app.get('/docs/swagger.json', (_req: Request, res: Response) => {
  res.status(200).json(openApiDocument);
});
app.use('/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.get('/health', async (req: Request, res: Response) => {
  try {
    const db = await getDb();
    await db.execute(sql`SELECT 1 AS ok`);
    res.status(200).json({ status: 'success', message: 'Server dan database terhubung' });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Gagal terhubung ke database',
      error: error instanceof Error ? error.message : String(error),
    });
  }
});

// Tugas 3: auth (dipasang di /api/v1/auth dan /auth sesuai tabel soal)
app.use('/api/v1/auth', authRouter);
app.use('/auth', authRouter);

// Stalls (dipasang di dua prefix juga)
app.use('/api/v1/stalls', stallRouter);
app.use('/stalls', stallRouter);

// Router Tugas 2 lainnya
app.use('/api/v1/users', userRouter);
app.use('/api/v1/menu-items', menuItemRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/likes', likeRouter);
app.use('/api/v1/flags', flagRouter);
app.use('/api/v1/audit-logs', auditLogRouter);

// Harus paling bawah
app.use(notFoundHandler);
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});