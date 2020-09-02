const { admin, db } = require("../util/admin");
const config = require("../util/config");
const firebase = require("firebase/app");
const fetch = require("node-fetch");
const defaultUserData = require("../util/defaultUserData");

require("firebase/auth");
require("firebase/firebase-auth");

const {
  validateInvite,
  signupValidation,
} = require("../util/validators");

/**
 * returns refreshToken in httpOnly Cookie. Cookie lives for 7 days.
 * refreshToken is used to auto-renew active login in resign function
 */
exports.signin = async (req, res) => {
  const form = {
    email: String(req.body.email).trim(),
    password: String(req.body.password).trim()
  };
  try {
    const login = await firebase.auth().signInWithEmailAndPassword(form.email, form.password)
    // on success get the users IdToken and refreshToken
    // and return and store both of them to/on the client
    const token = await login.user.getIdToken();
    const refreshToken = await login.user.refreshToken;
    // store refresh token in a cookie
    //set cookie to expire after 7 days
    return res
      .cookie("refresh_token", refreshToken, {
        maxAge: 60 * 60 * 1000 * 24 * 7,
        httpOnly: true
      })
      .status(200)
      .json({ message: "Authenticated", data: token });
  }
  catch (error) {
    return res.status(403).json({ error });
  }
};


/**
 * register a new user
 * createUserWithEmailAndPassword
 * also create
 */
exports.signup = async (req, res) => {
  //
  const form = {
    email: String(req.body.email).trim(),
    handle: String(req.body.handle).trim(),
    password: String(req.body.password).trim(),
    confirm: String(req.body.confirm).trim(),
    invite: String(req.body.invite) || '',
  };

  const { valid, errors } = signupValidation(form);
  if (!valid) return res.status(400).json(errors);
  const udoc = `/users/${form.handle}`.toString();
  // try to create a firestore document with name
  // of the passed username
  // if it already exists the username is already taken
  // otherwise create the document and use it to store
  // additional  user data inside of it
  const userDoc = await db.doc(udoc).get();
  if (userDoc.exists) {
    res.status(400).json({ handle: 'username already in use' });
    return
  }

  db.doc(udoc)
    .get()
    .then((doc) => {
      if (doc.exists)
        return res.status(400).json({ handle: 'username already taken' });
      else
        admin
          .auth()
          .createUser({
            email: form.email,
            password: form.password,
            displayName: form.handle,
          })
          .then(async (data) => {
            const uid = data.uid;
            const status = await validateInvite(uid, form.invite);
            return { uid, status };
          })
          .then(async (info) => {
            const user = {
              ...info,
              ...defaultUserData,
              handle: form.handle,
              email: form.email,
              createdAt: new Date().toISOString(),
            };
            db.doc(udoc).set(user);
            return res.status(201).json({ msg: 'account created' });
          })
          .catch((err) => {
            if (err.code === 'auth/email-already-exists')
              return res.status(400).json({ email: 'email is already taken' });
            else return res.status(500).json({ general: err.message });
          });
    });
};

/**
 * tries to use refreshToken from Cookie to get a new valid idToken.
 * It is probably better to let this be handled by the client-side js-sdk.
 */
exports.resign = async (req, res) => {
  const refreshToken = await req.cookies["refresh_token"];
  if (!refreshToken || refreshToken === undefined) {
    return res.status(400).json({ message: "no-refresh-token-found" });
  }
  try {
    const response = await fetch(`https://securetoken.googleapis.com/v1/token?key=${config.apiKey}`, {
      method: "POST",
      credentials: "include",
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: refreshToken
      })
    });
    const data = await response.json();
    if (data.error) {
      res
        .clearCookie("refresh_token", { path: "/" })
        .status(418)
        .json({ data: "I'm a teapot" });
    } else {
      res
        .cookie("refresh_token", data.refresh_token, {
          maxAge: 60 * 60 * 1000 * 24 * 7,
          httpOnly: true
        })
        .status(202)
        .json({ message: "ReAuthenticated", data: data.id_token });
    }
  }
  catch (error) {
    return res.status(400).json({ error });
  }
};


exports.signout = (req, res) => {
  res.clearCookie('refresh_token', { path: '/' });
  res.status(200).json({ msg: 'cookie deleted' });
};
