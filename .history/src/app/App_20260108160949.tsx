import React, { useState, useEffect } from "react";
import { PreLogin } from "./components/PreLogin";
import { ShiftSelection } from "./components/ShiftSelection";
import { LoginFormNew } from "./components/LoginFormNew";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./components/ui/card";
import { Dumbbell } from "lucide-react";
import { Dashboard } from "./components/Dashboard";
import { MembersManagement } from "./components/MembersManagement";
import { AttendanceControl } from "./components/AttendanceControl";
import { FinancialDashboard } from "./components/FinancialDashboard";
import { MembershipsManagement } from "./components/MembershipsManagement";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Users, ClipboardList, TrendingUp, LogOut, LayoutDashboard, CreditCard } from "lucide-react";
import { Member, AttendanceRecord, Membership, Shift } from "./types";
import { mockMembers, mockAttendanceRecords, mockMemberships } from "./utils/mockData";
import { generateId } from "./utils/helpers";
import { checkSavedSession, logoutGym, checkGymByIP, getUserIP, GymData } from "./utils/auth";
import { supabase } from "../lib/supabase";

interface AuthenticatedUser {
  usuario: string;
  contraseña: string;
  rol: 'admin' | 'empleado';
}

type AuthState = 'checking' | 'register' | 'shift-selection' | 'login' | 'authenticated';

function App() {
  const [authState, setAuthState] = useState<AuthState>('checking');
  const [selectedShift, setSelectedShift] = useState<Shift | null>(null);
  const [gymInfo, setGymInfo] = useState<{ gym_id: string; nombre_gym: string } | null>(null);
  const [currentUser, setCurrentUser] = useState<AuthenticatedUser | null>(null);
  const [gymId, setGymId] = useState<string | null>(null);
  const [gymData, setGymData] = useState<GymData | null>(null);
  const [loading, setLoading] = useState(true);
  const [members, setMembers] = useState<Member[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [activeTab, setActiveTab] = useState("home");

  // Ajustar tab si el usuario es empleado y está en un tab no permitido
  useEffect(() => {
    if (currentUser?.rol === 'empleado') {
      const allowedTabs = ['members', 'attendance'];
      if (!allowedTabs.includes(activeTab)) {
        setActiveTab('members');
      }
    }
  }, [currentUser, activeTab]);

  useEffect(() => {
    // Verificar si hay sesión guardada o gimnasio registrado
    const verifySession = async () => {
      try {
        // Primero verificar si hay sesión guardada COMPLETA (usuario ya logueado)
        // Solo entrar automáticamente si hay usuario Y turno guardados
        const savedUser = localStorage.getItem('current_user');
        const savedShift = localStorage.getItem('selected_shift') as Shift | null;
        
        if (savedUser && savedShift) {
          // Verificar que la sesión sea válida
          const session = await checkSavedSession();
          if (session.hasSession && session.gymData) {
            const user = JSON.parse(savedUser);
            setCurrentUser(user);
            setGymId(session.gymData.gym_id);
            setGymData(session.gymData);
            setSelectedShift(savedShift);
            setGymInfo({ gym_id: session.gymData.gym_id, nombre_gym: session.gymData.nombre_gym });
            setAuthState('authenticated');
            setLoading(false);
            return;
          } else {
            // Si la sesión no es válida, limpiar y continuar con el flujo normal
            localStorage.removeItem('current_user');
            localStorage.removeItem('selected_shift');
          }
        }

        // Si no hay sesión de usuario, SIEMPRE ir a PreLogin primero
        // El usuario elegirá si verificar IP o entrar como administrador
        setAuthState('register');
      } catch (error) {
        console.error('Error verificando sesión:', error);
        setAuthState('register');
      } finally {
        setLoading(false);
      }
    };

    verifySession();
    
    // Cargar datos de ejemplo
    setMembers(mockMembers);
    setAttendanceRecords(mockAttendanceRecords);
    setMemberships(mockMemberships);
  }, []);

  const handleRegisterSuccess = async (gymIdParam: string, user: AuthenticatedUser) => {
    setGymId(gymIdParam);
    // Obtener información del gimnasio después del registro
    const gymCheck = await checkGymByIP();
    if (gymCheck.exists && gymCheck.gym_id && gymCheck.nombre_gym) {
      const currentIP = await getUserIP();
      localStorage.setItem('gym_ip', currentIP);
      localStorage.setItem('gym_id', gymCheck.gym_id);
      setGymInfo({ gym_id: gymCheck.gym_id, nombre_gym: gymCheck.nombre_gym });
    }
    setAuthState('shift-selection');
    // Después del registro, el usuario debe seleccionar turno
  };

  const handleShiftSelected = (shift: Shift) => {
    setSelectedShift(shift);
    setAuthState('login');
  };

  const handleLoginSuccess = (gymIdParam: string, user: AuthenticatedUser, shift: Shift) => {
    setCurrentUser(user);
    setGymId(gymIdParam);
    setSelectedShift(shift);
    // Si es empleado, establecer tab inicial a 'members' (no 'home')
    if (user.rol === 'empleado') {
      setActiveTab('members');
    } else {
      setActiveTab('home');
    }
    setAuthState('authenticated');
  };

  const handleBackToShiftSelection = () => {
    setSelectedShift(null);
    setAuthState('shift-selection');
  };

  const handleExitIP = () => {
    // Limpiar datos de IP y volver a PreLogin
    localStorage.removeItem('gym_ip');
    localStorage.removeItem('gym_id');
    localStorage.removeItem('current_user');
    localStorage.removeItem('selected_shift');
    setGymInfo(null);
    setGymId(null);
    setCurrentUser(null);
    setSelectedShift(null);
    setAuthState('register');
  };

  const handleGymDetected = async () => {
    // Cuando se detecta el gimnasio desde LoginFormSimple (Verificar IP), obtener la información completa
    const gymCheck = await checkGymByIP();
    if (gymCheck.exists && gymCheck.gym_id && gymCheck.nombre_gym) {
      const currentIP = await getUserIP();
      localStorage.setItem('gym_ip', currentIP);
      localStorage.setItem('gym_id', gymCheck.gym_id);
      setGymInfo({ gym_id: gymCheck.gym_id, nombre_gym: gymCheck.nombre_gym });
      setGymId(gymCheck.gym_id);
      setAuthState('shift-selection');
    }
  };

  const handleAdminLoginFromPreLogin = async (gymIdParam: string, user: AuthenticatedUser) => {
    // Cuando el administrador inicia sesión desde PreLogin, entrar directamente sin turno
    // Verificar que sea administrador
    if (user.rol !== 'admin') {
      console.error('Usuario no es administrador');
      return;
    }

    setGymId(gymIdParam);
    setCurrentUser(user);
    localStorage.setItem('current_user', JSON.stringify(user));
    
    // Obtener información del gimnasio
    const gymCheck = await checkGymByIP();
    if (gymCheck.exists && gymCheck.gym_id && gymCheck.nombre_gym) {
      const currentIP = await getUserIP();
      localStorage.setItem('gym_ip', currentIP);
      localStorage.setItem('gym_id', gymCheck.gym_id);
      setGymInfo({ gym_id: gymCheck.gym_id, nombre_gym: gymCheck.nombre_gym });
      
      // Obtener datos completos del gym para tener acceso a todos los usuarios
      const { data: gymDataArray } = await supabase
        .from('gyms')
        .select('*')
        .eq('gym_id', gymCheck.gym_id);
      
      if (gymDataArray && gymDataArray.length > 0) {
        setGymData({
          gym_id: gymCheck.gym_id,
          nombre_gym: gymDataArray[0].nombre_gym,
          users: gymDataArray[0].users || []
        });
      }
    }
    
    // Administrador entra directamente sin seleccionar turno
    setActiveTab('home');
    setAuthState('authenticated');
  };

  const handleLogout = () => {
    logoutGym();
    setCurrentUser(null);
    setGymId(null);
    setGymData(null);
    setSelectedShift(null);
    setGymInfo(null);
    setAuthState('shift-selection');
  };

  const handleAddMember = (memberData: Omit<Member, 'id'>) => {
    const newMember: Member = {
      ...memberData,
      id: generateId(),
    };
    setMembers([...members, newMember]);
  };

  const handleUpdateMember = (id: string, memberData: Partial<Member>) => {
    setMembers(members.map(m => m.id === id ? { ...m, ...memberData } : m));
  };

  const handleDeleteMember = (id: string) => {
    setMembers(members.filter(m => m.id !== id));
  };

  const handleCheckIn = (memberId: string) => {
    const newRecord: AttendanceRecord = {
      id: generateId(),
      memberId,
      checkIn: new Date().toISOString(),
    };
    setAttendanceRecords([...attendanceRecords, newRecord]);
  };

  const handleCheckOut = (recordId: string) => {
    setAttendanceRecords(
      attendanceRecords.map(r => 
        r.id === recordId ? { ...r, checkOut: new Date().toISOString() } : r
      )
    );
  };

  const handleAddMembership = (membershipData: Omit<Membership, 'id'>) => {
    const newMembership: Membership = {
      ...membershipData,
      id: generateId(),
    };
    setMemberships([...memberships, newMembership]);
  };

  const handleUpdateMembership = (id: string, membershipData: Partial<Membership>) => {
    setMemberships(memberships.map(m => m.id === id ? { ...m, ...membershipData } : m));
  };

  const handleDeleteMembership = (id: string) => {
    setMemberships(memberships.filter(m => m.id !== id));
  };

  const getRolLabel = (rol: string) => {
    switch (rol) {
      case 'admin':
        return 'Administrador';
      case 'empleado':
        return 'Empleado';
      default:
        return rol;
    }
  };

  const getShiftLabel = (shift: Shift | null) => {
    if (!shift) return '';
    switch (shift) {
      case 'morning': return 'Mañana';
      case 'afternoon': return 'Tarde';
      case 'night': return 'Noche';
    }
  };

  if (loading || authState === 'checking') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando...</p>
        </div>
      </div>
    );
  }

  // Mostrar pantalla de registro/login si no hay gimnasio registrado
  if (authState === 'register') {
    return <PreLogin onLoginSuccess={handleAdminLoginFromPreLogin} onGymDetected={handleGymDetected} />;
  }

  // Mostrar selección de turno
  if (authState === 'shift-selection' && gymInfo) {
    return <ShiftSelection gymName={gymInfo.nombre_gym} onSelectShift={handleShiftSelected} onExitIP={handleExitIP} />;
  }

  // Mostrar login con turno seleccionado
  if (authState === 'login' && selectedShift && gymInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-background">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="bg-primary p-4 rounded-full">
                <Dumbbell className="w-12 h-12 text-primary-foreground" />
              </div>
            </div>
            <CardTitle>Iniciar Sesión</CardTitle>
            <CardDescription>
              {gymInfo.nombre_gym}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginFormNew
              shift={selectedShift}
              gymName={gymInfo.nombre_gym}
              onLoginSuccess={handleLoginSuccess}
              onBack={handleBackToShiftSelection}
            />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Si no estamos autenticados, mostrar selección de turno como fallback
  if (authState !== 'authenticated') {
    return <ShiftSelection onSelectShift={handleShiftSelected} onExitIP={handleExitIP} />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-primary p-2 rounded-lg">
                <Dumbbell className="w-6 h-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl">GymManager Pro</h1>
                <p className="text-sm text-muted-foreground">
                  {currentUser?.usuario} • {getRolLabel(currentUser?.rol || '')}
                  {selectedShift && ` • Turno ${getShiftLabel(selectedShift)}`}
                  {gymData && ` • ${gymData.nombre_gym}`}
                </p>
              </div>
            </div>
            <Button variant="outline" onClick={handleLogout} className="gap-2">
              <LogOut className="w-4 h-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className={`grid w-full ${currentUser?.rol === 'admin' ? 'grid-cols-5' : 'grid-cols-2'} lg:w-auto lg:inline-grid`}>
            {currentUser?.rol === 'admin' && (
              <TabsTrigger value="home" className="gap-2">
                <LayoutDashboard className="w-4 h-4" />
                <span className="hidden sm:inline">Inicio</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Miembros</span>
            </TabsTrigger>
            {currentUser?.rol === 'admin' && (
              <TabsTrigger value="memberships" className="gap-2">
                <CreditCard className="w-4 h-4" />
                <span className="hidden sm:inline">Membresías</span>
              </TabsTrigger>
            )}
            <TabsTrigger value="attendance" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Asistencia</span>
            </TabsTrigger>
            {currentUser?.rol === 'admin' && (
              <TabsTrigger value="financial" className="gap-2">
                <TrendingUp className="w-4 h-4" />
                <span className="hidden sm:inline">Finanzas</span>
              </TabsTrigger>
            )}
          </TabsList>

          {currentUser?.rol === 'admin' && (
            <TabsContent value="home" className="space-y-6">
              <Dashboard
                members={members}
                attendanceRecords={attendanceRecords}
                memberships={memberships}
              />
            </TabsContent>
          )}

          <TabsContent value="members" className="space-y-6">
            <MembersManagement
              members={members}
              memberships={memberships}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
            />
          </TabsContent>

          {currentUser?.rol === 'admin' && (
            <TabsContent value="memberships" className="space-y-6">
              <MembershipsManagement
                memberships={memberships}
                onAddMembership={handleAddMembership}
                onUpdateMembership={handleUpdateMembership}
                onDeleteMembership={handleDeleteMembership}
              />
            </TabsContent>
          )}

          <TabsContent value="attendance" className="space-y-6">
            <AttendanceControl
              members={members}
              attendanceRecords={attendanceRecords}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          </TabsContent>

          {currentUser?.rol === 'admin' && (
            <TabsContent value="financial" className="space-y-6">
              <FinancialDashboard 
                members={members}
                memberships={memberships}
              />
            </TabsContent>
          )}
        </Tabs>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>GymManager Pro - Sistema de Gestión de Gimnasios</p>
          <p className="mt-1">© 2026 - Todos los derechos reservados</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
