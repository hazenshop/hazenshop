import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

// Load .env.local
const envFile = fs.readFileSync(path.join(process.cwd(), '.env.local'), 'utf-8');
const env = {};
envFile.split('\n').forEach(line => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length) {
    env[key.trim()] = vals.join('=').trim();
  }
});

const cloudName = env.CLOUDINARY_CLOUD_NAME;
const apiKey = env.CLOUDINARY_API_KEY;
const apiSecret = env.CLOUDINARY_API_SECRET;

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!cloudName || !apiKey || !apiSecret) {
  console.error("Missing Cloudinary credentials in .env.local");
  process.exit(1);
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

async function uploadBufferToCloudinary(buffer, fileName) {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const cleanPublicId = fileName.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9_-]/g, "_");
  const strToSign = `public_id=${cleanPublicId}&timestamp=${timestamp}${apiSecret}`;
  const signature = crypto.createHash("sha1").update(strToSign).digest("hex");

  const base64File = `data:image/webp;base64,${buffer.toString("base64")}`;
  const form = new URLSearchParams();
  form.append("file", base64File);
  form.append("api_key", apiKey);
  form.append("timestamp", timestamp.toString());
  form.append("public_id", cleanPublicId);
  form.append("signature", signature);

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: form,
  });

  const data = await res.json();
  if (data.secure_url) {
    return data.secure_url;
  }
  throw new Error(`Cloudinary upload failed: ${JSON.stringify(data)}`);
}

async function migrate() {
  console.log("=== Starting Supabase to Cloudinary Image Migration ===");
  console.log(`Cloudinary Cloud: ${cloudName}, API Key: ${apiKey}`);

  const urlMap = new Map(); // supabaseUrl -> cloudinaryUrl

  // 1. Gather all unique Supabase image URLs
  const urlsToMigrate = new Set();

  const dataFiles = ['products.json', 'media.json', 'categories.json', 'settings.json', 'orders.json'];
  for (const f of dataFiles) {
    const fPath = path.join(process.cwd(), '.data', f);
    if (fs.existsSync(fPath)) {
      const content = fs.readFileSync(fPath, 'utf-8');
      const matches = content.match(/https:\/\/[^"'\s]+supabase\.co[^"'\s]+/g) || [];
      for (const m of matches) {
        urlsToMigrate.add(m);
      }
    }
  }

  // Also query Supabase tables directly
  if (supabase) {
    console.log("Querying Supabase database tables...");
    const { data: dbProducts } = await supabase.from('products').select('images');
    if (dbProducts) {
      for (const p of dbProducts) {
        if (Array.isArray(p.images)) {
          for (const img of p.images) {
            if (typeof img === 'string' && img.includes('supabase.co')) {
              urlsToMigrate.add(img);
            }
          }
        }
      }
    }

    const { data: dbMedia } = await supabase.from('media_items').select('url');
    if (dbMedia) {
      for (const m of dbMedia) {
        if (m.url && m.url.includes('supabase.co')) {
          urlsToMigrate.add(m.url);
        }
      }
    }

    const { data: dbCategories } = await supabase.from('categories').select('image, banner_image');
    if (dbCategories) {
      for (const c of dbCategories) {
        if (c.image && c.image.includes('supabase.co')) urlsToMigrate.add(c.image);
        if (c.banner_image && c.banner_image.includes('supabase.co')) urlsToMigrate.add(c.banner_image);
      }
    }
  }

  console.log(`Found ${urlsToMigrate.size} unique Supabase image URLs to migrate.`);

  let successCount = 0;
  let failCount = 0;

  for (const oldUrl of urlsToMigrate) {
    try {
      console.log(`\nMigrating: ${oldUrl}`);
      const res = await fetch(oldUrl);
      if (!res.ok) {
        console.error(`  Failed to download (${res.status} ${res.statusText})`);
        failCount++;
        continue;
      }
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Extract a filename
      const urlObj = new URL(oldUrl);
      const rawName = path.basename(urlObj.pathname);

      const newUrl = await uploadBufferToCloudinary(buffer, rawName);
      console.log(`  -> Cloudinary: ${newUrl}`);
      urlMap.set(oldUrl, newUrl);
      successCount++;
    } catch (err) {
      console.error(`  Error uploading to Cloudinary:`, err.message);
      failCount++;
    }
  }

  console.log(`\nMigration complete: ${successCount} succeeded, ${failCount} failed.`);

  if (urlMap.size === 0) {
    console.log("No URLs migrated. Exiting.");
    return;
  }

  // 2. Update .data files
  console.log("\nUpdating local .data/ JSON files...");
  for (const f of dataFiles) {
    const fPath = path.join(process.cwd(), '.data', f);
    if (fs.existsSync(fPath)) {
      let content = fs.readFileSync(fPath, 'utf-8');
      let replacedInFile = 0;
      for (const [oldUrl, newUrl] of urlMap.entries()) {
        if (content.includes(oldUrl)) {
          content = content.replaceAll(oldUrl, newUrl);
          replacedInFile++;
        }
      }
      if (replacedInFile > 0) {
        fs.writeFileSync(fPath, content, 'utf-8');
        console.log(`Updated ${f} (${replacedInFile} URL references replaced)`);
      }
    }
  }

  // 3. Update Supabase tables
  if (supabase) {
    console.log("\nUpdating Supabase database tables...");

    // Products
    const { data: dbProducts } = await supabase.from('products').select('id, images');
    if (dbProducts) {
      for (const p of dbProducts) {
        if (Array.isArray(p.images)) {
          let changed = false;
          const updatedImages = p.images.map(img => {
            if (urlMap.has(img)) {
              changed = true;
              return urlMap.get(img);
            }
            return img;
          });
          if (changed) {
            await supabase.from('products').update({ images: updatedImages }).eq('id', p.id);
            console.log(`Updated Supabase product ID: ${p.id}`);
          }
        }
      }
    }

    // Media Items
    const { data: dbMedia } = await supabase.from('media_items').select('id, url');
    if (dbMedia) {
      for (const m of dbMedia) {
        if (urlMap.has(m.url)) {
          const newUrl = urlMap.get(m.url);
          await supabase.from('media_items').update({ url: newUrl }).eq('id', m.id);
          console.log(`Updated Supabase media item ID: ${m.id}`);
        }
      }
    }

    // Categories
    const { data: dbCategories } = await supabase.from('categories').select('id, image, banner_image');
    if (dbCategories) {
      for (const c of dbCategories) {
        const updateObj = {};
        if (c.image && urlMap.has(c.image)) {
          updateObj.image = urlMap.get(c.image);
        }
        if (c.banner_image && urlMap.has(c.banner_image)) {
          updateObj.banner_image = urlMap.get(c.banner_image);
        }
        if (Object.keys(updateObj).length > 0) {
          await supabase.from('categories').update(updateObj).eq('id', c.id);
          console.log(`Updated Supabase category ID: ${c.id}`);
        }
      }
    }

    // Site settings
    try {
      const { data: dbSettings } = await supabase.from('site_settings').select('*');
      if (dbSettings && dbSettings.length > 0) {
        for (const s of dbSettings) {
          let changed = false;
          let newSetting = { ...s };
          for (const key of ['hero_poster', 'announcement_banner', 'logo']) {
            if (newSetting[key] && urlMap.has(newSetting[key])) {
              newSetting[key] = urlMap.get(newSetting[key]);
              changed = true;
            }
          }
          if (changed) {
            await supabase.from('site_settings').update(newSetting).eq('id', s.id);
            console.log(`Updated Supabase site_settings ID: ${s.id}`);
          }
        }
      }
    } catch (e) {
      // site_settings table check
    }
  }

  console.log("\n=== ALL MIGRATIONS COMPLETED SUCCESSFULLY! ===");
}

migrate().catch(console.error);
