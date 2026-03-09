import { User } from "../db/models.js";

export const findUser = (filter) => User.findOne({ where: filter });

export const findUserById = (id) => User.findByPk(id);

export const createUser = (data) => User.create(data);

export const updateUser = (id, data) => User.update(data, { where: { id } });

export const updateUserByFilter = (filter, data) => User.update(data, { where: filter });