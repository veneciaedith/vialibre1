import { Bell, MessageCircle, User, ChevronDown } from 'lucide-react';

export default function TopBar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <div className="brand">
          <div className="brand-mark">V</div>
          <div className="brand-name">Vía<em>Libre</em></div>
        </div>
        <div className="shop-switch">
          <span className="dot"></span>
          <span>Almacén Don Tito · Casilda</span>
          <ChevronDown size={14} />
        </div>
        <div className="topbar-actions">
          <button className="icon-btn" title="Notificaciones">
            <Bell size={17} />
            <span className="badge"></span>
          </button>
          <button className="icon-btn" title="WhatsApp">
            <MessageCircle size={17} />
          </button>
          <button className="icon-btn" title="Cuenta">
            <User size={17} />
          </button>
        </div>
      </div>
    </header>
  );
}
