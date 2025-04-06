// Global definitions for the application

interface Window {
  createWhooshSound?: () => any;
  __idleTimeoutWarningActive?: boolean;
  __hoverDialogDisabled?: boolean;
  __forceIdleTimeout?: boolean; // Flag untuk mode "nuklir override"
  __currentDialogText?: string;
  __contractDialogActive?: boolean;
  __contractResponseText?: string;
}