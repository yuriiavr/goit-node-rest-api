import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { nanoid } from "nanoid";
import gravatar from "gravatar";
import path from "path";
import fs from "fs/promises";
import { Jimp } from "jimp";

import * as authServices from "../services/authServices.js";
import HttpError from "../helpers/HttpError.js";
import sendEmail from "../helpers/sendEmail.js";

const avatarsDir = path.resolve("public", "avatars");

export const register = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authServices.findUser({ email });
    if (user) throw HttpError(409, "Email in use");

    const avatarURL = gravatar.url(email);
    const hashPassword = await bcrypt.hash(password, 10);
    const verificationToken = nanoid();

    const newUser = await authServices.createUser({
      ...req.body,
      password: hashPassword,
      avatarURL,
      verificationToken,
    });

    const verifyEmail = {
      to: email,
      subject: "Verify your email",
      html: `<a target="_blank" href="http://localhost:3000/api/auth/verify/${verificationToken}">Click to verify your email</a>`,
    };

    await sendEmail(verifyEmail);

    res.status(201).json({
      user: {
        email: newUser.email,
        subscription: newUser.subscription,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail = async (req, res, next) => {
  try {
    const { verificationToken } = req.params;
    const user = await authServices.findUser({ verificationToken });

    if (!user) throw HttpError(404, "User not found");

    await authServices.updateUser(user.id, { verify: true, verificationToken: null });

    res.status(200).json({ message: "Verification successful" });
  } catch (error) {
    next(error);
  }
};

export const resendVerifyEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await authServices.findUser({ email });

    if (!user) throw HttpError(404, "User not found");
    if (user.verify) throw HttpError(400, "Verification has already been passed");

    const verifyEmail = {
      to: email,
      subject: "Verify your email",
      html: `<a target="_blank" href="http://localhost:3000/api/auth/verify/${user.verificationToken}">Click to verify your email</a>`,
    };

    await sendEmail(verifyEmail);

    res.status(200).json({ message: "Verification email sent" });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await authServices.findUser({ email });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      throw HttpError(401, "Email or password is wrong");
    }

    if (!user.verify) throw HttpError(401, "Email not verified");

    const payload = { id: user.id };
    const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "23h" });
    
    await authServices.updateUser(user.id, { token });

    res.status(200).json({
      token,
      user: { email: user.email, subscription: user.subscription },
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (req, res, next) => {
  try {
    await authServices.updateUser(req.user.id, { token: null });
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

export const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) throw HttpError(400, "File is required");
    
    const { id } = req.user; 
    const { path: tempUpload, originalname } = req.file;

    const image = await Jimp.read(tempUpload);
    await image.cover({ w: 250, h: 250 });
    await image.write(tempUpload); 

    const fileName = `${id}_${originalname}`;
    const resultUpload = path.join(avatarsDir, fileName);

    await fs.rename(tempUpload, resultUpload);
    const avatarURL = path.join("avatars", fileName);

    await authServices.updateUser(id, { avatarURL });

    res.status(200).json({ avatarURL });
  } catch (error) {
    if (req.file) await fs.unlink(req.file.path).catch(() => {});
    next(error);
  }
};