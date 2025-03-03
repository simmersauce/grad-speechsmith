
import { useLocation, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

const Review = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [formData, setFormData] = useState(null);

  // Get formData from location state when component mounts
  useEffect(() => {
    if (location.state?.formData) {
      setFormData(location.state.formData);
      // Store formData in sessionStorage to persist it across navigation
      sessionStorage.setItem('speechFormData', JSON.stringify(location.state.formData));
    } else {
      // Try to get formData from sessionStorage if not in location state
      const storedData = sessionStorage.getItem('speechFormData');
      if (storedData) {
        setFormData(JSON.parse(storedData));
      } else {
        // If no data is found, navigate to create page
        navigate("/create");
      }
    }
  }, [location.state, navigate]);

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
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20 py-16">
      <div className="container max-w-2xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="p-8">
            <h2 className="text-2xl font-bold text-center mb-8">Review Your Information</h2>

            <div className="space-y-8">
              {sections.map((section, index) => (
                <motion.div
                  key={section.title}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
                  <div className="space-y-4">
                    {section.fields.map((field) => (
                      <div key={field} className="bg-gray-50 p-4 rounded-lg">
                        <p className="text-sm text-gray-600 mb-1">
                          {formatFieldName(field)}
                        </p>
                        <p className="text-gray-900">{formData[field]}</p>
                      </div>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>

            <div className="flex justify-between mt-8">
              <Button
                variant="outline"
                onClick={() => navigate("/create", { state: { formData } })}
                className="flex items-center"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Edit Information
              </Button>
              <Button
                onClick={() => navigate("/preview", { state: { formData } })}
                className="flex items-center bg-primary hover:bg-primary/90"
              >
                Generate Speech
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Review;
