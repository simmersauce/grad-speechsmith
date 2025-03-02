
import { z } from "zod";

export const graduationSpeechFormSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  role: z.string().min(2, { message: "Role must be at least 2 characters." }),
  institution: z.string().min(2, { message: "Institution must be at least 2 characters." }),
  graduationClass: z.string().min(1, { message: "Please enter your graduation class." }),
  graduationType: z.string(),
  graduationTypeOther: z.string().optional(),
  tone: z.string(),
  memories: z.string(),
  acknowledgements: z.string(),
  additionalInfo: z.string().optional(),
  themes: z.string().optional(),
  personalBackground: z.string().optional(),
  goalsLessons: z.string().optional(),
  quote: z.string().optional(),
  wishes: z.string().optional(),
});

export type GraduationSpeechFormValues = z.infer<typeof graduationSpeechFormSchema>;
