import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Search, LogIn, LogOut, Clock, CreditCard, Wifi, WifiOff } from "lucide-react";
import { Member, AttendanceRecord } from "../types";
import { formatTime, formatDate } from "../utils/helpers";
import { connectRFIDReader, startContinuousReading, stopContinuousReading, disconnectRFIDReader, isRFIDReaderConnected } from "../utils/rfid";

interface AttendanceControlProps {
  members: Member[];
  attendanceRecords: AttendanceRecord[];
  onCheckIn: (memberId: string) => void;
  onCheckOut: (recordId: string) => void;
}

export function AttendanceControl({ members, attendanceRecords, onCheckIn, onCheckOut }: AttendanceControlProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [isRFIDConnected, setIsRFIDConnected] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [lastScannedCard, setLastScannedCard] = useState<string | null>(null);

  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeSessions = attendanceRecords.filter(record => !record.checkOut);
  const todayRecords = attendanceRecords.filter(record => {
    const recordDate = new Date(record.checkIn).toDateString();
    const today = new Date().toDateString();
    return recordDate === today;
  }).slice(0, 10);

  const getMemberName = (memberId: string) => {
    return members.find(m => m.id === memberId)?.name || 'Desconocido';
  };

  const isCheckedIn = (memberId: string) => {
    return activeSessions.some(record => record.memberId === memberId);
  };

  const getActiveSessionId = (memberId: string) => {
    return activeSessions.find(record => record.memberId === memberId)?.id;
  };

  const calculateDuration = (checkIn: string, checkOut?: string) => {
    const start = new Date(checkIn);
    const end = checkOut ? new Date(checkOut) : new Date();
    const minutes = Math.floor((end.getTime() - start.getTime()) / 60000);
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Verificar conexión al montar
  useEffect(() => {
    setIsRFIDConnected(isRFIDReaderConnected());
    
    // Limpiar al desmontar
    return () => {
      if (isReading) {
        stopContinuousReading();
      }
    };
  }, []);

  const handleConnectRFID = async () => {
    const result = await connectRFIDReader();
    if (result.success) {
      setIsRFIDConnected(true);
      alert('Lector RFID conectado. Ahora puedes escanear tarjetas para fichar entrada/salida.');
    } else {
      alert(`Error: ${result.error}`);
    }
  };

  const handleStartReading = async () => {
    if (!isRFIDConnected) {
      const connectResult = await connectRFIDReader();
      if (!connectResult.success) {
        alert(`Error: ${connectResult.error}`);
        return;
      }
      setIsRFIDConnected(true);
    }

    setIsReading(true);
    const result = await startContinuousReading((cardId: string) => {
      // Buscar el miembro por su tarjeta RFID
      const member = members.find(m => m.rfidCardId === cardId);
      
      if (member) {
        setLastScannedCard(cardId);
        
        // Verificar si ya está dentro o fuera
        const checkedIn = isCheckedIn(member.id);
        const sessionId = getActiveSessionId(member.id);
        
        if (checkedIn && sessionId) {
          // Fichar salida
          onCheckOut(sessionId);
          alert(`Salida registrada para ${member.name}`);
        } else {
          // Fichar entrada
          onCheckIn(member.id);
          alert(`Entrada registrada para ${member.name}`);
        }
      } else {
        alert(`Tarjeta no reconocida. ID: ${cardId}`);
      }
    });

    if (!result.success) {
      setIsReading(false);
      alert(`Error: ${result.error}`);
    }
  };

  const handleStopReading = async () => {
    await stopContinuousReading();
    setIsReading(false);
  };

  const handleDisconnectRFID = async () => {
    if (isReading) {
      await stopContinuousReading();
      setIsReading(false);
    }
    await disconnectRFIDReader();
    setIsRFIDConnected(false);
  };

  return (
    <div className="space-y-6">
      {/* Panel de Control RFID */}
      <Card className="border-primary/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Control de Asistencia por RFID/NFC
          </CardTitle>
          <CardDescription>
            Conecta el lector RFID y escanea las tarjetas para fichar entrada/salida automáticamente
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              {isRFIDConnected ? (
                <>
                  <Wifi className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-green-600">Lector Conectado</span>
                </>
              ) : (
                <>
                  <WifiOff className="w-5 h-5 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Lector Desconectado</span>
                </>
              )}
            </div>
            
            {!isRFIDConnected ? (
              <Button onClick={handleConnectRFID} variant="outline" className="gap-2">
                <Wifi className="w-4 h-4" />
                Conectar Lector RFID
              </Button>
            ) : (
              <div className="flex gap-2">
                {!isReading ? (
                  <Button onClick={handleStartReading} className="gap-2 bg-green-600 hover:bg-green-700">
                    <CreditCard className="w-4 h-4" />
                    Iniciar Lectura
                  </Button>
                ) : (
                  <Button onClick={handleStopReading} variant="destructive" className="gap-2">
                    <CreditCard className="w-4 h-4" />
                    Detener Lectura
                  </Button>
                )}
                <Button onClick={handleDisconnectRFID} variant="outline" className="gap-2">
                  <WifiOff className="w-4 h-4" />
                  Desconectar
                </Button>
              </div>
            )}
          </div>
          
          {isReading && (
            <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
              <p className="text-sm text-green-700 dark:text-green-400 flex items-center gap-2">
                <Clock className="w-4 h-4 animate-pulse" />
                Escuchando tarjetas... Acerca una tarjeta al lector para fichar entrada/salida.
              </p>
            </div>
          )}
          
          {lastScannedCard && (
            <div className="p-2 bg-muted rounded text-xs text-muted-foreground">
              Última tarjeta escaneada: {lastScannedCard}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Asistencia Manual</CardTitle>
            <CardDescription>Busca un miembro para registrar ingreso/egreso manualmente</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                placeholder="Buscar miembro..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {filteredMembers.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No se encontraron miembros</p>
              ) : (
                filteredMembers.map((member) => {
                  const checkedIn = isCheckedIn(member.id);
                  const sessionId = getActiveSessionId(member.id);
                  
                  return (
                    <div
                      key={member.id}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                    >
                      <div>
                        <p>{member.name}</p>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                      </div>
                      {checkedIn ? (
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => sessionId && onCheckOut(sessionId)}
                          className="gap-2"
                        >
                          <LogOut className="w-4 h-4" />
                          Salida
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          onClick={() => onCheckIn(member.id)}
                          className="gap-2"
                        >
                          <LogIn className="w-4 h-4" />
                          Entrada
                        </Button>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sesiones Activas</CardTitle>
            <CardDescription>{activeSessions.length} miembro(s) en el gimnasio</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeSessions.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No hay sesiones activas</p>
              ) : (
                activeSessions.map((record) => (
                  <div
                    key={record.id}
                    className="flex items-center justify-between p-3 border rounded-lg bg-primary/10"
                  >
                    <div>
                      <p>{getMemberName(record.memberId)}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Entró: {formatTime(record.checkIn)}
                      </div>
                    </div>
                    <Badge className="bg-green-600 text-white">Activo</Badge>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registros de Hoy</CardTitle>
          <CardDescription>Últimas asistencias del día</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Miembro</TableHead>
                  <TableHead>Entrada</TableHead>
                  <TableHead>Salida</TableHead>
                  <TableHead>Duración</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {todayRecords.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                      No hay registros hoy
                    </TableCell>
                  </TableRow>
                ) : (
                  todayRecords.map((record) => (
                    <TableRow key={record.id}>
                      <TableCell>{getMemberName(record.memberId)}</TableCell>
                      <TableCell>{formatTime(record.checkIn)}</TableCell>
                      <TableCell>{record.checkOut ? formatTime(record.checkOut) : '-'}</TableCell>
                      <TableCell>{calculateDuration(record.checkIn, record.checkOut)}</TableCell>
                      <TableCell>
                        {record.checkOut ? (
                          <Badge variant="secondary">Completado</Badge>
                        ) : (
                          <Badge className="bg-green-600 text-white">En curso</Badge>
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
