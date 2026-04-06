export default function Home() {
  return (
    <main className="min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-200 px-6 py-4 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#1A56DB]">SWITCH</h1>
        <div className="flex gap-3">
          <a href="/login" className="px-4 py-2 text-[#1A56DB] font-medium hover:underline">
            Entrar
          </a>
          <a href="/cadastro" className="px-4 py-2 bg-[#1A56DB] text-white rounded-xl font-medium hover:bg-[#1447be] transition-colors">
            Cadastrar
          </a>
        </div>
      </header>

      {/* Hero */}
      <section className="px-6 py-20 text-center max-w-4xl mx-auto">
        <h2 className="text-5xl font-bold text-gray-900 mb-4">
          Troque semanas de timeshare com facilidade
        </h2>
        <p className="text-xl text-gray-500 mb-8">
          Deposite suas semanas, ganhe pontos e hospede-se nos melhores resorts do Brasil.
        </p>
        <a
          href="/cadastro"
          className="inline-block bg-[#1A56DB] text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-[#1447be] transition-colors"
        >
          Começar agora — é grátis
        </a>
      </section>

      {/* Cards de destaque */}
      <section className="px-6 pb-20 max-w-6xl mx-auto">
        <h3 className="text-2xl font-semibold text-gray-900 mb-6">Resorts em destaque</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { nome: 'Beach Park Acqua Resort', cidade: 'Aquiraz, CE', pontos: '350 pts/diária' },
            { nome: 'Enjoy Olímpia Park', cidade: 'Olímpia, SP', pontos: '250 pts/diária' },
            { nome: 'Riviera de Santa Cristina', cidade: 'Bertioga, SP', pontos: '300 pts/diária' },
          ].map((resort) => (
            <div key={resort.nome} className="border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-shadow">
              <div className="bg-gradient-to-br from-blue-100 to-blue-50 h-48 flex items-center justify-center">
                <span className="text-4xl">🏖️</span>
              </div>
              <div className="p-4">
                <h4 className="font-semibold text-gray-900">{resort.nome}</h4>
                <p className="text-gray-500 text-sm mt-1">📍 {resort.cidade}</p>
                <p className="text-[#1A56DB] font-medium mt-2">{resort.pontos}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
