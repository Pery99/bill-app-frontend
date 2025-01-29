import {
  ChatBubbleLeftRightIcon,
  EnvelopeIcon,
  PhoneIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useState } from "react";

function Support() {
  const [openFaq, setOpenFaq] = useState(null);

  const supportData = {
    email: "ShabanExpresshelp@gmail.com",
    whatsapp: "+234 704 429 9948",
    phone: "+234 704 429 9948",
    hours: "6:00 AM - 10:00 PM (WAT)",
    workdays: "Monday - Sunday",
  };

  const faqs = [
    {
      question: "How do I fund my wallet?",
      answer:
        "You can fund your wallet using your debit card or bank transfer. Go to the Fund Wallet page and follow the simple steps to add money to your account.",
    },
    {
      question: "What are reward points?",
      answer:
        "Reward points are earned with every transaction. These points can be converted to cash and added to your wallet balance.",
    },
    {
      question: "How long does it take to process transactions?",
      answer:
        "Most transactions are processed instantly. In rare cases, it might take up to 5 minutes. If you experience any delays, please contact our support team.",
    },
    {
      question: "Is my money safe?",
      answer: "Yes, your money is completely safe. I go lie for you???",
    },
    {
      question: "How do I get a refund?",
      answer:
        "For refund requests, please contact our support team via WhatsApp or email with your transaction details. Refunds are processed within 24-48 hours.",
    },
  ];

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Existing contact section */}
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Need Help?</h1>
        <p className="text-gray-600 mt-2">We're here to assist you</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* WhatsApp - Primary Support Channel */}
        <a
          href={`https://wa.me/${supportData.whatsapp.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-green-900">
                WhatsApp Support
              </h3>
              <p className="text-green-700">{supportData.whatsapp}</p>
              <p className="text-sm text-green-600 mt-1">
                Fastest response • Click to chat
              </p>
            </div>
          </div>
        </a>

        {/* Other Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Email */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <EnvelopeIcon className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium">Email</h3>
            </div>
            <a
              href={`mailto:${supportData.email}`}
              className="text-primary hover:underline"
            >
              {supportData.email}
            </a>
          </div>

          {/* Phone */}
          <div className="p-4 border rounded-lg">
            <div className="flex items-center space-x-3 mb-2">
              <PhoneIcon className="h-5 w-5 text-gray-600" />
              <h3 className="font-medium">Phone</h3>
            </div>
            <a
              href={`tel:${supportData.phone}`}
              className="text-primary hover:underline"
            >
              {supportData.phone}
            </a>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-6">
          Frequently Asked Questions
        </h2>
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b border-gray-100 last:border-0">
              <button
                onClick={() => toggleFaq(index)}
                className="flex items-center justify-between w-full py-4 text-left"
              >
                <span className="font-medium text-gray-900">
                  {faq.question}
                </span>
                <ChevronDownIcon
                  className={`w-5 h-5 text-gray-500 transition-transform ${
                    openFaq === index ? "transform rotate-180" : ""
                  }`}
                />
              </button>
              {openFaq === index && (
                <div className="pb-4">
                  <p className="text-gray-600">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Support Hours - moved to bottom */}
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm font-medium text-gray-900 mb-2">
          Support Hours
        </h3>
        <p className="text-gray-600">{supportData.hours}</p>
        <p className="text-gray-600">{supportData.workdays}</p>
      </div>
    </div>
  );
}

export default Support;
