/**
 * Placeholder WhatsApp messaging abstraction.
 * Integrate Twilio, Meta WhatsApp Cloud API, or other provider later.
 */

interface WhatsAppMessageOptions {
  to: string; // phone in E.164
  template?: string; // named template
  variables?: Record<string, string | number>;
  body?: string; // fallback plain text
}

const PROVIDER = process.env.WHATSAPP_PROVIDER || "console";

export async function sendWhatsAppMessage(opts: WhatsAppMessageOptions) {
  // In production we'd branch on PROVIDER and call real API.
  if (PROVIDER === "console") {
    console.log("📨 [WhatsApp Simulation]", {
      to: opts.to,
      template: opts.template,
      body: renderBody(opts),
    });
    return { simulated: true };
  }
  // TODO: real provider integration
  return { delivered: false };
}

function renderBody(opts: WhatsAppMessageOptions): string {
  if (opts.body) return opts.body;
  if (opts.template) {
    let text = opts.template;
    if (opts.variables) {
      for (const [k, v] of Object.entries(opts.variables)) {
        text = text.replace(new RegExp(`{{${k}}}`, "g"), String(v));
      }
    }
    return text;
  }
  return "";
}

export async function sendPropertySubmissionReceipt(params: {
  to: string;
  title: string;
}) {
  return sendWhatsAppMessage({
    to: params.to,
    template: "property_submission_receipt",
    variables: { title: params.title },
    body: `Thank you! Your property '${params.title}' has been received and is under review. – TruEstate`,
  });
}

export async function sendPropertyRejected(params: {
  to: string;
  title: string;
  reasons: string[];
}) {
  return sendWhatsAppMessage({
    to: params.to,
    template: "property_rejected",
    variables: { title: params.title },
    body: `Your property '${params.title}' was declined: ${params.reasons.join(
      "; "
    )}. You may correct and resubmit. – TruEstate`,
  });
}

export async function sendPropertyFlagged(params: {
  to: string;
  title: string;
}) {
  return sendWhatsAppMessage({
    to: params.to,
    template: "property_flagged",
    variables: { title: params.title },
    body: `Your property '${params.title}' needs manual review. We'll notify you soon. – TruEstate`,
  });
}

export async function sendPropertyApproved(params: {
  to: string;
  title: string;
}) {
  return sendWhatsAppMessage({
    to: params.to,
    template: "property_approved",
    variables: { title: params.title },
    body: `Great news! Your property '${params.title}' is now live on TruEstate. – TruEstate`,
  });
}
