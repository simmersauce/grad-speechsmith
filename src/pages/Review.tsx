
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";
import { TEST_MODE, dummyFormData } from "@/utils/testMode";
import EmailTestTool from "@/components/payment/EmailTestTool";
import PaymentSuccessSimulator from "@/components/payment/PaymentSuccessSimulator";
import TestingDashboard from "@/components/testing/TestingDashboard";
import { trackButtonClick } from "@/utils/clickTracking";
import { v4 as uuidv4 } from "uuid";

const Review = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  useEffect(() => {
    if (TEST_MODE) {
      setFormData(dummyFormData);
      return;
    }
    
    if (location.state?.formData) {
      setFormData(location.state.formData);
    } else {
      const storedData = sessionStorage.getItem('speechFormData');
      if (storedData) {
        setFormData(JSON.parse(storedData));
      } else {
        navigate("/create");
      }
    }
  }, [location.state, navigate]);

  const handleGenerateSpeech = () => {
    trackButtonClick('generate_speech_button', { from: 'review_page' });
    
    // Generate a unique ID for the preview URL
    const previewId = uuidv4().substring(0, 8);
    
    // Store form data in sessionStorage with the preview ID
    if (formData) {
      const previewData = {
        formData,
        timestamp: new Date().toISOString()
      };
      sessionStorage.setItem(`preview_${previewId}`, JSON.stringify(previewData));
    }
    
    navigate(`/preview/${previewId}`, { state: { formData } });
  };

  const handleEditInformation = () => {
    trackButtonClick('edit_information_button', { from: 'review_page' });
    navigate("/create", { state: { formData } });
  };

  if (!formData) {
    return null;
  }

  const sections = [
    {title: "Personal Information", fields: ["name", "institution", "graduationType", "graduationClass", "role"]},
    {title: "Speech Content", fields: ["tone", "themes", "memories", "personalBackground", "goalsLessons"]},
    {title: "Final Touches",fields: ["acknowledgements", "quote", "wishes", "additionalInfo"]}
  ];

  const formatFieldName = (field: string) => {
    return field
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());
  };

  return (
    <div className="min-h-screen secondary py-16">
      <div className="container max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-4 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold text-center mb-6 sm:mb-8">Review Your Information</h2>

            <div className="space-y-6 sm:space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3 className="text-lg font-semibold mb-3 sm:mb-4">{section.title}</h3>
                  <div className="space-y-3 sm:space-y-4">
                    {section.fields.map((field) => (
                      <div key={field} className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                        <p className="text-xs sm:text-sm text-gray-600 mb-1">
                          {formatFieldName(field)}
                        </p>
                        <p className="text-sm sm:text-base text-gray-900">{formData[field]}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row justify-between gap-3 mt-6 sm:mt-8">
              <Button
                variant="outline"
                onClick={handleEditInformation}
                className="flex items-center justify-center w-full sm:w-auto"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Edit Information
              </Button>
              <Button
                onClick={handleGenerateSpeech}
                className="flex items-center justify-center w-full sm:w-auto bg-primary hover:bg-primary/90"
              >
                Generate Speech
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>

          {TEST_MODE && (
            <div className="mt-8">
              <h2 className="text-xl font-bold text-center mb-6 bg-amber-100 py-2 rounded">Test Mode Tools</h2>
              <EmailTestTool />
              <PaymentSuccessSimulator />
              <TestingDashboard />
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Review;
