
import { Resend } from "https://esm.sh/resend@2.0.0";
import { createEmailWithAttachments, createSpeechPDFContent } from "./emailTemplates.ts";
import { PDFDocument, StandardFonts, rgb } from "https://esm.sh/pdf-lib@1.17.1";

// Initialize Resend
const resendApiKey = Deno.env.get("RESEND_API_KEY") || "";
export const resend = new Resend(resendApiKey);

// Generate a PDF document and return as base64
async function generatePDF(text: string): Promise<string> {
  try {
    console.log("Starting PDF generation");
    
    // Create a new PDF document
    const pdfDoc = await PDFDocument.create();
    
    // Add a page to the document
    const page = pdfDoc.addPage([612, 792]); // Letter size
    const { width, height } = page.getSize();
    
    // Embed fonts
    const titleFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const bodyFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
    
    // Settings
    const margin = 72; // 1 inch margin
    const titleFontSize = 16;
    const bodyFontSize = 12;
    const lineHeight = bodyFontSize * 1.5;
    const paragraphSpacing = bodyFontSize * 0.8; // Space between paragraphs
    const maxWidth = width - (margin * 2);
    
    // Parse the text into sections (title and paragraphs)
    const sections = text.trim().split('\n\n');
    let currentY = height - margin;
    let currentPage = page;
    
    // Process each section
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i].trim();
      
      // Skip empty sections
      if (!section) continue;
      
      // Check if it's a title (all caps)
      const isTitle = section === section.toUpperCase() && section.length < 50;
      const font = isTitle ? titleFont : bodyFont;
      const fontSize = isTitle ? titleFontSize : bodyFontSize;
      
      // For titles, make them bold and add more space
      if (isTitle) {
        // Check if we need a new page
        if (currentY < margin + fontSize * 2) {
          currentPage = pdfDoc.addPage([612, 792]);
          currentY = height - margin;
        }
        
        currentPage.drawText(section, {
          x: margin,
          y: currentY,
          size: fontSize,
          font: font,
          color: rgb(0, 0, 0),
        });
        
        currentY -= fontSize * 2; // More space after title
      } else {
        // Regular paragraph - need to wrap text
        const words = section.split(/\s+/);
        let currentLine = "";
        
        for (const word of words) {
          const testLine = currentLine + (currentLine ? " " : "") + word;
          const textWidth = bodyFont.widthOfTextAtSize(testLine, bodyFontSize);
          
          if (textWidth > maxWidth) {
            // Check if we need a new page
            if (currentY < margin + bodyFontSize) {
              currentPage = pdfDoc.addPage([612, 792]);
              currentY = height - margin;
            }
            
            // Draw the current line
            currentPage.drawText(currentLine, {
              x: margin,
              y: currentY,
              size: bodyFontSize,
              font: bodyFont,
              color: rgb(0, 0, 0),
            });
            
            currentY -= lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        // Don't forget the last line of the paragraph
        if (currentLine) {
          // Check if we need a new page
          if (currentY < margin + bodyFontSize) {
            currentPage = pdfDoc.addPage([612, 792]);
            currentY = height - margin;
          }
          
          currentPage.drawText(currentLine, {
            x: margin,
            y: currentY,
            size: bodyFontSize,
            font: bodyFont,
            color: rgb(0, 0, 0),
          });
          
          currentY -= lineHeight;
        }
        
        // Add extra space after paragraphs
        currentY -= paragraphSpacing;
      }
    }
    
    // Serialize the PDF document to bytes
    const pdfBytes = await pdfDoc.save();
    
    // Convert bytes to base64
    const base64String = btoa(
      String.fromCharCode(...new Uint8Array(pdfBytes))
    );
    
    console.log("PDF generation complete, returning base64 string");
    
    return base64String;
  } catch (error) {
    console.error("Error generating PDF:", error);
    throw new Error(`PDF generation failed: ${error.message}`);
  }
}

// Send a single email with all speeches as PDF attachments
export async function sendEmailWithAttachments(email: string, formData: any, speechVersions: any[], customerReference: string) {
  console.log(`Starting email sending process to ${email} with reference ${customerReference}`);
  
  // Verify API key is properly set
  if (!resendApiKey || resendApiKey.length < 10) {
    console.error("Invalid Resend API key:", resendApiKey ? `${resendApiKey.slice(0, 3)}...` : "empty");
    throw new Error("Email service configuration error: Invalid API key");
  }
  
  console.log(`Using Resend API key ending with: ${resendApiKey.slice(-4)}`);
  console.log(`Number of speech versions to attach: ${speechVersions.length}`);
  
  try {
    // Prepare PDF content for each speech
    const enrichedSpeeches = [];
    
    for (let i = 0; i < speechVersions.length; i++) {
      const speech = speechVersions[i];
      const pdfContent = createSpeechPDFContent(speech, i, formData, customerReference);
      const pdfBase64 = await generatePDF(pdfContent);
      
      enrichedSpeeches.push({
        ...speech,
        pdfContent: pdfBase64
      });
    }
    
    // Create the email with attachments
    const emailPayload = createEmailWithAttachments(enrichedSpeeches, email, formData, customerReference);
    
    console.log("Email payload:", JSON.stringify({
      from: emailPayload.from,
      to: emailPayload.to,
      subject: emailPayload.subject,
      attachmentsCount: emailPayload.attachments?.length || 0
    }));
    
    // Send the email
    const emailResult = await resend.emails.send(emailPayload);
    
    console.log("Email result:", JSON.stringify(emailResult));
    
    if (emailResult.error) {
      throw new Error(`Failed to send email: ${JSON.stringify(emailResult.error)}`);
    }
    
    console.log("Email sent successfully. ID:", emailResult.id);
    
    return {
      success: true,
      emailResult,
      totalAttachments: speechVersions.length
    };
  } catch (emailError: any) {
    console.error("Error sending email via Resend:", emailError);
    throw new Error(`Email sending failed: ${emailError.message || "Unknown error"}`);
  }
}
