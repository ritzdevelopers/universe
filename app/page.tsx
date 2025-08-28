'use client';

import { useState, useEffect, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere } from '@react-three/drei';
import * as THREE from 'three';
import ChatBoat from './chat/ChatBoat';

// Types for Unsplash API
interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
  };
  alt_description: string;
  user: {
    name: string;
  };
}

// UniverseScene Component
const UniverseScene = () => {
  return (
    <Canvas camera={{ position: [0, 0, 5] }}>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <Stars radius={100} depth={50} count={5000} factor={4} />
      <Planet position={[-2, 0, 0]} />
      <Planet position={[2, 0, 0]} size={0.5} color="orange" />
      <Planet position={[0, 1.5, -1]} size={0.3} color="lightblue" />
      <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.5} />
    </Canvas>
  );
};

// Planet Component
const Planet = ({ position, size = 0.7, color = "white" }: { position: [number, number, number], size?: number, color?: string }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state, delta) => {
    meshRef.current.rotation.y += delta * 0.5;
  });
  
  return (
    <Sphere ref={meshRef} position={position} args={[size, 32, 32]}>
      <meshStandardMaterial color={color} />
    </Sphere>
  );
};

// Header Component
const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  return (
    <header className="fixed top-0 w-full bg-black bg-opacity-70 backdrop-blur-md z-50 py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="text-2xl font-bold text-white">Universe Explorer</div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex space-x-8">
          {['Home', 'Galaxies', 'Planets', 'Stars', 'About'].map((item) => (
            <a key={item} href={`#${item.toLowerCase()}`} className="text-white hover:text-purple-400 transition-colors">
              {item}
            </a>
          ))}
        </nav>
        
        {/* Mobile Menu Button */}
        <button 
          className="md:hidden text-white"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Mobile Navigation */}
      {isMenuOpen && (
        <nav className="md:hidden mt-4 bg-black bg-opacity-90 rounded-lg p-4">
          <div className="flex flex-col space-y-4">
            {['Home', 'Galaxies', 'Planets', 'Stars', 'About'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`} 
                className="text-white hover:text-purple-400 transition-colors py-2"
                onClick={() => setIsMenuOpen(false)}
              >
                {item}
              </a>
            ))}
          </div>
        </nav>
      )}
    </header>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <section className="relative h-screen flex items-center justify-center">
      <div className="absolute inset-0 z-0">
        <UniverseScene />
      </div>
      
      <div className="z-10 text-center text-white px-4">
        <h1 className="text-5xl md:text-7xl font-bold mb-6">Explore the Universe</h1>
        <p className="text-xl md:text-2xl max-w-2xl mx-auto mb-8">
          Discover the wonders of our cosmos through stunning imagery and interactive 3D experiences
        </p>
        <button className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-colors">
          Begin Journey
        </button>
      </div>
      
      <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 animate-bounce">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
        </svg>
      </div>
    </section>
  );
};

// Gallery Section with Unsplash API
const GallerySection = () => {
  const [images, setImages] = useState<UnsplashImage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const accessKey = process.env.NEXT_PUBLIC_UNSPLASH_ACCESS_KEY;
        const query = 'universe galaxy space';
        const response = await fetch(
          `https://api.unsplash.com/search/photos?query=${query}&per_page=9&client_id=${'y1Xl-aCqD3kMFsElw3f-RjBZztGXdUPBVbRJQQVM7Do'}`
        );
        const data = await response.json();
        setImages(data.results);
      } catch (error) {
        console.error('Error fetching images from Unsplash:', error);
        // Fallback images if API fails
        setImages([]);
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, []);

  if (loading) {
    return (
      <section id="gallery" className="py-20 bg-gradient-to-b from-black to-purple-900">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Cosmic Gallery</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-64 bg-gray-800 rounded-lg animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="gallery" className="py-20 bg-gradient-to-b from-black to-purple-900">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-12">Cosmic Gallery</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {images && images.map((image) => (
            <div key={image.id} className="group relative overflow-hidden rounded-lg h-64">
              <img
                src={image.urls.small}
                alt={image.alt_description || 'Space image'}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black bg-opacity-40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                <p className="text-white">Photo by {image.user.name}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Facts Section
const FactsSection = () => {
  const facts = [
    {
      title: "Age of the Universe",
      value: "13.8 Billion Years",
      description: "The universe began with the Big Bang and has been expanding ever since."
    },
    {
      title: "Number of Galaxies",
      value: "100-200 Billion",
      description: "Each containing billions of stars, planets, and other celestial objects."
    },
    {
      title: "Speed of Light",
      value: "299,792 km/s",
      description: "The ultimate speed limit of the universe, taking 8 minutes from Sun to Earth."
    }
  ];

  return (
    <section id="facts" className="py-20 bg-black">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-bold text-white text-center mb-4">Astronomical Facts</h2>
        <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
          The universe is full of incredible phenomena that continue to amaze scientists and enthusiasts alike.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {facts && facts.map((fact, index) => (
            <div key={index} className="bg-gray-900 p-6 rounded-lg border border-purple-800 transform transition-transform hover:scale-105">
              <h3 className="text-xl font-bold text-purple-400 mb-2">{fact.title}</h3>
              <p className="text-2xl font-bold text-white mb-3">{fact.value}</p>
              <p className="text-gray-400">{fact.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">Universe Explorer</h3>
            <p className="text-gray-400 max-w-md">
              Exploring the wonders of our cosmos through stunning imagery and interactive 3D experiences.
            </p>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {['Home', 'Gallery', 'Facts', 'About'].map((item) => (
                <li key={item}>
                  <a href={`#${item.toLowerCase()}`} className="text-gray-400 hover:text-white transition-colors">
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect With Us</h4>
            <div className="flex space-x-4">
              {['facebook', 'twitter', 'instagram', 'youtube'].map((platform) => (
                <a key={platform} href="#" className="text-gray-400 hover:text-white transition-colors">
                  <span className="sr-only">{platform}</span>
                  <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center">
                    {/* Icon would go here */}
                    {platform.charAt(0).toUpperCase()}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>© {new Date().getFullYear()} Universe Explorer. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
const UniverseLandingPage = () => {
  return (
    <div className="min-h-screen bg-black text-white">
      <ChatBoat/>
      <Header />
      <main>
        <HeroSection />
        <GallerySection />
        <FactsSection />
      </main>
      <Footer />
    </div>
  );
};

export default UniverseLandingPage;