import { supabase } from './supabase';

export const uploadProfilePhoto = async (userId: string, photoUri: string, photoIndex: number) => {
  try {
    // Generate unique filename
    const fileExt = photoUri.split('.').pop();
    const fileName = `${userId}/${Date.now()}_${photoIndex}.${fileExt}`;

    // Convert image to blob
    const response = await fetch(photoUri);
    const blob = await response.blob();

    // Upload blob directly to Supabase Storage
    const { data, error } = await supabase.storage.from('profile-photos').upload(fileName, blob, {
      contentType: `image/${fileExt}`,
      upsert: false,
    });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('profile-photos').getPublicUrl(fileName);

    return { url: publicUrl, path: data.path };
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

export const deleteProfilePhoto = async (photoPath: string) => {
  try {
    const { error } = await supabase.storage.from('profile-photos').remove([photoPath]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting photo:', error);
    throw error;
  }
};

export const getProfilePhotos = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('photos')
      .select('*')
      .eq('user_id', userId)
      .order('order_index', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching photos:', error);
    throw error;
  }
};

// Fuck Me.
