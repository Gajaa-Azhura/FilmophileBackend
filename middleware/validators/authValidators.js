export const validateRegister = (req, res, next) => {
    const { name, email, password, role } = req.body;
    if (!name || !email || !password || !role) {
      return res.status(400).json({ error: 'All fields are required (name, email, password, role)' });
    }
    next();
  };
  
  export const validateLogin = (req, res, next) => {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }
    next();
  };
  