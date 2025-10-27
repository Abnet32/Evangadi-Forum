const brevo = require("@getbrevo/brevo");

async function sendEmail(to, subject, htmlContent) {
  try {
    const apiInstance = new brevo.TransactionalEmailsApi();
    apiInstance.setApiKey(
      brevo.TransactionalEmailsApiApiKeys.apiKey,
      process.env.BREVO_API_KEY
    );

    const sendSmtpEmail = {
      sender: {
        email: process.env.BREVO_SENDER_EMAIL,
        name: process.env.BREVO_SENDER_NAME,
      },
      to: [{ email: to }],
      subject,
      htmlContent,
    };

    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log("✅ Email sent successfully to:", to);
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw error;
  }
}

module.exports = sendEmail;
