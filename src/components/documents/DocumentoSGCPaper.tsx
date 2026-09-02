import {
  etiquetaEstadoDocumento,
  etiquetaTipoDocumento,
  formatearFechaSGC,
  logoSGCPorDefecto,
  parrafoIntroSGC,
  type DocumentoSGCData,
  type MarcaSGC,
} from "@/utils/documentoSGC";

interface DocumentoSGCPaperProps {
  data: DocumentoSGCData;
  marca: MarcaSGC;
  className?: string;
}

export function DocumentoSGCPaper({ data, marca, className = "" }: DocumentoSGCPaperProps) {
  const vigencia = formatearFechaSGC(
    data.fechaVigencia || data.fechaAprobacion || data.fechaCreacion,
  );
  const logoUrl = marca.logoUrl || logoSGCPorDefecto();
  const intro = parrafoIntroSGC(data, marca);

  const camposIdentificacion: Array<[string, string]> = [
    ["Código", data.codigo || "—"],
    ["Tipo", etiquetaTipoDocumento(data.tipoDocumento)],
    ["Versión", data.version || "1.0"],
    ["Estado", etiquetaEstadoDocumento(data.estado).toUpperCase()],
    ["Vigencia", vigencia],
  ];

  return (
    <div className={`w-full max-w-full break-words bg-white px-3 py-4 text-black sm:px-8 sm:py-8 ${className}`}>
      <div className="mb-5 sm:mb-7">
        <img
          src={logoUrl}
          alt={marca.titulo}
          className="max-h-[56px] max-w-[min(100%,160px)] object-contain object-left sm:max-h-[78px] sm:max-w-[220px]"
        />
      </div>

      <h1 className="mb-4 break-words text-center text-base font-bold uppercase tracking-[1px] text-black sm:mb-6 sm:text-[22px] sm:tracking-[1.5px]">
        {data.nombre || etiquetaTipoDocumento(data.tipoDocumento)}
      </h1>

      <p
        className="mb-5 text-justify text-[11px] leading-relaxed sm:text-[12px]"
        dangerouslySetInnerHTML={{ __html: intro }}
      />

      <div className="mb-5 overflow-hidden border border-black sm:hidden text-[11px]">
        {camposIdentificacion.map(([etiqueta, valor]) => (
          <div key={etiqueta} className="flex border-b border-black last:border-b-0">
            <div className="w-[38%] shrink-0 bg-[#6B6B6B] px-2 py-1.5 text-[10px] font-bold uppercase tracking-wide text-white">
              {etiqueta}
            </div>
            <div className="min-w-0 flex-1 px-2 py-1.5 break-words">{valor}</div>
          </div>
        ))}
        <div className="bg-[#D4D4D4] px-2 py-1.5 text-center text-[10px] font-bold uppercase">
          Documento controlado del SGC · {(data.estado || "borrador").toUpperCase()}
        </div>
      </div>

      <div className="mb-5 hidden overflow-x-auto sm:block">
        <table className="w-full border-collapse text-[11px]">
          <thead>
            <tr className="bg-[#6B6B6B] text-white">
              <th className="border border-black px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide">
                Código
              </th>
              <th className="border border-black px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide">
                Tipo
              </th>
              <th className="border border-black px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide">
                Versión
              </th>
              <th className="border border-black px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide">
                Estado
              </th>
              <th className="border border-black px-2 py-1.5 text-center text-[10px] font-bold uppercase tracking-wide">
                Vigencia
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-black px-2 py-1.5 text-center">{data.codigo || "—"}</td>
              <td className="border border-black px-2 py-1.5">
                {etiquetaTipoDocumento(data.tipoDocumento)}
              </td>
              <td className="border border-black px-2 py-1.5 text-center">{data.version || "1.0"}</td>
              <td className="border border-black px-2 py-1.5 text-center">
                {etiquetaEstadoDocumento(data.estado).toUpperCase()}
              </td>
              <td className="border border-black px-2 py-1.5 text-center">{vigencia}</td>
            </tr>
            <tr className="bg-[#D4D4D4] font-bold">
              <td className="border border-black px-2 py-1.5" colSpan={3}>
                DOCUMENTO CONTROLADO DEL SGC
              </td>
              <td className="border border-black px-2 py-1.5 text-center" colSpan={2}>
                {(data.estado || "borrador").toUpperCase()}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {data.contenidoHtml?.trim() ? (
        <div
          className="prose prose-sm max-w-none overflow-x-auto text-justify text-[11px] leading-relaxed text-black sm:text-[12px] prose-headings:break-words prose-headings:text-black prose-h2:text-[12px] prose-h2:uppercase prose-h2:tracking-wide prose-h2:mt-5 prose-h2:mb-2 sm:prose-h2:text-[13px] [&_img]:h-auto [&_img]:max-w-full [&_pre]:max-w-full [&_pre]:overflow-x-auto [&_table]:mb-4 [&_table]:w-full [&_table]:min-w-0 [&_table]:border-collapse [&_th]:break-words [&_th]:border [&_th]:border-black [&_th]:bg-[#6B6B6B] [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-[10px] [&_th]:font-bold [&_th]:uppercase [&_th]:text-white [&_td]:break-words [&_td]:border [&_td]:border-black [&_td]:px-2 [&_td]:py-1.5 [&_td]:text-[11px]"
          dangerouslySetInnerHTML={{ __html: data.contenidoHtml }}
        />
      ) : (
        <p className="italic text-neutral-500">Este documento no tiene contenido.</p>
      )}

      {data.versiones && data.versiones.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-[12px] font-bold uppercase tracking-wide">Control de cambios</h2>
          <div className="overflow-x-auto">
          <table className="w-full min-w-[360px] border-collapse text-[10px] sm:min-w-0 sm:text-[11px]">
            <thead>
              <tr className="bg-[#6B6B6B] text-white">
                <th className="w-[16%] border border-black px-2 py-1.5 text-center text-[10px] uppercase">
                  Versión
                </th>
                <th className="border border-black px-2 py-1.5 text-center text-[10px] uppercase">
                  Descripción del cambio
                </th>
                <th className="w-[20%] border border-black px-2 py-1.5 text-center text-[10px] uppercase">
                  Fecha
                </th>
              </tr>
            </thead>
            <tbody>
              {data.versiones.map((version, index) => (
                <tr key={`${version.version}-${index}`}>
                  <td className="border border-black px-2 py-1.5 text-center">
                    {version.version || "—"}
                  </td>
                  <td className="border border-black px-2 py-1.5">
                    {version.descripcion_cambios || "Sin descripción"}
                  </td>
                  <td className="border border-black px-2 py-1.5 text-center">
                    {formatearFechaSGC(version.creado_en)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}

      <p className="mt-6 text-justify text-[11px] leading-relaxed">
        El presente documento se emite sin enmendaduras ni tachones. La versión vigente es la
        publicada en el Sistema de Gestión de Calidad. Cualquier copia impresa se considera no
        controlada.
      </p>

      {!data.ocultarFirmas && (
      <div className="mt-8 grid grid-cols-1 gap-6 text-center text-[11px] sm:mt-10 sm:grid-cols-3 sm:gap-4">
        <div>
          <div className="mx-auto mb-2 w-[85%] border-t border-black pt-2 font-semibold">
            {data.elaboradoPor || "Pendiente"}
          </div>
          {data.elaboradoPor && data.elaboradoPor !== "Pendiente" && (data.fechaElaboracion || data.fechaCreacion) && (
            <div className="mb-1 text-[9px] text-neutral-600">
              {formatearFechaSGC(data.fechaElaboracion || data.fechaCreacion)}
            </div>
          )}
          <div className="text-[10px] font-bold uppercase tracking-wider">Elaboró</div>
        </div>
        <div>
          <div className="mx-auto mb-2 w-[85%] border-t border-black pt-2 font-semibold">
            {data.revisadoPor || "Pendiente"}
          </div>
          {data.revisadoPor && data.revisadoPor !== "Pendiente" && data.fechaRevision && (
            <div className="mb-1 text-[9px] text-neutral-600">
              {formatearFechaSGC(data.fechaRevision)}
            </div>
          )}
          <div className="text-[10px] font-bold uppercase tracking-wider">Revisó</div>
        </div>
        <div>
          <div className="mx-auto mb-2 w-[85%] border-t border-black pt-2 font-semibold">
            {data.aprobadoPor || "Pendiente"}
          </div>
          {data.aprobadoPor && data.aprobadoPor !== "Pendiente" && data.fechaAprobacion && (
            <div className="mb-1 text-[9px] text-neutral-600">
              {formatearFechaSGC(data.fechaAprobacion)}
            </div>
          )}
          <div className="text-[10px] font-bold uppercase tracking-wider">Aprobó</div>
        </div>
      </div>
      )}
    </div>
  );
}
