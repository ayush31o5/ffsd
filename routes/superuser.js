// routes/superuser.js
const express = require('express');
const User = require('../models/user');
const Order = require('../models/order');      // adjust if your Order model path/name differs
const ensureAdmin = require('../middleware/ensureAdmin');

const router = express.Router();

// Protect all routes in this router
router.use(ensureAdmin);

/**
 * GET /superuser
 * GET /superuser/dashboard
 */
router.get(['/', '/dashboard'], async (req, res, next) => {
    try {
        // Replace with real queries as needed
        const metrics = {
            totalUsers: await User.countDocuments(),
            newSignups: 12,
            totalRevenue: 75321,
            pendingOrders: 5
        };

        const charts = {
            userGrowth: {
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
                data: [50, 75, 150, 200, 300, 400]
            },
            salesTrend: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                data: [25, 40, 30, 50, 65, 70, 90]
            }
        };

        res.render('admin/superuser', {
            pageTitle: 'Super-User Dashboard',
            user: req.user,
            metrics,
            charts
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /superuser/users
 */
router.get('/users', async (req, res, next) => {
    try {
        const users = await User.find().lean();
        res.render('admin/users', {
            pageTitle: 'All Users',
            user: req.user,
            users
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /superuser/orders
 */
router.get('/orders', async (req, res, next) => {
    try {
        const orders = await Order.find()
            .populate('user', 'email name')
            .lean();
        res.render('admin/orders', {
            pageTitle: 'All Orders',
            user: req.user,
            orders
        });
    } catch (err) {
        next(err);
    }
});

/**
 * GET /superuser/logout
 */
router.get('/logout', (req, res, next) => {
    req.session.destroy(err => {
        if (err) return next(err);
        res.redirect('/');    // redirect to your public home or login page
    });
});

module.exports = router;
