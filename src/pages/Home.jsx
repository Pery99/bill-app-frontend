import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  PhoneIcon,
  WifiIcon,
  TvIcon,
  WalletIcon,
  LightBulbIcon,
  ShieldCheckIcon,
  ClockIcon,
  CurrencyDollarIcon,
  UserGroupIcon,
  BoltIcon,
  SparklesIcon,
  StarIcon,
} from "@heroicons/react/24/outline";

function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const services = [
    {
      name: "Airtime",
      icon: PhoneIcon,
      description: "Instant airtime recharge for all networks",
      color: "bg-blue-50 text-blue-600",
    },
    {
      name: "Data Bundles",
      icon: WifiIcon,
      description: "Stay connected with affordable data plans",
      color: "bg-green-50 text-green-600",
    },
    {
      name: "Electricity",
      icon: BoltIcon,
      description: "Pay electricity bills seamlessly",
      color: "bg-yellow-50 text-yellow-600",
    },
    {
      name: "TV Subscription",
      icon: TvIcon,
      description: "Never miss your favorite shows",
      color: "bg-purple-50 text-purple-600",
    }
  ];

  const features = [
    {
      title: "Instant Processing",
      description: "Get value within seconds of payment",
      icon: SparklesIcon,
    },
    {
      title: "Secure Payments",
      description: "Bank-grade security for all transactions",
      icon: ShieldCheckIcon,
    },
    {
      title: "24/7 Support",
      description: "We're always here to help",
      icon: ClockIcon,
    },
    {
      title: "Best Rates",
      description: "Competitive prices and discounts",
      icon: StarIcon,
    }
  ];

  const getStartedSteps = [
    {
      number: "01",
      title: "Create an Account",
      description: "Sign up in less than 2 minutes with your email and basic information",
      icon: UserGroupIcon,
      color: "from-blue-500 to-blue-600",
    },
    {
      number: "02",
      title: "Fund Your Wallet",
      description: "Add money to your wallet using your debit card or bank transfer",
      icon: WalletIcon,
      color: "from-green-500 to-green-600",
    },
    {
      number: "03",
      title: "Start Making Payments",
      description: "Choose any service and make instant payments securely",
      icon: CurrencyDollarIcon,
      color: "from-purple-500 to-purple-600",
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Modern Navbar */}
      <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center gap-8">
              <span className="text-2xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                QuickBills
              </span>
              <div className="hidden md:flex gap-6">
                <a href="#services" className="text-sm font-medium text-gray-700 hover:text-primary">Services</a>
                <a href="#features" className="text-sm font-medium text-gray-700 hover:text-primary">Features</a>
                <a href="#pricing" className="text-sm font-medium text-gray-700 hover:text-primary">Pricing</a>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/login" className="text-sm font-medium text-gray-700 hover:text-primary">
                Sign in
              </Link>
              <Link to="/register" className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-600">
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="pt-24 pb-16 px-4 bg-gradient-to-b from-gray-50 to-white">
        <div className="max-w-7xl mx-auto text-center">
          <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-8">
            Pay bills in seconds ⚡
          </span>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            The fastest way to pay your
            <span className="block text-primary">everyday bills</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Experience lightning-fast bill payments with QuickBills. 
            Pay for airtime, data, TV, and electricity bills instantly.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="btn-primary">
              Create Free Account
            </Link>
            <a href="#services" className="btn-secondary">
              View Services
            </a>
          </div>
        </div>
      </div>

      {/* How to Get Started Section */}
      <section className="py-24 bg-gray-50 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
              How to Get Started
            </h2>
            <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
              Three simple steps to start managing all your bill payments in one place
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-1/2 left-0 right-0 h-0.5 bg-gray-200 transform -translate-y-1/2"></div>
            
            {getStartedSteps.map((step, index) => (
              <div key={step.number} className="relative">
                {/* Step card */}
                <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 relative">
                  {/* Numbered badge */}
                  <div className={`absolute -top-4 left-8 h-8 px-3 flex items-center justify-center rounded-full bg-gradient-to-r ${step.color} text-white font-bold text-sm`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mb-6 mt-2">
                    <step.icon className="w-8 h-8 text-gray-900" />
                  </div>

                  {/* Content */}
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {step.title}
                  </h3>
                  <p className="text-gray-600">
                    {step.description}
                  </p>
                </div>

                {/* Arrow for desktop */}
                {index < getStartedSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-6 transform -translate-y-1/2 text-gray-400">
                    <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-16 text-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary hover:bg-primary-600 transition-all duration-300 hover:scale-105 shadow-md"
            >
              Get Started Now
              <svg className="ml-2 -mr-1 w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              All Your Bills in One Place
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Pay all your bills from one dashboard. No more juggling between apps.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((service) => (
              <div key={service.name} className="group relative bg-white p-6 rounded-2xl shadow-sm hover:shadow-lg transition-all">
                <div className={`${service.color} rounded-xl p-3 inline-flex mb-4`}>
                  <service.icon className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-semibold mb-2">{service.name}</h3>
                <p className="text-gray-600">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Why Choose QuickBills?
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              We've built the most reliable bill payment platform in Nigeria
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature) => (
              <div key={feature.title} className="bg-white p-6 rounded-xl">
                <feature.icon className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to simplify your bill payments?
          </h2>
          <p className="text-gray-600 mb-8">
            Join thousands of Nigerians who trust QuickBills for their daily transactions
          </p>
          <Link to="/register" className="btn-primary">
            Get Started Now
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-semibold mb-4">QuickBills</h3>
            <p className="text-gray-400 text-sm">
              Making bill payments fast and secure for everyone.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Services</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>Airtime Recharge</li>
              <li>Data Bundles</li>
              <li>TV Subscription</li>
              <li>Electricity Bills</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>About Us</li>
              <li>Contact</li>
              <li>Privacy Policy</li>
              <li>Terms of Service</li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold mb-4">Contact</h4>
            <ul className="space-y-2 text-gray-400 text-sm">
              <li>support@quickbills.com</li>
              <li>+234 704 429 9948</li>
              <li>Ondo, Nigeria</li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-gray-800 text-center text-gray-400 text-sm">
          <p>
            © {new Date().getFullYear()} Quick Bills. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default Home;
