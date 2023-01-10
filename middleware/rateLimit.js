const rateLimit = require("express-rate-limit");
const newpostLimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 4, // limit to 4 requests every 1 min per windows
  message: "Post limit reached. Please wait 1 minute to post again.",
  skipFailedRequests: true,
});

const commentlimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 5, // limit to 5 requests every 1 min per windows
  message: "Reply limit reached. Please wait 1 minute to reply again.", //err messasge
  skipFailedRequests: true,
});
const nestedcommentlimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 5, // limit to 5 requests every 1 min per windows
  message: "Reply limit reached. Please wait 1 minute to reply again.", //err messasge
  skipFailedRequests: true,
});
const followlimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 25, // limit to 25 requests every 1 min per windows
  message: "Follow limit reached. Please wait 1 minute to follow again.", //err messasge
  skipFailedRequests: true,
});
const likelimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 50, // limit to 35 requests every 1 min per windows
  message: "Like limit reached. Please wait 1 minute to like again.", //err messasge
  skipFailedRequests: true,
});
const registerlimit = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 1, // limit to 1 requests every 1 min per windows
  message: "Register limit reached. Please wait 1 hour to register again.", //err messasge
  skipFailedRequests: true,
});
const editprofilelimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 4, // limit to 4 requests every 1 min per windows
  message: "Edit profile limit reached. Please wait 1 minute to edit again.", //err messasge
  skipFailedRequests: true,
});
const commentlikelimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 35, // limit to 35 requests every 1 min per windows
  message: "Like limit reached. Please wait 1 minute to like again.", //err messasge
  skipFailedRequests: true,
});
const nestedcommentlikelimit = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 min
  max: 35, // limit to 35 requests every 1 min per windows
  message: "Like limit reached. Please wait 1 minute to like again.", //err messasge
  skipFailedRequests: true,
});
module.exports = {
  newpostLimit,
  registerlimit,
  commentlimit,
  followlimit,
  likelimit,
  nestedcommentlimit,
  editprofilelimit,
  commentlikelimit,
  nestedcommentlikelimit,
};
