"use strict";
require("dotenv").config();
const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const requestIp = require("request-ip");
global.io = new Server(server, {
  cors: {
    origin: [process.env.CLIENT_URL],
  },
});
const db = require("./models");
const cors = require("cors");
const port = process.env.PORT || 3001;

// blacklist of IP addresses
const blacklist = process.env.BLACKLISTED_IPS.split(" ");

// a custom middleware to check if the incoming request is from a blacklisted IP address
const blacklistMiddleware = (req, res, next) => {
  const ip = requestIp.getClientIp(req);
  if (blacklist.includes(ip)) {
    return res.status(403).send("Access denied");
  }
  next();
};

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
  })
);
app.set("trust proxy", 4);
app.use(express.json({ limit: "42mb" }));
app.use(express.urlencoded({ limit: "42mb", extended: true }));
const { tokenCheck } = require("./middleware/tokenCheck");
const {
  newpostLimit,
  commentlimit,
  followlimit,
  likelimit,
  nestedcommentlimit,
  registerlimit,
  commentlikelimit,
  nestedcommentlikelimit,
  tokennewpostLimit,

  tokencommentlimit,
  tokennestedcommentlimit,
} = require("./middleware/rateLimit");

const register = require("./routes/Auth/register");
const login = require("./routes/Auth/login");
const googleauth = require("./routes/Auth/Googleauth");
const newpost = require("./routes/POST/newpost");
const homepost = require("./routes/GET/homepost");
const userinfo = require("./routes/GET/userinfo");
const deletepost = require("./routes/DELETE/deletepost");
const likepost = require("./routes/POST/likepost");
const likedpost = require("./routes/GET/likedpost");
const profileinfo = require("./routes/GET/profileinfo");
const singlepost = require("./routes/GET/singlepost");
const newcomment = require("./routes/POST/newcomment");
const deletecomment = require("./routes/DELETE/deletecomment");
const newnestedcomment = require("./routes/POST/newNestedComment");
const deletenestedcomment = require("./routes/DELETE/deletenestedcomment");
const notis = require("./routes/GET/notis");
const follow = require("./routes/POST/follow");
const suggestedusers = require("./routes/GET/suggestedusers");
const settingsinfo = require("./routes/GET/settingsinfo");
const search = require("./routes/GET/search");
const leaderboard = require("./routes/GET/leaderboard");
const likecomment = require("./routes/POST/likecomment");
const likenestedcomment = require("./routes/POST/likenestedcomment");
const userlevel = require("./routes/GET/userlevel");
const reposts = require("./routes/GET/reposts");
const chat = require("./routes/chat/chat");

app.use("/likedposts", tokenCheck, likedpost);
app.use("/likepost", blacklistMiddleware, tokenCheck, likelimit, likepost);
app.use("/deletepost", tokenCheck, deletepost);
app.use("/userinfo", tokenCheck, userinfo);
app.use("/homeposts", homepost);
app.use(
  "/newpost",
  blacklistMiddleware,
  tokenCheck,
  tokennewpostLimit,
  newpostLimit,
  newpost
);
app.use("/auth/login", login);
app.use("/auth/register", blacklistMiddleware, registerlimit, register);
app.use("/auth/google", blacklistMiddleware, googleauth);
app.use("/profileinfo", profileinfo);
app.use("/post", singlepost);
app.use(
  "/newcomment",
  blacklistMiddleware,
  tokenCheck,
  tokencommentlimit,
  commentlimit,
  newcomment
);
app.use("/deletecomment", blacklistMiddleware, tokenCheck, deletecomment);
app.use(
  "/newnestedcomment",
  blacklistMiddleware,
  tokenCheck,
  tokennestedcommentlimit,
  nestedcommentlimit,
  newnestedcomment
);
app.use(
  "/deletenestedcomment",
  blacklistMiddleware,
  tokenCheck,
  deletenestedcomment
);
app.use("/notis", tokenCheck, notis);
app.use("/follow", blacklistMiddleware, tokenCheck, followlimit, follow);
app.use("/suggestedusers", suggestedusers);
app.use("/settingsinfo", tokenCheck, settingsinfo);
app.use("/search", search);
app.use("/leaderboard", leaderboard);
app.use(
  "/likecomment",
  blacklistMiddleware,
  tokenCheck,
  commentlikelimit,
  likecomment
);
app.use(
  "/likenestedcomment",
  blacklistMiddleware,
  tokenCheck,
  nestedcommentlikelimit,
  likenestedcomment
);
app.use("/userlevel", tokenCheck, userlevel);
app.use("/reposts", reposts);
app.use("/chat", blacklistMiddleware, tokenCheck, chat);

//initialize socket
const { verify } = require("jsonwebtoken");
const { users, profilebanners } = require("./models");
let onlineusers = [];
io.on("connection", (socket) => {
  console.log("a user connected ", socket.id);

  socket.on("onlinestatus", async (data) => {
    if (data.token) {
      const token = data.token.split(" ")[1];
      verify(token, process.env.JWT_SECRET, async (err, user) => {
        if (err) {
          console.log("online status error: ", err);
          const userarr = onlineusers?.filter((obj, index, self) => {
            return index === self.findIndex((o) => o.username === obj.username);
          });
          io.emit("onlineusers", userarr);
        } else {
          const finduser = await users.findOne({
            where: {
              id: user?.id,
            },
          });
          onlineusers.push({
            userid: finduser?.id,
            username: finduser?.username,
            avatar: finduser?.avatar,
            description: finduser?.description,
            socketid: socket.id,
          });
          console.log("user added to online users list");

          const userarr = onlineusers?.filter((obj, index, self) => {
            return index === self.findIndex((o) => o.username === obj.username);
          });
          io.emit("onlineusers", userarr);
        }
      });
    } else {
      const userarr = onlineusers?.filter((obj, index, self) => {
        return index === self.findIndex((o) => o.username === obj.username);
      });
      io.emit("onlineusers", userarr);
    }
  });
  socket.on("removeOnlinestatus", async (data) => {
    if (data.token) {
      const token = data.token.split(" ")[1];
      verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
          console.log("remove online status error: ", err);
        } else {
          onlineusers = onlineusers.filter((u) => u?.socketid !== socket?.id);
          const userarr = onlineusers?.filter((obj, index, self) => {
            return index === self.findIndex((o) => o.username === obj.username);
          });
          io.emit("onlineusers", userarr);
        }
      });
    }
  });
  socket.on("joinroom", async (data) => {
    if (data.roomid !== undefined) {
      socket.join(data.roomid);
      console.log("user joined room", socket.rooms);
    }
  });
  socket.on("leaveroom", (data) => {
    if (data.roomid !== undefined) {
      socket.leave(data.roomid);
      console.log("user left room", socket.rooms);
    }
  });
  socket.on("sendmessage", (data) => {
    console.log(data);
    io.emit("newmessage", data);
  });

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    console.log("users count ", socket.adapter.sids.size);
    onlineusers = onlineusers.filter((user) => user.socketid !== socket.id);
    const userarr = onlineusers?.filter((obj, index, self) => {
      return index === self.findIndex((o) => o.username === obj.username);
    });
    io.emit("onlineusers", userarr);

    console.log("user removed from onlineusers after disconnect");
  });
});

const {
  Client,
  Events,
  ActivityType,
  GatewayIntentBits,
} = require("discord.js");

// Create a new client instance
//global is used to make the client available to all files
global.client = new Client({
  intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages],
});

// When the client is ready, run this code (only once)
// We use 'c' for the event parameter to keep it separate from the already defined 'client'
global.client.once(Events.ClientReady, (c) => {
  console.log(`Discord bot ready! Logged in as ${c.user.tag}`);

  c.user.setPresence({
    activities: [{ name: "momosz.com", type: ActivityType.Watching }],
  });
});

// Log in to Discord with your client's token
global.client.login(process.env.DISCORD_BOT_TOKEN);

app.get("/", async (req, res) => {
  res.send("momos server ");
});

// force: true
db.sequelize
  .sync()
  .then(() => {
    server.listen(port, () => {
      console.log(`Server is listening on port ${port}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
