// app.js
require('dotenv').config();
const path = require('path');
const express = require('express');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');
const helmet = require('helmet');
const compression = require('compression');
const { expressCspHeader } = require('express-csp-header');

const dbConnect = require('./util/dbConnect');
const User = require('./models/user');

const {
  MONGO_ATLAS,
  MONGO_LOCAL,
  NODE_ENV = 'development',
  SESSION_SECRET,
  PORT = 4000
} = process.env;

const MONGO_URI = NODE_ENV === 'development'
  ? MONGO_LOCAL
  : MONGO_ATLAS;

const app = express();

// ─── View engine ─────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', 'views');

// ─── Security & performance ──────────────────────────────────
app.use(helmet());
app.use(compression());
app.use(
  expressCspHeader({
    directives: {
      'default-src': ["'self'"],
      'img-src': ["'self'", 'https://res.cloudinary.com'],
      'script-src': ["'self'", 'https://cdn.jsdelivr.net']
    }
  })
);

// ─── Body parsing, file uploads & static ─────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const ok = ['image/png', 'image/jpg', 'image/jpeg', 'image/webp']
    .includes(file.mimetype);
  cb(null, ok);
};
app.use(multer({ storage, fileFilter }).single('image'));

app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));

// ─── Sessions, CSRF & Flash ──────────────────────────────────
const store = new MongoDBStore({ uri: MONGO_URI, collection: 'sessions' });
app.use(
  session({
    secret: SESSION_SECRET || 'supersecret',
    resave: false,
    saveUninitialized: false,
    store
  })
);
app.use(csrf());
app.use(flash());

// ─── Attach req.user if logged in ─────────────────────────────
app.use((req, res, next) => {
  if (!req.session.user) return next();
  User.findById(req.session.user._id)
    .then(user => {
      if (user) req.user = user;
      next();
    })
    .catch(next);
});

// ─── Expose auth & CSRF to all views ──────────────────────────
app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();
  next();
});

// ─── Routes ───────────────────────────────────────────────────
const superuserRoutes = require('./routes/superuser');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/error');
const adminRoutes = require('./routes/admin.js');

// Mount your superuser/admin router
app.use('/superuser', superuserRoutes);
// If you prefer `/admin`, swap the line above to:
// app.use('/admin', superuserRoutes);
app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);

// Error pages
app.get('/500', errorController.get500);
app.use(errorController.get404);

// ─── Global error handler ─────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Error caught by middleware:', err);
  if (res.headersSent) return next(err);
  res.status(500).render('500', { pageTitle: 'Error', path: '/500' });
});

// ─── Start server ─────────────────────────────────────────────
dbConnect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 Listening on port ${PORT}`);
      console.log(`🗄️  Connected to ${NODE_ENV} DB`);
    });
  })
  .catch(err => console.error('❌ DB connection failed:', err));
