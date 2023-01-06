Feature: Facility Types List

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    Then I am logged out if I am an admin user
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click on lists link
    Then I am redirected to the "Edit A List" page
    When I hover over the tab title
    And I click on facility types list
    Then I should see "Facility Types" facility type page

  Scenario: Add new Facility Type with the name already exist
    Then I click on Add new facility type
    Then I am redirected to the "Add New Facility Type" facility type form
    Then I enter "Parking" in facility name textbox
    When I click facility type save button
    Then The error message displays for facility type "A facility type with the same name already exists."

  Scenario: Adding and deleting new Facility Type
    Then I click on Add new facility type
    Then I am redirected to the "Add New Facility Type" facility type form
    Then I enter "Test123" in facility name textbox
    When I click facility type save button
    Then A green message is displayed "Facility Types Updated"
    When I click delete button for facility type "Test123"
    Then I am redirected to the "Delete Facility Type: Test123" facility type form
    When I click confirm delete button
    Then A green message is displayed "Facility Types Updated"

  Scenario: Deleting existing Facility type
    When I click delete button for facility type "Parking"
    Then I am redirected to the "Delete Facility Type: Parking" facility type form
    When I click confirm delete button
    Then The error message displays for facility type "You cannot delete this facility type at the moment, as one or more courts are dependent on it. Please remove the facility from the relevant courts first."

  Scenario: Edit Facility Type
    Given I click edit facility type "Parking"
    Then I am redirected to the "Edit Facility Type: Parking" facility type form
    Then I will make sure to clear all entries for the facility type
    Then I enter "Parking" in facility name textbox
    Then I enter "Parcio" in facility welsh name textbox
    When I click facility type save button
    Then A green message is displayed "Facility Types Updated"

  Scenario: Editing Facility Type with the name already exist
    Given I click edit facility type "Lift"
    Then I am redirected to the "Edit Facility Type: Lift" facility type form
    Then I will make sure to clear all entries for the facility type
    Then I enter "Parking" in facility name textbox
    When I click facility type save button
    Then The error message displays for facility type "A facility type with the same name already exists."


