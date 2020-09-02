const { admin, db } = require('./admin');
/**
 *  middleware for basic authentification
 */
module.exports = async (req, res, next) => {
  if ((!req.headers.authorization || !req.headers.authorization.startsWith('Bearer '))) {
    res.status(401).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    idToken = req.headers.authorization.split("Bearer ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      req.user = decodedToken;
      const data = await db.collection('users').where('uid', '==', req.user.uid).limit(1).get();
      req.user.handle = data.docs[0].data().handle;
      next();
      return;
    }
    catch (error) {
      return res.status(401).send('Unauthorized');
    }
  }
}
