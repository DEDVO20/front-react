import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import LoginPage from "./pages/Login";
import NoConformidadesAbiertas from "@/pages/No_conformidades_Abiertas";
import NoConformidadesEnTratamiento from "@/pages/No_conformidades_EnTratamiento";
import NoConformidadesCerradas from "./pages/No_conformidades_Cerradas";

import AccionesCorrectivasCerradas from "./pages/Acciones_correctivas/Acciones_correctivas_Cerradas";
import AccionesCorrectivasVerificadas from "./pages/Acciones_correctivas/Acciones_correctivas_Verificadas";
import NuevasAccionesCorrectivas from "./pages/Acciones_correctivas/nuevas";
import EnProcesoAccionesCorrectivas from "./pages/Acciones_correctivas/enproceso";
import SolucionarAccionCorrectiva from "./pages/Acciones_correctivas/SolucionarAccionCorrectiva";
import DashboardAccionesCorrectivas from "./pages/Acciones_correctivas/DashboardAccionesCorrectivas";

import AprobacionesPendientes from "./pages/documentos/Aprobaciones_Pendientes";
import DocumentosObsoletos from "./pages/documentos/Documentos_Obsoletos";

import GestionarAreas from "./pages/areas/Gestionar_Areas";
import AreasResponsables from "./pages/areas/Asignar_Responsables";

import ListaDeUsuarios from "./pages/usuarios/ListaDeUsuarios";
import NuevosUsuarios from "./pages/usuarios/NuevoUsuario";
import EditarUsuario from "./pages/usuarios/EditarUsuario";
import CargaMasivaUsuarios from "./pages/usuarios/CargaMasivaUsuarios";
import RolesYPermisos from "./pages/usuarios/Roles_Permisos";

import AuditoriasPlanificacion from "./pages/auditorias/AuditoriasPlanificacion";
import AuditoriasEnCurso from "./pages/auditorias/EnCurso";
import AuditoriasHallazgosView from "./pages/auditorias/hallazgos";
import AuditoriasCompletas from "./pages/auditorias/Completadas";

import ObjetivosActivos from "./pages/objetivosCalidad/Activos";
import Seguimiento from "./pages/objetivosCalidad/Seguimiento";
import Historial from "./pages/objetivosCalidad/Historial";

import Dashboard from "./pages/Dashboard";
import Perfil from "./components/usuarios/Perfil";
import Documentos from "./pages/Documentos";
import CreateDocument from "./components/documents/CreateDocument";
import VerDocumento from "./pages/VerDocumento";
import EditarDocumento from "./pages/EditarDocumento";
import ControlVersiones from "./pages/ControlVersiones";

import TableroIndicadores from "./pages/Indicadores/tablero";
import EficaciaIndicadores from "./pages/Indicadores/eficacia";
import EficienciaIndicadores from "./pages/Indicadores/eficiencia";
import CumplimientoIndicadores from "./pages/Indicadores/cumplimiento";

import CapacitacionesProgramadas from "./pages/CapacitacionesProgramadas";
import CapacitacionesHistorial from "./pages/CapacitacionesHistorial";
import CapacitacionesAsistencia from "./pages/CapacitacionesAsistencia";
import CapacitacionesCompetencia from "./pages/CapacitacionesCompetencia";

import ReportesView from "./pages/reportes";
import MatrizRiesgos from "./pages/riesgos/matriz";
import ControlesRiesgos from "./pages/riesgos/controles";
import TratamientoRiesgos from "./pages/riesgos/tratamiento";
import MapaProcesos from "./pages/MapaProcesos";
import FormularioProceso from "./pages/procesos/FormularioProceso";
import DetalleProceso from "./pages/procesos/DetalleProceso";
import ListadoProcesos from "./pages/procesos/ListadoProcesos";
import MigracionesDB from "./pages/sistema/MigracionesDB";
import MesaDeAyuda from "./pages/soporte/MesaDeAyuda";
import Seguridad from "./pages/seguridad";
import Configuracion from "./pages/configuracion";

import { ProtectedLayout } from "./components/ProtectedLayout";
import { AuthProvider } from "./context/AuthContext";

import { Toaster } from "sonner";
import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" richColors closeButton />

        <Routes>
          {/* Redirección inicial */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<LoginPage />} />

          {/* Rutas protegidas */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/perfil" element={<Perfil />} />

            {/* Documentos */}
            <Route path="/documentos" element={<Documentos />} />
            <Route path="/control-versiones" element={<ControlVersiones />} />
            <Route path="/documentos/crear" element={<CreateDocument />} />
            <Route path="/documentos/:id" element={<VerDocumento />} />
            <Route path="/documentos/:id/editar" element={<EditarDocumento />} />
            <Route path="/documentos/:id/aprobaciones" element={<AprobacionesPendientes />} />

            <Route path="/Aprobaciones_Pendientes" element={<AprobacionesPendientes />} />
            <Route path="/Documentos_Obsoletos" element={<DocumentosObsoletos />} />

            {/* Áreas */}
            <Route path="/gestionar_areas" element={<GestionarAreas />} />
            <Route
              path="/Asignar_Responsables"
              element={<AreasResponsables />}
            />
            <Route path="/reportes" element={<ReportesView />} />
            <Route path="/Asignar_Responsables" element={<AreasResponsables />} />

            {/* Usuarios */}
            <Route path="/ListaDeUsuarios" element={<ListaDeUsuarios />} />
            <Route path="/NuevoUsuario" element={<NuevosUsuarios />} />
            <Route path="/usuarios/:id/editar" element={<NuevosUsuarios />} />
            <Route path="/usuarios/:id/editar" element={<EditarUsuario />} />
            <Route path="/usuarios/carga-masiva" element={<CargaMasivaUsuarios />} />
            <Route path="/Roles_y_Permisos" element={<RolesYPermisos />} />

            {/* Auditorías */}
            <Route path="/AuditoriasPlanificacion" element={<AuditoriasPlanificacion />} />
            <Route path="/AuditoriasEnCurso" element={<AuditoriasEnCurso />} />
            <Route path="/AuditoriasCompletas" element={<AuditoriasCompletas />} />
            <Route path="/AuditoriasHallazgosView" element={<AuditoriasHallazgosView />} />

            {/* Objetivos de Calidad */}
            <Route path="/Activos" element={<ObjetivosActivos />} />
            <Route path="/Seguimiento" element={<Seguimiento />} />
            <Route path="/Historial" element={<Historial />} />

            {/* No conformidades */}
            <Route path="/No_conformidades_Abiertas" element={<NoConformidadesAbiertas />} />
            <Route path="/No_conformidades_EnTratamiento" element={<NoConformidadesEnTratamiento />} />
            <Route path="/No_conformidades_Cerradas" element={<NoConformidadesCerradas />} />

            {/* Acciones Correctivas */}
            <Route path="/acciones-correctivas/dashboard" element={<DashboardAccionesCorrectivas />} />
            <Route path="/Acciones_correctivas_Cerradas" element={<AccionesCorrectivasCerradas />} />
            <Route path="/Acciones_correctivas_Verificadas" element={<AccionesCorrectivasVerificadas />} />
            <Route path="/Acciones_correctivas_Nuevas" element={<NuevasAccionesCorrectivas />} />
            <Route path="/Acciones_correctivas_EnProceso" element={<EnProcesoAccionesCorrectivas />} />
            <Route path="/acciones-correctivas/:id/solucionar" element={<SolucionarAccionCorrectiva />} />

            {/* Capacitaciones */}
            <Route path="/capacitaciones/programadas" element={<CapacitacionesProgramadas />} />
            <Route path="/capacitaciones/historial" element={<CapacitacionesHistorial />} />
            <Route path="/capacitaciones/asistencias" element={<CapacitacionesAsistencia />} />
            <Route path="/capacitaciones/competencias" element={<CapacitacionesCompetencia />} />

            {/* Indicadores */}
            <Route path="/indicadores/tablero" element={<TableroIndicadores />} />
            <Route path="/indicadores/eficacia" element={<EficaciaIndicadores />} />
            <Route path="/indicadores/eficiencia" element={<EficienciaIndicadores />} />
            <Route path="/indicadores/cumplimiento" element={<CumplimientoIndicadores />} />

            {/* Riesgos */}
            <Route path="/riesgos/matriz" element={<MatrizRiesgos />} />
            <Route path="/riesgos/controles" element={<ControlesRiesgos />} />
            <Route path="/riesgos/tratamiento" element={<TratamientoRiesgos />} />

            {/* Procesos */}
            <Route path="/procesos" element={<MapaProcesos />} />
            <Route path="/procesos/listado" element={<ListadoProcesos />} />
            <Route path="/procesos/nuevo" element={<FormularioProceso />} />
            <Route path="/procesos/:id" element={<DetalleProceso />} />
            <Route path="/procesos/:id/editar" element={<FormularioProceso />} />

            {/* Sistema */}
            <Route path="/sistema/migraciones" element={<MigracionesDB />} />

            {/* Soporte */}
            <Route path="/mesa-ayuda" element={<MesaDeAyuda />} />

            {/* Configuración y Seguridad */}
            <Route path="/configuracion" element={<Configuracion />} />
            <Route path="/seguridad" element={<Seguridad />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
