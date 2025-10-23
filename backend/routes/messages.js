const express = require('express');
const Message = require('../models/Message');
const auth = require('../middleware/auth');
const router = express.Router();

function normalizeWhatsAppNumber(raw) {
  try {
    const defaultCC = process.env.DEFAULT_COUNTRY_CODE || process.env.SMTP_DEFAULT_COUNTRY_CODE || '234';
    if (!raw) return '';
    let cleaned = String(raw).replace(/[^0-9+]/g, '');
    if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
    if (cleaned.startsWith('0') && defaultCC) cleaned = defaultCC + cleaned.slice(1);
    // If cleaned looks short (<8), don't assume — still prepend default
    if (!cleaned.startsWith(defaultCC) && cleaned.length <= 10) cleaned = defaultCC + cleaned;
    return cleaned;
  } catch (e) { return String(raw || ''); }
}

// POST /api/contact (save message)
router.post('/', async (req, res) => {
  try {
    console.log('POST /api/contact body:', req.body);
    let { name, email, whatsappnumber, content } = req.body || {};
    // normalize whatsapp number to digits-only and add default country code when missing
    try {
      const defaultCC = process.env.DEFAULT_COUNTRY_CODE || process.env.SMTP_DEFAULT_COUNTRY_CODE || '234';
      if (whatsappnumber) {
        // remove spaces, parentheses, dashes, plus signs
        let cleaned = String(whatsappnumber).replace(/[^0-9+]/g, '');
        // strip leading + for storage
        if (cleaned.startsWith('+')) cleaned = cleaned.slice(1);
        // if starts with 0 and we have a default country code, replace leading 0
        if (cleaned.startsWith('0') && defaultCC) cleaned = defaultCC + cleaned.slice(1);
        whatsappnumber = cleaned;
      }
    } catch (e) { console.warn('WhatsApp normalization error', e); }
    // basic validation
    if (!name) return res.status(400).json({ message: 'Name is required' });
    if (!email) return res.status(400).json({ message: 'Email is required' });
    if (!whatsappnumber) return res.status(400).json({ message: 'WhatsApp number is required' });
    if (!content) return res.status(400).json({ message: 'Message content is required' });

  const message = new Message({ name, email, whatsappnumber, content });
    await message.save();
    // Send notification email if configured (don't fail the request if email sending fails)
    (async () => {
      try {
        let nodemailer;
        try { nodemailer = require('nodemailer'); } catch (e) { nodemailer = null; }
        const notifyTo = process.env.NOTIFY_EMAIL_TO;
        const smtpHost = process.env.SMTP_HOST;
        if (nodemailer && notifyTo && smtpHost) {
          if (process.env.SMTP_USER && !process.env.SMTP_PASS) {
            console.warn('SMTP_USER provided but SMTP_PASS is missing. For providers like Gmail, you may need an app password.');
          }

          // Build a list of transporter factory functions to try in order
          const transportFactories = [];

          // 1) If MAIL_USERNAME/MAIL_PASSWORD specified, try Gmail service shorthand first
          if (process.env.MAIL_USERNAME && process.env.MAIL_PASSWORD) {
            transportFactories.push(() => nodemailer.createTransport({
              service: 'gmail',
              auth: { user: process.env.MAIL_USERNAME, pass: process.env.MAIL_PASSWORD }
            }));
          }

          // 2) Try explicit SMTP host with the configured port (or 587)
          const configuredPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT, 10) : 587;
          transportFactories.push(() => nodemailer.createTransport({
            host: smtpHost,
            port: configuredPort,
            secure: process.env.SMTP_SECURE === 'true' || configuredPort === 465,
            auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
            tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false' }
          }));

          // 3) If configured port wasn't 465, also try 465 (SMTPS) as a fallback
          if (configuredPort !== 465) {
            transportFactories.push(() => nodemailer.createTransport({
              host: smtpHost,
              port: 465,
              secure: true,
              auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
              tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false' }
            }));
          }

          // Helper that attempts verify/send with a transporter instance
          const tryTransporterSend = async (createTransport, mailOptions) => {
            const transport = createTransport();
            try {
              await transport.verify();
              console.log('SMTP transporter verified OK (transport)');
            } catch (vErr) {
              console.warn('Transport verify failed:', vErr && vErr.message ? vErr.message : vErr);
              // don't immediately give up — allow send attempt which may provide a clearer error
            }
            try {
              const info = await transport.sendMail(mailOptions);
              return { success: true, info };
            } catch (sendErr) {
              return { success: false, error: sendErr };
            }
          };

          const notifyMail = {
            from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.MAIL_USERNAME || 'no-reply@example.com',
            to: notifyTo,
            subject: `[Website] New message from ${name}`,
            text: `New message from ${name} <${email}>\nWhatsApp: ${whatsappnumber || 'N/A'}\n\n${content}`
          };

          // Try transport factories sequentially until one sends successfully
          let notifyResult = null;
          for (let make of transportFactories) {
            try {
              const r = await tryTransporterSend(make, notifyMail);
              if (r.success) { notifyResult = r; break; }
              console.warn('Transport send failed, trying next transporter:', r.error && r.error.message ? r.error.message : r.error);
            } catch (e) {
              console.warn('Unexpected error while trying transporter:', e && e.message ? e.message : e);
            }
          }
          if (notifyResult && notifyResult.success) {
            console.log('Notification email sent to', notifyTo, 'info:', notifyResult.info && notifyResult.info.messageId ? notifyResult.info.messageId : notifyResult.info);
          } else {
            console.warn('All transporter attempts failed for notification email.');
          }

          // Confirmation to sender — try the same transporters (recreate) until one sends
          if (email) {
            const senderText = `Hi ${name || ''},\n\nThanks for reaching out — I received your message and will get back to you as soon as possible.\n\nYour message:\n${content}\n\nBest,\nIsaiah`;
            const confirmMail = {
              from: process.env.SMTP_FROM || process.env.SMTP_USER || process.env.MAIL_USERNAME || 'no-reply@example.com',
              to: email,
              subject: `Thanks for contacting The Creative Isaiah`,
              text: senderText
            };
            let confirmResult = null;
            for (let make of transportFactories) {
              try {
                const r = await tryTransporterSend(make, confirmMail);
                if (r.success) { confirmResult = r; break; }
                console.warn('Transport send failed for confirmation, trying next transporter:', r.error && r.error.message ? r.error.message : r.error);
              } catch (e) {
                console.warn('Unexpected error while trying transporter for confirmation:', e && e.message ? e.message : e);
              }
            }
            if (confirmResult && confirmResult.success) console.log('Confirmation email sent to sender', email);
            else console.warn('All transporter attempts failed for confirmation email to sender.');
          }
        }
      } catch (e) {
        console.warn('Notification email flow error:', e && e.message ? e.message : e);
      }
    })();
  // return normalized whatsappnumber to client for debugging/confirmation
  res.status(201).json({ message: 'Message sent!', whatsappnumber: message.whatsappnumber });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// GET /api/messages (admin only)
router.get('/', auth, async (req, res) => {
  try {
    const messages = await Message.find().sort({ createdAt: -1 });
    // ensure returned whatsappnumber is normalized for legacy entries
    const normalized = messages.map(m => {
      const obj = m.toObject ? m.toObject() : m;
      obj.whatsappnumber = obj.whatsappnumber ? normalizeWhatsAppNumber(obj.whatsappnumber) : '';
      return obj;
    });
    res.json(normalized);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST /api/messages/test-email (admin only) - sends a diagnostic email to NOTIFY_EMAIL_TO
router.post('/test-email', auth, async (req, res) => {
  try {
    let nodemailer;
    try { nodemailer = require('nodemailer'); } catch (e) { nodemailer = null; }
    const notifyTo = process.env.NOTIFY_EMAIL_TO;
    const smtpHost = process.env.SMTP_HOST;
    if (!nodemailer || !notifyTo || !smtpHost) return res.status(400).json({ message: 'SMTP not configured' });
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT,10) : 587,
      secure: process.env.SMTP_SECURE === 'true' || (process.env.SMTP_PORT && parseInt(process.env.SMTP_PORT,10) === 465),
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
      tls: { rejectUnauthorized: process.env.SMTP_REJECT_UNAUTHORIZED !== 'false' }
    });
    try {
      await transporter.verify();
    } catch (vErr) {
      console.warn('SMTP verify failed in test-email:', vErr && vErr.message ? vErr.message : vErr);
      // continue to attempt send to capture send errors
    }
    const info = await transporter.sendMail({ from: process.env.SMTP_FROM || process.env.SMTP_USER || 'no-reply@example.com', to: notifyTo, subject: 'Test email from portfolio app', text: 'This is a test email to verify SMTP settings.' });
    res.json({ ok: true, info: info && info.messageId ? info.messageId : info });
  } catch (err) {
    console.error('Test email failed', err);
    res.status(500).json({ message: err && err.message ? err.message : String(err) });
  }
});

// PUT /api/messages/:id (mark as read)
router.put('/:id', auth, async (req, res) => {
  try {
    const message = await Message.findByIdAndUpdate(req.params.id, { read: true }, { new: true });
    res.json(message);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// POST /api/messages/mark-read (batch mark as read)
router.post('/mark-read', auth, async (req, res) => {
  try {
    const ids = Array.isArray(req.body && req.body.ids) ? req.body.ids : [];
    if (!ids.length) return res.status(400).json({ message: 'No ids provided' });
    const result = await Message.updateMany({ _id: { $in: ids } }, { $set: { read: true } });
    // return number of documents modified
    res.json({ modifiedCount: result.modifiedCount || result.nModified || 0 });
  } catch (err) {
    console.error('Batch mark-read error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/messages/unread-count (returns number of unread messages)
router.get('/unread-count', auth, async (req, res) => {
  try {
    const unread = await Message.countDocuments({ read: false });
    res.json({ unread });
  } catch (err) {
    console.error('Unread count error', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
