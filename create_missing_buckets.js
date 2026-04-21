import { supabase } from '../lib/supabase';

async function createBuckets() {
  try {
    // Create renovation-images bucket (public)
    const { data: renData, error: renError } = await supabase.storage.createBucket('renovation-images', {
      public: true,
      allowedMimeTypes: ['image/*']
    });
    if (renError && renError.message !== 'Bucket already exists') throw renError;
    console.log('renovation-images bucket created or exists');

    // Create transformation-images bucket (public)
    const { data: transData, error: transError } = await supabase.storage.createBucket('transformation-images', {
      public: true,
      allowedMimeTypes: ['image/*']
    });
    if (transError && transError.message !== 'Bucket already exists') throw transError;
    console.log('transformation-images bucket created or exists');
  } catch (e) {
    console.error('Bucket creation error:', e);
  }
}

createBuckets();
