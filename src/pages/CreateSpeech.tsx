
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { GraduationCap } from "lucide-react";
import { graduationSpeechFormSchema, GraduationSpeechFormValues } from "@/utils/formSchema";
import AboutYouTab from "@/components/speech-form/AboutYouTab";
import SpeechDetailsTab from "@/components/speech-form/SpeechDetailsTab";
import FinalTouchesTab from "@/components/speech-form/FinalTouchesTab";
import TabHeader from "@/components/speech-form/TabHeader";
import FormNavigation from "@/components/speech-form/FormNavigation";

const CreateSpeech = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("1");
  const [userInputs, setUserInputs] = useState<Partial<GraduationSpeechFormValues>>({});
  const [showOtherGraduationType, setShowOtherGraduationType] = useState(false);

  const form = useForm<GraduationSpeechFormValues>({
    resolver: zodResolver(graduationSpeechFormSchema),
    defaultValues: {
      name: "",
      email: "",
      role: "",
      institution: "",
      graduationClass: "",
      graduationType: "",
      graduationTypeOther: "",
      tone: "",
      memories: "",
      acknowledgements: "",
      additionalInfo: "",
      themes: "",
      personalBackground: "",
      goalsLessons: "",
      quote: "",
      wishes: "",
    },
  });
  
  const onSubmit = (values: GraduationSpeechFormValues) => {
    console.log("Form submitted:", values);
    navigate("/review", { state: { formData: values } });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault(); // Always prevent default to control navigation
    
    if (activeTab !== "3") {
      handleNext();
    } else {
      // When on the final tab, submit the form
      form.handleSubmit(onSubmit)(e);
    }
  };
  
  const handleNext = async () => {
    const currentTabNumber = parseInt(activeTab);
    if (currentTabNumber < 3) {
      const values = form.getValues();
      setUserInputs((prev) => ({ ...prev, ...values }));
      
      let isValid = true;
      if (currentTabNumber === 1) {
        // Specify the field names as literals to ensure type safety
        isValid = await form.trigger([
          "name", "email", "role", "institution", "graduationClass", "graduationType",
          ...(showOtherGraduationType ? ["graduationTypeOther" as const] : [])
        ] as const);
      } else if (currentTabNumber === 2) {
        isValid = await form.trigger(["tone"] as const);
      }
      
      if (isValid) {
        setActiveTab((currentTabNumber + 1).toString());
      }
    }
  }; 

  const handlePrevious = () => {
    const currentTabNumber = parseInt(activeTab);
    if (currentTabNumber > 1) {
      setActiveTab((currentTabNumber - 1).toString());
    }
  };

  const handleGraduationTypeChange = (value: string) => {
    form.setValue("graduationType", value);
    setShowOtherGraduationType(value === "other");
    
    if (value !== "other") {
      form.setValue("graduationTypeOther", "");
    }
  };

  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <div className="text-center mb-12">
        <GraduationCap className="w-16 h-16 mx-auto text-primary mb-4" />
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Create Your Graduation Speech</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Fill out the form below with details about yourself and your graduation.
          Our AI will craft a personalized speech just for you.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={handleFormSubmit}>
          <div className="mb-8">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabHeader activeTab={activeTab} />

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
              >
                <TabsContent value="1">
                  <AboutYouTab 
                    form={form} 
                    showOtherGraduationType={showOtherGraduationType}
                    handleGraduationTypeChange={handleGraduationTypeChange}
                  />
                </TabsContent>

                <TabsContent value="2">
                  <SpeechDetailsTab form={form} />
                </TabsContent>

                <TabsContent value="3">
                  <FinalTouchesTab form={form} />
                </TabsContent>
              </motion.div>
            </Tabs>
          </div>

          <FormNavigation 
            activeTab={activeTab} 
            handlePrevious={handlePrevious} 
            handleNext={handleNext} 
          />
        </form>
      </Form>
    </div>
  );
};

export default CreateSpeech;
