import React from 'react';
import { FileJson, Github } from 'lucide-react';

const Header: React.FC = () => {
  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 flex items-center text-primary-600">
              <FileJson className="h-8 w-8 mr-2" />
              <span className="font-bold text-xl tracking-tight text-gray-900">Doc2LaTeX</span>
            </div>
            <div className="hidden md:block ml-10 space-x-8">
              <span className="text-gray-500 text-sm">Word/PDF to LaTeX Converter powered by Gemini 2.5</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href="#" 
              className="text-gray-400 hover:text-gray-500 transition-colors"
              title="View source"
            >
              <Github className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;