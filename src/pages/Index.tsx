
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  ClipboardList, 
  Bot, 
  Edit 
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
      <div className="container px-4 py-16 mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="flex justify-center mb-6">
            <GraduationCap className="w-16 h-16 text-primary" />
          </div>
          <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
            Craft Your Perfect Graduation Speech
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Let AI help you create a memorable and inspiring graduation speech in minutes
          </p>
          <Button
            onClick={() => navigate("/create")}
            className="group bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full text-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>

        {/* How It Works Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mt-28 max-w-5xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-12">How It Works</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow relative flex flex-col items-center text-center"
              >
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-primary text-white w-8 h-8 rounded-full flex items-center justify-center font-bold">
                  {index + 1}
                </div>
                <div className="flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-6">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-4">{step.title}</h3>
                <p className="text-gray-600">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-8"
        >
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mb-6">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </motion.div>

        {/* Final CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mt-24"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Create Your Speech?</h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of graduates who have delivered memorable speeches with our help
          </p>
          <Button
            onClick={() => navigate("/create")}
            className="group bg-primary hover:bg-primary/90 text-white px-8 py-6 rounded-full text-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            Create Your Speech
            <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
        </motion.div>
      </div>
    </div>
  );
};

const steps = [
  {
    title: "Complete Our Form",
    description: "Fill out our quick form. Share details about the graduating class, memorable experiences, and the tone you'd like for your speech.",
    icon: <ClipboardList className="w-8 h-8 text-primary" />,
  },
  {
    title: "AI Crafts Your Speech",
    description: "Your personalized graduation speech will be generated, highlighting triumphs, expressing gratitude, and inspiring the graduating year to embrace future challenges with optimism.",
    icon: <Bot className="w-8 h-8 text-primary" />,
  },
  {
    title: "Review & Personalize",
    description: "Review the generated speech and make any personal touches to ensure it resonates with your audience and reflects the spirit of the graduating year.",
    icon: <Edit className="w-8 h-8 text-primary" />,
  },
];

const features = [
  {
    title: "AI-Powered Writing",
    description: "Our advanced AI helps craft personalized, impactful speeches that resonate with your audience.",
  },
  {
    title: "Easy Customization",
    description: "Simple form-based process to capture your unique experiences and message.",
  },
  {
    title: "Professional Results",
    description: "Get a polished, well-structured speech ready for your big day.",
  },
];

export default Index;
