import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as bcrypt from 'bcrypt';
import { User, UserRole, UserPublic } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  private users: Map<string, User> = new Map();

  constructor() {
    this.seedAdmin();
  }

  private async seedAdmin() {
    const adminUser: User = {
      id: uuidv4(),
      email: 'admin@hotel.com',
      password: await bcrypt.hash('admin123', 10),
      firstName: 'Admin',
      lastName: 'User',
      role: UserRole.ADMIN,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);
  }

  async create(dto: CreateUserDto): Promise<UserPublic> {
    const existingUser = [...this.users.values()].find((u) => u.email === dto.email);
    if (existingUser) {
      throw new ConflictException(`Email ${dto.email} already exists`);
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user: User = {
      id: uuidv4(),
      email: dto.email,
      password: hashedPassword,
      firstName: dto.firstName,
      lastName: dto.lastName,
      role: dto.role || UserRole.USER,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.set(user.id, user);
    return this.toPublic(user);
  }

  async findByEmail(email: string): Promise<User | null> {
    return [...this.users.values()].find((u) => u.email === email) || null;
  }

  async findById(id: string): Promise<UserPublic> {
    const user = this.users.get(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.toPublic(user);
  }

  async validatePassword(email: string, password: string): Promise<User | null> {
    const user = await this.findByEmail(email);
    if (user && await bcrypt.compare(password, user.password)) {
      return user;
    }
    return null;
  }

  findAll(): UserPublic[] {
    return [...this.users.values()].map((u) => this.toPublic(u));
  }

  private toPublic(user: User): UserPublic {
    const { password, ...publicUser } = user;
    return publicUser;
  }
}