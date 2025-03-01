import React from 'react'

const LandingPage = () => {
  return (
    <div
  className=""
  style={{
    backgroundImage: "url('/SRMIST-BANNER.jpg')",
    backgroundSize: "100% 100%", // Stretches to fit
    backgroundRepeat: "no-repeat", // Prevents tiling
    backgroundPosition: "center", // Centers the image
    width: "100%", // Adjust width if needed
    height: "100vh" // Example: Full viewport height
  }}
>

    <div className=" bg-opacity-70 bg-white min-h-screen flex flex-col justify-center items-center" > {/* Vertically centered */}
      {/* Hero Section - Split Left Text, Right Image */}
      <section className="hero py-16 md:py-20 lg:py-24 max-h-screen overflow-hidden"> {/* Reduced padding, max height */}
        <div className="hero-content flex-col justify-start lg:flex-row max-w-6xl  mx-auto px-6 md:px-12 lg:px-24"> {/* Wider container */}

          {/* Left Section - Text Content */}
          <div className="lg:w-1/2 lg:pr-12 text-left lg:text-left mb-10 lg:mb-0"> {/* Left half width, right padding, text alignment */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-gray-900 leading-tight mb-3"> {/* Main Headline - Larger font */}
                SRM Institute of Science and <span className="text-blue-500">Technology</span>
              </h1>
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 leading-relaxed"> {/* Sub Headline - Medium font */}
                Faculty of Engineering and Technology
              </h2>
            </div>
            <p className="mb-8 text-gray-700 text-lg leading-relaxed opacity-90"> {/* Description - Regular font */}
              A powerful platform developed by Department of Computing Technology to revolutionize event management.
              Streamline creation, submission, and review processes for enhanced efficiency and collaboration.
            </p>
            
          </div>



        </div>
      </section>
    </div>
    </div>
  )
}

export default LandingPage;