import React from "react";

export const colors = {
  red: "#EC1717",
  green: "#337E89",
  yellow: "#FFAE00",
  border: "#E5E8EB",
  gray: "#9D9CA3",
};

export const styles: {
  [key: string]: React.CSSProperties | string;
} = {
  container: {
    width: "100%",
    alignItems: "flex-start",
    justifyContent: "flex-start",
  },
  topTitle: {
    fontWeight: 600,
    height: "50px",
    paddingLeft: "20px",
    alignItems: "center",
  },
  topTitleBadge: {
    marginLeft: "10px",
  },
  selectsWrapper: {
    padding: "20px",
    width: "100%",
  },
  selectComponent: {
    marginRight: "20px",
    width: "150px",
  },
  controlsComponent: {
    padding: "20px",
    alignItems: "center",
    width: "100%",
    justifyContent: "space-between",
  },
  controlsText: {
    fontSize: "30px",
    lineHeight: "32px",
    fontWeight: 700,
  },
  controlButtonsWrapper: {
    marginLeft: "16px",
  },
  controlButton: {
    border: "1px solid #DCDCDC",
    borderRadius: "50%",
    minWidth: "40px",
    maxWidth: "40px",
    height: "40px",
    alignItems: "center",
    margin: 0,
  },
  controlButtonIconLeft: {
    marginLeft: "5px",
  },
  controlButtonIconRight: {
    marginLeft: "8px",
  },
  contolButtonToday: {
    margin: "0 16px",
  },
  utilisationContainer: {
    padding: "20px",
    width: "100%",
  },
  utilisationWrapper: {
    padding: "20px",
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    width: "100%",
  },
  utilisationBoxTotal: {
    width: "265px",
    paddingRight: "38px",
    borderRight: `1px solid ${colors.border}`,
  },
  utilisationBoxTitle: {
    color: "#6C6C6C",
    fontSize: "12px",
    lineHeight: "14px",
    fontWeight: 700,
  },
  utilisationBoxTitleNormal: {
    color: "#000",
    fontSize: "12px",
    lineHeight: "14px",
  },
  utilisationProgress: {
    width: "100%",
    height: "6px",
    position: "relative",
    borderRadius: "4px",
    backgroundColor: "#8EB8BE33",
    marginTop: "12px",
  },
  utilisationProgressFillWrapper: {
    position: "absolute",
    top: "0",
    left: "0",
    width: "100%",
    height: "6px",
    borderRadius: "4px",
    backgroundColor: "#8EB8BE33",
  },
  utlilisationProgressFillItem: {
    height: "6px",
    borderRadius: "4px",
    backgroundColor: colors.green,
  },
  utilisationText: {
    fontSize: "20px",
    marginLeft: "10px",
  },
  utilisationBoxAssignment: {
    flex: 1,
    paddingLeft: "38px",
  },
  // utilisationBoxAssignmentType: {
  //   ba
  // },
  utilisationBoxTotalForPeriod: {
    width: "180px",
    paddingLeft: "20px",
  },
  gridWrapper: {
    width: "100%",
    padding: "20px",
  },
  gridInnerWrapper: {
    border: `1px solid ${colors.border}`,
    borderRadius: "4px",
    width: "100%",
  },
  teamTitle: {
    height: "60px",
    alignItems: "center",
    padding: "0 20px",
  },
  teamGrid: {
    width: "300px",
  },
};

export const tasksStyes: {
  [key: string]: React.CSSProperties;
} = {
  default: {
    background: "rgba(0, 0, 0, 0.3)",
    color: "rgba(0, 0, 0, 0.5)",
    border: "1px solid rgba(0, 0, 0, 0.5)",
  },
  ONSITE: {
    background: "rgba(218, 8, 8, 0.2)",
    color: "rgba(218, 8, 8, 0.5)",
    border: "1px solid rgba(218, 8, 8, 0.5)",
  },
  REMOTE: {
    background: "rgba(51, 126, 137, 0.2)",
    color: "rgba(51, 126, 137, 0.5)",
    border: "1px solid rgba(51, 126, 137, 0.5)",
  },
  HYBRID: {
    background: "rgba(255, 174, 0, 0.2)",
    color: "rgba(255, 174, 0, 1)",
    border: "1px solid rgba(255, 174, 0, 1)",
  },
};
