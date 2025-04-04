
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { GraduationSpeechFormValues } from "@/utils/formSchema";
import { Asterisk } from "lucide-react";

interface AboutYouTabProps {
  form: UseFormReturn<GraduationSpeechFormValues>;
  showOtherGraduationType: boolean;
  handleGraduationTypeChange: (value: string) => void;
}

const AboutYouTab = ({ 
  form, 
  showOtherGraduationType, 
  handleGraduationTypeChange 
}: AboutYouTabProps) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Your Name
              <Asterisk className="h-3 w-3 text-red-500 ml-1" />
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter your name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Your Email
              <Asterisk className="h-3 w-3 text-red-500 ml-1" />
            </FormLabel>
            <FormControl>
              <Input placeholder="Enter your email address" type="email" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="role"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Your Speaking Role
              <Asterisk className="h-3 w-3 text-red-500 ml-1" />
            </FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select your speaking role" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="student">Student</SelectItem>
                <SelectItem value="valedictorian">Valedictorian</SelectItem>
                <SelectItem value="salutatorian">Salutatorian</SelectItem>
                <SelectItem value="classPresident">Class President/Representative</SelectItem>
                <SelectItem value="guestSpeaker">Guest Speaker</SelectItem>
                <SelectItem value="facultyMember">Faculty member</SelectItem>
                <SelectItem value="parent">Parent</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="institution"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Institution Name
              <Asterisk className="h-3 w-3 text-red-500 ml-1" />
            </FormLabel>
            <FormControl>
              <Input placeholder="Name of your school or university" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="graduationClass"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Graduating Class
              <Asterisk className="h-3 w-3 text-red-500 ml-1" />
            </FormLabel>
            <FormControl>
              <Input placeholder="Class of 2025" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="graduationType"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="flex items-center">
              Graduation Type
              <Asterisk className="h-3 w-3 text-red-500 ml-1" />
            </FormLabel>
            <Select onValueChange={handleGraduationTypeChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select graduation type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="highSchool">High school graduation</SelectItem>
                <SelectItem value="college">College/university graduation</SelectItem>
                <SelectItem value="graduate">Graduate school/PhD graduation</SelectItem>
                <SelectItem value="vocational">Vocational/technical school graduation</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      {showOtherGraduationType && (
        <FormField
          control={form.control}
          name="graduationTypeOther"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Please specify
                <Asterisk className="h-3 w-3 text-red-500 ml-1" />
              </FormLabel>
              <FormControl>
                <Input placeholder="Enter your graduation type" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
    </div>
  );
};

export default AboutYouTab;
