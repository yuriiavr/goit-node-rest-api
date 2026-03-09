import contactsService from "../services/contactsServices.js";
import HttpError from "../helpers/HttpError.js";

export const getAllContacts = async (req, res, next) => {
  try {
    const { id: ownerId } = req.user;
    const result = await contactsService.listContacts(ownerId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const getOneContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: ownerId } = req.user;
    const result = await contactsService.getContactById(id, ownerId);
    if (!result) throw HttpError(404);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const deleteContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: ownerId } = req.user;
    const result = await contactsService.removeContact(id, ownerId);
    if (!result) throw HttpError(404);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const createContact = async (req, res, next) => {
  try {
    const { id: ownerId } = req.user;
    const result = await contactsService.addContact(req.body, ownerId);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateContactById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: ownerId } = req.user;
    const result = await contactsService.updateContact(id, ownerId, req.body);
    if (!result) throw HttpError(404);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateStatusContact = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { id: ownerId } = req.user;
    const result = await contactsService.updateStatusContact(id, ownerId, req.body);
    if (!result) throw HttpError(404);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};