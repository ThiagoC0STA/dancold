/** Enquanto a página carrega: o desenho da tela, sem números. */
export default function Loading() {
  return (
    <div aria-busy="true" aria-label="Carregando">
      <div className="mb-6 space-y-2">
        <div className="adm-skeleton h-6 w-48" />
        <div className="adm-skeleton h-4 w-72 max-w-full" />
      </div>
      <div className="adm-panel grid gap-4 p-5 sm:grid-cols-2 xl:grid-cols-4">
        {[0, 1, 2, 3].map((item) => (
          <div key={item} className="space-y-2">
            <div className="adm-skeleton h-3.5 w-24" />
            <div className="adm-skeleton h-7 w-16" />
          </div>
        ))}
      </div>
      <div className="adm-panel mt-5 space-y-3 p-5">
        {[0, 1, 2, 3, 4].map((item) => (
          <div key={item} className="adm-skeleton h-9 w-full" />
        ))}
      </div>
    </div>
  );
}
