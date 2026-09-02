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

  return (
    <div className={`bg-white px-8 py-8 text-black ${className}`}>
      <div className="mb-7">
        <img
          src={logoUrl}
          alt={marca.titulo}
          className="max-h-[78px] max-w-[220px] object-contain object-left"
        />
      </div>

      <h1 className="mb-6 text-center text-[22px] font-bold uppercase tracking-[1.5px] text-black">
        {data.nombre || etiquetaTipoDocumento(data.tipoDocumento)}
      </h1>

      <p
        className="mb-5 text-justify text-[12px] leading-relaxed"
        dangerouslySetInnerHTML={{ __html: intro }}
      />

      <table className="mb-5 w-full border-collapse text-[11px]">
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

      {data.contenidoHtml?.trim() ? (
        <div
          className="prose prose-sm max-w-none text-justify text-[12px] leading-relaxed text-black prose-headings:text-black prose-h2:text-[13px] prose-h2:uppercase prose-h2:tracking-wide prose-h2:mt-5 prose-h2:mb-2 [&_table]:w-full [&_table]:border-collapse [&_table]:mb-4 [&_th]:border [&_th]:border-black [&_th]:bg-[#6B6B6B] [&_th]:px-2 [&_th]:py-1.5 [&_th]:text-left [&_th]:text-[10px] [&_th]:font-bold [&_th]:uppercase [&_th]:text-white [&_td]:border [&_td]:border-black [&_td]:px-2 [&_td]:py-1.5 [&_td]:text-[11px]"
          dangerouslySetInnerHTML={{ __html: data.contenidoHtml }}
        />
      ) : (
        <p className="italic text-neutral-500">Este documento no tiene contenido.</p>
      )}

      {data.versiones && data.versiones.length > 0 && (
        <div className="mt-6">
          <h2 className="mb-2 text-[12px] font-bold uppercase tracking-wide">Control de cambios</h2>
          <table className="w-full border-collapse text-[11px]">
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
      )}

      <p className="mt-6 text-justify text-[11px] leading-relaxed">
        El presente documento se emite sin enmendaduras ni tachones. La versión vigente es la
        publicada en el Sistema de Gestión de Calidad. Cualquier copia impresa se considera no
        controlada.
      </p>

      {!data.ocultarFirmas && (
      <div className="mt-10 grid grid-cols-3 gap-4 text-center text-[11px]">
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
