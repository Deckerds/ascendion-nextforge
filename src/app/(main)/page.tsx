import React from "react";

export default async function Home() {
  return (
    <div className="flex flex-col justify-center items-center px-2 py-20">
      <p className="text-2xl font-bold">Welcome to NextForge</p>
      <p className="text-lg text-center text-gray-600 mb-8">
        A secure authentication system built with Next.js
      </p>
      <div className="bg-white rounded-lg shadow-md p-6 max-w-2xl mx-auto">
        <h2 className="text-2xl font-medium text-gray-800 mb-4">Features</h2>
        <ul className="text-left space-y-2 text-gray-600">
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Responsive Navigation with Mobile Menu
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Secure Multi-Step Authentication
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Multi-Factor Authentication (MFA)
          </li>
          <li className="flex items-center">
            <span className="text-green-500 mr-2">✓</span>
            Transaction Dashboard
          </li>
        </ul>
      </div>
    </div>
  );
}
