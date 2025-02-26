import React from 'react'

const LandingPage = () => {
  return (
    <div className="bg-gradient-to-br from-slate-100 to-white min-h-screen flex flex-col justify-center items-center"> {/* Vertically centered */}
      {/* Hero Section - Split Left Text, Right Image */}
      <section className="hero py-16 md:py-20 lg:py-24 max-h-screen overflow-hidden"> {/* Reduced padding, max height */}
        <div className="hero-content flex-col lg:flex-row max-w-6xl mx-auto px-6 md:px-12 lg:px-24"> {/* Wider container */}

          {/* Left Section - Text Content */}
          <div className="lg:w-1/2 lg:pr-12 text-center lg:text-left mb-10 lg:mb-0"> {/* Left half width, right padding, text alignment */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-3"> {/* Main Headline - Larger font */}
                Department of Computing <span className="text-teal-500">Technologies</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 leading-relaxed"> {/* Sub Headline - Medium font */}
                In-House Proposal Management
              </h2>
            </div>
            <p className="mb-8 text-gray-700 text-lg leading-relaxed opacity-90"> {/* Description - Regular font */}
              A powerful platform developed by CTech to revolutionize in-house proposal management.
              Streamline creation, submission, and review processes for enhanced efficiency and collaboration.
            </p>
            
          </div>

          {/* Right Section - Image in a Box */}
          <div className="lg:w-1/2 flex justify-center items-center"> {/* Right half width, center content */}
            <div className="p-6 bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-shadow duration-300"> {/* Box around image */}
              <img
                src="/tp.jpg" // Replace with your image
                className="max-w-full h-auto rounded-2xl" // Image within box, rounded corners
                alt="Proposal Management System Interface"
              />
            </div>
          </div>

        </div>
      </section>
    </div>
  )
}

export default LandingPage