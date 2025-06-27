export type TeamMember = {
  consultant: {
    id: string;
    firstName: string;
    lastName: string;
    jobTitle: string;
  };
  plannedHours: number | null;
  loggedHours: number | null;
};

export type PlannerCreateModal = {
  isOpen: boolean;
  handleClose: () => void;
};
