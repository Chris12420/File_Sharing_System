const isAuthenticated = (req, res, next) => {
  // Check if the user object exists on the session
  if (req.session && req.session.user) {
    // User is authenticated, attach user info to req.user
    req.user = req.session.user;
    return next();
  } else {
    // User is not authenticated, send an unauthorized response
    return res.status(401).json({ message: 'Unauthorized. Please log in.' });
  }
};

module.exports = {
  isAuthenticated
}; 