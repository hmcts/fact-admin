Feature: Areas Of Law List

  Background:
    Given I am on new browser
    Given I am on FACT homepage
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my super user authenticated credentials
    And click the Sign In button
    When I click on lists link
    Then I am redirected to the "Edit A List" page
    When I hover over the tab title
    And I click on areas of law list
    Then I should see "Areas of Law" page

  Scenario: Edit Area Of Law
    Given I click edit Financial Remedy
    Then I am redirected to the "Editing Area of Law: Financial Remedy" form
    Then I will make sure to clear all entries for the Area of law
    Then I enter "Finances application" in Display Name textbox
    Then I enter "Finances application" in external link desc textbox
    Then I enter "Os ydych chi’n gwneud" in Display Name Cy textbox
    Then I enter "Finances application" in alternative name textbox
    Then I enter "Rhwymedi Ariannol" in alternative Name Cy textbox
    Then I enter "https://www.gov.uk/money-property-when-relationship-ends" in external link textbox
    Then I enter "Os ydych chi’n gwneud" in external link desc Cy textbox
    Then I enter "https://www.gov.uk" in Display external link textbox
    When I click Area Of Law save button
    Then A green message is displayed for the updated Area Of Law "Areas of Law Updated"

  Scenario: Add new Area Of Law with the name already exist
    Then I click on Add new Area of law
    Then I am redirected to the "Add New Area of Law" form
    Then I enter "Financial Remedy" in Name textbox
    When I click Area Of Law save button
    Then The error message display for the name already exist "An area of law with the proposed name already exists. The name must be unique."
