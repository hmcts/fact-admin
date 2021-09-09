Feature: Contact Types List

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click on lists link
    Then I am redirected to the "Edit A List" page
    When I hover over the tab title
    And I click on contact type list

  Scenario: Edit Contact Type
    Given I click edit contact type "Adoption"
    Then I am redirected to the contact type "Editing Contact Type: Adoption" form
    Then I will make sure to clear entries for the Contact Type
    Then I enter "Adoption" in name textbox
    Then I enter "Mabwysiadu" in name welsh textbox
    When I click Contact Type save button
    Then A green message is displayed for the updated Contact Type "Contact Types Updated"

  Scenario: Add new Contact Type with the name already exist
    Then I click on Add new Contact Type
    Then I am redirected to the contact type "Add New Contact Type" form
    Then I enter "Adoption" in name textbox
    When I click Contact Type save button
    Then The error message displays for a Contact type "A contact type with the proposed name already exists. The name must be unique."

  Scenario: Deleting new Contact Type
    Then I click on Add new Contact Type
    Then I am redirected to the contact type "Add New Contact Type" form
    Then I enter "Test123" in name textbox
    When I click Contact Type save button
    Then A green message is displayed for the updated Contact Type "Contact Types Updated"
    Then I click "Test123" delete Contact type button
    Then I am redirected to the contact type "Delete Contact Type: Test123" form
    When I click confirm delete button
    Then A green message is displayed for the updated Contact Type "Contact Types Updated"

  Scenario: Deleting existing Contact Type
    Then I click "Adoption" delete Contact type button
    Then I am redirected to the contact type "Delete Contact Type: Adoption" form
    When I click confirm delete button
    Then The error message displays for a Contact type "You cannot delete this contact type at the moment, as one or more courts are dependent on it. Please remove the contact type from the relevant courts first"

  Scenario: Editing Area Of Law with the name already exist
    Given I click edit contact type "Enquiries"
    Then I am redirected to the contact type "Editing Contact Type: Enquiries" form
    Then I will make sure to clear entries for the Contact Type
    Then I enter "Adoption" in name textbox
    When I click Contact Type save button
    #Then The error message displays for a Contact type "A contact type with the proposed name already exists. The name must be unique."
