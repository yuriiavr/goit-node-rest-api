import { Contact } from "../db/models.js";

async function listContacts() {
  return await Contact.findAll();
}

async function getContactById(contactId) {
  return await Contact.findByPk(contactId);
}

async function removeContact(contactId) {
  const deletedCount = await Contact.destroy({
    where: { id: contactId },
  });
  return deletedCount > 0 ? true : null;
}

async function addContact(data) {
  return await Contact.create(data);
}

async function updateContact(contactId, data) {
  const [updatedCount] = await Contact.update(data, {
    where: { id: contactId },
  });

  if (updatedCount === 0) return null;
  return await Contact.findByPk(contactId);
}

async function updateStatusContact(contactId, data) {
  const [updatedCount] = await Contact.update(data, {
    where: { id: contactId },
  });

  if (updatedCount === 0) return null;
  return await Contact.findByPk(contactId);
}

export default {
  listContacts,
  getContactById,
  removeContact,
  addContact,
  updateContact,
  updateStatusContact,
};