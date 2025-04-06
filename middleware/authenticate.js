const isAuthenticated = (req, res, next) => {
    if (req.session.user === undefined) {
        return res.status(401).json({ msg: "You do not have access. Please log in." });
    }
    next();
};

module.exports = { 
    isAuthenticated 
};
