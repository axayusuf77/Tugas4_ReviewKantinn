import {
  OpenAPIRegistry,
  OpenApiGeneratorV3,
} from '@asteasolutions/zod-to-openapi';
import { z } from 'zod';
import {
  createStallSchema,
  idParamSchema,
  stallQuerySchema,
  updateStallSchema,
} from '../schemas/stallSchema.ts';
import { loginSchema, registerSchema } from '../schemas/authSchema.ts';
import { createReviewSchema } from '../schemas/reviewSchema.ts';

const registry = new OpenAPIRegistry();

// Security scheme Bearer JWT
registry.registerComponent('securitySchemes', 'bearerAuth', {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT',
  description: 'Masukkan token JWT dari endpoint POST /api/v1/auth/login',
});

const secured = [{ bearerAuth: [] }];

// Komponen schema respons & input
const stallSchema = registry.register(
  'Stall',
  z.object({
    id: z.number().openapi({ example: 1 }),
    ownerId: z.number().openapi({ example: 2 }),
    name: z.string().openapi({ example: 'Warung Bu Tini' }),
    category: z.string().nullable().openapi({ example: 'Kwetiau' }),
    location: z.string().nullable().openapi({ example: 'Kantin FKIP' }),
    description: z.string().nullable().openapi({ example: 'Kedai kwetiau goreng & kuah' }),
    avgRating: z.number().openapi({ example: 4.5 }),
    reviewCount: z.number().openapi({ example: 2 }),
    isPopular: z.boolean().openapi({ example: false }),
  }),
);

const reviewSchema = registry.register(
  'Review',
  z.object({
    id: z.number().openapi({ example: 1 }),
    stallId: z.number().openapi({ example: 1 }),
    userId: z.number().openapi({ example: 3 }),
    rating: z.number().openapi({ example: 5 }),
    comment: z.string().nullable().openapi({ example: 'Enak banget!' }),
    likeCount: z.number().openapi({ example: 0 }),
    createdAt: z.string().nullable().openapi({ example: '2026-10-19T12:00:00.000Z' }),
  }),
);

const authUserSchema = registry.register(
  'AuthUser',
  z.object({
    id: z.number().openapi({ example: 1 }),
    name: z.string().openapi({ example: 'Admin Kantin' }),
    email: z.string().openapi({ example: 'admin@kantin.test' }),
    role: z.enum(['admin', 'owner', 'customer']).openapi({ example: 'admin' }),
  }),
);

const errorSchema = registry.register(
  'ErrorResponse',
  z.object({
    status: z.string().openapi({ example: 'fail' }),
    message: z.string().openapi({ example: 'Validasi gagal' }),
    errors: z
      .array(z.object({ field: z.string(), message: z.string() }))
      .optional()
      .openapi({
        example: [{ field: 'name', message: 'name minimal 3 karakter' }],
      }),
  }),
);

const stallInput = registry.register('StallInput', createStallSchema);
const stallUpdate = registry.register('StallUpdate', updateStallSchema);
const registerInput = registry.register('RegisterInput', registerSchema);
const loginInput = registry.register('LoginInput', loginSchema);
const reviewInput = registry.register('ReviewInput', createReviewSchema);

const stallListResponse = registry.register(
  'StallListResponse',
  z.object({
    status: z.literal('success'),
    meta: z.object({
      page: z.number().openapi({ example: 1 }),
      limit: z.number().openapi({ example: 10 }),
      total: z.number().openapi({ example: 10 }),
    }),
    data: z.array(stallSchema),
  }),
);

const stallDetailResponse = registry.register(
  'StallDetailResponse',
  z.object({
    status: z.literal('success'),
    data: stallSchema,
  }),
);

const registerResponse = registry.register(
  'RegisterResponse',
  z.object({
    status: z.literal('success'),
    data: z.object({ user: authUserSchema }),
  }),
);

const loginResponse = registry.register(
  'LoginResponse',
  z.object({
    status: z.literal('success'),
    data: z.object({
      token: z.string().openapi({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' }),
      tokenType: z.literal('Bearer'),
      expiresIn: z.string().openapi({ example: '2h' }),
      user: authUserSchema,
    }),
  }),
);

const meResponse = registry.register(
  'MeResponse',
  z.object({
    status: z.literal('success'),
    data: authUserSchema,
  }),
);

const reviewDetailResponse = registry.register(
  'ReviewDetailResponse',
  z.object({
    status: z.literal('success'),
    data: reviewSchema,
  }),
);

const json = (schema: Parameters<typeof registry.registerPath>[0] extends never ? never : any) => ({
  'application/json': { schema },
});

const unauthorizedResponse = {
  401: {
    description: 'Belum login / token tidak ada atau tidak valid',
    content: json(errorSchema),
  },
};

const forbiddenResponse = {
  403: {
    description: 'Sudah login, tetapi role tidak punya akses / bukan pemilik warung',
    content: json(errorSchema),
  },
};

// ===== Auth =====
registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/register',
  summary: 'Daftar akun baru (role otomatis customer)',
  request: {
    body: { description: 'Data pendaftaran', content: json(registerInput) },
  },
  responses: {
    201: { description: 'Akun berhasil dibuat', content: json(registerResponse) },
    400: { description: 'Body tidak valid', content: json(errorSchema) },
    409: { description: 'Email sudah terdaftar', content: json(errorSchema) },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/auth/login',
  summary: 'Login dan terima token JWT',
  request: {
    body: { description: 'Kredensial login', content: json(loginInput) },
  },
  responses: {
    200: { description: 'Login berhasil', content: json(loginResponse) },
    400: { description: 'Body tidak valid', content: json(errorSchema) },
    401: { description: 'Email atau password salah', content: json(errorSchema) },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/auth/me',
  summary: 'Ambil data user dari token JWT',
  security: secured,
  responses: {
    200: { description: 'Data user dari token', content: json(meResponse) },
    ...unauthorizedResponse,
  },
});

// ===== Stalls & Reviews =====
registry.registerPath({
  method: 'get',
  path: '/api/v1/stalls',
  summary: 'Daftar warung (publik)',
  request: { query: stallQuerySchema },
  responses: {
    200: { description: 'Daftar warung + meta pagination', content: json(stallListResponse) },
    400: { description: 'Query parameter tidak valid', content: json(errorSchema) },
  },
});

registry.registerPath({
  method: 'get',
  path: '/api/v1/stalls/{id}',
  summary: 'Detail warung (publik)',
  request: { params: idParamSchema },
  responses: {
    200: { description: 'Detail warung', content: json(stallDetailResponse) },
    400: { description: 'Parameter id tidak valid', content: json(errorSchema) },
    404: { description: 'Warung tidak ditemukan', content: json(errorSchema) },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/stalls',
  summary: 'Tambah warung (owner, admin)',
  security: secured,
  request: {
    body: { description: 'Data warung baru', content: json(stallInput) },
  },
  responses: {
    201: { description: 'Warung berhasil dibuat', content: json(stallDetailResponse) },
    400: { description: 'Body tidak valid', content: json(errorSchema) },
    ...unauthorizedResponse,
    ...forbiddenResponse,
  },
});

registry.registerPath({
  method: 'put',
  path: '/api/v1/stalls/{id}',
  summary: 'Ubah warung (owner pemilik warung, admin)',
  security: secured,
  request: {
    params: idParamSchema,
    body: { description: 'Data warung yang diubah', content: json(stallUpdate) },
  },
  responses: {
    200: { description: 'Warung ter-update', content: json(stallDetailResponse) },
    400: { description: 'Body/parameter tidak valid', content: json(errorSchema) },
    ...unauthorizedResponse,
    ...forbiddenResponse,
    404: { description: 'Warung tidak ditemukan', content: json(errorSchema) },
  },
});

registry.registerPath({
  method: 'delete',
  path: '/api/v1/stalls/{id}',
  summary: 'Hapus warung (khusus admin)',
  security: secured,
  request: { params: idParamSchema },
  responses: {
    200: { description: 'Warung terhapus', content: json(stallDetailResponse) },
    ...unauthorizedResponse,
    ...forbiddenResponse,
    404: { description: 'Warung tidak ditemukan', content: json(errorSchema) },
  },
});

registry.registerPath({
  method: 'post',
  path: '/api/v1/stalls/{id}/reviews',
  summary: 'Tambah review warung (semua role yang login)',
  security: secured,
  request: {
    params: idParamSchema,
    body: { description: 'Data review', content: json(reviewInput) },
  },
  responses: {
    201: { description: 'Review berhasil dibuat', content: json(reviewDetailResponse) },
    400: { description: 'Input tidak valid', content: json(errorSchema) },
    ...unauthorizedResponse,
    404: { description: 'Warung tidak ditemukan', content: json(errorSchema) },
    409: { description: 'Sudah pernah memberi review untuk warung ini', content: json(errorSchema) },
  },
});

const generator = new OpenApiGeneratorV3(registry.definitions);

export const openApiDocument = generator.generateDocument({
  openapi: '3.0.0',
  info: {
    title: 'Review Kantin API - Tugas 3',
    version: '1.0.0',
    description: 'Dokumentasi OpenAPI 3.0 untuk validasi, error handling, dan autentikasi JWT.',
  },
  servers: [{ url: 'http://localhost:3000' }],
});