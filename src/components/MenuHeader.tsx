export const MenuHeader = () => {
  return (
    <header className="relative h-[70vh] flex items-center justify-center text-center mb-16 overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900"></div>
      <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&h=1200&fit=crop')] bg-cover bg-center opacity-30"></div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/40"></div>
      
      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-4">
        <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white mb-6 tracking-tight">
          Tast3D
        </h1>
        <p className="text-xl sm:text-2xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
          Experience our culinary artistry in three dimensions. Locally crafted. Globally inspired.
        </p>
      </div>
    </header>
  );
};