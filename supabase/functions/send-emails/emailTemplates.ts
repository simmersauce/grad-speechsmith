
// Create the main email HTML with all 3 speeches as attachments
export const createMainEmailHTML = (speechVersions: any[], formData: any, customerReference: string) => {
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
          .signature { border-top: 1px solid #eee; margin-top: 20px; padding-top: 20px; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Your graduation speeches are ready!</h1>
          <p><strong>Order #${customerReference}</strong></p>
        </div>
        <div class="content">
          <p>Hi ${formData?.name || 'Customer'},</p>
          
          <p>Congratulations on taking a step towards an unforgettable moment! We're pleased to inform you that your 3 personalized graduation speech drafts have been successfully generated and are attached to this email.</p>
          
          <p>Need to add some personal touches to your speeches? You can easily edit your speech drafts by right-clicking on any of the attached PDF files and selecting "Open With" and then "Microsoft Word" or your preferred document editing tool.</p>
          
          <p>We hope you enjoy the drafts and find them useful. If you have any questions or feedback, please don't hesitate to reach out to us.</p>
          
          <div class="signature">
            <p>Mech<br>Co-founder</p>
          </div>
        </div>
        <div class="footer">
          <p>© 2024 Graduation Speech Writer | Order #${customerReference}</p>
        </div>
      </body>
    </html>
  `;
};

// Create text content for PDF
export const createSpeechPDFContent = (speech: any, index: number, formData: any, customerReference: string) => {
  const roleText = formData?.role || 'Graduate';
  const institutionText = formData?.institution || 'Your Institution';
  const toneText = speech?.tone || 'Standard';
  
  return `
GRADUATION SPEECH - VERSION ${index + 1}
Role: ${roleText}
Institution: ${institutionText}
Tone: ${toneText}
Reference: ${customerReference}

${speech.content}

© 2024 Graduation Speech Writer
  `;
};

// Create a unified email object with PDF attachments
export const createEmailWithAttachments = (speechVersions: any[], email: string, formData: any, customerReference: string) => {
  return {
    from: `Graduation Speech Writer <speeches@resend.dev>`,
    to: [email],
    subject: `Your Graduation Speech Drafts - Order #${customerReference}`,
    html: createMainEmailHTML(speechVersions, formData, customerReference),
    attachments: speechVersions.map((speech, index) => ({
      filename: `Graduation_Speech_Version_${index + 1}.pdf`,
      content: speech.pdfContent || speech.content,
    }))
  };
};
