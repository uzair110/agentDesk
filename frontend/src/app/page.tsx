'use client';

import React from 'react';
import Link from "next/link";

export default function Home(): React.ReactElement {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
                AgentDesk
              </span>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/agents" className="text-gray-300 hover:text-white transition-colors">
                Agents
              </Link>
              <Link href="/chat" className="text-gray-300 hover:text-white transition-colors">
                Chat
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-32 pb-20">
        <div className="text-center space-y-8">
          <h1 className="text-5xl md:text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            AgentDesk
          </h1>
          <p className="text-xl md:text-2xl text-gray-300 max-w-2xl mx-auto">
            Create, manage, and deploy intelligent AI agents that work for you. 
            Transform your workflow with cutting-edge automation.
          </p>
          
          {/* CTA Button */}
          <div className="pt-8">
            <Link 
              href="/agents" 
              className="inline-block px-8 py-4 text-lg font-semibold text-white bg-gradient-to-r from-blue-500 to-purple-600 rounded-full hover:from-blue-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              Create Your Agent →
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-200">
            <div className="text-blue-400 text-2xl mb-4">🤖</div>
            <h3 className="text-xl font-semibold mb-2">Smart Automation</h3>
            <p className="text-gray-400">Create intelligent agents that automate your repetitive tasks with precision.</p>
          </div>
          
          <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-200">
            <div className="text-purple-400 text-2xl mb-4">⚡</div>
            <h3 className="text-xl font-semibold mb-2">Lightning Fast</h3>
            <p className="text-gray-400">Experience real-time responses and seamless interactions with your agents.</p>
          </div>
          
          <div className="bg-gray-800/50 p-6 rounded-xl backdrop-blur-sm hover:bg-gray-800/70 transition-all duration-200">
            <div className="text-green-400 text-2xl mb-4">🔒</div>
            <h3 className="text-xl font-semibold mb-2">Secure & Reliable</h3>
            <p className="text-gray-400">Your data is protected with enterprise-grade security and reliability.</p>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/20 rounded-full filter blur-3xl"></div>
        </div>
      </div>
    </div>
  );
}
