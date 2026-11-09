import {
  StallRepository,
  type FindAllParams,
} from '../repositories/stallRepository.ts';
import type { StallResponseDto } from '../dtos/stallDto.ts';
import { ForbiddenError } from '../errors/ForbiddenError.ts';
import { NotFoundError } from '../errors/NotFoundError.ts';
import type { AuthUser } from './tokenService.ts';
import type { CreateStallInput, UpdateStallInput } from '../schemas/stallSchema.ts';

type StallRow = NonNullable<Awaited<ReturnType<StallRepository['findById']>>>;

export class StallService {
  private stallRepository: StallRepository;

  constructor(stallRepository: StallRepository = new StallRepository()) {
    this.stallRepository = stallRepository;
  }

  private toDto(row: StallRow): StallResponseDto {
    const avgRating = Number(row.avgRating);
    return {
      id: row.id,
      ownerId: row.ownerId,
      name: row.name,
      category: row.category,
      location: row.location,
      description: row.description,
      avgRating,
      reviewCount: row.reviewCount,
      isPopular: avgRating >= 4.7,
    };
  }

  async getAllStalls(params: FindAllParams) {
    const { rows, total } = await this.stallRepository.findAll(params);
    return { data: rows.map((row) => this.toDto(row)), total };
  }

  async getStallById(id: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.findById(id);
    if (!row) throw new NotFoundError('Warung tidak ditemukan');
    return this.toDto(row);
  }

  async createStall(input: CreateStallInput, ownerId: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.create({ ...input, ownerId });
    if (!row) throw new NotFoundError('Warung gagal dibuat');
    return this.toDto(row);
  }

  async updateStall(
    id: number,
    input: UpdateStallInput,
    user: AuthUser,
  ): Promise<StallResponseDto> {
    if (user.role !== 'admin') {
      const current = await this.stallRepository.findById(id);
      if (!current) throw new NotFoundError('Warung tidak ditemukan');
      if (current.ownerId !== user.id) {
        throw new ForbiddenError('Kamu hanya bisa mengubah warung milikmu sendiri');
      }
    }

    const row = await this.stallRepository.update(id, input);
    if (!row) throw new NotFoundError('Warung tidak ditemukan');
    return this.toDto(row);
  }

  async deleteStall(id: number): Promise<StallResponseDto> {
    const row = await this.stallRepository.remove(id);
    if (!row) throw new NotFoundError('Warung tidak ditemukan');
    return this.toDto(row);
  }
}