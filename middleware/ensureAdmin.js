// middleware/ensureAdmin.js
module.exports = (req, res, next) => {
    if (req.user && req.user.isAdmin) {
        return next();
    }
    // Optionally render a 403 page instead:
    return res.status(403).render('403', {
        pageTitle: 'Forbidden',
        path: req.originalUrl
    });
};
