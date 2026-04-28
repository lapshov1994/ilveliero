import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-[#0A1128] text-white pt-24 pb-12 px-6 lg:px-20 relative overflow-hidden">

      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent pointer-events-none"></div>

      <div className="max-w-7xl mx-auto relative z-10">

        {/* Big CTA */}
        <div className="mb-24 flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-16">
          <div>
            <h2 className="text-5xl md:text-7xl font-serif font-light leading-tight">
              Inizia il tuo <br/>
              <span className="italic text-[#D4AF37]">viaggio qui.</span>
            </h2>
          </div>
          <button className="mt-10 md:mt-0 bg-[#D4AF37] text-[#0A1128] px-10 py-5 uppercase text-xs tracking-[0.2em] font-bold w-full md:w-auto text-center relative overflow-hidden group">
            <span className="relative z-10 inline-block transition-transform duration-300 group-hover:translate-x-[3px]">Verifica Disponibilità</span>
            <span className="absolute inset-0 bg-white scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-500" />
          </button>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 text-sm font-light text-white/60">

          {/* Brand */}
          <div className="col-span-1 md:col-span-1">
            <div className="text-xl tracking-[0.2em] font-serif uppercase text-white mb-6 flex items-center">
              il veliero <span className="text-[#D4AF37] ml-2 text-xs">★★★</span>
            </div>
            <p className="tracking-[0.15em] uppercase text-[9px] leading-loose text-white/40">
              Autentico Artigianato Siciliano <br/>
              Mare e Vento
            </p>
          </div>

          {/* Location */}
          <div>
            <h4 className="text-white uppercase tracking-[0.2em] text-[10px] mb-6 font-medium">Posizione</h4>
            <p className="mb-2 hover:text-white transition-colors cursor-default">Via Savoia 15</p>
            <p className="mb-2 hover:text-white transition-colors cursor-default">91010 San Vito Lo Capo (TP)</p>
            <p className="hover:text-white transition-colors cursor-default">Sicilia, Italia</p>
          </div>

          {/* Contacts */}
          <div>
            <h4 className="text-white uppercase tracking-[0.2em] text-[10px] mb-6 font-medium">Contatti</h4>
            <p className="mb-2 hover:text-[#D4AF37] cursor-pointer transition-colors">+39 0923 000000</p>
            <p className="mb-2 hover:text-[#D4AF37] cursor-pointer transition-colors">info@ilveliero.it</p>
            <p className="hover:text-[#D4AF37] cursor-pointer transition-colors mt-6 uppercase text-[10px] tracking-widest block">
              Instagram ↗
            </p>
          </div>

          {/* Legal */}
          <div className="md:text-right flex flex-col md:items-end justify-between h-full">
            <div>
              <p className="mb-3 hover:text-white cursor-pointer transition-colors text-xs">Privacy Policy</p>
              <p className="mb-3 hover:text-white cursor-pointer transition-colors text-xs">Cookie Policy</p>
            </div>
            <p className="mt-12 text-[9px] uppercase tracking-[0.2em] text-white/30">
              © 2026 Il Veliero.
            </p>
          </div>

        </div>
      </div>
    </footer>
  );
}
