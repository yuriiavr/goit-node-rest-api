import { Contact } from "../db/models.js";

async function listContacts(ownerId) {
  return await Contact.findAll({ where: { owner: ownerId } });
}

async function getContactById(contactId, ownerId) {
  return await Contact.findOne({ where: { id: contactId, owner: ownerId } });
}

async function removeContact(contactId, ownerId) {
  const deletedCount = await Contact.destroy({
    where: { id: contactId, owner: ownerId },
  });
  return deletedCount > 0 ? true : null;
}

async function addContact(data, ownerId) {
  return await Contact.create({ ...data, owner: ownerId });
}

async function updateContact(contactId, ownerId, data) {
  const [updatedCount] = await Contact.update(data, {
    where: { id: contactId, owner: ownerId },
  });

  if (updatedCount === 0) return null;
  return await Contact.findOne({ where: { id: contactId, owner: ownerId } });
}

async function updateStatusContact(contactId, ownerId, data) {
  return await updateContact(contactId, ownerId, data);
}

export default {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};