import { Gear } from "@phosphor-icons/react";
import { useUser } from "../../../context/UserContext";

const TechHeader = ({
  title = "Technician Workspace",
  subtitle = "Field operations",
  onMenuToggle,
}) => {
  const { user } = useUser();

  return (
    <header className="tech-header">
      <div className="tech-header-left">
        <button
          type="button"
          className="tech-menu-toggle"
          onClick={onMenuToggle}
        >
          <Gear size={20} weight="bold" className="inline-icon" />
        </button>
        <div>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </div>
      </div>
      <div className="tech-user-chip">
        <span className="tech-user-avatar">
          {(user?.name?.charAt(0) || "?").toUpperCase()}
        </span>
        <span>{user?.name || "-"}</span>
      </div>
    </header>
  );
};

export default TechHeader;
