import React from "react";

const About = () => {
  return (
    <div className="min-h-screen bg-black text-white rounded  " >
      <main className="container mx-auto px-4 py-16  font-mono">
      <div className="max-w-3xl mx-auto bg-gray-900 rounded-lg p-8 shadow-lg shadow-red-600/50">
      <h1 className="text-2xl font-bold text-center mb-8">ABOUT</h1>

          <div className="space-y-6 text-gray-300">
            <p>
              We are passionate gamers who live and breathe the thrill of
              immersive gameplay. Founded by a team of gaming enthusiasts, our
              mission is to provide the ultimate destination for gamers to find
              the best gear, accessories, and cutting-edge technology to elevate
              their gaming experience.
            </p>

            <p>
              We specialize in offering top-quality gaming products, from
              high-performance gaming consoles, precision peripherals, and
              powerful graphics cards to immersive gaming headsets and
              ultra-responsive monitors. Every product we offer is carefully
              selected to meet the needs of both casual players and professional
              gamers.
            </p>

            <p>
              Our goal is simple: to empower gamers to play at their best. With
              expert knowledge, competitive pricing, and a commitment to
              customer satisfaction, we aim to be the go-to source for all
              things gaming.
            </p>

            <p className="text-center font-semibold">
              Game On. Level Up with Game Pulse.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
};

export default About;
