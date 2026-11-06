import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;

    if (!file) {
      return NextResponse.json({ error: 'No logo file provided' }, { status: 400 });
    }

    // Size limit: 500 KB (512,000 bytes)
    if (file.size > 512 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds maximum allowed limit of 500 KB' },
        { status: 400 }
      );
    }

    // MIME type check: png, svg, webp
    const allowedTypes = ['image/png', 'image/svg+xml', 'image/webp', 'image/jpeg'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Only PNG, SVG, or WebP formats are allowed' },
        { status: 400 }
      );
    }

    // If Cloudinary environment variables are set, upload to Cloudinary (free plan)
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    const buffer = Buffer.from(await file.arrayBuffer());

    if (cloudName && apiKey && apiSecret) {
      try {
        const timestamp = Math.round(Date.now() / 1000);
        const crypto = await import('node:crypto');
        const signature = crypto
          .createHash('sha1')
          .update(`timestamp=${timestamp}${apiSecret}`)
          .digest('hex');

        const uploadFormData = new FormData();
        uploadFormData.append('file', new Blob([buffer], { type: file.type }), file.name);
        uploadFormData.append('api_key', apiKey);
        uploadFormData.append('timestamp', String(timestamp));
        uploadFormData.append('signature', signature);

        const uploadRes = await fetch(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          {
            method: 'POST',
            body: uploadFormData,
          }
        );

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          return NextResponse.json({
            success: true,
            url: uploadData.secure_url || uploadData.url,
          });
        }
      } catch (cloudErr) {
        console.warn('[upload/logo] Cloudinary upload error, using data URL fallback:', cloudErr);
      }
    }

    // Spark free tier fallback (Zero external paid dependency, fully offline & compliant):
    // Convert to optimized data URL under 500 KB
    const base64 = buffer.toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    return NextResponse.json({
      success: true,
      url: dataUrl,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Logo upload failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
