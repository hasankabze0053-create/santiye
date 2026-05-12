const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Uploading image...');
  const imagePath = 'C:/Users/koray/.gemini/antigravity/brain/a9a6f581-66ce-482f-a7b7-6a344b8fdb6b/modern_salon_light_1778624711697.png';
  const fileBuffer = fs.readFileSync(imagePath);
  const storagePath = `modern_salon_${Date.now()}.png`;
  
  // Imgur URL we got earlier
  const imgurUrl = 'https://i.imgur.com/HmoPx5P.jpeg';
  
  // Try uploading to Supabase construction-documents
  let finalUrl = imgurUrl;
  const { data, error } = await supabase.storage
    .from('construction-documents')
    .upload(storagePath, fileBuffer, {
      contentType: 'image/png',
      upsert: false
    });

  if (error) {
    console.error('Upload Error, using Imgur URL:', error);
  } else {
    const { data: publicUrlData } = supabase.storage
      .from('construction-documents')
      .getPublicUrl(storagePath);
    finalUrl = publicUrlData.publicUrl;
    console.log(`Uploaded to Supabase! URL: ${finalUrl}`);
  }

  // Update renovation_showcase
  console.log('Fetching showcase rows...');
  const { data: rows, error: fetchError } = await supabase
    .from('renovation_showcase')
    .select('*');

  if (fetchError) {
    console.error('Fetch Error:', fetchError);
    return;
  }

  const targetRow = rows.find(r => r.title && r.title.includes('Modern Salon'));
  
  if (targetRow) {
      console.log('Updating row...', targetRow.id);
      
      const { error: updateError, data: resData } = await supabase
        .from('renovation_showcase')
        .update({
            image_url: finalUrl,
            tag_color: '#B8820F',
            button_color: '#B8820F'
        })
        .eq('id', targetRow.id);
        
      if (updateError) {
          console.error('Update Error:', updateError);
      } else {
          console.log('Successfully updated the showcase item!');
          
          // Verify
          const { data: verifyData } = await supabase.from('renovation_showcase').select('*').eq('id', targetRow.id);
          console.log('Verified state:', verifyData[0].image_url, verifyData[0].tag_color);
      }
  } else {
      console.log('Row not found.');
  }
}

run();
