const User = require("../models/User");
const jwt = require("jsonwebtoken");

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};

const googleAuth = async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      console.error("No user found in request during Google OAuth callback");
      return res.redirect(
        `${
          process.env.CLIENT_URL || "http://localhost:5174"
        }/login?error=${encodeURIComponent("Usuario no encontrado")}`
      );
    }
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa");

    const token = generateToken(user._id);
    console.log("bbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbbb");

    const clientUrl = process.env.CLIENT_URL || "https://mcp.digital-goods.es";

    const userInfo = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
    };

    console.log("Google OAuth success, redirecting user:", user.email);
    console.log("clientUrl", clientUrl);
    console.log("process.env.CLIENT_URL", process.env.CLIENT_URL);

    res.redirect(
      `${clientUrl}/login?token=${token}&user=${encodeURIComponent(
        JSON.stringify(userInfo)
      )}`
    );
  } catch (error) {
    console.error("Error in Google OAuth callback:", error);
    const clientUrl = process.env.CLIENT_URL || "http://localhost:5174";
    res.redirect(
      `${clientUrl}/login?error=${encodeURIComponent("Error de autenticación")}`
    );
  }
};

const logout = async (req, res) => {
  try {
    res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  googleAuth,
  logout,
};
