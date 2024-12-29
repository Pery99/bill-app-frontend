import { ChatBubbleLeftRightIcon, EnvelopeIcon, PhoneIcon } from "@heroicons/react/24/outline";

function Support() {
  const supportData = {
    email: "quickbillshelp@gmail.com",
    whatsapp: "+234 704 429 9948",
    phone: "+234 704 429 9948",
    hours: "6:00 AM - 10:00 PM (WAT)",
    workdays: "Monday - Sunday",
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Need Help?</h1>
        <p className="text-gray-600 mt-2">We're here to assist you</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6 space-y-6">
        {/* WhatsApp - Primary Support Channel */}
        <a
          href={`https://wa.me/${supportData.whatsapp.replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="block p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
        >
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-green-900">WhatsApp Support</h3>
              <p className="text-green-700">{supportData.whatsapp}</p>
              <p className="text-sm text-green-600 mt-1">Fastest response • Click to chat</p>
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

        {/* Support Hours */}
        <div className="border-t pt-6 mt-6">
          <h3 className="text-sm font-medium text-gray-900 mb-2">Support Hours</h3>
          <p className="text-gray-600">{supportData.hours}</p>
          <p className="text-gray-600">{supportData.workdays}</p>
        </div>
      </div>
    </div>
  );
}

export default Support;
