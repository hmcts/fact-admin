Feature('List - Contact Types');

// Data for these tests should probably be loaded at start of test run so contact type is 100% there and then cleaned up at end

Scenario('Super Admin - Edit Contact Types', async ({ I }) => {
  I.loginAsSuperAdmin();
  I.click("lists")
  I.waitForText("Edit A List")
  I.moveCursorTo('.fact-tabs-title');
  I.click("Contact Types")
  I.waitForText("Add Contact Type")
  I.click("edit")
  I.see("Editing")
  I.clearField("contactType[type]")
  I.clearField("contactType[type_cy]")
  I.fillField("contactType[type]", "Admin")
  I.fillField("contactType[type_cy]", "Gweinyddol")
  I.click("Save")
  I.see("Contact Types Updated")
  I.logout();
})

Scenario('Super Admin - Add new Contact Type with a name that already exists', async ({ I }) => {
  I.loginAsSuperAdmin();
  I.click("lists")
  I.waitForText("Edit A List")
  I.moveCursorTo('.fact-tabs-title');
  I.click("Contact Types")
  I.waitForText("Add Contact Type")
  I.click("Add Contact Type")
  I.see("Add New Contact Type")
  I.fillField("contactType[type]", "Office")
  I.fillField("contactType[type_cy]", "Swyddfa")
  I.click("Save")
  I.see("A contact type with the proposed name already exists. The name must be unique.\n")
  I.logout();
})

// Scenario('Super Admin - Create new contact type then delete it', async ({ I }) => {
//   I.loginAsSuperAdmin();
//   I.click("lists")
//   I.waitForText("Edit A List")
//   I.moveCursorTo('.fact-tabs-title');
//   I.click("Contact Types")
//   I.waitForText("Add Contact Type")
//   I.click("Add Contact Type")
//   I.see("Add New Contact Type")
//   I.fillField("contactType[type]", "AutomationTest")
//   I.fillField("contactType[type_cy]", "AutomationTestCy")
//   I.click("Save")
//   I.see("Contact Types Updated")
//   // Delete our new one, need a way to find it in the list of all deletes
//   I.click("delete")
//   I.see("Delete Contact Type: AutomationTest")
//   I.click("Confirm Delete")
//   I.waitForText("Contact Types Updated")
//   I.logout();
// })
