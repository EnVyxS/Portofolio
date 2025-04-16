import React from "react";
import { motion } from "framer-motion";
import HoverDialogController from "../controllers/hoverDialogController";

export type HoverLinkType =
  | "whatsapp"
  | "email"
  | "linkedin"
  | "github"
  | "tiktok"
  | "youtube"
  | "none";

interface SocialLinkProps {
  name: string;
  url: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  id: string; // ID yang bisa dipetakan ke HoverLinkType
}

const SocialLink: React.FC<SocialLinkProps> = ({
  name,
  url,
  icon,
  color,
  hoverColor,
  id,
}) => {
  const mapIdToLinkType = (id: string): HoverLinkType => {
    if (
      id === "whatsapp" ||
      id === "email" ||
      id === "linkedin" ||
      id === "github" ||
      id === "tiktok" ||
      id === "youtube"
    ) {
      return id as HoverLinkType;
    }
    return "none";
  };

  // Menggunakan komponen motion.a untuk efek hover
  return (
    <motion.a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="social-link"
      whileHover={{
        scale: 1.05,
        backgroundColor: "rgba(255, 255, 255, 0.05)",
      }}
      transition={{ duration: 0.2 }}
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.1)",
        color: color,
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.3rem 0.5rem",
        borderRadius: "2px",
        fontSize: "clamp(0.6rem, 0.7vw, 0.6rem)",
        textDecoration: "none",
        width: "100%",
        boxSizing: "border-box",
        border: "1px solid rgba(150, 130, 100, 0.15)",
        textShadow: "1px 1px 1px rgba(0, 0, 0, 0.7)",
      }}
      onMouseEnter={() => {
        const hoverController = HoverDialogController.getInstance();
        hoverController.handleHoverDialog(mapIdToLinkType(id));
      }}
    >
      <span className="icon" style={{ display: "flex", alignItems: "center" }}>
        {icon}
      </span>
      <span className="text" style={{ fontFamily: "serif", letterSpacing: "0.5px" }}>
        {name}
      </span>
    </motion.a>
  );
};

export default SocialLink;