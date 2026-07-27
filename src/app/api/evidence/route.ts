import { createHash, randomUUID } from "node:crypto";
import { createClient as createAdminClient } from "@supabase/supabase-js";
import sharp from "sharp";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 5_000_000;
const ALLOWED = new Set(["image/jpeg", "image/png", "image/webp"]);

export async function POST(request: Request) {
  const supabase = await createClient();
  const secret = process.env.SUPABASE_SECRET_KEY;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabase || !secret || !url) {
    return Response.json({ error: "Evidence upload is not configured." }, { status: 503 });
  }

  const { data } = await supabase.auth.getClaims();
  const userId = data?.claims?.sub;
  if (!userId) return Response.json({ error: "Sign in required." }, { status: 401 });

  const admin = createAdminClient(url, secret, { auth: { persistSession: false } });
  const { data: profile } = await admin
    .from("profiles")
    .select("email")
    .eq("user_id", userId)
    .maybeSingle();
  const { data: invite } = profile
    ? await admin.from("pilot_invites").select("email").eq("email", profile.email).maybeSingle()
    : { data: null };
  if (!invite) return Response.json({ error: "This prototype is invite-only." }, { status: 403 });

  const form = await request.formData();
  const file = form.get("evidence");
  if (!(file instanceof File) || file.size > MAX_BYTES || !ALLOWED.has(file.type)) {
    return Response.json({ error: "Use a JPEG, PNG, or WebP image up to 5 MB." }, { status: 400 });
  }

  try {
    const encoded = await sharp(await file.arrayBuffer(), { failOn: "warning" })
      .rotate()
      .resize({ width: 2000, height: 2000, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 82 })
      .toBuffer();
    const path = `${userId}/${randomUUID()}.webp`;
    const { error } = await admin.storage.from("evidence").upload(path, encoded, {
      contentType: "image/webp",
      upsert: false,
    });
    if (error) throw error;
    return Response.json({
      path,
      bytes: encoded.byteLength,
      sha256: createHash("sha256").update(encoded).digest("hex"),
    });
  } catch {
    return Response.json({ error: "The image could not be safely processed." }, { status: 422 });
  }
}
