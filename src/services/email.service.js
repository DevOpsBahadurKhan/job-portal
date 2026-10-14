
const { Resend } = require("resend");

const resend = new Resend(process.env.RESEND_API_KEY);

const sendPasswordResetEmail = async (email, resetUrl) => {
    const { data, error } = await resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: [email],
        subject: "Reset your QuickHire password",
        text: `Reset your password using this link: ${resetUrl}\n\nThis link expires in 15 minutes. If you did not request this, ignore this email.`,
        html: `
      <div style="font-family: Arial, sans-serif; max-width: 560px; margin: auto; padding: 24px;">
        <h2>Reset your QuickHire password</h2>
        <p>We received a request to reset your password.</p>
        <p>
          <a href="${resetUrl}"
             style="display:inline-block;padding:12px 20px;background:#2563eb;color:#fff;text-decoration:none;border-radius:8px;">
            Reset Password
          </a>
        </p>
        <p>This link expires in 15 minutes and can only be used once.</p>
        <p>If you didn't request this, you can safely ignore this email.</p>
      </div>
    `,
    });

    if (error) {
        throw new Error(`Password reset email failed: ${error.message}`);
    }

    return data;
};

module.exports = { sendPasswordResetEmail };
