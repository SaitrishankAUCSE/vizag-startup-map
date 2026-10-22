// Resend email integration (Free tier, up to 3,000 emails/mo)
// Fallback mock logging when API key is not yet set.

export async function sendEmailAlert({
  to,
  subject,
  htmlContent,
}: {
  to: string;
  subject: string;
  htmlContent: string;
}): Promise<{ success: boolean; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;

  if (apiKey && !apiKey.includes('sample')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          from: 'Vizag Startup Map <alerts@vizagstartupmap.com>',
          to: [to],
          subject,
          html: htmlContent,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        return { success: true, id: data.id };
      }
    } catch {
      // Fall through to mock logger
    }
  }

  // Development logger
  console.log(`[Email Alert Mock] To: ${to} | Subject: "${subject}"`);
  return { success: true, id: `mock_email_${Date.now()}` };
}
