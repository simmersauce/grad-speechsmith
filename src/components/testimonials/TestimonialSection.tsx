
import { motion } from "framer-motion";
import TestimonialCard from "./TestimonialCard";

// Testimonial data
const testimonials = [
  {
    text: "Delivering a speech to my entire graduating class felt overwhelming, but Gradsmith made it so much easier. They helped me craft a speech that was both inspiring and personal, capturing our shared journey perfectly. It was a moment I'll never forget.",
    type: "Valedictorian"
  },
  {
    text: "Speaking at the graduation was such an honor, but I didn't know where to begin. Gradsmith helped me organize my ideas into a speech that was motivational and heartfelt. The feedback I received after the event was incredible!",
    type: "Guest Speaker"
  },
  {
    text: "As an alumnus, I wanted to inspire the next generation, but I wasn't sure how to put my thoughts into words. Gradsmith created a speech that celebrated their accomplishments and encouraged them to embrace the future with confidence. It was perfect.",
    type: "Alumni"
  },
  {
    text: "They turned my scattered thoughts into a powerful speech that brought my classmates to their feet. It celebrated our achievements and gave us all a moment to reflect on everything we've accomplished together.",
    type: "Student"
  }
];

const TestimonialSection = () => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.5 }}
      className="mb-8"
    >
      <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-center">What our users say</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {testimonials.map((testimonial, index) => (
          <TestimonialCard 
            key={index} 
            text={testimonial.text} 
            type={testimonial.type} 
          />
        ))}
      </div>
    </motion.div>
  );
};

export default TestimonialSection;
