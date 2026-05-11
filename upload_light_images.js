const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const artifactDir = 'C:\\Users\\koray\\.gemini\\antigravity\\brain\\a9a6f581-66ce-482f-a7b7-6a344b8fdb6b';

const images = [
  { id: 'highlight_card_urban', filename: 'urban_light_v2_1778459477323.png' },
  { id: 'highlight_card_renovation', filename: 'renovation_light_v2_1778459489971.png' },
  { id: 'highlight_card_market', filename: 'market_light_v2_1778459507864.png' },
  { id: 'highlight_card_law', filename: 'law_light_v2_1778459520958.png' }
];

async function run() {
  for (const img of images) {
    const fullPath = path.join(artifactDir, img.filename);
    console.log(`Uploading ${img.filename}...`);
    
    try {
      const fileBuffer = fs.readFileSync(fullPath);
      // FormData is not strictly needed for node.js upload using SDK if we pass a Buffer directly,
      // but let's just pass the buffer with proper content type.
      
      const storagePath = `highlight_light_${Date.now()}_${img.filename}`;
      
      const { data, error } = await supabase.storage
        .from('construction-documents')
        .upload(storagePath, fileBuffer, {
          contentType: 'image/png',
          upsert: false
        });

      if (error) {
        console.error('Upload Error:', error);
        continue;
      }

      const { data: publicUrlData } = supabase.storage
        .from('construction-documents')
        .getPublicUrl(storagePath);
        
      const publicUrl = publicUrlData.publicUrl;
      console.log(`Uploaded! URL: ${publicUrl}`);

      // Now fetch existing metadata
      const { data: currentData, error: fetchError } = await supabase
        .from('screen_section_config')
        .select('metadata')
        .eq('id', img.id)
        .single();
        
      if (fetchError) {
        console.error('Fetch Error:', fetchError);
        continue;
      }

      const updatedMetadata = { ...currentData.metadata, image_light: publicUrl };

      // Update the DB
      const { error: updateError } = await supabase
        .from('screen_section_config')
        .update({ metadata: updatedMetadata })
        .eq('id', img.id);

      if (updateError) {
        console.error('Update Error:', updateError);
      } else {
        console.log(`Database updated for ${img.id}`);
      }

    } catch (e) {
      console.error('Error processing', img.id, e);
    }
  }
  console.log('All done!');
}

run();
