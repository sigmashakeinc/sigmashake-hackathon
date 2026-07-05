import { getSupabaseServerClient } from "@/services/supabase";
import { config } from "@/services/config";
import type { PlatformSetupInput, OwnerSetupInput } from "./types";

export function createSetupService() {
  function client() {
    return getSupabaseServerClient();
  }

  async function isPlatformInitialised(): Promise<boolean> {
    try {
      const { data } = await client().rpc("is_platform_initialised");
      return data === true;
    } catch {
      return false;
    }
  }

  function validateSetupKey(key: string): boolean {
    const validKey = process.env.PLATFORM_SETUP_KEY;
    if (!validKey) return false;
    return key === validKey;
  }

  async function initialisePlatform(
    platform: PlatformSetupInput,
    owner: OwnerSetupInput,
  ): Promise<{
    success: boolean;
    error?: string;
    userId?: string;
  }> {
    try {
      const { data: authData, error: authError } = await client().auth.signUp({
        email: owner.email,
        password: owner.password,
        options: {
          data: {
            username: owner.username,
            display_name: owner.displayName,
          },
        },
      });

      if (authError || !authData.user) {
        return { success: false, error: authError?.message ?? "Failed to create owner account." };
      }

      const userId = authData.user.id;

      const { error: profileError } = await client().from("profiles").upsert({
        id: userId,
        display_name: owner.displayName,
        username: owner.username,
        email: owner.email,
        timezone: platform.timezone,
        onboarded: true,
      } as never);

      if (profileError) {
        await client().auth.admin.deleteUser(userId);
        return { success: false, error: profileError.message };
      }

      const { error: configError } = await client().from("platform_config").insert({
        owner_id: userId,
        platform_name: platform.platformName,
        description: platform.description ?? null,
        default_locale: platform.defaultLocale,
        version: config.app.version,
        schema_version: 1,
        initialized: true,
        initialised_at: new Date().toISOString(),
      } as never);

      if (configError) {
        await client().auth.admin.deleteUser(userId);
        await client().from("profiles").delete().eq("id", userId);
        return { success: false, error: configError.message };
      }

      const { error: prefError } = await client().from("notification_preferences").insert({
        user_id: userId,
      } as never);

      if (prefError) {
        await client().auth.admin.deleteUser(userId);
        await client().from("profiles").delete().eq("id", userId);
        await client().from("platform_config").delete().eq("owner_id", userId);
        return { success: false, error: prefError.message };
      }

      return { success: true, userId };
    } catch (err) {
      return {
        success: false,
        error: err instanceof Error ? err.message : "Unexpected error during platform initialisation.",
      };
    }
  }

  return { isPlatformInitialised, validateSetupKey, initialisePlatform };
}
