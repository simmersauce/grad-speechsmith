
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { GraduationCap, ArrowRight, Sparkles } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-secondary/20">
      <div className="container px-4 py-16 mx-auto">
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

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8"
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
      </div>
    </div>
  );
};

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
