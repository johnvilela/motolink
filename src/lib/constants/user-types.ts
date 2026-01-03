export const UserTypes = {
  ADMIN: "admin",
  MANAGER: "manager",
  USER: "user",
};

export const UserTypesArr = Object.keys(UserTypes) as Array<
  keyof typeof UserTypes
>;
