import { supabase } from './supabase';
import { decode } from 'base64-arraybuffer';

export const uploadProfilePhoto = async (
  userId: string,
  photoUri: string,
  photoIndex: number
) => {
  try {
    // Generate unique filename
    const fileExt = photoUri.split('.').pop();
    const fileName = `${userId}/${Date.now()}_${photoIndex}.${fileExt}`;
    
    // Convert image to base64
    const response = await fetch(photoUri);
    const blob = await response.blob();
    
    // Create a FileReader to convert blob to base64
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    
    return new Promise((resolve, reject) => {
      reader.onloadend = async () => {
        try {
          const base64 = reader.result as string;
          const base64Data = base64.split(',')[1];
          
          // Upload to Supabase Storage
          const { data, error } = await supabase.storage
            .from('profile-photos')
            .upload(fileName, decode(base64Data), {
              contentType: `image/${fileExt}`,
              upsert: false
            });
          
          if (error) throw error;
          
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from('profile-photos')
            .getPublicUrl(fileName);
          
          resolve({ url: publicUrl, path: data.path });
        } catch (error) {
          reject(error);
        }
      };
    });
  } catch (error) {
    console.error('Error uploading photo:', error);
    throw error;
  }
};

export const deleteProfilePhoto = async (photoPath: string) => {
  try {
    const { error } = await supabase.storage
      .from('profile-photos')
      .remove([photoPath]);
    
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