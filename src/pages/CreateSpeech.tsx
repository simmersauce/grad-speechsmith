
import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Form } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowRight, ArrowLeft } from "lucide-react";

const steps = [
  {
    title: "Basic Information",
    fields: ["name", "school", "graduationType"],
  },
  {
    title: "Key Messages",
    fields: ["keyAchievements", "futureAspirations"],
  },
  {
    title: "Personal Touch",
    fields: ["memorableExperience", "thanksTo"],
  },
];

const CreateSpeech = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    name: "",
    school: "",
    graduationType: "",
    keyAchievements: "",
    futureAspirations: "",
    memorableExperience: "",
    thanksTo: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    } else {
      navigate("/review", { state: { formData } });
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
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
            <div className="mb-8">
              <div className="flex justify-between mb-4">
                {steps.map((step, index) => (
                  <div
                    key={step.title}
                    className={`flex-1 text-center ${
                      index === currentStep ? "text-primary font-medium" : "text-gray-400"
                    }`}
                  >
                    <div
                      className={`w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center ${
                        index === currentStep ? "bg-primary text-white" : "bg-gray-100"
                      }`}
                    >
                      {index + 1}
                    </div>
                    <span className="text-sm">{step.title}</span>
                  </div>
                ))}
              </div>
            </div>

            <Form>
              {currentStep === 0 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="name">Your Name</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleInputChange("name", e.target.value)}
                      placeholder="Enter your full name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="school">School/University</Label>
                    <Input
                      id="school"
                      value={formData.school}
                      onChange={(e) => handleInputChange("school", e.target.value)}
                      placeholder="Enter your institution name"
                    />
                  </div>
                  <div>
                    <Label htmlFor="graduationType">Type of Graduation</Label>
                    <Input
                      id="graduationType"
                      value={formData.graduationType}
                      onChange={(e) => handleInputChange("graduationType", e.target.value)}
                      placeholder="e.g., High School, College, Master's"
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="keyAchievements">Key Achievements</Label>
                    <Textarea
                      id="keyAchievements"
                      value={formData.keyAchievements}
                      onChange={(e) => handleInputChange("keyAchievements", e.target.value)}
                      placeholder="Share your main accomplishments during your academic journey"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="futureAspirations">Future Aspirations</Label>
                    <Textarea
                      id="futureAspirations"
                      value={formData.futureAspirations}
                      onChange={(e) => handleInputChange("futureAspirations", e.target.value)}
                      placeholder="What are your hopes and dreams for the future?"
                      rows={4}
                    />
                  </div>
                </motion.div>
              )}

              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-6"
                >
                  <div>
                    <Label htmlFor="memorableExperience">Most Memorable Experience</Label>
                    <Textarea
                      id="memorableExperience"
                      value={formData.memorableExperience}
                      onChange={(e) => handleInputChange("memorableExperience", e.target.value)}
                      placeholder="Share a special moment or experience from your time at school"
                      rows={4}
                    />
                  </div>
                  <div>
                    <Label htmlFor="thanksTo">Special Thanks</Label>
                    <Textarea
                      id="thanksTo"
                      value={formData.thanksTo}
                      onChange={(e) => handleInputChange("thanksTo", e.target.value)}
                      placeholder="Who would you like to thank in your speech?"
                      rows={4}
                    />
                  </div>
                </motion.div>
              )}

              <div className="flex justify-between mt-8">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  className="flex items-center"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
                <Button
                  type="button"
                  onClick={nextStep}
                  className="flex items-center bg-primary hover:bg-primary/90"
                >
                  {currentStep === steps.length - 1 ? "Review" : "Next"}
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </Form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default CreateSpeech;
