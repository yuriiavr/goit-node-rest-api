import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { User } from "../db/models.js";
import HttpError from "../helpers/HttpError.js";
import gravatar from "gravatar";
import path from "path";
import fs from "fs/promises";
import { Jimp } from "jimp";

const avatarsDir = path.resolve("public", "avatars");

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      throw HttpError(400, "File is required");
    }
    
    const { id } = req.user; 
    const { path: tempUpload, originalname } = req.file;

    const image = await Jimp.read(tempUpload);
    
    await image.cover({ w: 250, h: 250 });
    await image.write(tempUpload); 

    const fileName = `${id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, fileName);

    await fs.rename(tempUpload, resultUpload);

    const avatarURL = path.join("avatars", fileName);

    await User.update({ avatarURL }, { where: { id } });

    res.status(200).json({ avatarURL });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    next(error);
  }
};

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (user) throw HttpError(409, "Email in use");

    const avatarURL = gravatar.url(email);
    const hashPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      ...req.body,
      password: hashPassword,
      avatarURL,
    });

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
        avatarURL,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw HttpError(401, "Email or password is wrong");
    }

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "23h",
    });
    await user.update({ token });

    res.status(200).json({
      token,
      user: {
        email: user.email,
        subscription: user.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    const { id } = req.user;
    await User.update({ token: null }, { where: { id } });
    res.status(204).end();
  } catch (error) {
    next(error);
  }
};

export const getCurrent = async (req, res, next) => {
  res.status(200).json({
    email: req.user.email,
    subscription: req.user.subscription,
  });
};
