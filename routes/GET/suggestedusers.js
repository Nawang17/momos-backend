"use strict";
const router = require("express").Router();
const { users, follows } = require("../../models");
const Sequelize = require("sequelize");
const { Op } = require("sequelize");

router.get("/:name", async (req, res) => {
  const { name } = req.params;
  const finduser = await users.findOne({
    where: {
      username: name ? name : "no",
    },
  });
  const followingarray = await follows.findAll({
    where: {
      followerid: finduser?.id ? finduser.id : "0",
    },
    include: [
      {
        model: users,
        as: "following",
        attributes: ["username", "avatar", "verified", "id"],
      },
    ],
  });
  const followingarr = followingarray.map((z) => z.following.username);
  const suggestedusers = await users.findAll({
    order: Sequelize.fn("RAND"),
    where: {
      username: {
        [Op.notIn]: followingarr,
      },
    },
    attributes: ["username", "avatar", "verified", "id"],
    limit: 30,
  });
  res.status(200).send({
    message: "user retrieved successfully",
    suggestedusers,
  });
});

module.exports = router;