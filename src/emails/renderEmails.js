// src/emails/renderEmails.js
// Pure JS — no JSX — safe to import from Node.js / Vercel serverless

/**
 * Darken a hex color by a given percentage (0–1).
 * Used by bold_gradient template to compute header gradient stops.
 */
function darkenHex(hex, amount = 0.25) {
  const h = hex.replace('#', '');
  const r = Math.max(0, Math.round(parseInt(h.slice(0, 2), 16) * (1 - amount)));
  const g = Math.max(0, Math.round(parseInt(h.slice(2, 4), 16) * (1 - amount)));
  const b = Math.max(0, Math.round(parseInt(h.slice(4, 6), 16) * (1 - amount)));
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

// ─── Layout Renderers ────────────────────────────────────────────────────────

/**
 * modern_dark — Dark slate header, white body, accent CTA, subtle footer.
 */
function renderModernDark({ projName, firstName, company, cfg, feat1, feat2, benefit, website, unsubscribeUrl, trackingPixel, accent }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${cfg.heading}</title>
</head>
<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,Helvetica,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0f172a;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">

          <!-- Header -->
          <tr>
            <td style="background:#1e293b;padding:36px 40px;border-bottom:3px solid ${accent};">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td>
                    <span style="display:inline-block;background:${accent};color:#ffffff;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;padding:4px 12px;border-radius:4px;margin-bottom:14px;">${projName}</span>
                    <h1 style="margin:0;color:#f1f5f9;font-size:26px;font-weight:700;line-height:1.3;">${cfg.heading}</h1>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;background:#ffffff;">
              <p style="margin:0 0 20px;color:#334155;font-size:16px;line-height:1.7;">Hi ${firstName},</p>
              <p style="margin:0 0 20px;color:#475569;font-size:15px;line-height:1.7;">${cfg.intro}</p>
              <p style="margin:0 0 16px;color:#334155;font-size:15px;font-weight:700;">Here's what sets us apart:</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;border-left:3px solid ${accent};border-radius:0 6px 6px 0;margin-bottom:8px;display:block;">
                    <span style="color:#334155;font-size:14px;">✦ ${feat1}</span>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;border-left:3px solid ${accent};border-radius:0 6px 6px 0;">
                    <span style="color:#334155;font-size:14px;">✦ ${feat2}</span>
                  </td>
                </tr>
                <tr><td style="height:8px;"></td></tr>
                <tr>
                  <td style="padding:12px 16px;background:#f8fafc;border-left:3px solid ${accent};border-radius:0 6px 6px 0;">
                    <span style="color:#334155;font-size:14px;">✦ ${benefit}</span>
                  </td>
                </tr>
              </table>
              <a href="${website}" style="display:inline-block;background:${accent};color:#ffffff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:700;font-size:15px;letter-spacing:0.02em;">${cfg.cta} →</a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e2e8f0;" /></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#f8fafc;">
              <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6;">
                You received this email because ${company} was identified as a potential fit for ${projName}.<br/>
                <a href="${unsubscribeUrl}" style="color:${accent};text-decoration:none;">Unsubscribe</a> · <a href="${website}" style="color:${accent};text-decoration:none;">Visit Website</a>
              </p>
            </td>
          </tr>

          <!-- Tracking pixel -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">${trackingPixel}</td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * clean_minimal — White header with thin accent top border, light gray body bg, minimal typography.
 */
function renderCleanMinimal({ projName, firstName, company, cfg, feat1, feat2, benefit, website, unsubscribeUrl, trackingPixel, accent }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${cfg.heading}</title>
</head>
<body style="margin:0;padding:0;background:#f1f5f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f1f5f9;padding:48px 0;">
    <tr>
      <td align="center">
        <table width="580" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.06);">

          <!-- Accent top border -->
          <tr>
            <td style="background:${accent};height:4px;font-size:0;line-height:0;">&nbsp;</td>
          </tr>

          <!-- Header -->
          <tr>
            <td style="background:#ffffff;padding:32px 48px 24px;">
              <p style="margin:0;color:${accent};font-size:12px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;">${projName}</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:0 48px 40px;">
              <h1 style="margin:0 0 20px;color:#0f172a;font-size:24px;font-weight:700;line-height:1.35;">Hi ${firstName}, ${cfg.heading}</h1>
              <p style="margin:0 0 18px;color:#64748b;font-size:15px;line-height:1.75;">${cfg.intro}</p>
              <p style="margin:0 0 12px;color:#334155;font-size:14px;font-weight:600;text-transform:uppercase;letter-spacing:0.06em;">What you get:</p>
              <ul style="margin:0 0 28px;padding-left:18px;color:#64748b;font-size:14px;line-height:2;">
                <li>${feat1}</li>
                <li>${feat2}</li>
                <li>${benefit}</li>
              </ul>
              <a href="${website}" style="display:inline-block;background:${accent};color:#ffffff;padding:12px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">${cfg.cta}</a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 48px;"><hr style="border:none;border-top:1px solid #f1f5f9;" /></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 48px 28px;">
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.6;">
                Sent to ${company} · <a href="${unsubscribeUrl}" style="color:#94a3b8;">Unsubscribe</a>
              </p>
            </td>
          </tr>

          <!-- Tracking pixel -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">${trackingPixel}</td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * bold_gradient — Gradient header from accent to darker shade, large bold headline, prominent CTA.
 */
function renderBoldGradient({ projName, firstName, company, cfg, feat1, feat2, benefit, website, unsubscribeUrl, trackingPixel, accent }) {
  const accentDark = darkenHex(accent, 0.3);
  return `<!DOCTYPE html>
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
        <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.08);">

          <!-- Gradient Header -->
          <tr>
            <td style="background:linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%);padding:48px 40px;text-align:center;">
              <p style="margin:0 0 12px;color:rgba(255,255,255,0.75);font-size:11px;font-weight:700;letter-spacing:0.2em;text-transform:uppercase;">${projName}</p>
              <h1 style="margin:0;color:#ffffff;font-size:32px;font-weight:800;line-height:1.25;letter-spacing:-0.02em;">${cfg.heading}</h1>
              <p style="margin:16px 0 0;color:rgba(255,255,255,0.85);font-size:15px;line-height:1.6;">For ${company} — a personal message from our team.</p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:48px 40px;">
              <p style="margin:0 0 20px;color:#334155;font-size:16px;line-height:1.7;">Hi ${firstName},</p>
              <p style="margin:0 0 24px;color:#475569;font-size:15px;line-height:1.7;">${cfg.intro}</p>

              <!-- Feature pills -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:32px;">
                <tr>
                  <td width="33%" style="text-align:center;padding:16px 8px;">
                    <div style="background:#f8fafc;border-radius:12px;padding:16px 12px;">
                      <p style="margin:0 0 6px;font-size:18px;">⚡</p>
                      <p style="margin:0;color:#334155;font-size:12px;font-weight:700;line-height:1.4;">${feat1}</p>
                    </div>
                  </td>
                  <td width="33%" style="text-align:center;padding:16px 8px;">
                    <div style="background:#f8fafc;border-radius:12px;padding:16px 12px;">
                      <p style="margin:0 0 6px;font-size:18px;">🔗</p>
                      <p style="margin:0;color:#334155;font-size:12px;font-weight:700;line-height:1.4;">${feat2}</p>
                    </div>
                  </td>
                  <td width="33%" style="text-align:center;padding:16px 8px;">
                    <div style="background:#f8fafc;border-radius:12px;padding:16px 12px;">
                      <p style="margin:0 0 6px;font-size:18px;">🚀</p>
                      <p style="margin:0;color:#334155;font-size:12px;font-weight:700;line-height:1.4;">${benefit}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- CTA Block -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:linear-gradient(135deg, ${accent} 0%, ${accentDark} 100%);border-radius:12px;padding:28px;text-align:center;">
                    <p style="margin:0 0 16px;color:rgba(255,255,255,0.9);font-size:14px;">Ready to see the difference?</p>
                    <a href="${website}" style="display:inline-block;background:#ffffff;color:${accent};padding:14px 36px;border-radius:8px;text-decoration:none;font-weight:800;font-size:15px;">${cfg.cta}</a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;background:#f8fafc;border-top:1px solid #e2e8f0;text-align:center;">
              <p style="margin:0;color:#94a3b8;font-size:12px;">
                Outreach sent to ${company} · <a href="${unsubscribeUrl}" style="color:${accent};text-decoration:none;">Unsubscribe</a>
              </p>
            </td>
          </tr>

          <!-- Tracking pixel -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">${trackingPixel}</td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * professional_blue — Two-column-style header: logo placeholder left, headline right; formal; accent on CTA only.
 */
function renderProfessionalBlue({ projName, firstName, company, cfg, feat1, feat2, benefit, website, unsubscribeUrl, trackingPixel, accent }) {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${cfg.heading}</title>
</head>
<body style="margin:0;padding:0;background:#f0f4f8;font-family:Georgia,'Times New Roman',serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f0f4f8;padding:40px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:4px;overflow:hidden;border:1px solid #dde3ec;">

          <!-- Two-column Header -->
          <tr>
            <td style="background:#1e293b;padding:28px 40px;">
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <!-- Logo placeholder left -->
                  <td width="120" valign="middle">
                    <div style="width:52px;height:52px;background:${accent};border-radius:8px;display:inline-block;text-align:center;line-height:52px;">
                      <span style="color:#ffffff;font-size:22px;font-weight:800;font-family:Arial,sans-serif;">${projName.charAt(0).toUpperCase()}</span>
                    </div>
                    <p style="margin:8px 0 0;color:rgba(255,255,255,0.6);font-size:10px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;font-family:Arial,sans-serif;">${projName}</p>
                  </td>
                  <!-- Divider -->
                  <td width="1" style="background:rgba(255,255,255,0.15);width:1px;">&nbsp;</td>
                  <!-- Headline right -->
                  <td style="padding-left:24px;" valign="middle">
                    <h1 style="margin:0;color:#f1f5f9;font-size:20px;font-weight:700;line-height:1.3;font-family:Georgia,serif;">${cfg.heading}</h1>
                    <p style="margin:6px 0 0;color:rgba(255,255,255,0.5);font-size:12px;font-family:Arial,sans-serif;">A professional introduction for ${company}</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              <p style="margin:0 0 18px;color:#1e293b;font-size:16px;line-height:1.8;">Dear ${firstName},</p>
              <p style="margin:0 0 18px;color:#475569;font-size:15px;line-height:1.8;">${cfg.intro}</p>
              <p style="margin:0 0 14px;color:#1e293b;font-size:14px;font-weight:700;font-family:Arial,sans-serif;text-transform:uppercase;letter-spacing:0.08em;">Key Capabilities:</p>

              <!-- Feature table -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;border:1px solid #e2e8f0;border-radius:4px;overflow:hidden;">
                <tr style="background:#f8fafc;">
                  <td style="padding:13px 18px;border-bottom:1px solid #e2e8f0;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width:20px;color:${accent};font-size:14px;font-family:Arial,sans-serif;">▸</td>
                      <td style="color:#334155;font-size:14px;padding-left:8px;font-family:Arial,sans-serif;">${feat1}</td>
                    </tr></table>
                  </td>
                </tr>
                <tr style="background:#ffffff;">
                  <td style="padding:13px 18px;border-bottom:1px solid #e2e8f0;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width:20px;color:${accent};font-size:14px;font-family:Arial,sans-serif;">▸</td>
                      <td style="color:#334155;font-size:14px;padding-left:8px;font-family:Arial,sans-serif;">${feat2}</td>
                    </tr></table>
                  </td>
                </tr>
                <tr style="background:#f8fafc;">
                  <td style="padding:13px 18px;">
                    <table cellpadding="0" cellspacing="0"><tr>
                      <td style="width:20px;color:${accent};font-size:14px;font-family:Arial,sans-serif;">▸</td>
                      <td style="color:#334155;font-size:14px;padding-left:8px;font-family:Arial,sans-serif;">${benefit}</td>
                    </tr></table>
                  </td>
                </tr>
              </table>

              <p style="margin:0 0 24px;color:#475569;font-size:14px;line-height:1.8;font-family:Arial,sans-serif;">We would welcome the opportunity to demonstrate how ${projName} can benefit ${company}. Please feel free to take the next step below.</p>
              <a href="${website}" style="display:inline-block;background:${accent};color:#ffffff;padding:13px 30px;border-radius:4px;text-decoration:none;font-weight:700;font-size:14px;font-family:Arial,sans-serif;">${cfg.cta}</a>
            </td>
          </tr>

          <!-- Divider -->
          <tr>
            <td style="padding:0 40px;"><hr style="border:none;border-top:1px solid #e2e8f0;" /></td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px 40px 28px;">
              <p style="margin:0;color:#94a3b8;font-size:11px;line-height:1.7;font-family:Arial,sans-serif;">
                This message was sent to ${company} as part of a targeted outreach campaign.<br/>
                <a href="${unsubscribeUrl}" style="color:#94a3b8;">Unsubscribe from future communications</a>
              </p>
            </td>
          </tr>

          <!-- Tracking pixel -->
          <tr>
            <td style="padding:0;line-height:0;font-size:0;">${trackingPixel}</td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ─── Template config ─────────────────────────────────────────────────────────

const TEMPLATE_RENDERERS = {
  modern_dark: renderModernDark,
  clean_minimal: renderCleanMinimal,
  bold_gradient: renderBoldGradient,
  professional_blue: renderProfessionalBlue,
};

// ─── Main export ─────────────────────────────────────────────────────────────

/**
 * Builds the email HTML string for a given campaign type.
 *
 * @param {string} campaignType       — brand_introduction | product_pitch | problem_solution | demo_request | follow_up | partnership
 * @param {object} project            — project record from Firebase
 * @param {object} lead               — lead record (or placeholder object)
 * @param {string|null} sendId        — optional sendId to embed open-tracking pixel
 * @param {string} [templateStyle]    — "modern_dark" | "clean_minimal" | "bold_gradient" | "professional_blue"
 * @param {string} [accentColor]      — hex color e.g. "#4f46e5"
 * @returns {Promise<string>}         — full HTML string
 */
export const renderCampaignEmail = async (
  campaignType,
  project,
  lead,
  sendId = null,
  templateStyle = 'clean_minimal', accentColor = '#4f46e5'
) => {
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

  // Resolve renderer — fallback to clean_minimal
  const renderer = TEMPLATE_RENDERERS[templateStyle] || TEMPLATE_RENDERERS.clean_minimal;

  return renderer({
    projName,
    firstName,
    company,
    cfg,
    feat1,
    feat2,
    benefit,
    website,
    unsubscribeUrl,
    trackingPixel,
    accent: accentColor || '#4f46e5',
  });
};