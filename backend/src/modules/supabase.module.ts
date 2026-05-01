// supabase.module.ts
import { Global, Module } from '@nestjs/common';
import { SupabaseService } from './supabase.service';
import { DetectionLogsModule } from './detection-logs/detection-logs.module';

@Global() // Makes it available everywhere without re-importing
@Module({
  providers: [SupabaseService],
  exports: [SupabaseService],
  imports: [DetectionLogsModule],
})
export class SupabaseModule {}
