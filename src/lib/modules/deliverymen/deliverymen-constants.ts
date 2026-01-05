export const CONTRACT_TYPE = {
  FREELANCER: "FREELANCER",
  INDEPENDENT_COLLABORATOR: "INDEPENDENT_COLLABORATOR",
};

export const contractTypeArr = Object.values(CONTRACT_TYPE) as Array<
  (typeof CONTRACT_TYPE)[keyof typeof CONTRACT_TYPE]
>;
