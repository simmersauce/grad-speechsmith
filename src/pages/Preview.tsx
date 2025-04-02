
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import SpeechPreview from "@/components/speech/SpeechPreview";
import PaymentCard from "@/components/payment/PaymentCard";
import TestimonialSection from "@/components/testimonials/TestimonialSection";
import SharableLinkCard from "@/components/preview/SharableLinkCard";
import ErrorAlert from "@/components/preview/ErrorAlert";
import { usePreviewData } from "@/hooks/use-preview-data";

// Preview character limit constant
const PREVIEW_CHAR_LIMIT = 400;

const Preview = () => {
  const {
    speech,
    isLoading,
    formData,
    customerEmail,
    setCustomerEmail,
    isRedirecting,
    error,
    sharableLink,
    handlePaymentRedirect,
    handleCopyLink
  } = usePreviewData();

  if (!formData) return null;

  return (
    <div className="min-h-screen secondary py-8 sm:py-16">
      <div className="container max-w-3xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {error && <ErrorAlert message={error} />}

          {sharableLink && (
            <SharableLinkCard 
              sharableLink={sharableLink} 
              onCopyLink={handleCopyLink} 
            />
          )}

          <Card className="p-4 sm:p-8 mb-6">
            <SpeechPreview 
              speech={speech} 
              isLoading={isLoading && !isRedirecting} 
              formData={formData} 
              previewCharLimit={PREVIEW_CHAR_LIMIT}
            />
          </Card>

          {!isLoading || isRedirecting ? (
            <>
              <PaymentCard 
                customerEmail={customerEmail} 
                setCustomerEmail={setCustomerEmail} 
                formData={formData}
                onPaymentStart={handlePaymentRedirect}
              />
              <TestimonialSection />
            </>
          ) : (
            <TestimonialSection />
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Preview;
