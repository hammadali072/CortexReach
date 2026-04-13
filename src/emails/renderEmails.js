// src/emails/renderEmails.js
// Pure JS — no JSX — safe to import from Node.js / Vercel serverless

/**
 * Builds the email HTML string for a given campaign type.
 * Accepts an optional sendId to embed an open-tracking pixel.
 */
export const renderCampaignEmail = async (campaignType, project, lead, sendId = null) => {
  const firstName = lead.first_name || lead.firstName ||
    lead.name?.split(' ')[0] || 'there';
  const company = lead.company_name || lead.company || 'your company';
  const projName = project.name || 'our platform';
  const benefit = project.description || 'streamline your workflow';
  const website = project.website || '#';
  const features = Array.isArray(project.features)
    ? project.features
    : (project.features?.split(',').map(f => f.trim()) ?? []);
  const feat1 = features[0] || 'core efficiency';
  const feat2 = features[1] || 'seamless integration';

  const unsubscribeUrl = `https://durzaar.com/unsubscribe?lead=${lead.id}`;

  // Build tracking pixel URL — only injected when a real sendId exists
  const trackingPixel = sendId
    ? `<img src="https://durzaar.com/api/track-open?sendId=${sendId}" width="1" height="1" style="display:block;width:1px;height:1px;border:0;opacity:0;" alt="" />`
    : '';

  // Subject + opening line vary by campaign type
  const typeConfig = {
    brand_introduction: {
      heading: `Introducing ${projName}`,
      intro: `I wanted to introduce you to ${projName} — built specifically for companies like ${company}.`,
      cta: 'Learn More',
    },
    product_pitch: {
      heading: `${projName} can help ${company}`,
      intro: `I'm reaching out because ${projName} helps teams ${benefit}.`,
      cta: 'See How It Works',
    },
    problem_solution: {
      heading: `A solution for ${company}`,
      intro: `Many teams in your space struggle with this exact problem. ${projName} was built to fix it.`,
      cta: 'See the Solution',
    },
    demo_request: {
      heading: `Quick demo for ${company}?`,
      intro: `I'd love to show you how ${projName} can help your team — would a 15-min call work?`,
      cta: 'Book a Demo',
    },
    follow_up: {
      heading: `Following up, ${firstName}`,
      intro: `I wanted to follow up on my previous email about ${projName}. Did you get a chance to take a look?`,
      cta: 'Take Another Look',
    },
    partnership: {
      heading: `Partnership opportunity`,
      intro: `I believe there's a strong synergy between ${company} and ${projName}. Would love to explore a partnership.`,
      cta: 'Explore Partnership',
    },
  };

  const cfg = typeConfig[campaignType] || typeConfig.brand_introduction;

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${cfg.heading}</title>
</head>
<body style="margin:0;padding:0;background:#f8fafc;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f8fafc;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.1);">
          
          <!-- Header -->
          <tr>
            <td style="background:#4f46e5;padding:32px 40px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">${projName}</h1>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <h2 style="margin:0 0 16px;color:#1e293b;font-size:22px;font-weight:700;">
                Hi ${firstName}, ${cfg.heading}
              </h2>
              <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
                ${cfg.intro}
              </p>
              <p style="margin:0 0 16px;color:#475569;font-size:15px;line-height:1.6;">
                Here's what makes ${projName} different:
              </p>
              <ul style="margin:0 0 24px;padding-left:20px;color:#475569;font-size:15px;line-height:1.8;">
                <li>${feat1}</li>
                <li>${feat2}</li>
                <li>${benefit}</li>
              </ul>
              <a href="${website}"
                 style="display:inline-block;background:#4f46e5;color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:700;font-size:15px;">
                ${cfg.cta}
              </a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;">
              <hr style="border:none;border-top:1px solid #e2e8f0;" />
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.5;">
                You're receiving this because your company was identified as a potential fit.<br/>
                <a href="${unsubscribeUrl}" style="color:#94a3b8;">Unsubscribe</a>
              </p>
            </td>
          </tr>

          <!-- Tracking pixel (1x1 invisible image) -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">
              ${trackingPixel}
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return html;
};