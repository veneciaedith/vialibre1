import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Package, ScanLine, Mic,
  CircleDot, Users, MessageSquare,
  Layers, Activity,
} from 'lucide-react';

const sections = [
  {
    label: 'Operación',
    items: [
      { to: '/', label: 'Panel', icon: LayoutDashboard, end: true },
      { to: '/inventario', label: 'Inventario', icon: Package },
      { to: '/escaner', label: 'Escáner', icon: ScanLine },
      { to: '/voz', label: 'Voz e Imagen', icon: Mic },
    ],
  },
  {
    label: 'Inteligencia',
    items: [
      { to: '/semaforo', label: 'Semáforo', icon: CircleDot },
      { to: '/comunidad', label: 'Comunidad', icon: Users },
      { to: '/asistente', label: 'Asistente', icon: MessageSquare },
    ],
  },
  {
    label: 'Finanzas Web3',
    items: [
      { to: '/capital', label: 'Capital On-Chain', icon: Layers },
      { to: '/score', label: 'Score Crediticio', icon: Activity },
    ],
  },
];

export default function Sidebar() {
  return (
    <aside className="sidebar">
      {sections.map(section => (
        <div key={section.label}>
          <div className="nav-label">{section.label}</div>
          {section.items.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => 'nav-item' + (isActive ? ' active' : '')}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          ))}
        </div>
      ))}
      <div className="nav-foot">
        v2.6.0 · ESTABLE<br />
        Hash bloque #847.221<br />
        Casilda · AR · UTC-3
      </div>
    </aside>
  );
}
