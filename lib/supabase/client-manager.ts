// lib/supabase/client-manager.ts
// Centralized Supabase client manager to prevent connection pooling issues

import { createServiceRoleClient } from './admin';
import type { SupabaseClient } from '@supabase/supabase-js';

class SupabaseClientManager {
  private static instance: SupabaseClientManager;
  private serviceRoleClient: SupabaseClient | null = null;
  private clientCreatedAt: number = 0;
  private readonly CLIENT_TTL = 5 * 60 * 1000; // 5 minutes

  private constructor() {}

  public static getInstance(): SupabaseClientManager {
    if (!SupabaseClientManager.instance) {
      SupabaseClientManager.instance = new SupabaseClientManager();
    }
    return SupabaseClientManager.instance;
  }

  public getServiceRoleClient(): SupabaseClient {
    const now = Date.now();
    
    // Create new client if none exists or if the existing one is too old
    if (!this.serviceRoleClient || (now - this.clientCreatedAt) > this.CLIENT_TTL) {
      console.log('[Supabase Manager] Creating new service role client');
      this.serviceRoleClient = createServiceRoleClient();
      this.clientCreatedAt = now;
    }
    
    return this.serviceRoleClient;
  }

  public refreshClient(): SupabaseClient {
    console.log('[Supabase Manager] Forcing client refresh');
    this.serviceRoleClient = null;
    return this.getServiceRoleClient();
  }

  public async executeWithRetry<T>(
    operation: (client: SupabaseClient) => Promise<T>,
    maxRetries: number = 3,
    baseDelay: number = 300
  ): Promise<T> {
    let lastError: Error;
    
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        const client = this.getServiceRoleClient();
        const result = await operation(client);
        
        if (attempt > 0) {
          console.log(`[Supabase Manager] Operation succeeded on attempt ${attempt + 1}`);
        }
        
        return result;
      } catch (error: any) {
        lastError = error;
        console.warn(`[Supabase Manager] Operation failed on attempt ${attempt + 1}:`, error.message);
        
        if (attempt < maxRetries - 1) {
          const delay = baseDelay * Math.pow(2, attempt); // Exponential backoff
          console.log(`[Supabase Manager] Retrying in ${delay}ms...`);
          await new Promise(resolve => setTimeout(resolve, delay));
          
          // Refresh client on retry to ensure we're not using a stale connection
          if (attempt > 0) {
            this.refreshClient();
          }
        }
      }
    }
    
    throw lastError!;
  }
}

// Export singleton instance
export const supabaseManager = SupabaseClientManager.getInstance();

// Convenience function for getting the client
export function getManagedSupabaseClient(): SupabaseClient {
  return supabaseManager.getServiceRoleClient();
}

// Convenience function for executing operations with retry
export async function executeSupabaseOperation<T>(
  operation: (client: SupabaseClient) => Promise<T>,
  maxRetries?: number,
  baseDelay?: number
): Promise<T> {
  return supabaseManager.executeWithRetry(operation, maxRetries, baseDelay);
}