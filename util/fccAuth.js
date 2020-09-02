const { admin } = require("./admin");

module.exports = async (req, res, next) => {
  if ((!req.headers.authorization || !req.headers.authorization.startsWith("Bearer "))) {
    res.status(401).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
    idToken = req.headers.authorization.split("Bearer ")[1];
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      // check if token has required claim
      if (decodedToken && decodedToken.fcc) {
        next();
        return;
      }
      else {
        res.status(403).send('Forbidden');
        return;
      }
    }
    catch (error) {
      console.log(error);
      res.status(401).send('Unauthorized');
      return;
    }
  }
}
