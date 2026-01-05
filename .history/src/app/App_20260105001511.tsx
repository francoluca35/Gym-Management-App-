import React, { useState, useEffect } from "react";
import { LoginScreen } from "./components/LoginScreen";
import { LoginForm } from "./components/LoginForm";
import { Dashboard } from "./components/Dashboard";
import { MembersManagement } from "./components/MembersManagement";
import { AttendanceControl } from "./components/AttendanceControl";
import { FinancialDashboard } from "./components/FinancialDashboard";
import { MembershipsManagement } from "./components/MembershipsManagement";
import { Button } from "./components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Dumbbell, Users, ClipboardList, TrendingUp, LogOut, LayoutDashboard, CreditCard } from "lucide-react";
import { Member, AttendanceRecord, Shift, Employee, EmployeeSession, Membership } from "./types";
import { mockMembers, mockAttendanceRecords, mockEmployees, mockMemberships } from "./utils/mockData";
import { generateId, formatTime } from "./utils/helpers";

function App() {
  const [currentShift, setCurrentShift] = useState<Shift | null>(null);
  const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
  const [currentSession, setCurrentSession] = useState<EmployeeSession | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [memberships, setMemberships] = useState<Membership[]>([]);
  const [employees] = useState<Employee[]>(mockEmployees);
  const [employeeSessions, setEmployeeSessions] = useState<EmployeeSession[]>([]);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    // Cargar datos de ejemplo
    setMembers(mockMembers);
    setAttendanceRecords(mockAttendanceRecords);
    setMemberships(mockMemberships);
  }, []);

  const handleShiftSelection = (shift: Shift) => {
    setCurrentShift(shift);
  };

  const handleLogin = (employee: Employee) => {
    setCurrentEmployee(employee);
    
    // Crear sesión de empleado
    const session: EmployeeSession = {
      id: generateId(),
      employeeId: employee.id,
      shift: currentShift!,
      loginTime: new Date().toISOString(),
    };
    
    setCurrentSession(session);
    setEmployeeSessions([...employeeSessions, session]);
  };

  const handleLogout = () => {
    // Actualizar sesión con logout time
    if (currentSession) {
      setEmployeeSessions(
        employeeSessions.map(s => 
          s.id === currentSession.id 
            ? { ...s, logoutTime: new Date().toISOString() } 
            : s
        )
      );
    }
    
    setCurrentEmployee(null);
    setCurrentShift(null);
    setCurrentSession(null);
  };

  const handleBackToShiftSelection = () => {
    setCurrentShift(null);
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

  const getShiftLabel = (shift: Shift | null) => {
    switch (shift) {
      case 'morning':
        return 'Mañana';
      case 'afternoon':
        return 'Tarde';
      case 'night':
        return 'Noche';
      default:
        return '';
    }
  };

  // Mostrar pantalla de selección de turno
  if (!currentShift) {
    return <LoginScreen onLogin={handleShiftSelection} />;
  }

  // Mostrar pantalla de login con usuario/contraseña
  if (!currentEmployee) {
    return (
      <LoginForm 
        shift={currentShift}
        employees={employees}
        onLogin={handleLogin}
        onBack={handleBackToShiftSelection}
      />
    );
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
                  {currentEmployee.name} • Turno: {getShiftLabel(currentShift)} • 
                  Ingreso: {formatTime(currentSession?.loginTime || '')}
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
          <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
            <TabsTrigger value="home" className="gap-2">
              <LayoutDashboard className="w-4 h-4" />
              <span className="hidden sm:inline">Inicio</span>
            </TabsTrigger>
            <TabsTrigger value="members" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Miembros</span>
            </TabsTrigger>
            <TabsTrigger value="memberships" className="gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="hidden sm:inline">Membresías</span>
            </TabsTrigger>
            <TabsTrigger value="attendance" className="gap-2">
              <ClipboardList className="w-4 h-4" />
              <span className="hidden sm:inline">Asistencia</span>
            </TabsTrigger>
            <TabsTrigger value="financial" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Finanzas</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="home" className="space-y-6">
            <Dashboard
              members={members}
              attendanceRecords={attendanceRecords}
              memberships={memberships}
            />
          </TabsContent>

          <TabsContent value="members" className="space-y-6">
            <MembersManagement
              members={members}
              memberships={memberships}
              onAddMember={handleAddMember}
              onUpdateMember={handleUpdateMember}
              onDeleteMember={handleDeleteMember}
            />
          </TabsContent>

          <TabsContent value="memberships" className="space-y-6">
            <MembershipsManagement
              memberships={memberships}
              onAddMembership={handleAddMembership}
              onUpdateMembership={handleUpdateMembership}
              onDeleteMembership={handleDeleteMembership}
            />
          </TabsContent>

          <TabsContent value="attendance" className="space-y-6">
            <AttendanceControl
              members={members}
              attendanceRecords={attendanceRecords}
              onCheckIn={handleCheckIn}
              onCheckOut={handleCheckOut}
            />
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <FinancialDashboard 
              members={members}
              memberships={memberships}
            />
          </TabsContent>
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