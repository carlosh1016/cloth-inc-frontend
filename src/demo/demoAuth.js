export const demoUser = {
  user_id: 1,
  name: "Carlos Demo",
  email: "demo@clothinc.com",
};

export const demoLogin = async () => {
  return {
    token: "demo-token",
    user: demoUser,
  };
};
