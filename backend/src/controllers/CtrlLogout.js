const logoutController = {};

logoutController.logout = (req, res) => {
  try {
 res.clearCookie("authToken", {
  httpOnly: true,
  secure: true,
    sameSite: "None",
  path: "/",
});
    return res.json({ ok: true, message: "Sesión cerrada correctamente" });
  } catch (error) {
    return res.status(500).json({ ok: false, message: "Error al cerrar sesión", error: error.message });
  }
};

export default logoutController;