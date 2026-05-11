const buckets = ['public', 'images', 'app-assets', 'assets', 'avatars', 'profiles', 'market-images', 'construction-documents', 'transformation-images', 'renovation-images'];
Promise.all(buckets.map(b => 
  fetch(`https://nxsjokupnsaeemtnlexf.supabase.co/storage/v1/object/public/${b}/test.jpg`)
    .then(r => console.log(b, r.status))
    .catch(e => console.log(b, 'error'))
)).then(() => console.log('done'));
