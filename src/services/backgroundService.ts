import { Bolt Database } from '../lib/supabase';

export interface Background {
  id: string;
  user_id: string;
  desktop_light_bg: string;
  desktop_dark_bg: string;
  mobile_light_bg: string;
  mobile_dark_bg: string;
  created_at: string;
  updated_at: string;
}

export interface BackgroundInput {
  desktop_light_bg?: string;
  desktop_dark_bg?: string;
  mobile_light_bg?: string;
  mobile_dark_bg?: string;
}

export async function getBackgroundByUserId(userId: string) {
  const { data, error } = await Bolt Database
    .from('backgrounds')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle();

  if (error) {
    console.error('Error fetching background:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function createBackground(userId: string, backgroundData: BackgroundInput) {
  const { data, error } = await Bolt Database
    .from('backgrounds')
    .insert({
      user_id: userId,
      ...backgroundData,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating background:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function updateBackground(backgroundId: string, backgroundData: BackgroundInput) {
  const { data, error } = await Bolt Database
    .from('backgrounds')
    .update(backgroundData)
    .eq('id', backgroundId)
    .select()
    .single();

  if (error) {
    console.error('Error updating background:', error);
    return { data: null, error };
  }

  return { data, error: null };
}

export async function getOrCreateBackground(userId: string) {
  const { data: existingBackground, error: fetchError } = await getBackgroundByUserId(userId);

  if (fetchError) {
    return { data: null, error: fetchError };
  }

  if (existingBackground) {
    return { data: existingBackground, error: null };
  }

  return await createBackground(userId, {
    desktop_light_bg: '',
    desktop_dark_bg: '',
    mobile_light_bg: '',
    mobile_dark_bg: '',
  });
}
