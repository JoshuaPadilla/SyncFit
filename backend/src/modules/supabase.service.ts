// supabase.service.ts
import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, SupabaseClient } from '@supabase/supabase-js';

@Injectable()
export class SupabaseService implements OnModuleInit {
  private supabase!: SupabaseClient;

  constructor(private readonly configService: ConfigService) {}

  onModuleInit() {
    // This runs exactly once when the app starts
    this.supabase = createClient(
      this.configService.get<string>('supabase.url')!,
      this.configService.get<string>('supabase.serviceRole')!,
    );
    console.log('Supabase client initialized');
  }

  get client() {
    return this.supabase;
  }
}
