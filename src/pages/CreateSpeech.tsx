import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
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
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TEST_MODE, dummyFormData } from "@/utils/testMode";

const CreateSpeech = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("1");
  const [userInputs, setUserInputs] = useState<Partial<GraduationSpeechFormValues>>({});
  const [showOtherGraduationType, setShowOtherGraduationType] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formId, setFormId] = useState<string | null>(null);

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
  
  useEffect(() => {
    if (TEST_MODE) {
      Object.entries(dummyFormData).forEach(([key, value]) => {
        if (value) {
          form.setValue(key as any, value as any);
        }
      });
      setUserInputs(dummyFormData);
      if (dummyFormData.graduationType === 'other') {
        setShowOtherGraduationType(true);
      }
      return;
    }
    
    let savedData;
    
    if (location.state?.formData) {
      savedData = location.state.formData;
      if (location.state.formId) {
        setFormId(location.state.formId);
      }
    } else {
      const storedData = sessionStorage.getItem('speechFormData');
      if (storedData) {
        try {
          const parsedData = JSON.parse(storedData);
          savedData = parsedData.formData;
          if (parsedData.formId) {
            setFormId(parsedData.formId);
          }
        } catch (error) {
          console.error("Error parsing stored form data:", error);
        }
      }
    }
    
    if (savedData) {
      Object.entries(savedData).forEach(([key, value]) => {
        if (value) {
          form.setValue(key as any, value as any);
        }
      });
      
      setUserInputs(savedData);
      if (savedData.graduationType === 'other') {
        setShowOtherGraduationType(true);
      }
    }
  }, [location.state, form]);
  
  const onSubmit = async (values: GraduationSpeechFormValues) => {
    try {
      setIsSubmitting(true);
      
      if (TEST_MODE) {
        toast({
          title: "Success",
          description: "Test mode: Your speech information has been saved!",
        });
        
        sessionStorage.setItem('speechFormData', JSON.stringify({
          formData: values,
          formId: "test-id-123"
        }));
        
        navigate("/review", { 
          state: { 
            formData: values,
            formId: "test-id-123"
          } 
        });
        setIsSubmitting(false);
        return;
      }
      
      const speechData = {
        name: values.name,
        email: values.email,
        role: values.role,
        institution: values.institution,
        graduation_class: values.graduationClass,
        graduation_type: values.graduationType,
        graduation_type_other: values.graduationTypeOther,
        tone: values.tone,
        memories: values.memories,
        acknowledgements: values.acknowledgements,
        additional_info: values.additionalInfo,
        themes: values.themes,
        personal_background: values.personalBackground,
        goals_lessons: values.goalsLessons,
        quote: values.quote,
        wishes: values.wishes
      };
      
      let result;
      
      if (formId) {
        result = await supabase
          .from('graduation_speeches')
          .update(speechData)
          .eq('id', formId)
          .select();
      } else {
        result = await supabase
          .from('graduation_speeches')
          .insert(speechData)
          .select();
      }
      
      const { data, error } = result;
      
      if (error) {
        console.error("Error saving to Supabase:", error);
        toast({
          title: "Error",
          description: "There was a problem saving your speech data. Please try again.",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      const newFormId = data?.[0]?.id;
      
      toast({
        title: "Success",
        description: "Your speech information has been saved!",
      });
      
      sessionStorage.setItem('speechFormData', JSON.stringify({
        formData: values,
        formId: formId || newFormId
      }));
      
      console.log("Form submitted and saved to Supabase:", values);
      navigate("/review", { 
        state: { 
          formData: values,
          formId: formId || newFormId
        } 
      });
    } catch (error) {
      console.error("Exception saving to Supabase:", error);
      toast({
        title: "Error",
        description: "There was a problem saving your speech data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinalSubmit = () => {
    form.handleSubmit(onSubmit)();
  };

  const handleNext = async () => {
    const currentTabNumber = parseInt(activeTab);
    if (currentTabNumber < 3) {
      const values = form.getValues();
      setUserInputs((prev) => ({ ...prev, ...values }));
      
      let isValid = true;
      if (currentTabNumber === 1) {
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

  const handleGoHome = () => {
    navigate("/");
  };

  return (
    <div className="container mx-auto py-16 px-4 max-w-4xl">
      <div className="text-center mb-12">
        <GraduationCap 
          className="w-16 h-16 mx-auto text-primary mb-4 cursor-pointer hover:text-primary/80 transition-colors" 
          onClick={handleGoHome}
        />
        <h1 className="text-3xl md:text-4xl font-bold mb-4">Create Your Graduation Speech</h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Fill out the form below with details about yourself and your graduation.
          Our AI will craft a personalized speech just for you.
        </p>
      </div>

      <Form {...form}>
        <form>
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
            onFinalSubmit={handleFinalSubmit}
            isSubmitting={isSubmitting}
          />
        </form>
      </Form>
    </div>
  );
};

export default CreateSpeech;
