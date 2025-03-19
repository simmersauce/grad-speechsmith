
// Create the summary email HTML with previews of all speeches
export const createSummaryEmailHTML = (speechVersions: any[], formData: any, customerReference: string) => {
  const speechListHTML = speechVersions.map((speech, index) => {
    return `
      <div style="margin-bottom: 20px; padding: 10px; border-left: 4px solid #0070f3;">
        <h3 style="margin-top: 0;">Speech Version ${index + 1}</h3>
        <p style="white-space: pre-wrap;">${speech.content.substring(0, 300)}...</p>
        <p><em>Full version available in the following emails</em></p>
      </div>
    `;
  }).join('');

  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background-color: #f5f5f5; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
          .highlight { color: #0070f3; }
          .reference { font-family: monospace; background-color: #f0f0f0; padding: 5px 10px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Your Graduation Speech Drafts</h1>
          <p><strong>Reference: ${customerReference}</strong></p>
        </div>
        <div class="content">
          <p>Dear ${formData?.name || 'Graduate'},</p>
          <p>Thank you for using our Graduation Speech Writer. We're excited to share your personalized speech drafts!</p>
          
          <h2>Your Customer Reference</h2>
          <p>Please save this reference number for future inquiries: <span class="reference">${customerReference}</span></p>
          
          <h2>Speech Previews</h2>
          ${speechListHTML}
          
          <p>Full versions of each speech are included in separate emails that follow this one. You can save, print, and practice with them at your convenience.</p>
          
          <h2>Speech Details</h2>
          <ul>
            <li><strong>Institution:</strong> ${formData?.institution || 'Your institution'}</li>
            <li><strong>Graduation:</strong> ${formData?.graduationClass || 'Your graduation'}</li>
            <li><strong>Role:</strong> ${formData?.role || 'Graduate'}</li>
            <li><strong>Tone:</strong> ${formData?.tone || 'Standard'}</li>
          </ul>
          
          <p>Congratulations on your achievement! We wish you all the best for your graduation ceremony and future endeavors.</p>
        </div>
        <div class="footer">
          <p>© 2024 Graduation Speech Writer | Customer Reference: ${customerReference}</p>
        </div>
      </body>
    </html>
  `;
};

// Create HTML for individual speech emails
export const createSpeechEmailHTML = (speech: any, index: number, formData: any, customerReference: string) => {
  return `
    <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; }
          .header { background-color: #f5f5f5; padding: 20px; text-align: center; }
          .content { padding: 20px; }
          .footer { background-color: #f5f5f5; padding: 20px; text-align: center; font-size: 12px; }
          .speech { white-space: pre-wrap; line-height: 1.8; }
          .reference { font-family: monospace; background-color: #f0f0f0; padding: 5px 10px; border-radius: 4px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Graduation Speech - Version ${index + 1}</h1>
          <p>Tone: ${formData?.tone || 'Standard'}</p>
          <p><strong>Reference: ${customerReference}</strong></p>
        </div>
        <div class="content">
          <p>Dear ${formData?.name || 'Graduate'},</p>
          <p>Here is the full text of your graduation speech (version ${index + 1}):</p>
          <div class="speech">${speech.content}</div>
        </div>
        <div class="footer">
          <p>© 2024 Graduation Speech Writer | Customer Reference: ${customerReference}</p>
        </div>
      </body>
    </html>
  `;
};

// Create email config objects for all speech emails
export const createSpeechEmails = (speechVersions: any[], email: string, formData: any, customerReference: string) => {
  return speechVersions.map((speech, index) => {
    return {
      from: `Graduation Speech Writer <speeches@resend.dev>`,
      to: [email],
      subject: `Graduation Speech Draft ${index + 1} - Ref: ${customerReference}`,
      html: createSpeechEmailHTML(speech, index, formData, customerReference)
    };
  });
};
