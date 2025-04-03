
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { 
  GraduationCap, 
  ArrowRight, 
  Sparkles, 
  ClipboardList, 
  Bot, 
  Edit,
  MessageSquare,
  Star 
} from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { FaqItem } from "@/components/FaqItem";
import { trackButtonClick } from "@/utils/clickTracking";

const Index = () => {
  const navigate = useNavigate();

  const handleCreateSpeechClick = () => {
    trackButtonClick('create_speech_button', { location: 'home_page' });
    navigate("/create");
  };

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
            Craft Your Coolest Perfect Graduation Speech
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Let AI help you create a memorable and inspiring graduation speech in minutes
          </p>
          <Button
            onClick={handleCreateSpeechClick}
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

        {/* Benefits Section Header */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-28 mb-12 text-center max-w-3xl mx-auto"
        >
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your AI Powered Graduation Speech Assistant</h2>
          <p className="text-xl text-gray-600">Benefits Of using ToastieAI</p>
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
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

        {/* Testimonials Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-28 max-w-5xl mx-auto"
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Don't take our word for it</h2>
            <p className="text-xl text-gray-600">
              Our AI-crafted speeches have been the centerpiece of countless graduations. But don't just take our word for it—hear from those who have inspired with us.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + index * 0.1, duration: 0.5 }}
              >
                <Card className="h-full hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="mb-4 flex">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="h-5 w-5 fill-primary text-primary" />
                      ))}
                    </div>
                    <p className="italic mb-6 text-gray-600">"{testimonial.quote}"</p>
                    <div className="flex items-center">
                      <div className="flex items-center justify-center w-12 h-12 bg-primary/10 rounded-full mr-4">
                        <MessageSquare className="w-6 h-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">{testimonial.name}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-28 max-w-4xl mx-auto"
        >
          <div className="text-center max-w-3xl mx-auto mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Frequently Asked Questions</h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our graduation speech service
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
            {faqs.map((faq, index) => (
              <FaqItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>
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
            onClick={handleCreateSpeechClick}
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

const testimonials = [
  {
    quote: "The speech generated for my high school graduation was better than anything I could have written on my own. It was personal, inspiring, and received a standing ovation!",
    name: "Emma Johnson",
    role: "High School Graduate"
  },
  {
    quote: "As a professor, I was skeptical about AI-generated content. But the speech crafted for our department's graduation ceremony was thoughtful and captured our unique academic journey.",
    name: "Dr. Michael Chen",
    role: "University Professor"
  },
  {
    quote: "My graduation speech needed to be memorable yet professional. ToastieAI delivered exactly what I needed, with just the right balance of humor and inspiration.",
    name: "Sarah Williams",
    role: "MBA Graduate"
  }
];

const faqs = [
  {
    question: "What types of speeches can be created with our platform?",
    answer: "Our flexible platform allows you to craft speeches for any graduation role, whether you're a valedictorian, class president, alumni, guest speaker, or even delivering a thank-you to teachers or mentors. Customize your tone—be it motivational, reflective, humorous, or heartfelt—to suit your audience and occasion."
  },
  {
    question: "Why should I choose this service?",
    answer: "Choose our service when you want to deliver an unforgettable graduation speech that inspires your audience. Whether you're nervous about public speaking, short on time, or struggling to turn your thoughts and experiences into words, we're here to help you craft a speech that leaves a lasting impression."
  },
  {
    question: "How can I craft my speech using your platform?",
    answer: "Simply select the type of speech you need and complete our tailored form. This step-by-step process gathers the essential details about your journey, memories, and achievements. We then refine and enhance your input, creating a personalized speech that captures your unique voice and story. Receive your ready-to-go speech in seconds—no writing skills required."
  },
  {
    question: "How does your speech creation technology work?",
    answer: "Powered by advanced AI, our system analyzes your writing style, tone, and the details you provide. It polishes your narrative, ensures clarity, and weaves your stories into a cohesive and impactful speech, designed to connect with and inspire your audience while preserving your original essence."
  },
  {
    question: "How do I get my speech?",
    answer: "Just complete the easy-to-use form with your stories and reflections, and we'll deliver three different drafts of your graduation speech within minutes—all for a simple, one-time purchase."
  },
  {
    question: "What is the quality of the speeches?",
    answer: "We deliver top-tier speeches comparable to those crafted by professional writers. Drawing from your unique anecdotes, our service produces a polished draft that may need minimal adjustments for personal preferences."
  },
  {
    question: "How long are the speeches?",
    answer: "Speeches are typically 500-700 words, which translates to about 3-5 minutes of speaking time, depending on your pace. The more details you provide, the more customized and potentially longer your speech will be. You can easily add or remove content to match your preferences."
  },
  {
    question: "How long does it take to generate my speech?",
    answer: "Once you complete the form, our system takes just 3-4 minutes to process your information and produce a thoughtfully crafted speech. It's the perfect tool for both careful planners and last-minute speechwriters."
  },
  {
    question: "Is the speech created original?",
    answer: "Absolutely. Every speech is 100% original, crafted specifically from the information you provide. We don't rely on templates, ensuring your speech is as unique and personal as your own story."
  }
];

export default Index;
