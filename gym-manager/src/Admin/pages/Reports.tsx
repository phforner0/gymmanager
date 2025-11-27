import React, { useMemo } from 'react';
import { BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useApp } from '../context/AppContext';

export const Reports: React.FC = () => {
  const { students, checkins, classes: classSchedules } = useApp();

  const retentionData = useMemo(() => {
    const cohorts: Record<string, { total: number; active: number }> = {};
    students.forEach(s => {
      const month = s.joinDate.substring(0, 7);
      if (!cohorts[month]) cohorts[month] = { total: 0, active: 0 };
      cohorts[month].total++;
      if (s.status === 'active') cohorts[month].active++;
    });
    return Object.entries(cohorts).map(([month, data]) => ({
      month,
      retention: ((data.active / data.total) * 100).toFixed(1) + '%',
      total: data.total,
      active: data.active
    })).slice(-6);
  }, [students]);

  const peakHoursData = useMemo(() => {
    const hours: Record<number, number> = {};
    checkins.forEach(c => {
      const hour = new Date(c.timestamp).getHours();
      hours[hour] = (hours[hour] || 0) + 1;
    });
    return Object.entries(hours)
      .map(([hour, count]) => ({ hour: `${hour}h`, count }))
      .sort((a, b) => parseInt(a.hour) - parseInt(b.hour));
  }, [checkins]);

  const instructorData = useMemo(() => {
    const instructors: Record<string, number> = {};
    classSchedules.forEach(c => {
      instructors[c.instructor] = (instructors[c.instructor] || 0) + 1;
    });
    return Object.entries(instructors).map(([name, classes]) => ({ name, classes }));
  }, [classSchedules]);

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: '700', marginBottom: '24px' }}>Relatórios</h1>

      <div className="card mb-6">
        <h3 className="card-title">Taxa de Retenção por Coorte</h3>
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Mês de Entrada</th>
                <th>Total</th>
                <th>Ativos</th>
                <th>Taxa de Retenção</th>
              </tr>
            </thead>
            <tbody>
              {retentionData.map(row => (
                <tr key={row.month}>
                  <td>{new Date(row.month + '-01').toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}</td>
                  <td>{row.total}</td>
                  <td>{row.active}</td>
                  <td>
                    <span className="badge badge-success">{row.retention}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-2">
        <div className="card">
          <h3 className="card-title">Horários de Pico</h3>
          <div className="chart-container">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHoursData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="hour" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card">
          <h3 className="card-title">Aulas por Instrutor</h3>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Instrutor</th>
                  <th>Aulas</th>
                </tr>
              </thead>
              <tbody>
                {instructorData.map(row => (
                  <tr key={row.name}>
                    <td>{row.name}</td>
                    <td>{row.classes}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};