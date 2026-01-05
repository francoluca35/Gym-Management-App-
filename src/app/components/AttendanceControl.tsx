import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Button } from "./ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Badge } from "./ui/badge";
import { Search, LogIn, LogOut, Clock } from "lucide-react";
import { Member, AttendanceRecord } from "../types";
import { formatTime, formatDate } from "../utils/helpers";

interface AttendanceControlProps {
  members: Member[];
  attendanceRecords: AttendanceRecord[];
  onCheckIn: (memberId: string) => void;
  onCheckOut: (recordId: string) => void;
}

export function AttendanceControl({ members, attendanceRecords, onCheckIn, onCheckOut }: AttendanceControlProps) {
  const [searchTerm, setSearchTerm] = useState("");

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

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Registrar Asistencia</CardTitle>
            <CardDescription>Busca un miembro para registrar ingreso/egreso</CardDescription>
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
